import { NextRequest } from "next/server";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs/promises";
import { createReadStream } from "fs";
import os from "os";
import path from "path";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Hosts we're allowed to fetch media/overlay assets from.
 */
const ALLOWED_HOSTS = [
  "res.cloudinary.com",
  "nextvibe.co",
  "images.pexels.com",
  "lh3.googleusercontent.com",
  "pbs.twimg.com",
  "hebbkx1anhila5yf.public.blob.vercel-storage.com",
  "minio-production-5cff.up.railway.app",
];

function isAllowedHost(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return ALLOWED_HOSTS.some((h) => parsed.hostname.endsWith(h));
  } catch {
    return false;
  }
}

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

    // Optional VibeTag overlay image to burn onto the video.
    const overlayUrl = searchParams.get("overlay");
    if (overlayUrl && !isAllowedHost(overlayUrl)) {
        return new Response("Overlay host not allowed", { status: 403 });
    }

    let tempDir: string | undefined;

    try {
        const ffmpegPath = await getFFmpegPath();
        ffmpeg.setFfmpegPath(ffmpegPath);

        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "nextvibe-"));

        // fluent-ffmpeg passes paths directly to the FFmpeg binary which uses
        // POSIX-style paths even on Windows. Convert backslashes to forward
        // slashes so the output file argument is never malformed.
        const toFFmpegPath = (p: string) => p.replace(/\\/g, "/");

        const inputPath  = toFFmpegPath(path.join(tempDir, "input.webm"));
        const outputPath = toFFmpegPath(path.join(tempDir, "output.mp4"));

        const sourceResponse = await fetch(url);
        if (!sourceResponse.ok || !sourceResponse.body) {
            throw new Error(`Failed to fetch video: ${sourceResponse.status}`);
        }

        // Stream the download straight to disk. createWriteStream uses the
        // native OS path; toFFmpegPath is only needed for FFmpeg arguments.
        const nodeStream = Readable.fromWeb(sourceResponse.body as any);
        const { createWriteStream } = await import("fs");
        await new Promise<void>((resolve, reject) => {
            const ws = createWriteStream(path.join(tempDir!, "input.webm"));
            nodeStream.pipe(ws);
            ws.on("finish", resolve);
            ws.on("error", reject);
            nodeStream.on("error", reject);
        });

        // If an overlay was requested, download it locally so FFmpeg can
        // composite it over every frame of the video.
        let overlayPath: string | undefined;
        if (overlayUrl) {
            const overlayResponse = await fetch(overlayUrl, {
                headers: { "User-Agent": "NextVibe/1.0" },
            });
            if (!overlayResponse.ok) {
                throw new Error(
                    `Failed to fetch overlay: ${overlayResponse.status}`
                );
            }
            const overlayBuffer = Buffer.from(
                await overlayResponse.arrayBuffer()
            );
            // Store under the native path for Node FS; toFFmpegPath converts it
            // to forward slashes when passed to the FFmpeg command below.
            const overlayNativePath = path.join(tempDir, "overlay.png");
            await fs.writeFile(overlayNativePath, overlayBuffer);
            overlayPath = toFFmpegPath(overlayNativePath);
        }

        const command = ffmpeg(inputPath);

        if (overlayPath) {
            // Add the overlay image as a second input, looped for the video duration.
            command
                .input(overlayPath)
                .inputOptions(["-loop 1"]);

            // Scale the overlay to the video's dimensions and composite it on top.
            // We do NOT pass a second argument to complexFilter so fluent-ffmpeg
            // won't auto-inject a duplicate -map [v] — we add the maps explicitly
            // in outputOptions below.
            command.complexFilter(
                "[0:v][1:v]scale2ref=w=iw:h=ih[ov][base];[base][ov]overlay=0:0[out]"
            );
        }

        await new Promise<void>((resolve, reject) => {
            command
                .output(outputPath)
                .videoCodec("libx264")
                .audioCodec("aac")
                .outputOptions([
                    "-preset veryfast",
                    "-crf 23",
                    "-pix_fmt yuv420p",
                    "-movflags +faststart",
                    "-fps_mode cfr",
                    "-r 30",
                    "-max_muxing_queue_size 9999",
                    // When an overlay is present: map the composited video stream
                    // and the original audio (optional — videos may be silent).
                    // -shortest ends encoding when the shorter input (video) ends.
                    ...(overlayPath
                        ? ["-map", "[out]", "-map", "0:a?", "-shortest"]
                        : []),
                ])
                .on("start", (cmd) => console.log("FFmpeg command:", cmd))
                .on("error", (err, stdout, stderr) => {
                    console.error("FFmpeg error:", err.message);
                    console.error("FFmpeg stderr:", stderr);
                    reject(err);
                })
                .on("end", () => resolve())
                .run();
        });

        // createReadStream needs the native OS path (backslashes fine on Windows).
        const outputNativePath = path.join(tempDir, "output.mp4");
        const stat = await fs.stat(outputNativePath);
        const nodeReadable = createReadStream(outputNativePath);
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
