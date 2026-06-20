"""modern path — learned keyblock line extraction (optional).

XDoG (the classical keyblock in pipeline/keyblock.py) is fast and surprisingly
ink-like, but it can thin out soft brush lines and break on texture. a learned
line-art model (e.g. a lightweight 'sketch' / 'informative-drawings' network)
produces cleaner, more deliberate strokes — closer to a carver's hanshita-e.

this is a hook: wire a torch model here and return ink strength in [0,1]. with no
model present it returns None and `keyblock.extract_keyblock` uses XDoG.
"""

from __future__ import annotations

import numpy as np

from ..config import settings

_MODEL = None


def extract_lines(rgb: np.ndarray) -> np.ndarray | None:
    """return ink strength (HxW, [0,1]) from a learned model, or None."""
    if not getattr(settings, "lineart_checkpoint", None):
        return None
    try:
        model = _load()
    except Exception:
        return None
    if model is None:
        return None
    return _infer(model, rgb)


def _load():
    global _MODEL
    if _MODEL is not None:
        return _MODEL
    # intentionally left as an integration point: load a torch line-art net here
    # and assign it to _MODEL. kept lazy so importing this module is always safe.
    return None


def _infer(model, rgb: np.ndarray) -> np.ndarray:  # pragma: no cover - needs weights
    import torch

    with torch.no_grad():
        x = torch.from_numpy(rgb.transpose(2, 0, 1)[None]).float()
        y = model(x)[0, 0].clamp(0, 1).cpu().numpy()
    return y
