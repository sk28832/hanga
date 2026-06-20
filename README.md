# hanga — woodblock deconstruction engine

a study of **hiroshige** expressed as a real ukiyo-e production pipeline. take
any image — a photo, a generated scene, your own drawing — and recover the
keyblock, the colour blocks, the bokashi gradations, and the hanmoto printing
sequence. watch the blocks peel apart; watch the print build up impression by
impression.

```
hanga/
  web/      next.js frontend (washi/sumi aesthetic)
  engine/   python ml service (the inverse problem)
```

## quick start

```bash
# terminal 1 — engine
cd engine
./run.sh

# terminal 2 — frontend
cd web
npm install
npm run dev
```

open http://localhost:3000. go to **studio**, upload an image or pick a bundled
sample.

the frontend proxies uploads to the engine at `http://127.0.0.1:8000`. if the
engine is not running, bundled sample plans in `web/public/decon/` still work.

## rebuild bundled samples

```bash
cd engine
. .venv/bin/activate
python -m scripts.make_demo_samples   # stylised demo images
python -m scripts.build_samples       # run pipeline, write web/public/decon/
```

## what it teaches

| stage | technique |
| --- | --- |
| keyblock | XDoG line extraction (optional learned line-art) |
| colour separation | Lab k-means, paper detection, hard layer assignment |
| bokashi | gradient-domain planar fit |
| sequence | hanmoto heuristics, kentō registration |
| press | subtractive multiply compositing, mis-registration |
| modern (optional) | SAM region coherence |

see [engine/README.md](engine/README.md) for the pipeline in detail.

## deploy

- **web only**: deploy `web/` to vercel; bundled `/decon/` samples demo without python.
- **full stack**: run the engine on a gpu host; set `HANGA_ENGINE_URL` in the frontend env.

## design

the frontend follows the workspace [DESIGN.md](../DESIGN.md): washi paper,
shippori mincho, lowercase copy, vermillion reserved for the hanko seal.
