# Troy Testing & Learning Centers

A multi-page marketing site for an accredited **CELPIP** (Paragon) and **CFA**
(Prometric) exam-delivery centre serving Toronto & Mississauga. The site's job is
to build trust and route candidates to the official provider booking portals —
Troy does **not** book exams itself.

Served at **matinsaiyed.com/troytesting/**. Implemented from a Claude Design
handoff as split source files. Installable as a PWA (manifest + service worker,
works offline).

## How it runs

**Production** (`index.html`) loads precompiled, **minified `.js`** files that are
committed to the repo — no in-browser Babel, no build server needed by the host.
The `.jsx` files are the *source*; the matching `.js` files are *build output*.

**Development** (`dev.html`) loads the raw `.jsx` via in-browser Babel so you can
iterate without rebuilding (it skips the service worker and is `noindex`).

### Editing workflow

1. Edit the `.jsx` sources (preview via `dev.html`)
2. `bash build.sh` → regenerates the committed `.js` files (Babel + terser)
3. Bump `?v=` in `index.html` **and** the `CACHE` constant in `sw.js`
4. Commit the `.jsx` and `.js` files together

**Script load order matters** (classic scripts sharing one global scope; the mount
in `app.jsx` must run last):

```
components → features → pages → home → programs → test-center → contact → app
```

| Source | Contains |
|------|----------|
| `components.jsx` | Header, Footer, ReserveModal, exam board, partner bar, scroll-reveal, counters, dialog-a11y hook |
| `features.jsx` | i18n table (`TR`/`t`), language toggle, find-my-exam wizard, diagnostic quiz, availability, CFA countdown, seat alerts, guides, gallery, FAB, section nav |
| `pages.jsx` | Availability, Reviews, Centres, FAQ, Privacy pages |
| `home / programs / test-center / contact.jsx` | The remaining page components |
| `app.jsx` | Router, history, per-route titles, language state, mount |
| `styles.css` | All styling (responsive, reduced-motion, focus rings) |
| `sw.js` | Service worker — offline shell + installability, scoped to this folder |
| `manifest.webmanifest` + icons | PWA install metadata (home-screen icons) |

## Configure the contact form

Out of the box the contact form composes an email in the visitor's mail client
(so it always delivers something). To receive submissions silently in-page,
create a free form at <https://formspree.io> and paste its endpoint into
`FORM_ENDPOINT` at the top of `contact.jsx` (then rebuild):

```js
const FORM_ENDPOINT = "https://formspree.io/f/your-id";
```

A honeypot field (`company`) filters basic bots.

## Before you rely on it for SEO

`index.html` includes `LocalBusiness` / `EducationalOrganization` / `FAQPage`
JSON-LD. **Verify the real data first** — addresses, phone, opening hours.
`aggregateRating` is intentionally omitted until the real Google rating/count is
confirmed (unverifiable ratings risk a Google manual action). Update the
`canonical`/`og:url` if you deploy under a different domain or path.

## Known follow-ups

- **Photos are hot-linked Unsplash stock** loaded as CSS backgrounds. Replace
  with real photos of the centres and self-host them for authenticity + resilience.
- **French is complete sitewide but machine-translated** (Canadian French).
  Have a native speaker review before heavy promotion. Verbatim Google reviews
  and postal addresses are intentionally untranslated.
- **The exam board and availability cadence are illustrative**, not live seat
  data (clearly labelled as such). Wire to a real data source if you want true
  availability.
- **CFA registration URL** (`components.jsx` EXAMS) points at the CFA Institute
  register page — confirm it matches the exact flow the centre uses.
