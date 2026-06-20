"""stage 0 — ingest and normalise.

before a hanmoto can plan anything, the source drawing (the hanshita-e) has to
be cleaned up: sized to the block, and smoothed so paper grain and jpeg noise
don't get mistaken for line or colour. edge-preserving smoothing keeps the hard
boundaries a carver would actually cut.
"""

from __future__ import annotations

import numpy as np
from skimage.restoration import denoise_bilateral
from skimage.transform import resize

from ..config import settings


def ingest(rgb: np.ndarray, max_dim: int | None = None) -> np.ndarray:
    """resize to the working resolution and apply edge-preserving denoise."""
    max_dim = max_dim or settings.max_dim
    h, w = rgb.shape[:2]
    scale = max_dim / max(h, w)
    if scale < 1.0:
        rgb = resize(
            rgb,
            (max(1, round(h * scale)), max(1, round(w * scale))),
            order=1,
            anti_aliasing=True,
            preserve_range=True,
        )

    s = float(settings.denoise_strength)
    if s > 0:
        rgb = denoise_bilateral(
            rgb,
            sigma_color=0.06 + 0.10 * s,
            sigma_spatial=1.0 + 3.0 * s,
            channel_axis=-1,
        )

    return np.clip(rgb, 0.0, 1.0)
