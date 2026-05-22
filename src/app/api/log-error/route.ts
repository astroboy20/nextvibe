import { appendFileSync, existsSync, mkdirSync, readFileSync } from "fs";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";

const LOG_DIR = join(process.cwd(), "logs");
const LOG_FILE = join(LOG_DIR, "errors.log");

export async function GET() {
  try {
    if (!existsSync(LOG_FILE)) {
      return NextResponse.json({ entries: [] });
    }

    const raw = readFileSync(LOG_FILE, "utf8");
    const entries = raw
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line);
        } catch {
          return { raw: line };
        }
      });

    return NextResponse.json({ total: entries.length, entries });
  } catch {
    return NextResponse.json({ error: "Could not read log file." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();

    const line = JSON.stringify({
      ts: new Date().toISOString(),
      message,
      ...(context && { context }),
    });

    mkdirSync(LOG_DIR, { recursive: true });
    appendFileSync(LOG_FILE, line + "\n", "utf8");

    return NextResponse.json({ ok: true });
  } catch {
    // Never let a log failure surface to the client
    return NextResponse.json({ ok: false });
  }
}
