import { NextRequest } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import { createReadStream } from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 60;

async function getFFmpegPath(): Promise<string> {
    const possiblePaths = [
        path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg.exe"),
        path.join(process.cwd(), "node_modules", "ffmpeg-static", "ffmpeg"),
    ];
    for (const ffmpegPath of possiblePaths) {
        try {
            await fs.access(ffmpegPath);
            return ffmpegPath;
        } catch { }
    }
    throw new Error(`FFmpeg binary not found. Checked:\n${possiblePaths.join("\n")}`);
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    if (!url) return new Response("Missing video URL", { status: 400 });

    let tempDir: string | undefined;

    try {
        const ffmpegPath = await getFFmpegPath();
        ffmpeg.setFfmpegPath(ffmpegPath);

        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "nextvibe-"));
        const inputPath = path.join(tempDir, "input.webm");
        const outputPath = path.join(tempDir, "output.mp4");

        const sourceResponse = await fetch(url);
        if (!sourceResponse.ok || !sourceResponse.body) {
            throw new Error(`Failed to fetch video: ${sourceResponse.status}`);
        }

        // Stream the download straight to disk instead of buffering the whole
        // thing in memory first — starts writing immediately as bytes arrive.
        const nodeStream = Readable.fromWeb(sourceResponse.body as any);
        const { createWriteStream } = await import("fs");
        await new Promise<void>((resolve, reject) => {
            const ws = createWriteStream(inputPath);
            nodeStream.pipe(ws);
            ws.on("finish", resolve);
            ws.on("error", reject);
            nodeStream.on("error", reject);
        });

        await new Promise<void>((resolve, reject) => {
            ffmpeg(inputPath)
                .videoCodec("libx264")
                .audioCodec("aac")
                .outputOptions([
                    "-preset veryfast",
                    "-crf 23",
                    "-pix_fmt yuv420p",
                    "-movflags +faststart",
                    "-fps_mode cfr",      // forces constant frame rate — fixes the skipping
                    "-r 30",               // explicit output fps; drop/duplicate frames to hit it evenly
                    "-max_muxing_queue_size 9999", // avoids a mux error that can also manifest as dropped frames on VFR sources
                ])
                .format("mp4")
                .on("start", (cmd) => console.log("FFmpeg command:", cmd))
                .on("error", (err) => {
                    console.error("FFmpeg error:", err);
                    reject(err);
                })
                .on("end", () => resolve())
                .save(outputPath);
        });

        // Stream the output file back instead of reading it fully into memory first.
        const stat = await fs.stat(outputPath);
        const nodeReadable = createReadStream(outputPath);
        const webStream = Readable.toWeb(nodeReadable) as ReadableStream;

        return new Response(webStream, {
            status: 200,
            headers: {
                "Content-Type": "video/mp4",
                "Content-Disposition": 'attachment; filename="nextvibe-postcard.mp4"',
                "Content-Length": stat.size.toString(),
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Video conversion failed:", error);
        return new Response(
            error instanceof Error ? error.message : "Video conversion failed",
            { status: 500 }
        );
    } finally {
        if (tempDir) await fs.rm(tempDir, { recursive: true, force: true });
    }
}