/* Fetch Troy Testing's live Google rating → write troytesting/rating.json and
   refresh the aggregateRating in troytesting/index.html's JSON-LD. Runs daily
   from the GitHub Action. Requires env:
     GOOGLE_MAPS_API_KEY  — a Google Cloud key with "Places API (New)" (or legacy
                            "Places API") enabled
     TROY_PLACE_ID        — the Google Place ID of the business listing
   Tries the new Places API first, falls back to the legacy endpoint, so it works
   whichever one the key has enabled. Exits 0 (no-op) if secrets are unset. */
import { readFileSync, writeFileSync } from 'node:fs';

const KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACE = process.env.TROY_PLACE_ID;
if (!KEY || !PLACE) {
  console.log('rating: GOOGLE_MAPS_API_KEY / TROY_PLACE_ID not set — skipping (no-op).');
  process.exit(0);
}

async function fromNew() {
  const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE)}`, {
    headers: { 'X-Goog-Api-Key': KEY, 'X-Goog-FieldMask': 'rating,userRatingCount' },
  });
  if (!res.ok) { console.error('Places API (New):', res.status, (await res.text()).slice(0, 200)); return null; }
  const b = await res.json();
  if (typeof b.rating === 'number' && typeof b.userRatingCount === 'number') return { rating: b.rating, count: b.userRatingCount };
  return null;
}
async function fromLegacy() {
  const res = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(PLACE)}&fields=rating,user_ratings_total&key=${KEY}`);
  if (!res.ok) { console.error('legacy Places API HTTP', res.status); return null; }
  const b = await res.json();
  if (b.status === 'OK' && b.result && typeof b.result.rating === 'number' && typeof b.result.user_ratings_total === 'number')
    return { rating: b.result.rating, count: b.result.user_ratings_total };
  console.error('legacy Places API:', b.status, b.error_message || '');
  return null;
}

let data = null;
try { data = await fromNew(); } catch (e) { console.error('new API error:', e.message); }
if (!data) { try { data = await fromLegacy(); } catch (e) { console.error('legacy API error:', e.message); } }
if (!data) { console.error('rating: could not fetch rating from either Places API — leaving files unchanged.'); process.exit(1); }

const { rating, count } = data;
const stamp = new Date().toISOString().slice(0, 10);
writeFileSync('troytesting/rating.json', JSON.stringify({
  _note: 'Auto-updated daily from the Google Places API. Do not edit by hand.',
  rating, count, updated: stamp,
}, null, 2) + '\n');
console.log(`rating: ${rating} / ${count} reviews (updated ${stamp})`);

/* refresh aggregateRating in the JSON-LD so search engines see verifiable, current numbers */
try {
  const file = 'troytesting/index.html';
  let html = readFileSync(file, 'utf8');
  const re = /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/;
  const m = html.match(re);
  if (m) {
    const obj = JSON.parse(m[2]);
    obj.aggregateRating = { '@type': 'AggregateRating', ratingValue: String(rating), reviewCount: String(count), bestRating: '5' };
    // function replacement avoids $-sequence interpretation in the JSON string
    html = html.replace(re, (whole, open, _body, close) => open + JSON.stringify(obj) + close);
    writeFileSync(file, html);
    console.log('rating: patched JSON-LD aggregateRating');
  }
} catch (e) { console.error('rating: JSON-LD patch skipped —', e.message); }
