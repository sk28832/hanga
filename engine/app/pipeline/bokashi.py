"""stage 3 — bokashi (ぼかし) planning.

bokashi is the hand-wiped tonal gradation that gives hiroshige his skies and
deep water: the printer dampens the block and drags a graded film of pigment so
the colour fades across the sheet. it is not a separate block — it is a *way of
inking* an existing block.

detection is a gradient-domain test: inside a block's mask, fit a linear ramp to
the original luminance. if the tone really does ramp smoothly in one direction
(high planar fit, wide tonal spread) the block is flagged as a bokashi and its
flat alpha is replaced by that ramp, so the simulated print fades the way a
wiped block would. a strongly axial ramp is ichimonji-bokashi (a straight band);
anything looser we label atenashi (free, edgeless).
"""

from __future__ import annotations

import numpy as np
from skimage.color import rgb2gray

from ..config import settings
from ..imaging import hex_color
from .separate import Block


def plan_bokashi(rgb: np.ndarray, blocks: list[Block]) -> None:
    lum = rgb2gray(rgb)
    h, w = lum.shape
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float64)
    xn, yn = xx / max(w - 1, 1), yy / max(h - 1, 1)

    for b in blocks:
        if b.is_paper or b.area_fraction < settings.bokashi_min_area:
            continue

        sel = b.mask > 0.35
        if sel.sum() < 64:
            continue

        x = xn[sel]
        y = yn[sel]
        z = lum[sel]
        spread = float(np.percentile(z, 95) - np.percentile(z, 5))
        if spread < settings.bokashi_min_spread:
            continue

        # least-squares plane z ~ a*x + b*y + c
        A = np.column_stack([x, y, np.ones_like(x)])
        coef, *_ = np.linalg.lstsq(A, z, rcond=None)
        pred = A @ coef
        ss_res = float(np.sum((z - pred) ** 2))
        ss_tot = float(np.sum((z - z.mean()) ** 2)) + 1e-9
        r2 = 1.0 - ss_res / ss_tot
        if r2 < settings.bokashi_gradient_r2:
            continue

        a, bcoef, _ = coef
        angle = float(np.degrees(np.arctan2(bcoef, a)))
        axial = min(abs(angle % 90), 90 - abs(angle % 90))
        kind = "ichimonji" if axial < 20 else "atenashi"
        orient = "vertical" if abs(bcoef) >= abs(a) else "horizontal"

        # ramp the block's ink: denser where the original is darker.
        ramp_full = coef[0] * xn + coef[1] * yn + coef[2]
        lo, hi = float(ramp_full[sel].min()), float(ramp_full[sel].max())
        norm = (ramp_full - lo) / (hi - lo + 1e-9)
        ink_ramp = np.clip(0.18 + 0.82 * (1.0 - norm), 0.0, 1.0)
        b.mask = b.mask * ink_ramp

        dark_end = z.argmin()
        light_end = z.argmax()
        b.bokashi = {
            "type": kind,
            "orientation": orient,
            "angle_deg": round(angle, 1),
            "linearity": round(r2, 3),
            "spread": round(spread, 3),
            "from_hex": hex_color(rgb[sel][dark_end]),
            "to_hex": hex_color(rgb[sel][light_end]),
        }
