#!/usr/bin/env bash
#
# OPTIONAL production build for the Troy Testing site.
#
# By default the site runs with no build step: index.html compiles the .jsx
# sources in the browser via @babel/standalone. That's simple and deploys
# straight to GitHub Pages, but it ships ~150KB of JSX + the Babel compiler
# and compiles on every visit.
#
# This script precompiles the JSX to plain JS so production visitors download
# neither Babel nor raw JSX. Output goes to dist/ — deploy the CONTENTS of dist/.
#
# Requires Node + npm. Run:  bash build.sh
#
set -euo pipefail
cd "$(dirname "$0")"

SRC=(components features pages home programs test-center contact app)
TMP=".babel-build"

echo "→ Installing Babel (one-time, into $TMP/) ..."
mkdir -p "$TMP"
cat > "$TMP/package.json" <<'JSON'
{ "name": "troy-build", "private": true,
  "devDependencies": { "@babel/core": "^7.24.0", "@babel/cli": "^7.24.0", "@babel/preset-react": "^7.24.0" } }
JSON
( cd "$TMP" && npm install --silent --no-audit --no-fund )

echo "→ Compiling JSX → dist/ ..."
rm -rf dist && mkdir -p dist
PRESET="$PWD/$TMP/node_modules/@babel/preset-react"
for f in "${SRC[@]}"; do
  "$TMP/node_modules/.bin/babel" --presets "$PRESET" "$f.jsx" -o "dist/$f.js"
done
cp styles.css logo.jpg dist/

echo "→ Writing dist/index.html (loads compiled JS, no in-browser Babel) ..."
node - <<'NODE'
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
// Drop the Babel standalone CDN script
html = html.replace(/\s*<script src="https:\/\/unpkg\.com\/@babel\/standalone[^"]*"[^>]*><\/script>/g, '');
// Swap each text/babel .jsx tag (with optional ?v= cache-bust) for a plain compiled .js tag
html = html.replace(/<script type="text\/babel" src="([a-z-]+)\.jsx(?:\?[^"]*)?"><\/script>/g, '<script src="$1.js"></script>');
fs.writeFileSync('dist/index.html', html);
NODE

echo "✓ Done. Deploy the contents of dist/  (e.g. copy dist/* to your published path)."
