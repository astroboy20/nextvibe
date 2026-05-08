import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/media-proxy?url=<encoded-media-url>
 *
 * Proxies an external media file through the Next.js server so the browser
 * can fetch it without hitting CORS restrictions, then use it with the
 * Web Share API to share the actual image/video as a post.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediaUrl = searchParams.get("url");

  if (!mediaUrl) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  // Only allow fetching from known trusted hostnames
  let parsed: URL;
  try {
    parsed = new URL(mediaUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  const ALLOWED_HOSTS = [
    "res.cloudinary.com",
    "nextvibe.co",
    "images.pexels.com",
    "lh3.googleusercontent.com",
    "pbs.twimg.com",
    "hebbkx1anhila5yf.public.blob.vercel-storage.com",
    "minio-production-5cff.up.railway.app",
  ];

  if (!ALLOWED_HOSTS.some((h) => parsed.hostname.endsWith(h))) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    const upstream = await fetch(mediaUrl, {
      headers: { "User-Agent": "NextVibe/1.0" },
    });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
    }

    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(buffer.byteLength),
        // Cache for 1 hour — media URLs don't change
        "Cache-Control": "public, max-age=3600, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 502 });
  }
}
