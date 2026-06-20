"""stage 2 — colour and layer separation (the inverse problem).

a finished print is the *sum* of many single-colour blocks. going backwards —
one flat image into a small set of flat, carve-able colour regions — is
genuinely under-determined. the classical attack here:

  1. quantise the palette in CIE-Lab (perceptual) with k-means, so the chosen
     inks sit where the eye groups colour, not where rgb happens to land;
  2. read off the bare-paper colour (the lightest, low-chroma, high-area
     cluster) and treat it as the sheet rather than a printed block;
  3. assign every pixel to its nearest ink, giving one flat mask per block —
     exactly the shape a carver would cut.

if a segmentation is supplied (SAM, stage = modern), each region is snapped to a
single ink by majority vote, which removes the speckle hard quantisation leaves
behind. that is the only thing the modern path changes here.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import numpy as np
from scipy.ndimage import gaussian_filter
from skimage.color import rgb2lab
from sklearn.cluster import KMeans

from ..config import settings


@dataclass
class Block:
    id: int
    rgb: tuple[float, float, float]
    mask: np.ndarray  # HxW float alpha in [0,1]
    area_fraction: float
    is_paper: bool = False
    lightness: float = 0.0
    chroma: float = 0.0
    centroid: tuple[float, float] = (0.5, 0.5)
    # filled by later stages
    role: str = "color"
    bokashi: dict | None = None
    sequence: int = 0
    registration_offset: tuple[int, int] = (0, 0)
    pigment: dict = field(default_factory=dict)


def _sample(lab: np.ndarray, weights: np.ndarray, n: int = 24000) -> np.ndarray:
    flat = lab.reshape(-1, 3)
    w = weights.reshape(-1)
    idx = np.arange(flat.shape[0])
    if flat.shape[0] > n:
        p = w / w.sum()
        idx = np.random.default_rng(7).choice(idx, size=n, replace=False, p=p)
    return flat[idx]


def separate(
    rgb: np.ndarray,
    ink_alpha: np.ndarray,
    n_colors: int | None = None,
    seg_labels: np.ndarray | None = None,
) -> tuple[tuple[float, float, float], list[Block]]:
    n = int(n_colors or settings.default_colors)
    h, w = rgb.shape[:2]
    lab = rgb2lab(rgb)

    # ink pixels are unreliable colour evidence (they are mostly black outline),
    # so down-weight them when fitting the palette.
    weights = 1.0 - 0.85 * np.clip(ink_alpha, 0.0, 1.0)

    # fit a couple extra centres so paper + a possible dark mass have somewhere
    # to land without stealing a colour slot.
    k = max(2, n + 2)
    km = KMeans(n_clusters=k, n_init=4, random_state=7)
    km.fit(_sample(lab, weights))
    centers_lab = km.cluster_centers_

    # hard assign every pixel to its nearest ink (nearest centre in Lab).
    flat_lab = lab.reshape(-1, 3)
    d = np.linalg.norm(flat_lab[:, None, :] - centers_lab[None, :, :], axis=2)
    labels = np.argmin(d, axis=1).reshape(h, w)

    # snap regions to a single ink if a segmentation is available (modern path).
    if seg_labels is not None:
        labels = _snap_to_segments(labels, seg_labels, k)

    centers_rgb = _lab_to_rgb(centers_lab)

    blocks: list[Block] = []
    total = h * w
    for i in range(k):
        mask_bool = labels == i
        area = float(mask_bool.sum()) / total
        if area <= 0:
            continue

        L = float(centers_lab[i, 0]) / 100.0
        chroma = float(np.hypot(centers_lab[i, 1], centers_lab[i, 2]))
        ys, xs = np.nonzero(mask_bool)
        centroid = (float(xs.mean()) / w, float(ys.mean()) / h)

        alpha = gaussian_filter(mask_bool.astype(np.float64), 0.7)
        alpha = np.clip(alpha, 0.0, 1.0)

        blocks.append(
            Block(
                id=i,
                rgb=tuple(float(c) for c in centers_rgb[i]),
                mask=alpha,
                area_fraction=area,
                lightness=L,
                chroma=chroma,
                centroid=centroid,
            )
        )

    base_rgb = _choose_paper(blocks)
    _fold_small_blocks(blocks, labels, centers_lab, total)
    return base_rgb, [b for b in blocks if not b.is_paper and b.area_fraction > 0]


def _choose_paper(blocks: list[Block]) -> tuple[float, float, float]:
    """the bare sheet: lightest, low-chroma, reasonably large cluster."""
    candidates = [
        b for b in blocks
        if b.lightness >= settings.paper_lightness and b.chroma < 18 and b.area_fraction > 0.02
    ]
    if not candidates:
        candidates = [b for b in blocks if b.lightness == max(x.lightness for x in blocks)]
    paper = max(candidates, key=lambda b: b.area_fraction)
    paper.is_paper = True
    paper.role = "paper"
    return paper.rgb


def _fold_small_blocks(blocks, labels, centers_lab, total) -> None:
    """drop slivers below the min carve-able area by marking them paper-merged."""
    for b in blocks:
        if b.is_paper:
            continue
        if b.area_fraction < settings.min_block_area:
            b.area_fraction = 0.0  # filtered out by caller


def _snap_to_segments(labels: np.ndarray, seg: np.ndarray, k: int) -> np.ndarray:
    out = labels.copy()
    for s in np.unique(seg):
        m = seg == s
        if not m.any():
            continue
        vals = labels[m]
        out[m] = np.bincount(vals, minlength=k).argmax()
    return out


def _lab_to_rgb(lab: np.ndarray) -> np.ndarray:
    from skimage.color import lab2rgb

    return np.clip(lab2rgb(lab.reshape(-1, 1, 3)).reshape(-1, 3), 0.0, 1.0)
