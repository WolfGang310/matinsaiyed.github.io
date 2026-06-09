// Troy Testing — shared components
const { useState, useEffect, useRef } = React;

// ─── Layout chrome ────────────────────
function Header({ route, go, lang, setLang, openWizard }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);
  const primaryLinks = [
    { id: 'home', label: t(lang, 'nav.home') },
    { id: 'programs', label: t(lang, 'nav.programs') },
    { id: 'test-center', label: t(lang, 'nav.testcenter') },
    { id: 'reviews', label: t(lang, 'nav.reviews') },
    { id: 'centres', label: t(lang, 'nav.centres') },
    { id: 'guides', label: t(lang, 'nav.guides') },
    { id: 'contact', label: t(lang, 'nav.contact') },
  ];
  const allLinks = [
    { id: 'home', label: t(lang, 'nav.home') },
    { id: 'programs', label: t(lang, 'nav.programs') },
    { id: 'test-center', label: t(lang, 'nav.testcenter') },
    { id: 'availability', label: t(lang, 'nav.availability') },
    { id: 'reviews', label: t(lang, 'nav.reviews') },
    { id: 'centres', label: t(lang, 'nav.centres') },
    { id: 'faq', label: t(lang, 'nav.faq') },
    { id: 'guides', label: t(lang, 'nav.guides') },
    { id: 'contact', label: t(lang, 'nav.contact') },
  ];
  const navTo = (id) => { setMenuOpen(false); go(id); };
  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <a className="skip-link" href="#main" onClick={e => { const m = document.getElementById('main'); if (m) { e.preventDefault(); m.focus(); m.scrollIntoView(); } }}>Skip to content</a>
      <div className="container inner">
        <a className="brand" href="#home" onClick={e => { e.preventDefault(); navTo('home'); }}>
          <img src={window.__TROY_LOGO__ || "logo.jpg"} alt="Troy Testing & Learning Centers" className="brand-logo" />
        </a>
        <nav className="nav" aria-label="Primary">
          {primaryLinks.map(l => (
            <a key={l.id}
              href={`#${l.id}`}
              className={route === l.id ? 'active' : ''}
              onClick={e => { e.preventDefault(); navTo(l.id); }}>{l.label}</a>
          ))}
        </nav>
        <div className="header-cta">
          {setLang && <LangToggle lang={lang} setLang={setLang} />}
          <button className="btn find-exam-btn" onClick={() => (openWizard ? openWizard() : go('test-center'))}>
            {t(lang, 'cta.find')} <span className="arrow" />
          </button>
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(o => !o)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <nav className="mobile-nav" aria-label="Mobile">
          {allLinks.map(l => (
            <a key={l.id}
              href={`#${l.id}`}
              className={route === l.id ? 'active' : ''}
              onClick={e => { e.preventDefault(); navTo(l.id); }}>
              {l.label}<span className="mm-arrow">→</span>
            </a>
          ))}
        </nav>
        <div className="mobile-menu-foot">
          <button className="btn" onClick={() => { setMenuOpen(false); (openWizard ? openWizard() : go('test-center')); }}>
            {t(lang, 'cta.find')} <span className="arrow" />
          </button>
          <a className="mm-tel" href="tel:+14372640311">+1 437 264 0311</a>
          {setLang && <LangToggle lang={lang} setLang={setLang} />}
        </div>
      </div>
      {menuOpen && <div className="mobile-scrim" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}

function Footer({ go, lang = 'en' }) {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">Troy Testing<em>.</em></div>
            <p style={{ maxWidth: 340, margin: 0, fontSize: 14, color: 'var(--muted)' }}>
              {t(lang, 'foot.blurb')}
            </p>
          </div>
          <div>
            <h4>{t(lang, 'foot.explore')}</h4>
            <ul>
              <li><a href="#programs" onClick={e => { e.preventDefault(); go('programs'); }}>{t(lang, 'nav.programs')}</a></li>
              <li><a href="#test-center" onClick={e => { e.preventDefault(); go('test-center'); }}>{t(lang, 'nav.testcenter')}</a></li>
              <li><a href="#availability" onClick={e => { e.preventDefault(); go('availability'); }}>{t(lang, 'nav.availability')}</a></li>
              <li><a href="#guides" onClick={e => { e.preventDefault(); go('guides'); }}>{t(lang, 'nav.guides')}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t(lang, 'foot.visit')}</h4>
            <ul>
              <li><a href="#reviews" onClick={e => { e.preventDefault(); go('reviews'); }}>{t(lang, 'nav.reviews')}</a></li>
              <li><a href="#centres" onClick={e => { e.preventDefault(); go('centres'); }}>{t(lang, 'nav.centres')}</a></li>
              <li><a href="#faq" onClick={e => { e.preventDefault(); go('faq'); }}>{t(lang, 'nav.faq')}</a></li>
              <li><a href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>{t(lang, 'nav.contact')}</a></li>
            </ul>
          </div>
          <div>
            <h4>{t(lang, 'foot.contact')}</h4>
            <ul>
              <li><a href="tel:+14372640311">+1 437 264 0311</a></li>
              <li><a href="mailto:hello@troytesting.com">hello@troytesting.com</a></li>
              <li>{t(lang, 'foot.hours')}</li>
            </ul>
          </div>
        </div>
        <div className="footer-bot">
          <div>© 2014 – 2026 Troy Testing &amp; Learning Centers</div>
          <div>
            <a href="#privacy" onClick={e => { e.preventDefault(); go('privacy'); }}>{t(lang, 'foot.privacy')}</a>
            {' · '}{t(lang, 'foot.rights')}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Accessible dialog hook (focus on open, trap Tab, restore focus on close) ──────
