// Main app shell
const { useState: useStateA, useEffect: useEffectA } = React;

// Per-route <title> + meta description. The pages share one URL (#hash), so we update
// these on navigation for better sharing/bookmarks and as a hint to JS-executing crawlers.
const ROUTE_META = {
  home: { t: 'Troy Testing & Learning Centers — CELPIP & CFA exam centre, GTA', d: 'Authorized CELPIP (Paragon) and CFA (Prometric) exam delivery in Toronto & Mississauga. Quiet, on-time rooms — book with the provider, sit the exam with us.' },
  programs: { t: 'Programs — Tutoring & CELPIP / CFA Test Prep | Troy Testing', d: 'Academic tutoring plus CELPIP and CFA test-prep programs, taught by top-percentile instructors. Diagnostic-first, in-person or hybrid.' },
  'test-center': { t: 'Exams We Host — CELPIP & CFA | Troy Testing', d: 'Sit CELPIP (Paragon) and CFA (Prometric) exams at our North York & Mississauga centres. Book on the provider; we host the seat.' },
  availability: { t: 'Upcoming Sessions & CFA Window | Troy Testing', d: 'Typical CELPIP and CFA session cadence across both GTA centres, plus the next CFA exam window. Book live seats on the provider portal.' },
  reviews: { t: 'Candidate Reviews | Troy Testing', d: 'Verified Google reviews from candidates who sat their CELPIP exam at Troy Testing in the GTA.' },
  centres: { t: 'Centres — North York & Mississauga | Troy Testing', d: 'Two GTA exam centres: North York (CELPIP) and Mississauga (CFA). Directions, transit and parking.' },
  faq: { t: 'FAQ — Booking, ID & Exam Day | Troy Testing', d: 'Common questions about booking CELPIP/CFA, identification, exam-day logistics and prep at Troy Testing.' },
  guides: { t: 'Guides — CELPIP & CFA Prep | Troy Testing', d: 'Plain-English guides on choosing and preparing for CELPIP and CFA, from the people who run the room.' },
  contact: { t: 'Contact Troy Testing — CELPIP & CFA Centre, GTA', d: 'Questions about booking CELPIP or CFA, or about prep? Message the team or call +1 437 264 0311.' },
  privacy: { t: 'Privacy Policy | Troy Testing', d: 'How Troy Testing & Learning Centers collects, uses and protects your personal information.' },
};

function App() {
  const [route, setRoute] = useStateA(() => {
    const saved = localStorage.getItem('troy.route');
    const hash = window.location.hash.replace('#', '');
    return hash || saved || 'home';
  });
  const [reserve, setReserve] = useStateA(null);
  const [wizardOpen, setWizardOpen] = useStateA(false);
  const [quizOpen, setQuizOpen] = useStateA(false);
  const [lang, setLang] = useStateA(() => { try { return localStorage.getItem('troy.lang') || 'en'; } catch (_) { return 'en'; } });

  const go = (r) => {
    setRoute(r);
    try { localStorage.setItem('troy.route', r); } catch (_) {}
    // Push a real history entry so the browser Back/Forward buttons navigate between pages.
    if (('#' + r) !== window.location.hash) window.history.pushState({ route: r }, '', '#' + r);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const setLangP = (l) => { setLang(l); try { localStorage.setItem('troy.lang', l); } catch (_) {} };

  // Keep <html lang> in sync for accessibility + SEO
  useEffectA(() => { document.documentElement.lang = lang; }, [lang]);

  // Per-route document title + meta description
  useEffectA(() => {
    const m = ROUTE_META[route] || ROUTE_META.home;
    document.title = m.t;
    let el = document.querySelector('meta[name="description"]');
    if (!el) { el = document.createElement('meta'); el.setAttribute('name', 'description'); document.head.appendChild(el); }
    el.setAttribute('content', m.d);
  }, [route]);

  // ESC closes overlays
  useEffectA(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setReserve(null); setWizardOpen(false); setQuizOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Sync route with browser Back/Forward (popstate) and external hash changes.
  useEffectA(() => {
    const sync = () => {
      const r = window.location.hash.replace('#', '') || 'home';
      setRoute(r);
      try { localStorage.setItem('troy.route', r); } catch (_) {}
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => { window.removeEventListener('popstate', sync); window.removeEventListener('hashchange', sync); };
  }, []);

  // Re-scan scroll-reveal targets on every route/render
  useReveal();

  const Page = {
    'home': HomePage,
    'programs': ProgramsPage,
    'test-center': TestCenterPage,
    'availability': AvailabilityPage,
    'reviews': ReviewsPage,
    'centres': CentresPage,
    'faq': FAQPage,
    'guides': GuidesPage,
    'contact': ContactPage,
    'privacy': PrivacyPage,
  }[route] || HomePage;

  const openWizard = () => setWizardOpen(true);
  const openQuiz = () => setQuizOpen(true);

  return (
    <>
      <AnnouncementBanner lang={lang} go={go} />
      <Header route={route} go={go} lang={lang} setLang={setLangP} openWizard={openWizard} />
      <div id="main" tabIndex={-1} data-screen-label={route}>
        <Page go={go} openReserve={setReserve} openWizard={openWizard} openQuiz={openQuiz} lang={lang} />
      </div>
      <Footer go={go} lang={lang} />
      {reserve && <ReserveModal exam={reserve} close={() => setReserve(null)} go={go} lang={lang} />}
      <ExamWizard open={wizardOpen} close={() => setWizardOpen(false)} lang={lang} />
      <DiagnosticQuiz open={quizOpen} close={() => setQuizOpen(false)} go={go} lang={lang} />
      <CallFab lang={lang} />
      {!(reserve || wizardOpen || quizOpen) && (
        <div className="mobile-book-bar">
          <button className="btn" onClick={openWizard}>{t(lang, 'cta.find')} <span className="arrow" /></button>
        </div>
      )}
    </>
  );
}

// Idempotent mount (safe against double-execution in instrumented mode)
(function mountTroy() {
  const el = document.getElementById('root');
  if (!el) return;
  if (!window.__troyRoot) window.__troyRoot = ReactDOM.createRoot(el);
  window.__troyRoot.render(<App />);
})();
