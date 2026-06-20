"""stage 1 — the keyblock (sumiban).

the keyblock is the carved block that holds the black outline of the whole
image. everything else registers against it. recovering it from a flat photo is
a line-extraction problem; the classical attack is XDoG (extended
difference-of-gaussians), a thresholded DoG that produces clean, ink-like
strokes much closer to a brush line than a raw Canny edge.

reference: winnemoeller et al., "XDoG: an extended difference-of-gaussians
compendium" (2012).
"""

from __future__ import annotations

import numpy as np
from scipy.ndimage import gaussian_filter
from skimage.color import rgb2gray

from ..config import settings


def _xdog(gray: np.ndarray) -> np.ndarray:
    """return ink strength in [0,1]; 1 = solid sumi, 0 = bare paper."""
    s = settings
    g1 = gaussian_filter(gray, s.xdog_sigma)
    g2 = gaussian_filter(gray, s.xdog_sigma * s.xdog_k)
    dog = g1 - s.xdog_tau * g2

    # soft thresholding -> a continuous, tunable line. high where dog is dark.
    e = np.where(
        dog >= s.xdog_epsilon,
        1.0,
        1.0 + np.tanh(s.xdog_phi * (dog - s.xdog_epsilon)),
    )
    ink = 1.0 - e  # invert: lines become high values
    ink = ink - ink.min()
    peak = ink.max()
    if peak > 1e-6:
        ink = ink / peak
    return ink


def extract_keyblock(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """returns (rgba_keyblock_layer, ink_alpha).

    the layer is solid sumi shaped by the ink alpha; ink_alpha is reused later
    so colour separation can ignore the pixels the outline already owns.
    """
    gray = rgb2gray(rgb)

    # modern path: a learned line-art net, if one is wired up. falls back to XDoG.
    ink = None
    try:
        from ..models.lineart import extract_lines

        ink = extract_lines(rgb)
    except Exception:
        ink = None
    if ink is None:
        ink = _xdog(gray)

    # darker source pixels reinforce the line; keeps thick brush areas solid.
    ink = np.clip(ink * (0.5 + 0.5 * (1.0 - gray)) * 1.6, 0.0, 1.0)
    ink[ink < settings.key_min_strength] = 0.0

    sumi = np.array([26, 26, 26], dtype=np.float64) / 255.0
    h, w = ink.shape
    layer = np.zeros((h, w, 4), dtype=np.float64)
    layer[..., :3] = sumi
    layer[..., 3] = ink
    return layer, ink
