"""fastapi surface for the engine."""

from __future__ import annotations

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from . import __version__
from .config import settings
from .deconstruct import deconstruct, to_payload
from .imaging import load_rgb

app = FastAPI(title="hanga — woodblock deconstruction engine", version=__version__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict:
    return {"ok": True, "version": __version__, "sam": settings.use_sam}


@app.post("/deconstruct")
async def deconstruct_endpoint(
    file: UploadFile = File(...),
    n_colors: int = Form(settings.default_colors),
    modern: bool = Form(False),
) -> JSONResponse:
    try:
        raw = await file.read()
        if not raw:
            return JSONResponse(status_code=400, content={"detail": "empty upload"})
        rgb = load_rgb(raw)
        result = deconstruct(rgb, n_colors=max(3, min(12, n_colors)), use_modern=modern)
        return JSONResponse(to_payload(result))
    except Exception as exc:
        return JSONResponse(status_code=500, content={"detail": str(exc)})
