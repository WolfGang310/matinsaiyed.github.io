/* ─────────────────────────────────────────────────────────────────────
   TROY TESTING — SITE CONFIGURATION (owner-editable, plain JavaScript)
   Edit the values below, save, commit. No rebuild needed. See OWNER-GUIDE.md.
   ───────────────────────────────────────────────────────────────────── */
window.TROY_CONFIG = {
  /* 1) CONTACT FORM + RFP → your inbox. Create a free form at
     https://formspree.io, then paste its endpoint here, e.g.
       FORM_ENDPOINT: "https://formspree.io/f/abcdwxyz",
     While empty, forms fall back to opening the visitor's email app. */
  FORM_ENDPOINT: "",

  /* 2) VISITOR ANALYTICS (privacy-friendly). Put your domain here to enable
     Plausible, e.g. PLAUSIBLE_DOMAIN: "matinsaiyed.com". Empty = off. */
  PLAUSIBLE_DOMAIN: "",

  /* 3) LIVE CONTENT FROM THE SCHEDULER. The site reads exam sessions + the
     announcement banner from the scheduler's database (the "Website" page in
     the scheduler app) first, then falls back to sessions.json /
     announcements.json, then to built-in defaults. Publishable key only —
     writes still require a signed-in manager. Clear both to disable. */
  SUPABASE_URL: "https://igfchvbzmvfveecivswb.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_iz7Rbg2pVJSBBIfMt6gXNw_CddgML0Z",
};

/* ── Do not edit below: activates analytics when configured ── */
(function () {
  var d = window.TROY_CONFIG.PLAUSIBLE_DOMAIN;
  if (!d) return;
  var s = document.createElement('script');
  s.defer = true; s.setAttribute('data-domain', d);
  s.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(s);
})();
