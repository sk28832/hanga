import { NextRequest, NextResponse } from "next/server";

const ENGINE = process.env.HANGA_ENGINE_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const incoming = await req.formData();
    const body = new FormData();
    const file = incoming.get("file");
    if (!(file instanceof Blob)) {
      return NextResponse.json({ detail: "missing file" }, { status: 400 });
    }
    body.append("file", file, "upload.png");
    body.append("n_colors", String(incoming.get("n_colors") ?? "7"));
    body.append("modern", String(incoming.get("modern") ?? "false"));

    const res = await fetch(`${ENGINE}/deconstruct`, { method: "POST", body });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    const detail =
      process.env.NODE_ENV === "production"
        ? "uploads unavailable right now. bundled samples still work."
        : "could not reach the engine. run `./dev.sh` from the hanga folder, or start the engine with `cd engine && ./run.sh`. bundled samples work without it.";
    return NextResponse.json({ detail }, { status: 503 });
  }
}
