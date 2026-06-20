"""stage 4 — sequence planning (the hanmoto's job).

a print is pulled in a deliberate order. the workshop convention this follows:

  * the keyblock is printed first. its impression registers everything else and
    re-states the outline the colours sit inside.
  * colour blocks then go light -> dark. pale inks are laid before deep ones so
    a heavy blue or black never muddies a colour pulled over it.
  * among similar tones, the large flat fields go before small detail blocks.

registration is held by kentō marks cut into every block: an L-shaped kagi in
one corner and a straight hikitsuke along the same edge. the paper drops into
the same two marks on every impression; the tiny errors that remain are the
charm of a hand-pulled print, simulated as a per-block offset.
"""

from __future__ import annotations

import numpy as np

from ..pigments import nearest_pigment
from .separate import Block


def plan_sequence(blocks: list[Block]) -> dict:
    color_blocks = [b for b in blocks if not b.is_paper]

    for b in color_blocks:
        b.role = _role(b)
        pig = nearest_pigment(b.rgb)
        b.pigment = {
            "romaji": pig.romaji,
            "kanji": pig.kanji,
            "english": pig.english,
            "note": pig.note,
        }

    # light -> dark, then large -> small. the keyblock is slotted in front of
    # everything at sequence 1 by the orchestrator.
    ordered = sorted(
        color_blocks,
        key=lambda b: (-b.lightness, -b.area_fraction),
    )

    rng = np.random.default_rng(11)
    for i, b in enumerate(ordered):
        b.sequence = i + 2  # 1 is reserved for the keyblock
        jitter = rng.integers(-1, 2, size=2) if i else np.array([0, 0])
        b.registration_offset = (int(jitter[0]), int(jitter[1]))

    return {
        "kento": {
            "kagi": {"x": 0.94, "y": 0.94, "note": "L-shaped corner mark (鉤)"},
            "hikitsuke": {"x": 0.30, "y": 0.965, "note": "straight guide mark (引付)"},
            "explanation": "the sheet drops into these two marks on every pull.",
        },
        "order": [b.id for b in ordered],
    }


def _role(b: Block) -> str:
    if b.bokashi:
        return "bokashi"
    if b.lightness < 0.22 and b.chroma < 16:
        return "sumi-field"  # a large solid dark, printed by its own block
    if b.area_fraction >= 0.12:
        return "field"
    if b.area_fraction >= 0.03:
        return "color"
    return "detail"
