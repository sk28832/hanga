"""small array <-> image helpers shared across the pipeline."""

from __future__ import annotations

import base64
import io

import numpy as np
from PIL import Image


def load_rgb(data: bytes) -> np.ndarray:
    """decode image bytes to a float rgb array in [0,1], HxWx3."""
    img = Image.open(io.BytesIO(data)).convert("RGB")
    return np.asarray(img, dtype=np.float64) / 255.0


def to_uint8(arr: np.ndarray) -> np.ndarray:
    return np.clip(arr * 255.0 + 0.5, 0, 255).astype(np.uint8)


def png_bytes(arr: np.ndarray) -> bytes:
    """encode a float rgb (HxWx3) or rgba (HxWx4) array to png bytes."""
    mode = "RGBA" if arr.shape[-1] == 4 else "RGB"
    return _encode(Image.fromarray(to_uint8(arr), mode=mode))


def data_uri(arr: np.ndarray) -> str:
    return "data:image/png;base64," + base64.b64encode(png_bytes(arr)).decode("ascii")


def _encode(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    return buf.getvalue()


def rgba_from_mask(rgb: tuple[float, float, float], alpha: np.ndarray) -> np.ndarray:
    """build an HxWx4 layer that is a single flat colour shaped by an alpha mask."""
    h, w = alpha.shape
    out = np.zeros((h, w, 4), dtype=np.float64)
    out[..., 0] = rgb[0]
    out[..., 1] = rgb[1]
    out[..., 2] = rgb[2]
    out[..., 3] = alpha
    return out


def hex_color(rgb: tuple[float, float, float] | np.ndarray) -> str:
    r, g, b = (int(round(float(c) * 255)) for c in rgb[:3])
    return f"#{r:02x}{g:02x}{b:02x}"
