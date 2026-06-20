import { engineBaseUrl } from "./engine-url";

export async function checkEngineHealth(): Promise<{
  ok: boolean;
  detail?: string;
}> {
  try {
    const engine = engineBaseUrl();
    const url = engine ? `${engine}/health` : "/api/health";
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    return { ok: Boolean(data.ok), detail: data.detail };
  } catch {
    return { ok: false, detail: "could not check engine" };
  }
}
