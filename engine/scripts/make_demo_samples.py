"""generate stylised ukiyo-e demo images for the bundled sample gallery.

these are not scans — they are simplified compositions in hiroshige's palette
(enough for the engine to deconstruct convincingly in a demo without network
access to museum APIs).
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[1] / "samples"


def _save(name: str, rgb: np.ndarray) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    Image.fromarray((np.clip(rgb, 0, 1) * 255).astype(np.uint8)).save(OUT / f"{name}.png")


def _grad(h: int, w: int, c0, c1, axis: str = "y") -> np.ndarray:
    t = np.linspace(0, 1, h if axis == "y" else w)
    if axis == "y":
        t = t[:, None, None]
        c0, c1 = np.array(c0), np.array(c1)
        return (1 - t) * c0 + t * c1
    t = t[None, :, None]
    c0, c1 = np.array(c0), np.array(c1)
    return (1 - t) * c0 + t * c1


def tokaido_shono() -> None:
    h, w = 600, 900
    sky = _grad(h, w, (0.75, 0.78, 0.72), (0.55, 0.58, 0.52))
    img = np.tile(sky, (1, w, 1))[:h]
    img[int(h * 0.45) :, :] = (0.35, 0.48, 0.28)  # green road
    img[int(h * 0.55) :, :] = (0.28, 0.38, 0.22)
    pil = Image.fromarray((img * 255).astype(np.uint8))
    draw = ImageDraw.Draw(pil)
    for i in range(40):
        x = 80 + i * 18
        draw.line([(x, 0), (x - 30, h)], fill=(30, 30, 30), width=2)
    draw.line([(0, int(h * 0.45)), (w, int(h * 0.45))], fill=(20, 20, 20), width=3)
    _save("tokaido-shono", np.asarray(pil) / 255.0)


def edo_ohashi() -> None:
    h, w = 600, 900
    img = _grad(h, w, (0.92, 0.88, 0.78), (0.55, 0.62, 0.72))  # bokashi sky
    img = np.tile(img, (1, w, 1))[:h]
    water = _grad(h, w, (0.12, 0.22, 0.42), (0.08, 0.14, 0.32))
    img[int(h * 0.55) :] = water[int(h * 0.55) :]
    pil = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    draw = ImageDraw.Draw(pil)
    draw.polygon(
        [(100, int(h * 0.55)), (450, int(h * 0.52)), (800, int(h * 0.55)), (800, h), (100, h)],
        fill=(40, 55, 75),
    )
    draw.line([(100, int(h * 0.55)), (800, int(h * 0.55))], fill=(20, 20, 20), width=4)
    _save("edo-ohashi", np.asarray(pil) / 255.0)


def edo_plum() -> None:
    h, w = 600, 900
    img = _grad(h, w, (0.85, 0.55, 0.45), (0.95, 0.82, 0.72))  # red bokashi sky
    img = np.tile(img, (1, w, 1))[:h]
    img[int(h * 0.6) :, :] = (0.38, 0.52, 0.32)
    pil = Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8))
    draw = ImageDraw.Draw(pil)
    draw.line([(650, 50), (200, h)], fill=(25, 25, 25), width=6)
    for dy in range(0, 500, 80):
        draw.ellipse((180 - dy * 0.3, 120 + dy, 240 - dy * 0.3, 180 + dy), fill=(180, 60, 70))
    _save("edo-plum", np.asarray(pil) / 255.0)


def main() -> None:
    tokaido_shono()
    edo_ohashi()
    edo_plum()
    print(f"wrote demo samples to {OUT}")


if __name__ == "__main__":
    main()
