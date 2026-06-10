/* ─────────────────────────────────────────────────────────────────────
   TROY TESTING — SITE CONFIGURATION (owner-editable, plain JavaScript)

   Edit the values below, save, commit. No rebuild needed — this file is
   loaded as-is. See OWNER-GUIDE.md for the full walkthrough.
   ───────────────────────────────────────────────────────────────────── */
window.TROY_CONFIG = {

  /* 1) CONTACT FORM + SEAT ALERTS → your inbox.
     Create a free form at https://formspree.io, then paste its endpoint:
       FORM_ENDPOINT: "https://formspree.io/f/abcdwxyz",
     While empty, the contact form falls back to opening the visitor's
     email app, and seat-alert signups do the same.                    */
  FORM_ENDPOINT: "",

  /* 2) VISITOR ANALYTICS (privacy-friendly, no cookies).
     Create a site at https://plausible.io, then put your domain here:
       PLAUSIBLE_DOMAIN: "matinsaiyed.com",
     Once set, the dashboard shows page views plus custom events:
     provider_click (exam hand-offs), seat_alert_signup, faq_no_match. */
  PLAUSIBLE_DOMAIN: "",

  /* 3) LIVE CONTENT FROM THE SCHEDULER (managers edit, site updates).
     The site first tries to read sessions + the announcement banner from the
     scheduler's database (the "Website" page in the scheduler app). If that's
     unreachable — paused project, offline — it falls back to the static
     sessions.json / announcements.json files, then to built-in defaults.
     The key below is the PUBLIC (publishable) key; writes still require a
     signed-in manager. Clear both values to disable the connection.        */
  SUPABASE_URL: "https://igfchvbzmvfveecivswb.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_iz7Rbg2pVJSBBIfMt6gXNw_CddgML0Z",
};

/* ── Do not edit below: activates analytics when configured ── */
(function () {
  var d = window.TROY_CONFIG.PLAUSIBLE_DOMAIN;
  if (!d) return;
  var s = document.createElement('script');
  s.defer = true;
  s.setAttribute('data-domain', d);
  s.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(s);
})();