function useDialogA11y(open) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const node = ref.current;
    if (!node) return;
    const prev = document.activeElement;
    const sel = 'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
    const visible = (el) => el.offsetParent !== null || el === node;
    const focusables = () => Array.from(node.querySelectorAll(sel)).filter(visible);
    (focusables()[0] || node).focus();
    const onKey = (e) => {
      if (e.key !== 'Tab') return;
      const f = focusables();
      if (!f.length) { e.preventDefault(); node.focus(); return; }
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    };
    node.addEventListener('keydown', onKey);
    return () => { node.removeEventListener('keydown', onKey); if (prev && prev.focus) try { prev.focus(); } catch (_) {} };
  }, [open]);
  return ref;
}

// ─── Provider redirect modal ────────────────────
function ReserveModal({ exam, close, go }) {
  const dref = useDialogA11y(!!exam);
  const [sent, setSent] = useState(false);
  if (!exam) return null;
  const isCfa = exam.flow === 'cfa';
  const centre = exam.preferredCenter || 'Toronto or Mississauga';
  const goProvider = () => {
    try { window.troyTrack && window.troyTrack('provider_click', { exam: exam.code, org: exam.org, centre }); } catch (_) {}
    setSent(true); // anchor still opens the provider in a new tab; we surface the hand-off reminder
  };
  return (
    <div className="modal-bg" onClick={close}>
      <div className="modal" ref={dref} role="dialog" aria-modal="true" aria-label={`Book ${exam.name}`} tabIndex={-1} onClick={e => e.stopPropagation()}>
        {!sent ? (
          <>
            <div className="eyebrow">{isCfa ? `Register with ${exam.org}` : `Book on ${exam.org}`} · {exam.code}</div>
            <h3>{exam.name}</h3>
            <p>
              {isCfa
                ? <>Registration is handled by <strong>{exam.org}</strong>. Register online, then schedule your seat at our <strong>{centre}</strong> centre — a {exam.scheduler} site. Bring valid photo ID on exam day.</>
                : <>Booking is made directly with <strong>{exam.org}</strong>. Pick your date on their portal and choose Troy Testing — <strong>{centre}</strong> as your location. Bring valid photo ID on the day.</>}
            </p>
            <div className="modal-actions">
              <a className="btn" href={exam.url} target="_blank" rel="noopener" onClick={goProvider}>
                {isCfa ? `Register with ${exam.org}` : `Go to ${exam.org}`} <span className="arrow" />
              </a>
              <button className="btn ghost" onClick={close}>Not now</button>
            </div>
          </>
        ) : (
          <>
            <div className="eyebrow" style={{ color: 'var(--accent)' }}>One thing before you go</div>
            <h3>Select Troy Testing — {centre}</h3>
            <p>When you pick your {isCfa ? 'test centre' : 'location'}, choose <strong>Troy Testing — {centre}</strong>. That’s how your seat lands with us. The {exam.org} tab should have opened in a new window.</p>
            <div className="modal-actions">
              <a className="btn" href={exam.url} target="_blank" rel="noopener" onClick={goProvider}>Reopen {exam.org} <span className="arrow" /></a>
              {go && <button className="btn ghost" onClick={() => { close(); go('contact'); }}>Questions? Message us</button>}
            </div>
          </>
        )}
        <button className="close" onClick={close}>Close (Esc)</button>
      </div>
    </div>
  );
}

