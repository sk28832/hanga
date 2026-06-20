"""traditional ukiyo-e pigments.

hiroshige's prints were pulled from a small, named palette. naming each
extracted colour block after the pigment a hanmoto would actually have reached
for is what turns a generic colour-quantiser into a *study*. matching is done
in CIE-Lab so it follows perception rather than raw rgb distance.
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from skimage.color import rgb2lab


@dataclass(frozen=True)
class Pigment:
    romaji: str
    kanji: str
    english: str
    rgb: tuple[int, int, int]
    note: str


# approximate sRGB of edo-period woodblock pigments. values are eyeballed from
# surviving impressions, not spectrophotometry — close enough to name a block.
PIGMENTS: tuple[Pigment, ...] = (
    Pigment("sumi", "墨", "lampblack ink", (26, 26, 26),
            "the keyblock ink. soot and animal glue; the outline of the world."),
    Pigment("bero-ai", "ベロ藍", "prussian blue", (29, 59, 107),
            "imported synthetic blue. hiroshige's signature skies and water after the 1830s."),
    Pigment("ai", "藍", "indigo", (46, 74, 98),
            "fermented indigo. the older, softer blue bero-ai slowly displaced."),
    Pigment("aizuri", "藍摺", "blue gradation", (70, 110, 150),
            "diluted blue used for the long ramps of sky and sea."),
    Pigment("beni", "紅", "safflower red", (200, 74, 91),
            "safflower pink-red. fugitive — it fades, so survivors look pinker than printed."),
    Pigment("shu", "朱", "vermillion", (199, 62, 58),
            "cinnabar/mercury red. costly, saturated, reserved for accents."),
    Pigment("tan", "丹", "red-lead orange", (214, 85, 43),
            "lead oxide orange. warm, opaque, common in early figure work."),
    Pigment("kihada", "黄檗", "amur cork yellow", (217, 185, 75),
            "plant yellow from cork-tree bark. greens are built on top of it."),
    Pigment("ki", "黄", "yellow", (224, 196, 96),
            "general yellow; gamboge or orpiment depending on the shop."),
    Pigment("midori", "緑", "green", (90, 125, 79),
            "not a single pigment — printed by overlaying blue and yellow blocks."),
    Pigment("moegi", "萌黄", "fresh-leaf green", (120, 150, 80),
            "the light yellow-green of new foliage."),
    Pigment("murasaki", "紫", "purple", (106, 74, 122),
            "purple, often laid as red over blue. another fugitive colour."),
    Pigment("taisha", "代赭", "red ochre", (139, 90, 43),
            "iron-earth brown-red for soil, tree trunks, rooftiles."),
    Pigment("cha", "茶", "tea brown", (120, 86, 54),
            "warm brown for timber and earth."),
    Pigment("nezumi", "鼠", "mouse grey", (138, 138, 130),
            "literally 'mouse' — the neutral grey of stone and dusk."),
    Pigment("usuzumi", "薄墨", "pale ink", (90, 92, 92),
            "ink let down with water; the soft grey of distant hills."),
    Pigment("gofun", "胡粉", "shell white", (243, 240, 228),
            "ground oyster-shell white. also the bare paper showing through."),
)

_PIGMENT_RGB = np.array([p.rgb for p in PIGMENTS], dtype=np.float64) / 255.0
_PIGMENT_LAB = rgb2lab(_PIGMENT_RGB.reshape(-1, 1, 3)).reshape(-1, 3)


def nearest_pigment(rgb: tuple[float, float, float] | np.ndarray) -> Pigment:
    """nearest named pigment to a colour given in [0,1] sRGB."""
    arr = np.asarray(rgb, dtype=np.float64).reshape(1, 1, 3)
    lab = rgb2lab(arr).reshape(3)
    d = np.linalg.norm(_PIGMENT_LAB - lab, axis=1)
    return PIGMENTS[int(np.argmin(d))]
