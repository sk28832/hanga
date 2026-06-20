#!/usr/bin/env bash
# start engine + web together (one command)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

cleanup() {
  if [[ -n "${ENGINE_PID:-}" ]]; then
    kill "$ENGINE_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "→ starting engine on :8000"
cd "$ROOT/engine"
if [[ ! -d .venv ]]; then
  python3 -m venv .venv
  ./.venv/bin/pip install --upgrade pip -q
  ./.venv/bin/pip install -r requirements.txt -q
fi
./.venv/bin/uvicorn app.main:app --reload --port 8000 &
ENGINE_PID=$!

# wait for engine health
for i in {1..30}; do
  if curl -sf http://127.0.0.1:8000/health >/dev/null 2>&1; then
    echo "→ engine ready"
    break
  fi
  sleep 0.5
done

echo "→ starting web on :3000"
cd "$ROOT/web"
if [[ ! -d node_modules ]]; then
  npm install
fi
# stale .next chunks cause 500s after route changes; safe to wipe in dev
rm -rf .next
npm run dev