// ─── Exam data ────────────────────
// `flow` drives the booking copy: CELPIP books directly on Paragon; CFA registers on the
// CFA Institute site and then schedules a seat at our Prometric centre.
// NOTE: confirm the exact provider URLs and current CFA fees before launch.
const EXAMS = [
  { code: 'CELPIP-G', name: 'CELPIP General', org: 'Paragon Testing', flow: 'celpip', url: 'https://secure.paragontesting.ca/', featured: true,
    fee: 'CA$ 280', duration: '3 hrs', seats: 'Daily seats', preferredCenter: 'North York' },
  { code: 'CELPIP-LS', name: 'CELPIP General LS', org: 'Paragon Testing', flow: 'celpip', url: 'https://secure.paragontesting.ca/', featured: false,
    fee: 'CA$ 195', duration: '1h 10m', seats: 'Weekly seats', preferredCenter: 'North York' },
  { code: 'CFA-I', name: 'CFA Level I', org: 'CFA Institute', scheduler: 'Prometric', flow: 'cfa', url: 'https://www.cfainstitute.org/programs/cfa/exam/register', featured: true,
    fee: 'from US$ 990 (by window)', duration: '4h 30m', seats: 'Feb / May / Aug / Nov', preferredCenter: 'Mississauga' },
  { code: 'CFA-II', name: 'CFA Level II', org: 'CFA Institute', scheduler: 'Prometric', flow: 'cfa', url: 'https://www.cfainstitute.org/programs/cfa/exam/register', featured: false,
    fee: 'from US$ 990 (by window)', duration: '4h 30m', seats: 'May / Aug / Nov', preferredCenter: 'Mississauga' },
  { code: 'CFA-III', name: 'CFA Level III', org: 'CFA Institute', scheduler: 'Prometric', flow: 'cfa', url: 'https://www.cfainstitute.org/programs/cfa/exam/register', featured: false,
    fee: 'from US$ 990 (by window)', duration: '4h 30m', seats: 'Feb / Aug', preferredCenter: 'Mississauga' },
];

Object.assign(window, { Header, Footer, ReserveModal, EXAMS, useReveal, Reveal, Counter, PartnerBar, Swap, ExamBoard, useDialogA11y });

