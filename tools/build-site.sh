#!/bin/sh
# Build the real website into dist/ (what Dokploy serves). The claude.ai preview uses the files at the repo root as they are.
# - index.html gets a full document head (charset, viewport) — the preview adds these itself
# - Unit I voices point to mp3 files (no data URIs: a real site has no file-count limit)
set -e
cd "$(dirname "$0")/.."
rm -rf dist && mkdir -p dist
cp catalog.js engine.js types-rw.js dist/
cp -r lessons assets dist/
rm -rf dist/assets/i1/vo dist/assets/i1/vo3 dist/assets/common/vo dist/assets/common/vo3   # older takes, kept only as source
{ printf '<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#f8f5ef"></head><body>\n'
  cat index.html
  printf '\n</body></html>\n'; } > dist/index.html
python3 tools/pack-voice.py --files dist i2 i3 i4 i5
echo "dist/ ready: $(find dist -type f | wc -l) files, $(du -sh dist | cut -f1)"
