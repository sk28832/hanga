# engine — the woodblock deconstruction pipeline

a python service that takes one image and recovers a full ukiyo-e production
plan: the keyblock, the colour blocks, the bokashi gradations, the printing
sequence, and a simulated registered print.

it is the inverse of a woodblock workshop. a workshop turns a drawing into many
carved blocks and prints them up into one image; this turns one image back into
the blocks and the plan that would have produced it.

## the pipeline

| stage | file | what it does | technique |
| --- | --- | --- | --- |
| ingest | [app/pipeline/ingest.py](app/pipeline/ingest.py) | size + edge-preserving denoise | bilateral filtering |
| keyblock | [app/pipeline/keyblock.py](app/pipeline/keyblock.py) | recover the black outline block | XDoG (extended difference-of-gaussians) |
| separate | [app/pipeline/separate.py](app/pipeline/separate.py) | one image → flat colour blocks | Lab k-means, paper detection, hard assignment |
| bokashi | [app/pipeline/bokashi.py](app/pipeline/bokashi.py) | find wiped tonal gradations | gradient-domain planar fit |
| sequence | [app/pipeline/sequence.py](app/pipeline/sequence.py) | order the blocks like a hanmoto | light→dark heuristic, kentō marks |
| press | [app/pipeline/press.py](app/pipeline/press.py) | simulate registration + printing | subtractive (multiply) compositing |

`app/pigments.py` names every recovered colour after the edo-period pigment a
workshop would have used (bero-ai, beni, kihada …), matched in CIE-Lab.

## run

```bash
./run.sh                      # creates .venv, installs, serves on :8000
# or
python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

`POST /deconstruct` (multipart: `file`, optional `n_colors`, `modern`) returns
the plan with every layer inlined as a png data-uri.

## bundled demo data

the frontend can run without this service by reading pre-computed plans. drop
public-domain scans into `samples/` (named to match the keys in
`scripts/build_samples.py`) and run:

```bash
. .venv/bin/activate
python -m scripts.build_samples
```

this writes `web/public/decon/<slug>/` + a manifest.

## modern path (optional)

the classical pipeline runs with no ml weights. to sharpen results:

```bash
pip install -r requirements-modern.txt
# download a SAM checkpoint, then set config.sam_checkpoint
```

- **SAM** ([app/models/segmentation.py](app/models/segmentation.py)) — coherent
  regions, so blocks stop speckling along edges.
- **learned line-art** ([app/models/lineart.py](app/models/lineart.py)) — a
  cleaner keyblock than XDoG (hook; wire your own checkpoint).

both degrade gracefully to the classical path when weights are absent.