// ─── Kinetic word-swap ────────────────────
function Swap({ words, interval = 2600, className = '' }) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState('in');
  useEffect(() => {
    const t = setInterval(() => {
      setPhase('out');
      setTimeout(() => { setI(p => (p + 1) % words.length); setPhase('in'); }, 340);
    }, interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  // width holder uses the longest word to avoid layout shift
  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
  return (
    <span className={`swap ${className}`}>
      <span className="swap-ghost" aria-hidden="true">{longest}</span>
      <span className={`swap-word ${phase}`}>{words[i]}</span>
    </span>
  );
}

// ─── Split-flap cell ────────────────────
const FLAP_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·:/';
function FlipCell({ target, steps = 7, speed = 42 }) {
  const [ch, setCh] = useState('\u00A0');
  useEffect(() => {
    if (target === ' ') { setCh('\u00A0'); return; }
    let n = 0;
    const iv = setInterval(() => {
      n++;
      if (n >= steps) { setCh(target); clearInterval(iv); }
      else setCh(FLAP_GLYPHS[Math.floor(Math.random() * FLAP_GLYPHS.length)]);
    }, speed);
    return () => clearInterval(iv);
  }, [target, steps, speed]);
  return <span className="flap-cell">{ch}</span>;
}
function FlipText({ text, stepBase = 5 }) {
  const chars = String(text).split('');
  return (
    <span className="flap">
      {chars.map((c, i) => <FlipCell key={i + '-' + c} target={c} steps={stepBase + (i % 5)} />)}
    </span>
  );
}

// ─── Live exam board ────────────────────
const BOARD_BASE = [
  { exam: 'CELPIP GENERAL', centre: 'NORTH YORK', when: 'TODAY 14:00', status: 'open' },
  { exam: 'CELPIP GEN LS', centre: 'NORTH YORK', when: 'TOMORROW 09:30', status: 'filling' },
  { exam: 'CFA LEVEL I', centre: 'MISSISSAUGA', when: '21 MAY 08:00', status: 'open' },
  { exam: 'CFA LEVEL II', centre: 'MISSISSAUGA', when: '22 AUG 08:00', status: 'waitlist' },
  { exam: 'CELPIP GENERAL', centre: 'MISSISSAUGA', when: 'FRI 11:00', status: 'open' },
];
const STATUS_LABEL = { open: 'SEATS OPEN', filling: 'FILLING FAST', waitlist: 'WAITLIST', full: 'FULL' };

function ExamBoard() {
  // A representative (illustrative) departures-style board — NOT live seat data.
  // Statuses are a static snapshot so the UI never invents availability that could
  // mislead a candidate. Real seats are always confirmed on the provider's portal.
  const [rows] = useState(BOARD_BASE);
  const [clock, setClock] = useState('');
  useEffect(() => {
    // Decorative wall-clock (current local time).
    const fmt = () => {
      const d = new Date();
      const p = (n) => String(n).padStart(2, '0');
      setClock(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    fmt();
    const c = setInterval(fmt, 1000);
    return () => clearInterval(c);
  }, []);
  return (
    <div className="exam-board" role="img" aria-label="Illustrative board of typical CELPIP and CFA exam sessions across the North York and Mississauga centres. Seats are booked on the provider's portal.">
      <div className="board-top" aria-hidden="true">
        <div className="board-title">
          <span className="board-live"><span className="live-dot" />SAMPLE</span>
          <span>Typical exam sessions</span>
        </div>
        <div className="board-clock">{clock}</div>
      </div>
      <div className="board-cols" aria-hidden="true">
        <span>Exam</span><span>Centre</span><span>Session</span><span className="ta-r">Status</span>
      </div>
      <div className="board-rows" aria-hidden="true">
        {rows.map((r, i) => (
          <div className="board-row" key={i}>
            <span className="bc bexam"><FlipText text={r.exam} /></span>
            <span className="bc centre"><FlipText text={r.centre} /></span>
            <span className="bc when"><FlipText text={r.when} /></span>
            <span className="bc status ta-r">
              <span className={`pill ${r.status}`}><span className="pill-dot" />{STATUS_LABEL[r.status]}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="board-foot" aria-hidden="true">
        <span>Toronto · Mississauga</span>
        <span>Illustrative — book live seats on the provider portal</span>
      </div>
    </div>
  );
}

// ─── Scroll-reveal hook (scroll-position based, rAF/IO-independent) ──────────
function useReveal() {
  useEffect(() => {
    const check = () => {
      const h = window.innerHeight || document.documentElement.clientHeight;
      document.querySelectorAll('.reveal:not(.in)').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.top < h * 0.94) el.classList.add('in');
      });
    };
    const revealAll = () => document.querySelectorAll('.reveal:not(.in)').forEach(el => el.classList.add('in'));
    check();
    const timers = [80, 260, 600, 1200].map(ms => setTimeout(check, ms));
    // Failsafe: never let content stay hidden even if scroll detection fails
    const failsafe = setTimeout(revealAll, 2600);
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      timers.forEach(clearTimeout);
      clearTimeout(failsafe);
    };
  });
}

// ─── Reveal wrapper ────────────────────
function Reveal({ as = 'div', delay = 0, className = '', children, ...rest }) {
  const Tag = as;
  return (
    <Tag className={`reveal ${className}`} style={{ transitionDelay: delay + 'ms', ...(rest.style || {}) }} {...rest}>
      {children}
    </Tag>
  );
}

// ─── Animated counter (timer-based, fires even when rAF throttled) ──────────
function Counter({ to, suffix = '', prefix = '', decimals = 0, duration = 1400 }) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let iv = 0;
    let timers = [];
    const start = () => {
      if (done.current) return; done.current = true;
      const t0 = Date.now();
      iv = setInterval(() => {
        const p = Math.min(1, (Date.now() - t0) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        setVal(to * eased);
        if (p >= 1) clearInterval(iv);
      }, 32);
    };
    const cleanup = () => {
      window.removeEventListener('scroll', check);
      timers.forEach(clearTimeout);
    };
    const check = () => {
      const h = window.innerHeight || document.documentElement.clientHeight;
      if (el.getBoundingClientRect().top < h * 0.94) { start(); cleanup(); }
    };
    timers = [150, 500, 1000].map(ms => setTimeout(check, ms));
    window.addEventListener('scroll', check, { passive: true });
    check();
    return () => { window.removeEventListener('scroll', check); timers.forEach(clearTimeout); if (iv) clearInterval(iv); };
  }, [to, duration]);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-US');
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

// ─── Partner / accreditation bar ────────────────────
const PARTNERS = [
  { name: 'Paragon Testing', sub: 'CELPIP', note: 'Official CELPIP test centre' },
  { name: 'Prometric', sub: 'CFA delivery', note: 'Authorized CFA test site' },
  { name: 'CFA Institute', sub: 'CFA Program', note: 'Recognized exam location' },
];
function PartnerBar({ compact = false }) {
  return (
    <div className={`partner-bar ${compact ? 'compact' : ''}`}>
      <div className="partner-label">Authorized delivery site for</div>
      <div className="partner-list">
        {PARTNERS.map((p) => (
          <div className="partner" key={p.name} title={p.note}>
            <span className="partner-seal" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18"><path d="M9 12.5l2 2 4.5-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5"/></svg>
            </span>
            <span className="partner-text">
              <span className="partner-name">{p.name}</span>
              <span className="partner-sub">{p.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
