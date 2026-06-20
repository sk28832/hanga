import type { DeconstructPlan, SampleEntry } from "./types";

export async function deconstructImage(
  file: File,
  nColors = 7,
  modern = false,
): Promise<DeconstructPlan> {
  const body = new FormData();
  body.append("file", file);
  body.append("n_colors", String(nColors));
  body.append("modern", modern ? "true" : "false");

  const res = await fetch("/api/deconstruct", { method: "POST", body });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail ?? "deconstruction failed");
  }
  return data as DeconstructPlan;
}

export async function fetchManifest(): Promise<SampleEntry[]> {
  const res = await fetch("/decon/manifest.json");
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSamplePlan(path: string): Promise<DeconstructPlan> {
  const res = await fetch(path);
  if (!res.ok) throw new Error("sample plan not found");
  return res.json();
}
