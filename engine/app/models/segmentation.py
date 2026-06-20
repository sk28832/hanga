"""modern path — region segmentation with Segment Anything (SAM).

hard colour quantisation alone leaves speckle along edges. SAM gives coherent
regions; stage 2 then snaps every region to a single ink by majority vote, so a
roof, a sail, a band of sky each become one clean carve-able block.

this is strictly optional. if torch or a SAM checkpoint is missing,
`segment_regions` returns None and the engine falls back to pure quantisation.
download a checkpoint (e.g. sam_vit_b_01ec64.pth) and point config.sam_checkpoint
at it to switch this on.
"""

from __future__ import annotations

import numpy as np

from ..config import settings

_GENERATOR = None


def _load():
    global _GENERATOR
    if _GENERATOR is not None:
        return _GENERATOR
    if not settings.sam_checkpoint:
        return None
    import torch  # noqa: F401  (presence check)
    from segment_anything import SamAutomaticMaskGenerator, sam_model_registry

    sam = sam_model_registry[settings.sam_model_type](checkpoint=settings.sam_checkpoint)
    if torch.cuda.is_available():
        sam.to("cuda")
    _GENERATOR = SamAutomaticMaskGenerator(sam, points_per_side=24)
    return _GENERATOR


def segment_regions(rgb: np.ndarray) -> np.ndarray | None:
    """return an int label map (HxW) of coherent regions, or None if unavailable."""
    gen = _load()
    if gen is None:
        return None

    img8 = np.clip(rgb * 255, 0, 255).astype(np.uint8)
    masks = gen.generate(img8)
    if not masks:
        return None

    h, w = rgb.shape[:2]
    labels = np.zeros((h, w), dtype=np.int32)
    # paint largest first so small masks sit on top and keep their identity.
    for i, m in enumerate(sorted(masks, key=lambda d: -d["area"]), start=1):
        labels[m["segmentation"]] = i
    return labels
