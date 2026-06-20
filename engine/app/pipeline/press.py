"""stage 5 — registration and the press (suri).

the printer (surishi) lays the dampened sheet onto each inked block in turn and
burnishes the back with a baren. pigment sinks into the paper, so overprinting is
*subtractive*: each block multiplies the colour already there. this stage rebuilds
the print that way — base sheet first, then the keyblock, then every colour block
in planned order, each nudged by its small registration error — and adds a faint
paper grain so the result reads as pulled, not rendered.
"""

from __future__ import annotations

import numpy as np
from scipy.ndimage import gaussian_filter

from .separate import Block


def _shift(layer: np.ndarray, dx: int, dy: int) -> np.ndarray:
    if dx == 0 and dy == 0:
        return layer
    out = np.zeros_like(layer)
    h, w = layer.shape[:2]
    ys0, ys1 = max(0, dy), min(h, h + dy)
    xs0, xs1 = max(0, dx), min(w, w + dx)
    yd0, yd1 = max(0, -dy), min(h, h - dy)
    xd0, xd1 = max(0, -dx), min(w, w - dx)
    out[ys0:ys1, xs0:xs1] = layer[yd0:yd1, xd0:xd1]
    return out


def _multiply_over(base: np.ndarray, layer: np.ndarray) -> np.ndarray:
    """composite a flat-colour rgba layer onto base using subtractive (multiply) ink."""
    color = layer[..., :3]
    alpha = layer[..., 3:4]
    blended = base * color  # pigment absorbs: darken toward the ink colour
    return base * (1.0 - alpha) + blended * alpha


def simulate_print(
    base_rgb: tuple[float, float, float],
    keyblock_layer: np.ndarray,
    blocks: list[Block],
    apply_jitter: bool = True,
) -> np.ndarray:
    h, w = keyblock_layer.shape[:2]
    canvas = np.empty((h, w, 3), dtype=np.float64)
    canvas[:] = np.asarray(base_rgb, dtype=np.float64)

    # faint, uneven sheet so flat fields are not dead-flat.
    grain = gaussian_filter(
        np.random.default_rng(3).normal(0, 1, (h, w)), 1.4
    )
    grain = (grain - grain.mean()) / (grain.std() + 1e-9)
    canvas *= (1.0 + 0.018 * grain[..., None])
    canvas = np.clip(canvas, 0.0, 1.0)

    canvas = _multiply_over(canvas, keyblock_layer)

    for b in sorted(blocks, key=lambda b: b.sequence):
        if b.is_paper:
            continue
        layer = np.zeros((h, w, 4), dtype=np.float64)
        layer[..., :3] = b.rgb
        layer[..., 3] = b.mask
        if apply_jitter:
            dx, dy = b.registration_offset
            layer = _shift(layer, dx, dy)
        canvas = _multiply_over(canvas, layer)

    return np.clip(canvas, 0.0, 1.0)
