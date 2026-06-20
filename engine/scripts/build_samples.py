"""pre-compute deconstructions for the bundled sample prints.

the public demo deploys the frontend alone (no python). this script runs each
image in engine/samples/ through the pipeline and writes the layer pngs + plan
json into web/public/decon/<slug>/, plus a manifest the studio reads. run it
whenever you add a sample or change the pipeline:

    python -m scripts.build_samples            # from engine/
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# allow running as `python scripts/build_samples.py` from engine/
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.deconstruct import deconstruct, to_files  # noqa: E402
from app.imaging import load_rgb  # noqa: E402

ENGINE = Path(__file__).resolve().parents[1]
SAMPLES = ENGINE / "samples"
PUBLIC = ENGINE.parent / "web" / "public" / "decon"

# editorial metadata for each sample, keyed by file stem. titles/years are the
# study layer; the engine fills in everything technical.
META = {
    "tokaido-shono": {
        "title": "shōno, driving rain",
        "series": "fifty-three stations of the tōkaidō",
        "year": "c. 1833",
        "note": "travellers bent under a sudden squall; the rain is cut as fine "
                "parallel lines straight into the keyblock.",
    },
    "edo-ohashi": {
        "title": "sudden shower over shin-ōhashi bridge and atake",
        "series": "one hundred famous views of edo",
        "year": "1857",
        "note": "the print van gogh copied. grey bokashi sky, bero-ai river, "
                "and again rain as ruled keyblock lines.",
    },
    "edo-plum": {
        "title": "plum garden at kameido",
        "series": "one hundred famous views of edo",
        "year": "1857",
        "note": "a blossoming branch thrust across the foreground; flat green "
                "ground, red bokashi sky behind.",
    },
}


def slug(p: Path) -> str:
    return p.stem.lower()


def main() -> None:
    images = sorted(
        [p for p in SAMPLES.glob("*") if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}]
    )
    if not images:
        print(f"no sample images in {SAMPLES}. drop public-domain scans there first.")
        return

    PUBLIC.mkdir(parents=True, exist_ok=True)
    manifest = []
    for img in images:
        s = slug(img)
        print(f"deconstructing {img.name} -> {s}")
        rgb = load_rgb(img.read_bytes())
        result = deconstruct(rgb)
        plan = to_files(result, PUBLIC / s, public_prefix=f"/decon/{s}")
        plan["sample"] = {"slug": s, **META.get(s, {"title": s})}
        (PUBLIC / s / "plan.json").write_text(json.dumps(plan, indent=2))
        manifest.append({
            "slug": s,
            "title": plan["sample"].get("title", s),
            "series": plan["sample"].get("series", ""),
            "year": plan["sample"].get("year", ""),
            "thumb": plan["original"],
            "plan": f"/decon/{s}/plan.json",
        })

    (PUBLIC / "manifest.json").write_text(json.dumps(manifest, indent=2))
    print(f"wrote {len(manifest)} samples to {PUBLIC}")


if __name__ == "__main__":
    main()
