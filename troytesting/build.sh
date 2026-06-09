#!/usr/bin/env bash
#
# Build for the Troy Testing site.
#
# Production (index.html) loads precompiled, minified .js — committed to the repo.
# The .jsx files are the SOURCE; the .js files are BUILD OUTPUT. Workflow:
#
#   1. Edit the .jsx sources (preview live via dev.html, which uses in-browser Babel)
#   2. Run:  bash build.sh          → regenerates the committed .js files
#   3. Bump ?v= in index.html AND the CACHE constant in sw.js (cache busting)
#   4. Commit both the .jsx and .js files
#
# Requires Node + npm. Tools install once into .babel-build/ (gitignored).
#
set -euo pipefail
cd "$(dirname "$0")"

SRC=(components features pages home programs test-center contact app)
TMP=".babel-build"

if [ ! -x "$TMP/node_modules/.bin/babel" ] || [ ! -x "$TMP/node_modules/.bin/terser" ]; then
  echo "→ Installing build tools (one-time, into $TMP/) ..."
  mkdir -p "$TMP"
  cat > "$TMP/package.json" <<'JSON'
{ "name": "troy-build", "private": true,
  "devDependencies": { "@babel/core": "^7.24.0", "@babel/cli": "^7.24.0", "@babel/preset-react": "^7.24.0", "terser": "^5.31.0" } }
JSON
  ( cd "$TMP" && npm install --silent --no-audit --no-fund )
fi

PRESET="$PWD/$TMP/node_modules/@babel/preset-react"
echo "→ Compiling + minifying JSX → .js ..."
for f in "${SRC[@]}"; do
  "$TMP/node_modules/.bin/babel" --presets "$PRESET" "$f.jsx" -o "$f.tmp.js"
  # NOTE: terser must NOT mangle top-level names — the files share one global
  # scope (Header, t, EXAMS, ...). Default mangle leaves top-level intact.
  "$TMP/node_modules/.bin/terser" "$f.tmp.js" --compress --mangle -o "$f.js"
  rm "$f.tmp.js"
done
wc -c "${SRC[@]/%/.js}" | tail -1

echo "✓ Done. Now bump ?v= in index.html and CACHE in sw.js, then commit .jsx + .js together."
