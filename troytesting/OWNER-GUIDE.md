# Owner's Guide — running the Troy Testing site

## ⭐ Easiest way: the scheduler's "Website" page

Managers can edit the public site **directly from the scheduler app**
(matinsaiyed.com/scheduler → log in as a manager → **Website** in the sidebar):

- **Exam sessions** — the homepage departures board + Availability page,
  including the Live toggle and status pills.
- **Announcement banner** — publish or take down the red banner in one click.

Changes publish to the site within a minute. No files, no commits.

The site reads that database first and **falls back automatically** to the
files below if the database is paused or unreachable — so the file route keeps
working as a backup, and nothing the scheduler does can break the site.

---

The fallback files below can be edited right in the GitHub web interface
(open the file → pencil icon → commit) — no rebuild needed.

## 1. `sessions.json` — the exam sessions shown on the site

Drives the departures board on the homepage **and** the Availability page.

```json
{
  "live": false,
  "updated": "2026-06-09",
  "sessions": [
    { "code": "CELPIP-G", "label": "CELPIP General", "centre": "North York",
      "when": "Sat Jun 14 · 09:00", "whenFr": "Sam 14 juin · 9 h", "status": "open" }
  ]
}
```

- **`live`** — leave `false` and the site labels everything "Sample".
  Set it to `true` **only once you commit to keeping the rows accurate** —
  the labels then switch to "Updated {date}" and status pills appear.
- **`updated`** — change this date every time you edit the rows.
- **`when`** — free text: a date/time, or a cadence like `"Daily seats"`.
  `whenFr` is the French version (falls back to `when` if empty).
- **`status`** — `open`, `filling`, `waitlist`, `full`, or `""` for none.
  Status pills only show when `live` is `true`.
- **`code`** must be one of: `CELPIP-G`, `CELPIP-LS`, `CFA-I`, `CFA-II`,
  `CFA-III` (it links the row to the right provider booking page).
- Keep **5–6 rows** — the homepage board shows at most 6.

## 2. `announcements.json` — the red banner across the top

```json
{
  "message": "Holiday hours: closed Dec 25–26. CELPIP sessions resume Dec 27.",
  "messageFr": "Horaire des Fêtes : fermé les 25 et 26 déc.",
  "link": "#availability",
  "linkText": "See sessions",
  "linkTextFr": "Voir les séances",
  "until": "2026-12-27"
}
```

- Empty `message` = no banner. `until` (YYYY-MM-DD) auto-hides it after that date.
- `link` can be an internal page (`#availability`, `#contact`, …) or a full URL.
- Visitors can dismiss the banner; changing the message shows it again to everyone.

## 3. `config.js` — connect your accounts (one-time setup)

- **Get contact-form + seat-alert submissions in your inbox:** create a free
  form at [formspree.io](https://formspree.io), copy its endpoint, and paste it
  into `FORM_ENDPOINT`. Seat-alert rows arrive tagged `form: seat-alert`.
- **See visitor analytics:** create a site at [plausible.io](https://plausible.io)
  and put your domain in `PLAUSIBLE_DOMAIN`. The dashboard then shows, beyond
  page views: **provider_click** (who you handed off to Paragon/CFA, per exam),
  **seat_alert_signup**, and **faq_no_match** (questions visitors searched for
  that the FAQ couldn't answer — your list of content to add).

---

## Everything else (code changes)

The page copy, exams, prices and guides live in the `.jsx` source files; the
site serves compiled `.js`. After editing any `.jsx`: run `bash build.sh`,
bump `?v=` in `index.html` and `CACHE` in `sw.js`, commit both. Full details
in `README.md`.
