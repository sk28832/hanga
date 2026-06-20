"""orchestrator: run the full deconstruction and serialise the production plan.

this is the one place the stages are wired together in workshop order:

    ingest -> keyblock -> (optional SAM regions) -> separate -> bokashi
           -> sequence -> press

the result can be serialised two ways: inline data-uris for the live api, or
written to disk as png files for the bundled, engine-free demo.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np

from . import __version__
from .config import settings
from .imaging import data_uri, hex_color, png_bytes
from .pigments import nearest_pigment
from .pipeline.bokashi import plan_bokashi
from .pipeline.ingest import ingest
from .pipeline.keyblock import extract_keyblock
from .pipeline.press import simulate_print
from .pipeline.separate import Block, separate
from .pipeline.sequence import plan_sequence


@dataclass
class Decon:
    width: int
    height: int
    base_rgb: tuple[float, float, float]
    original: np.ndarray
    final: np.ndarray
    keyblock: np.ndarray
    blocks: list[Block]
    kento: dict
    used_sam: bool = False
    notes: list[str] = field(default_factory=list)


def deconstruct(
    image_rgb: np.ndarray,
    n_colors: int | None = None,
    use_modern: bool | None = None,
) -> Decon:
    rgb = ingest(image_rgb)
    h, w = rgb.shape[:2]

    keyblock_layer, ink_alpha = extract_keyblock(rgb)

    used_sam = False
    seg_labels = None
    want_modern = settings.use_sam if use_modern is None else use_modern
    if want_modern:
        try:
            from .models.segmentation import segment_regions

            seg_labels = segment_regions(rgb)
            used_sam = seg_labels is not None
        except Exception:
            seg_labels = None

    base_rgb, blocks = separate(rgb, ink_alpha, n_colors=n_colors, seg_labels=seg_labels)
    blocks = [b for b in blocks if b.area_fraction > 0 and not b.is_paper]

    plan_bokashi(rgb, blocks)
    kento = plan_sequence(blocks)

    final = simulate_print(base_rgb, keyblock_layer, blocks)
    blocks.sort(key=lambda b: b.sequence)

    return Decon(
        width=w,
        height=h,
        base_rgb=base_rgb,
        original=rgb,
        final=final,
        keyblock=keyblock_layer,
        blocks=blocks,
        kento=kento,
        used_sam=used_sam,
    )


def _block_meta(b: Block) -> dict:
    return {
        "id": b.id,
        "sequence": b.sequence,
        "role": b.role,
        "hex": hex_color(b.rgb),
        "rgb": [round(float(c), 4) for c in b.rgb],
        "area_fraction": round(b.area_fraction, 4),
        "pigment": b.pigment,
        "bokashi": b.bokashi,
        "registration_offset": list(b.registration_offset),
        "centroid": [round(b.centroid[0], 4), round(b.centroid[1], 4)],
    }


def _base_meta(d: Decon) -> dict:
    pig = nearest_pigment(d.base_rgb)
    return {
        "hex": hex_color(d.base_rgb),
        "pigment": {
            "romaji": pig.romaji,
            "kanji": pig.kanji,
            "english": pig.english,
            "note": pig.note,
        },
    }


def _keyblock_meta() -> dict:
    pig = nearest_pigment((26 / 255, 26 / 255, 26 / 255))
    return {
        "sequence": 1,
        "role": "keyblock",
        "name": "sumiban",
        "pigment": {
            "romaji": pig.romaji,
            "kanji": pig.kanji,
            "english": pig.english,
            "note": pig.note,
        },
    }


def to_payload(d: Decon) -> dict:
    """inline data-uri plan for the live api."""
    blocks = []
    for b in d.blocks:
        meta = _block_meta(b)
        layer = np.zeros((d.height, d.width, 4))
        layer[..., :3] = b.rgb
        layer[..., 3] = b.mask
        meta["image"] = data_uri(layer)
        blocks.append(meta)

    return {
        "meta": {
            "width": d.width,
            "height": d.height,
            "n_blocks": len(d.blocks),
            "engine_version": __version__,
            "used_sam": d.used_sam,
        },
        "base": {**_base_meta(d)},
        "keyblock": {**_keyblock_meta(), "image": data_uri(d.keyblock)},
        "kento": {
            **d.kento["kento"],
            "order": d.kento.get("order", []),
        },
        "original": data_uri(d.original),
        "final": data_uri(d.final),
        "blocks": blocks,
    }


def to_files(d: Decon, out_dir, public_prefix: str) -> dict:
    """write png layers to disk; return a plan that references them by url."""
    from pathlib import Path

    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    def _write(name: str, arr: np.ndarray) -> str:
        (out / name).write_bytes(png_bytes(arr))
        return f"{public_prefix}/{name}"

    blocks = []
    for b in d.blocks:
        meta = _block_meta(b)
        layer = np.zeros((d.height, d.width, 4))
        layer[..., :3] = b.rgb
        layer[..., 3] = b.mask
        meta["image"] = _write(f"layer_{b.sequence:02d}.png", layer)
        blocks.append(meta)

    return {
        "meta": {
            "width": d.width,
            "height": d.height,
            "n_blocks": len(d.blocks),
            "engine_version": __version__,
            "used_sam": d.used_sam,
        },
        "base": {**_base_meta(d)},
        "keyblock": {**_keyblock_meta(), "image": _write("keyblock.png", d.keyblock)},
        "kento": {
            **d.kento["kento"],
            "order": d.kento.get("order", []),
        },
        "original": _write("original.png", d.original),
        "final": _write("final.png", d.final),
        "blocks": blocks,
    }
