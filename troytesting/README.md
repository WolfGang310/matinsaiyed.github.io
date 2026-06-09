# Troy Testing & Learning Centers

A multi-page marketing site for an accredited **CELPIP** (Paragon) and **CFA**
(Prometric) exam-delivery centre serving Toronto & Mississauga. The site's job is
to build trust and route candidates to the official provider booking portals —
Troy does **not** book exams itself.

Implemented from a Claude Design handoff as split source files.

## How it runs

No build step by default. `index.html` loads the `.jsx` sources and compiles them
in the browser with [`@babel/standalone`](https://babeljs.io/docs/babel-standalone).
Drop the folder on any static host (GitHub Pages, Netlify, …) and it works.

**Script load order matters** (classic scripts sharing one global scope; the mount
in `app.jsx` must run last):

```
components.jsx → features.jsx → pages.jsx → home.jsx →
programs.jsx → test-center.jsx → contact.jsx → app.jsx
```

| File | Contains |
|------|----------|
| `components.jsx` | Header, Footer, ReserveModal, exam board, partner bar, scroll-reveal, counters, dialog-a11y hook |
| `features.jsx` | i18n table (`TR`/`t`), language toggle, find-my-exam wizard, diagnostic quiz, availability, CFA countdown, seat alerts, guides, gallery, FAB, section nav |
| `pages.jsx` | Availability, Reviews, Centres, FAQ pages |
| `home / programs / test-center / contact.jsx` | The remaining page components |
| `app.jsx` | Router, history, language state, mount |
| `styles.css` | All styling (incl. `prefers-reduced-motion`) |

## Configure the contact form

Out of the box the contact form composes an email in the visitor's mail client
(so it always delivers something). To receive submissions silently in-page,
create a free form at <https://formspree.io> and paste its endpoint into
`FORM_ENDPOINT` at the top of `contact.jsx`:

```js
const FORM_ENDPOINT = "https://formspree.io/f/your-id";
```

A honeypot field (`company`) filters basic bots.

## Before you rely on it for SEO

`index.html` includes `LocalBusiness` / `EducationalOrganization` JSON-LD.
**Verify the real data first** — addresses, phone, opening hours, and the
`aggregateRating` (review count / score). Google can penalize unverifiable
structured data. Also update the `canonical`/`og:url` if you deploy under a
different domain or path.

## Optional: production build

To stop shipping Babel + raw JSX (faster first load), precompile:

```bash
bash build.sh      # requires Node; outputs to dist/
```

`dist/` contains plain compiled `.js`, a Babel-free `index.html`, and assets —
deploy its contents. Re-run after editing any `.jsx`. (The default zero-build
flow is fine for low traffic; this is purely a performance optimization.)

## Known follow-ups

- **Photos are hot-linked Unsplash stock** loaded as CSS backgrounds. Replace
  with real photos of the centres and self-host them for authenticity + resilience.
- **French translations** are fully wired for: global nav + header, the Home
  page, the footer, the Contact page (form, options, validation, confirmation),
  the FAQ, and the Find-my-exam wizard. The remaining pages (Programs, Test
  Centre, Centres, Guides articles, the diagnostic quiz) still render English
  via the built-in fallback — the `lang` prop is already threaded everywhere, so
  finishing them is just adding keys to `TR` in `features.jsx` and swapping the
  literal strings for `t(lang, '…')`. Verbatim Google reviews and postal
  addresses are intentionally left untranslated. Have a native speaker review
  the French copy before relying on it.
- **The exam board is illustrative**, not live seat data (clearly labelled as
  such). Wire it to a real data source if you want true availability.
