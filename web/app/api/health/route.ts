import { NextResponse } from "next/server";

const ENGINE = process.env.HANGA_ENGINE_URL ?? "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${ENGINE}/health`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({ ok: res.ok, engine: data, url: ENGINE });
  } catch {
    return NextResponse.json(
      { ok: false, engine: null, url: ENGINE, detail: "engine unreachable" },
      { status: 503 },
    );
  }
}
