"""engine-wide tunables. kept small and explicit on purpose."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    # ----- ingest -----
    max_dim: int = 1100
    """longest edge an input image is resized to before processing."""

    denoise_strength: float = 0.6
    """0 = none, 1 = heavy edge-preserving smoothing."""

    # ----- keyblock (sumiban) -----
    xdog_sigma: float = 0.8
    xdog_k: float = 4.5
    xdog_tau: float = 0.97
    xdog_phi: float = 18.0
    xdog_epsilon: float = -0.08
    key_min_strength: float = 0.18
    """ink below this alpha is dropped as noise."""

    # ----- colour / layer separation -----
    default_colors: int = 7
    """how many carved colour blocks to plan for, before merges."""

    min_block_area: float = 0.0022
    """blocks smaller than this fraction of the image are folded into a neighbour."""

    paper_lightness: float = 0.86
    """clusters lighter than this (in [0,1] L) are treated as bare washi, not a block."""

    ink_merge_lightness: float = 0.2
    """near-black clusters this dark are merged into the keyblock."""

    # ----- bokashi -----
    bokashi_min_area: float = 0.02
    bokashi_gradient_r2: float = 0.55
    """how linear a block's luminance ramp must be to count as a gradation."""
    bokashi_min_spread: float = 0.12
    """minimum tonal range across the block for a ramp to be a bokashi."""

    # ----- registration / press -----
    misregister_px: int = 2
    """max per-impression random offset, in pixels, at processing resolution."""

    # ----- modern path -----
    use_sam: bool = False
    """toggled on automatically if torch + a SAM checkpoint are present."""
    sam_checkpoint: str | None = None
    sam_model_type: str = "vit_b"


settings = Settings()
