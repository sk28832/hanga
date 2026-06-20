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
# one command — starts engine + web together
chmod +x dev.sh
./dev.sh
```

or manually:

```bash
# terminal 1 — engine
cd engine
./run.sh

# terminal 2 — frontend
cd web
npm install
npm run dev
```

open http://localhost:3000. upload an image or pick a bundled sample.

the study — art history and pipeline notes — lives on the portfolio at
[shreyankkadadi.com/studio/hanga](https://shreyankkadadi.com/studio/hanga).
the hanko seal links back there.

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

### engine (railway)

1. create a railway project from this repo; set the service root to `engine/`
2. enable public networking and copy the https url
3. railway reads `engine/Procfile` and `engine/railway.toml` automatically

### web (vercel)

1. import this repo on vercel; set **root directory** to `web/`
2. add custom domain `hanga.shreyankkadadi.com`
3. set env vars (see `web/.env.example`):
   - `NEXT_PUBLIC_STUDY_URL` → portfolio study page
   - `NEXT_PUBLIC_HANGA_ENGINE_URL` → railway public url
   - `HANGA_ENGINE_URL` → same railway url (server-side fallback)

uploads call the engine directly from the browser in production (avoids vercel
serverless timeouts). bundled `/decon/` samples work without the engine.

## design

the frontend follows the workspace [DESIGN.md](../DESIGN.md): washi paper,
shippori mincho, lowercase copy, vermillion reserved for the hanko seal.
