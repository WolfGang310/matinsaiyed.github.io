/* Fetch Troy Testing's live Google rating and write troytesting/rating.json,
   and refresh the aggregateRating in troytesting/index.html's JSON-LD.
   Runs daily from the GitHub Action. Requires env:
     GOOGLE_MAPS_API_KEY  — a Google Cloud key with the Places API enabled
     TROY_PLACE_ID        — the Google Place ID of the business listing
   Exits 0 (no-op) if secrets are missing, so the schedule never fails. */
import { readFileSync, writeFileSync } from 'node:fs';

const KEY = process.env.GOOGLE_MAPS_API_KEY;
const PLACE = process.env.TROY_PLACE_ID;
if (!KEY || !PLACE) {
  console.log('rating: GOOGLE_MAPS_API_KEY / TROY_PLACE_ID not set — skipping (no-op).');
  process.exit(0);
}

const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(PLACE)}&fields=rating,user_ratings_total&key=${KEY}`;
const res = await fetch(url);
const body = await res.json();
if (body.status !== 'OK' || !body.result) {
  console.error('rating: Places API returned', body.status, body.error_message || '');
  process.exit(1);
}
const rating = body.result.rating;
const count = body.result.user_ratings_total;
if (typeof rating !== 'number' || typeof count !== 'number') {
  console.error('rating: missing rating/count in response'); process.exit(1);
}

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
    const data = JSON.parse(m[2]);
    data.aggregateRating = { '@type': 'AggregateRating', ratingValue: String(rating), reviewCount: String(count), bestRating: '5' };
    html = html.replace(re, `$1${JSON.stringify(data)}$3`);
    writeFileSync(file, html);
    console.log('rating: patched JSON-LD aggregateRating');
  }
} catch (e) { console.error('rating: JSON-LD patch skipped —', e.message); }
