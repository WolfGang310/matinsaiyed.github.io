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
