/**
 * Patches @splinetool/runtime to remove the "Built with Spline" watermark.
 *
 * The watermark is a WebGL post-processing overlay (logoOverlayPass) loaded
 * from a texture embedded in the .splinecode file. CSS/DOM tricks can't
 * remove it because it's rendered entirely on the GPU.
 *
 * This script applies four patches:
 *  1. Replaces the watermark-loading condition with `false`
 *  2. Makes `setWatermark()` a no-op
 *  3. Removes the logoOverlayPass from the render pipeline
 *  4. Disables the per-frame logoOverlayPass check
 *
 * Run automatically via the "postinstall" npm script.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FILES = [
  resolve(__dirname, '../node_modules/@splinetool/runtime/build/runtime.js'),
  resolve(__dirname, '../node_modules/@splinetool/runtime/build/runtime.cjs'),
];

const patches = [
  // 1. Kill the watermark-loading condition
  {
    find: /i\.shared\.images\.SplineWatermark/g,
    replace: 'false',
    label: 'watermark loading condition',
  },
  // 2. Make setWatermark a no-op
  {
    find: /setWatermark\(e\)\{this\.logoOverlayPass\.enabled=e!==null,e&&\(this\.logoOverlayPass\.texture=e\)\}/g,
    replace: 'setWatermark(e){}',
    label: 'setWatermark method',
  },
  // 3. Remove logoOverlayPass from the effect composer
  {
    find: /this\.effectComposer\.addPass\(this\.logoOverlayPass\)/g,
    replace: 'void 0',
    label: 'addPass(logoOverlayPass)',
  },
  // 4. Disable the per-frame logoOverlayPass enabled check
  {
    find: /if\(this\.pipeline\.logoOverlayPass\.enabled\)/g,
    replace: 'if(false)',
    label: 'logoOverlayPass.enabled check',
  },
];

let totalPatched = 0;

for (const file of FILES) {
  if (!existsSync(file)) {
    console.log(`[patch-spline] Skipping (not found): ${file}`);
    continue;
  }

  let src = readFileSync(file, 'utf8');
  let fileChanged = false;

  for (const patch of patches) {
    if (patch.find.test(src)) {
      // Reset lastIndex since we tested above
      patch.find.lastIndex = 0;
      src = src.replace(patch.find, patch.replace);
      fileChanged = true;
      console.log(`[patch-spline]   ✓ ${patch.label}`);
    }
  }

  if (fileChanged) {
    writeFileSync(file, src, 'utf8');
    totalPatched++;
    console.log(`[patch-spline] Patched: ${file}`);
  } else {
    console.log(`[patch-spline] Already patched: ${file}`);
  }
}

console.log(`[patch-spline] Done — ${totalPatched} file(s) patched.`);
