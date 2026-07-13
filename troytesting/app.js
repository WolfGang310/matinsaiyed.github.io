/* Troy Testing - precompiled from Claude Design handoff. Do not edit by hand. */
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState,
  useEffect,
  useRef
} = React;
/* ============================================================
   Glossy 3D-ish inline SVG icon system — replaces every emoji.
   Icon({name,size,color,title}) renders an <svg> that references a
   shared, self-contained sprite of glossy symbols (rounded gradient
   "chip" badges with a top gloss highlight + a rim, plus currentColor
   UI glyphs and gold stars). The sprite lives inline in index.html
   (id="ti-sprite"); gradient defs are shared once, currentColor flows
   through <use> so control glyphs adapt to their context colour.
   Decorative by default (aria-hidden); pass `title` for a labelled img.
   ============================================================ */
function Icon({
  name,
  size = 28,
  color,
  title,
  style
}) {
  const st = {
    display: 'inline-block',
    lineHeight: 0,
    verticalAlign: 'middle',
    flex: 'none'
  };
  if (color) st.color = color;
  if (style) Object.assign(st, style);
  const href = '#ti-' + name;
  return React.createElement("svg", {
    className: "ticon",
    width: size,
    height: size,
    viewBox: "0 0 32 32",
    style: st,
    focusable: "false",
    role: title ? 'img' : undefined,
    'aria-label': title || undefined,
    'aria-hidden': title ? undefined : 'true'
  }, React.createElement("use", {
    href: href,
    xlinkHref: href
  }));
}
window.Icon = Icon;
/* Curated Unsplash CDN photo URL for full-bleed feature cards.
   Same stable direct-CDN form the site already uses on .ph/.gphoto/.photo. */
function PHOTO(id, w) {
  return 'https://images.unsplash.com/photo-' + id + '?w=' + (w || 800) + '&q=80&auto=format&fit=crop';
}
window.PHOTO = PHOTO;
function useFocusTrap(active, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!active) return;
    const node = ref.current;
    if (!node) return;
    const prev = document.activeElement;
    const SEL = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
    const list = () => Array.from(node.querySelectorAll(SEL)).filter(el => el.offsetParent !== null);
    const first = list()[0];
    (first || node).focus();
    const onKey = e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose && onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const f = list();
      if (!f.length) {
        e.preventDefault();
        return;
      }
      const a = f[0],
        b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        b.focus();
      } else if (!e.shiftKey && document.activeElement === b) {
        e.preventDefault();
        a.focus();
      }
    };
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      if (prev && prev.focus) {
        try {
          prev.focus();
        } catch (_) {}
      }
    };
  }, [active]);
  return ref;
}
const __siteJsonCache = {};
const __SUPA_KEYS = {
  'sessions.json': 'sessions',
  'announcements.json': 'announcement'
};
function __fetchSiteData(file) {
  const cfg = window.TROY_CONFIG || {};
  const key = __SUPA_KEYS[file];
  const fromFile = () => fetch(file, {
    cache: 'no-cache'
  }).then(r => r.ok ? r.json() : null).catch(() => null);
  if (!key || !cfg.SUPABASE_URL || !cfg.SUPABASE_ANON_KEY) return fromFile();
  return fetch(`${cfg.SUPABASE_URL}/rest/v1/website_content?key=eq.${key}&select=data`, {
    cache: 'no-store',
    headers: {
      apikey: cfg.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${cfg.SUPABASE_ANON_KEY}`
    }
  }).then(r => r.ok ? r.json() : Promise.reject(new Error('rest ' + r.status))).then(rows => Array.isArray(rows) && rows.length && rows[0].data ? rows[0].data : fromFile()).catch(fromFile);
}
function useSiteJson(file) {
  const [data, setData] = useState(__siteJsonCache[file]);
  useEffect(() => {
    let on = true;
    if (__siteJsonCache[file] !== undefined) {
      setData(__siteJsonCache[file]);
      return;
    }
    __fetchSiteData(file).then(d => {
      __siteJsonCache[file] = d;
      if (on) setData(d);
    });
    return () => {
      on = false;
    };
  }, [file]);
  return data;
}
function Header({
  route,
  go,
  lang,
  setLang,
  openWizard
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, {
      passive: true
    });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);
  const primaryLinks = [{
    id: 'home',
    label: t(lang, 'nav.home')
  }, {
    id: 'programs',
    label: t(lang, 'nav.programs')
  }, {
    id: 'test-center',
    label: t(lang, 'nav.testcenter')
  }, {
    id: 'centres',
    label: t(lang, 'nav.centres')
  }, {
    id: 'guides',
    label: t(lang, 'nav.guides')
  }, {
    id: 'corporate',
    label: t(lang, 'nav.corporate')
  }, {
    id: 'contact',
    label: t(lang, 'nav.contact')
  }];
  const allLinks = [{
    id: 'home',
    label: t(lang, 'nav.home')
  }, {
    id: 'programs',
    label: t(lang, 'nav.programs')
  }, {
    id: 'test-center',
    label: t(lang, 'nav.testcenter')
  }, {
    id: 'availability',
    label: t(lang, 'nav.availability')
  }, {
    id: 'reviews',
    label: t(lang, 'nav.reviews')
  }, {
    id: 'centres',
    label: t(lang, 'nav.centres')
  }, {
    id: 'faq',
    label: t(lang, 'nav.faq')
  }, {
    id: 'guides',
    label: t(lang, 'nav.guides')
  }, {
    id: 'corporate',
    label: t(lang, 'nav.corporate')
  }, {
    id: 'contact',
    label: t(lang, 'nav.contact')
  }];
  const navTo = id => {
    setMenuOpen(false);
    go(id);
  };
  return React.createElement("header", {
    className: `site-header ${scrolled ? 'scrolled' : ''}`
  }, React.createElement("div", {
    className: "container inner"
  }, React.createElement("a", {
    className: "brand",
    href: "#home",
    onClick: e => {
      e.preventDefault();
      navTo('home');
    }
  }, React.createElement("img", {
    src: window.__TROY_LOGO__ || "logo.jpg",
    alt: "Troy Testing & Learning Centers",
    className: "brand-logo"
  })), React.createElement("nav", {
    className: "nav",
    "aria-label": "Primary"
  }, primaryLinks.map(l => React.createElement("a", {
    key: l.id,
    href: `#${l.id}`,
    className: route === l.id ? 'active' : '',
    "aria-current": route === l.id ? 'page' : undefined,
    onClick: e => {
      e.preventDefault();
      navTo(l.id);
    }
  }, l.label))), React.createElement("div", {
    className: "header-cta"
  }, setLang && React.createElement(LangToggle, {
    lang: lang,
    setLang: setLang
  }), React.createElement("button", {
    className: "btn find-exam-btn",
    onClick: () => openWizard ? openWizard() : go('test-center')
  }, t(lang, 'cta.find'), " ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("button", {
    className: `hamburger ${menuOpen ? 'open' : ''}`,
    "aria-label": "Menu",
    "aria-expanded": menuOpen,
    onClick: () => setMenuOpen(o => !o)
  }, React.createElement("span", null), React.createElement("span", null), React.createElement("span", null)))), React.createElement("div", {
    className: `mobile-menu ${menuOpen ? 'open' : ''}`
  }, React.createElement("nav", {
    className: "mobile-nav"
  }, allLinks.map(l => React.createElement("a", {
    key: l.id,
    href: `#${l.id}`,
    className: route === l.id ? 'active' : '',
    "aria-current": route === l.id ? 'page' : undefined,
    onClick: e => {
      e.preventDefault();
      navTo(l.id);
    }
  }, l.label, React.createElement("span", {
    className: "mm-arrow"
  }, "\u2192")))), React.createElement("div", {
    className: "mobile-menu-foot"
  }, React.createElement("button", {
    className: "btn",
    onClick: () => {
      setMenuOpen(false);
      openWizard ? openWizard() : go('test-center');
    }
  }, t(lang, 'cta.find'), " ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("a", {
    className: "mm-tel",
    href: "tel:+14372640311"
  }, "+1 437 264 0311"), setLang && React.createElement(LangToggle, {
    lang: lang,
    setLang: setLang
  }))), menuOpen && React.createElement("div", {
    className: "mobile-scrim",
    onClick: () => setMenuOpen(false)
  }));
}
function Footer({
  go
}) {
  return React.createElement("footer", {
    className: "site-footer"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "footer-grid"
  }, React.createElement("div", null, React.createElement("div", {
    className: "footer-brand"
  }, "Troy Testing", React.createElement("em", null, ".")), React.createElement("p", {
    style: {
      maxWidth: 340,
      margin: 0,
      fontSize: 14,
      color: 'var(--muted)'
    }
  }, "One of Canada's best test centre services \u2014 and the GTA's top-rated CELPIP centre on Google. Serving students and professionals across North America since 2014.")), React.createElement("div", null, React.createElement("h4", null, "Explore"), React.createElement("ul", null, React.createElement("li", null, React.createElement("a", {
    href: "#programs",
    onClick: e => {
      e.preventDefault();
      go('programs');
    }
  }, "Programs")), React.createElement("li", null, React.createElement("a", {
    href: "#test-center",
    onClick: e => {
      e.preventDefault();
      go('test-center');
    }
  }, "Exams")), React.createElement("li", null, React.createElement("a", {
    href: "#availability",
    onClick: e => {
      e.preventDefault();
      go('availability');
    }
  }, "Availability")), React.createElement("li", null, React.createElement("a", {
    href: "#guides",
    onClick: e => {
      e.preventDefault();
      go('guides');
    }
  }, "Guides")), React.createElement("li", null, React.createElement("a", {
    href: "#corporate",
    onClick: e => {
      e.preventDefault();
      go('corporate');
    }
  }, "Corporate & pop-up")))), React.createElement("div", null, React.createElement("h4", null, "Visit"), React.createElement("ul", null, React.createElement("li", null, React.createElement("a", {
    href: "#reviews",
    onClick: e => {
      e.preventDefault();
      go('reviews');
    }
  }, "Reviews")), React.createElement("li", null, React.createElement("a", {
    href: "#centres",
    onClick: e => {
      e.preventDefault();
      go('centres');
    }
  }, "Centres")), React.createElement("li", null, React.createElement("a", {
    href: "#faq",
    onClick: e => {
      e.preventDefault();
      go('faq');
    }
  }, "FAQ")), React.createElement("li", null, React.createElement("a", {
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, "Contact")))), React.createElement("div", null, React.createElement("h4", null, "Contact"), React.createElement("ul", null, React.createElement("li", null, React.createElement("a", {
    href: "tel:+14372640311"
  }, "+1 437 264 0311")), React.createElement("li", null, React.createElement("a", {
    href: "mailto:Enquiry@troytesting.com"
  }, "Enquiry@troytesting.com")), React.createElement("li", null, "Mon\u2013Sat \xB7 9:00 \u2013 19:00")))), React.createElement("div", {
    className: "footer-bot"
  }, React.createElement("div", null, "\xA9 2014 \u2013 2026 Troy Testing & Learning Centers"), React.createElement("div", null, "All rights reserved"))));
}
function ReserveModal({
  exam,
  close
}) {
  const trapRef = useFocusTrap(!!exam, close);
  if (!exam) return null;
  const centreUrls = exam.centreUrls || {};
  const centreKeys = Object.keys(centreUrls);
  return React.createElement("div", {
    className: "modal-bg",
    onClick: close
  }, React.createElement("div", {
    className: "modal",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "reserve-title",
    ref: trapRef,
    tabIndex: -1,
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "eyebrow"
  }, "Book on ", exam.org, " \xB7 ", exam.code), React.createElement("h3", {
    id: "reserve-title"
  }, exam.name), React.createElement("p", null, "All exam bookings are made directly with the official provider. Click through to", ' ', React.createElement("strong", null, exam.org), "'s portal to pick your date \u2014 we deliver the exam at our", ' ', exam.preferredCenter || 'Toronto or Mississauga', " center. Bring a valid ID on the day."), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("a", {
    className: "btn",
    href: exam.url,
    target: "_blank",
    rel: "noopener"
  }, "Go to ", exam.org, " ", React.createElement("span", {
    className: "arrow"
  })), centreKeys.map(c => React.createElement("a", {
    className: "btn ghost",
    key: c,
    href: centreUrls[c],
    target: "_blank",
    rel: "noopener"
  }, "Book at ", c, " ", React.createElement("span", {
    className: "arrow"
  }))), centreKeys.length === 0 && React.createElement("button", {
    className: "btn ghost",
    onClick: close
  }, "Not now")), React.createElement("button", {
    className: "close",
    onClick: close
  }, "Close (Esc)")));
}
const EXAMS = [{
  code: 'CELPIP-G',
  name: 'CELPIP General',
  org: 'Paragon Testing',
  url: 'https://www.celpip.ca/take-celpip/register-for-celpip/',
  featured: true,
  centreUrls: {
    'North York': 'https://www.celpip.ca/centre/troy-testing-learning-centers-toronto/',
    'Mississauga': 'https://www.celpip.ca/centre/troy-testing-learning-centers-mississauga/'
  },
  fee: 'CA$ 290',
  duration: '3 hrs',
  seats: 'Daily seats',
  preferredCenter: 'North York'
}, {
  code: 'CELPIP-LS',
  name: 'CELPIP General LS',
  org: 'Paragon Testing',
  url: 'https://www.celpip.ca/take-celpip/register-for-celpip/',
  featured: true,
  centreUrls: {
    'North York': 'https://www.celpip.ca/centre/troy-testing-learning-centers-toronto/',
    'Mississauga': 'https://www.celpip.ca/centre/troy-testing-learning-centers-mississauga/'
  },
  fee: 'CA$ 195',
  duration: '1h 10m',
  seats: 'Weekly seats',
  preferredCenter: 'North York'
}, {
  code: 'CFA-I',
  name: 'CFA Level I',
  org: 'CFA Institute',
  url: 'https://www.cfainstitute.org/programs/cfa-program',
  featured: true,
  fee: 'from US$ 940',
  duration: '4h 30m',
  seats: 'Feb / May / Aug / Nov',
  preferredCenter: 'North York or Mississauga'
}, {
  code: 'CFA-II',
  name: 'CFA Level II',
  org: 'CFA Institute',
  url: 'https://www.cfainstitute.org/programs/cfa-program',
  featured: true,
  fee: 'from US$ 940',
  duration: '4h 30m',
  seats: 'May / Aug / Nov',
  preferredCenter: 'North York or Mississauga'
}, {
  code: 'CFA-III',
  name: 'CFA Level III',
  org: 'CFA Institute',
  url: 'https://www.cfainstitute.org/programs/cfa-program',
  featured: true,
  fee: 'from US$ 940',
  duration: '4h 30m',
  seats: 'Feb / Aug',
  preferredCenter: 'North York or Mississauga'
}, {
  code: 'LSAT',
  name: 'LSAT',
  org: 'LSAC',
  url: 'https://www.lsac.org/lsat/register-lsat',
  featured: true,
  fee: 'US$ 238',
  duration: '3 hrs',
  seats: 'Multiple / year',
  preferredCenter: 'North York'
}];
Object.assign(window, {
  Header,
  Footer,
  ReserveModal,
  EXAMS,
  useReveal,
  Reveal,
  Counter,
  PartnerBar,
  Swap,
  ExamBoard
});
function Swap({
  words,
  interval = 2600,
  className = ''
}) {
  const [i, setI] = useState(0);
  const [phase, setPhase] = useState('in');
  useEffect(() => {
    if (REDUCED) return;
    const t = setInterval(() => {
      setPhase('out');
      setTimeout(() => {
        setI(p => (p + 1) % words.length);
        setPhase('in');
      }, 340);
    }, interval);
    return () => clearInterval(t);
  }, [words.length, interval]);
  const longest = words.reduce((a, b) => b.length > a.length ? b : a, '');
  return React.createElement("span", {
    className: `swap ${className}`
  }, React.createElement("span", {
    className: "swap-ghost",
    "aria-hidden": "true"
  }, longest), React.createElement("span", {
    className: `swap-word ${phase}`
  }, words[i]));
}
const FLAP_GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ·:/';
function FlipCell({
  target,
  steps = 7,
  speed = 42
}) {
  const [ch, setCh] = useState('\u00A0');
  useEffect(() => {
    if (target === ' ') {
      setCh('\u00A0');
      return;
    }
    if (REDUCED) {
      setCh(target);
      return;
    }
    let n = 0;
    const iv = setInterval(() => {
      n++;
      if (n >= steps) {
        setCh(target);
        clearInterval(iv);
      } else setCh(FLAP_GLYPHS[Math.floor(Math.random() * FLAP_GLYPHS.length)]);
    }, speed);
    return () => clearInterval(iv);
  }, [target, steps, speed]);
  return React.createElement("span", {
    className: "flap-cell"
  }, React.createElement("span", {
    className: "flap-inner",
    key: ch
  }, ch));
}
function FlipText({
  text,
  stepBase = 5
}) {
  const chars = String(text).split('');
  return React.createElement("span", {
    className: "flap"
  }, chars.map((c, i) => React.createElement(FlipCell, {
    key: i + '-' + c,
    target: c,
    steps: stepBase + i % 5
  })));
}
const BOARD_BASE = [{
  exam: 'CELPIP GENERAL',
  centre: 'NORTH YORK',
  when: 'TODAY 14:00',
  status: 'open'
}, {
  exam: 'CELPIP GEN LS',
  centre: 'NORTH YORK',
  when: 'TOMORROW 09:30',
  status: 'filling'
}, {
  exam: 'CFA LEVEL I',
  centre: 'MISSISSAUGA',
  when: '21 MAY 08:00',
  status: 'open'
}, {
  exam: 'LSAT',
  centre: 'NORTH YORK',
  when: '14 JUN 12:30',
  status: 'waitlist'
}, {
  exam: 'CELPIP GENERAL',
  centre: 'MISSISSAUGA',
  when: 'FRI 11:00',
  status: 'open'
}];
const STATUS_LABEL = {
  open: 'SEATS OPEN',
  filling: 'FILLING FAST',
  waitlist: 'WAITLIST',
  full: 'FULL'
};
const STATUS_CYCLE = ['open', 'filling', 'open', 'waitlist', 'open', 'full'];
function ExamBoard() {
  const site = useSiteJson('sessions.json');
  const owner = site && Array.isArray(site.sessions) && site.sessions.length ? site.sessions.slice(0, 6).map(s => ({
    exam: (s.label || '').toUpperCase(),
    centre: (s.centre || '').toUpperCase(),
    when: (s.when || [s.date, s.time].filter(Boolean).join(' ')).toUpperCase(),
    status: s.status || 'open'
  })) : null;
  const [rows, setRows] = useState(owner || BOARD_BASE);
  const [clock, setClock] = useState('');
  useEffect(() => {
    if (owner) setRows(owner);
  }, [site]);
  useEffect(() => {
    const fmt = () => {
      const d = new Date();
      const p = n => String(n).padStart(2, '0');
      setClock(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    fmt();
    const c = setInterval(fmt, 1000);
    if (REDUCED || owner) return () => clearInterval(c);
    const s = setInterval(() => {
      setRows(prev => {
        const idx = Math.floor(Math.random() * prev.length);
        const next = prev.slice();
        const cur = next[idx].status;
        const ni = (STATUS_CYCLE.indexOf(cur) + 1 + Math.floor(Math.random() * 2)) % STATUS_CYCLE.length;
        next[idx] = {
          ...next[idx],
          status: STATUS_CYCLE[ni]
        };
        return next;
      });
    }, 3600);
    return () => {
      clearInterval(c);
      clearInterval(s);
    };
  }, [site]);
  return React.createElement("div", {
    className: "exam-board"
  }, React.createElement("div", {
    className: "board-top"
  }, React.createElement("div", {
    className: "board-title"
  }, React.createElement("span", {
    className: "board-live"
  }, React.createElement("span", {
    className: "live-dot"
  }), "LIVE"), React.createElement("span", null, "Exam sessions")), React.createElement("div", {
    className: "board-clock"
  }, clock)), React.createElement("div", {
    className: "board-cols"
  }, React.createElement("span", null, "Exam"), React.createElement("span", null, "Centre"), React.createElement("span", null, "Session"), React.createElement("span", {
    className: "ta-r"
  }, "Status")), React.createElement("div", {
    className: "board-rows"
  }, rows.map((r, i) => React.createElement("div", {
    className: "board-row",
    key: i
  }, React.createElement("span", {
    className: "bc bexam"
  }, React.createElement(FlipText, {
    text: r.exam
  })), React.createElement("span", {
    className: "bc centre"
  }, React.createElement(FlipText, {
    text: r.centre
  })), React.createElement("span", {
    className: "bc when"
  }, React.createElement(FlipText, {
    text: r.when
  })), React.createElement("span", {
    className: "bc status ta-r"
  }, React.createElement("span", {
    className: `pill ${r.status}`
  }, React.createElement("span", {
    className: "pill-dot"
  }), STATUS_LABEL[r.status]))))), React.createElement("div", {
    className: "board-foot"
  }, React.createElement("span", null, "Toronto \xB7 Mississauga"), React.createElement("span", null, "Book on the provider portal \u2014 we host the seat")));
}
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
    const failsafe = setTimeout(revealAll, 2600);
    window.addEventListener('scroll', check, {
      passive: true
    });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
      timers.forEach(clearTimeout);
      clearTimeout(failsafe);
    };
  });
}
function Reveal({
  as = 'div',
  delay = 0,
  className = '',
  children,
  ...rest
}) {
  const Tag = as;
  return React.createElement(Tag, _extends({
    className: `reveal ${className}`,
    style: {
      transitionDelay: delay + 'ms',
      ...(rest.style || {})
    }
  }, rest), children);
}
function Counter({
  to,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1400
}) {
  const ref = useRef(null);
  const [val, setVal] = useState(0);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let iv = 0;
    let timers = [];
    const start = () => {
      if (done.current) return;
      done.current = true;
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
      if (el.getBoundingClientRect().top < h * 0.94) {
        start();
        cleanup();
      }
    };
    timers = [150, 500, 1000].map(ms => setTimeout(check, ms));
    window.addEventListener('scroll', check, {
      passive: true
    });
    check();
    return () => {
      window.removeEventListener('scroll', check);
      timers.forEach(clearTimeout);
      if (iv) clearInterval(iv);
    };
  }, [to, duration]);
  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString('en-US');
  return React.createElement("span", {
    ref: ref
  }, prefix, display, suffix);
}
const PARTNERS = [{
  name: 'Paragon Testing',
  sub: 'CELPIP',
  note: 'Official CELPIP test centre'
}, {
  name: 'Prometric',
  sub: 'CFA delivery',
  note: 'Authorized CFA test site'
}, {
  name: 'CFA Institute',
  sub: 'CFA Program',
  note: 'Recognized exam location'
}, {
  name: 'LSAC',
  sub: 'LSAT',
  note: 'Official LSAT test centre'
}];
function PartnerBar({
  compact = false
}) {
  return React.createElement("div", {
    className: `partner-bar ${compact ? 'compact' : ''}`
  }, React.createElement("div", {
    className: "partner-label"
  }, "Authorized delivery site for"), React.createElement("div", {
    className: "partner-list"
  }, PARTNERS.map(p => React.createElement("div", {
    className: "partner",
    key: p.name,
    title: p.note
  }, React.createElement("span", {
    className: "partner-seal",
    "aria-hidden": "true"
  }, React.createElement("svg", {
    viewBox: "0 0 24 24",
    width: "18",
    height: "18"
  }, React.createElement("path", {
    d: "M9 12.5l2 2 4.5-4.5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2.2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "10",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.4",
    opacity: "0.5"
  }))), React.createElement("span", {
    className: "partner-text"
  }, React.createElement("span", {
    className: "partner-name"
  }, p.name), React.createElement("span", {
    className: "partner-sub"
  }, p.sub))))));
}
const {
  useState: useF,
  useEffect: useFE,
  useRef: useFR
} = React;
const TR = {
  en: {
    'nav.home': 'Home',
    'nav.programs': 'Programs',
    'nav.testcenter': 'Exams',
    'nav.availability': 'Availability',
    'nav.reviews': 'Reviews',
    'nav.centres': 'Centres',
    'nav.faq': 'FAQ',
    'nav.guides': 'Guides',
    'nav.corporate': 'Corporate',
    'nav.contact': 'Contact',
    'cta.find': 'Find Your Exam',
    'cta.talk': 'Talk to our team',
    'hero.eyebrow': 'One of Canada’s best test centre services · CELPIP · CFA · LSAC',
    'hero.h1a': 'Sit your',
    'hero.h1b': 'exam in a room that runs like clockwork.',
    'hero.sub': "The GTA’s top-rated CELPIP test centre on Google — and an official delivery site for CFA (Prometric) and LSAT (LSAC). You book with the provider; we run the room — quiet, on-time, every session.",
    'm.tests': 'Tests administered every month',
    'm.proctors': 'Certified proctors on staff',
    'm.centres': 'Centres across North America'
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.programs': 'Programmes',
    'nav.testcenter': 'Examens',
    'nav.availability': 'Disponibilité',
    'nav.reviews': 'Avis',
    'nav.centres': 'Centres',
    'nav.faq': 'FAQ',
    'nav.guides': 'Guides',
    'nav.corporate': 'Entreprises',
    'nav.contact': 'Contact',
    'cta.find': 'Trouvez votre examen',
    'cta.talk': 'Parlez à notre équipe',
    'hero.eyebrow': "L’un des meilleurs services de centres d’examen au Canada · CELPIP · CFA · LSAC",
    'hero.h1a': 'Passez votre examen',
    'hero.h1b': 'dans une salle réglée comme une horloge.',
    'hero.sub': "Le centre CELPIP le mieux noté de la RGT sur Google — et un site officiel pour le CFA (Prometric) et le LSAT (LSAC). Vous réservez auprès du fournisseur; nous gérons la salle.",
    'm.tests': 'Examens administrés chaque mois',
    'm.proctors': 'Surveillants certifiés',
    'm.centres': 'Centres en Amérique du Nord'
  }
};
function t(lang, key) {
  return TR[lang] && TR[lang][key] || TR.en[key] || key;
}
function LangToggle({
  lang,
  setLang
}) {
  return React.createElement("div", {
    className: "lang-toggle",
    role: "group",
    "aria-label": "Language"
  }, ['en', 'fr'].map(l => React.createElement("button", {
    key: l,
    className: lang === l ? 'active' : '',
    "aria-pressed": lang === l,
    onClick: () => setLang(l)
  }, l.toUpperCase())));
}
function Stars({
  size = 13
}) {
  return React.createElement("span", {
    className: "stars",
    style: {
      fontSize: size
    },
    "aria-hidden": "true"
  }, [0, 1, 2, 3, 4].map(i => React.createElement(Icon, {
    key: i,
    name: "star",
    size: size,
    style: {
      marginRight: 1
    }
  })));
}
function GoogleBadge({
  compact
}) {
  const r = useSiteJson('rating.json');
  const rating = r && r.rating ? r.rating : '4.9';
  const reviews = r && r.count ? r.count + ' Google reviews' : '120+ Google reviews';
  return React.createElement("a", {
    className: `gbadge ${compact ? 'compact' : ''}`,
    href: "https://www.google.com/search?q=Troy+Testing+%26+Learning+Centers+reviews",
    target: "_blank",
    rel: "noopener"
  }, React.createElement("span", {
    className: "g-mark"
  }, "G"), React.createElement("span", {
    className: "g-body"
  }, React.createElement("span", {
    className: "g-top"
  }, React.createElement("strong", null, rating), React.createElement(Stars, null)), React.createElement("span", {
    className: "g-sub"
  }, reviews)));
}
const SESSIONS = [{
  code: 'CELPIP-G',
  label: 'CELPIP General',
  centre: 'North York',
  date: 'Today',
  time: '14:00',
  status: 'open'
}, {
  code: 'CELPIP-LS',
  label: 'CELPIP General LS',
  centre: 'North York',
  date: 'Tomorrow',
  time: '09:30',
  status: 'filling'
}, {
  code: 'CELPIP-G',
  label: 'CELPIP General',
  centre: 'Mississauga',
  date: 'Fri',
  time: '11:00',
  status: 'open'
}, {
  code: 'CFA-I',
  label: 'CFA Level I',
  centre: 'Mississauga',
  date: '21 May',
  time: '08:00',
  status: 'open'
}, {
  code: 'CFA-II',
  label: 'CFA Level II',
  centre: 'Mississauga',
  date: '22 Aug',
  time: '08:00',
  status: 'waitlist'
}, {
  code: 'LSAT',
  label: 'LSAT',
  centre: 'North York',
  date: '14 Jun',
  time: '12:30',
  status: 'filling'
}, {
  code: 'LSAT',
  label: 'LSAT',
  centre: 'North York',
  date: '19 Jun',
  time: '09:00',
  status: 'open'
}, {
  code: 'LSAT',
  label: 'LSAT',
  centre: 'North York',
  date: '20 Jun',
  time: '09:00',
  status: 'open'
}];
const ST = {
  open: 'Seats open',
  filling: 'Filling fast',
  waitlist: 'Waitlist',
  full: 'Full'
};
function AvailabilitySection() {
  const site = useSiteJson('sessions.json');
  const SRC = site && Array.isArray(site.sessions) && site.sessions.length ? site.sessions : SESSIONS;
  const live = !!(site && site.live);
  const [fam, setFam] = useF(() => {
    try {
      return localStorage.getItem('troy.av.fam') || 'all';
    } catch (_) {
      return 'all';
    }
  });
  const [centre, setCentre] = useF(() => {
    try {
      return localStorage.getItem('troy.av.centre') || 'all';
    } catch (_) {
      return 'all';
    }
  });
  const pick = (setter, key) => v => {
    setter(v);
    try {
      localStorage.setItem(key, v);
    } catch (_) {}
  };
  const setFamP = pick(setFam, 'troy.av.fam');
  const setCentreP = pick(setCentre, 'troy.av.centre');
  const famOf = c => c.startsWith('CELPIP') ? 'CELPIP' : c.startsWith('CFA') ? 'CFA' : 'LSAT';
  const centreList = ['all', ...Array.from(new Set(SRC.map(s => s.centre)))];
  const rows = SRC.filter(s => (fam === 'all' || famOf(s.code) === fam) && (centre === 'all' || s.centre === centre));
  const chip = active => ({
    fontFamily: 'var(--font-mono)',
    fontSize: 11,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '7px 12px',
    borderRadius: 999,
    cursor: 'pointer',
    transition: 'all .2s',
    background: active ? 'var(--accent)' : 'transparent',
    color: active ? 'var(--accent-ink)' : 'var(--text-dim)',
    border: '1px solid ' + (active ? 'var(--accent)' : 'var(--rule)')
  });
  return React.createElement("section", {
    className: "block",
    id: "availability"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Upcoming sessions"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Next available seats.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, live ? 'Updated ' + (site.updated || 'recently') + ' — book on the provider portal; seats fill quickly.' : 'Typical availability at each centre — book on the provider portal; seats fill quickly.')), React.createElement("div", {
    className: "avail-filters reveal",
    role: "group",
    "aria-label": "Filter sessions"
  }, React.createElement("div", {
    className: "avf-group"
  }, ['all', 'CELPIP', 'CFA', 'LSAT'].map(f => React.createElement("button", {
    key: f,
    style: chip(fam === f),
    "aria-pressed": fam === f,
    onClick: () => setFamP(f)
  }, f === 'all' ? 'All exams' : f))), React.createElement("div", {
    className: "avf-group"
  }, centreList.map(c => React.createElement("button", {
    key: c,
    style: chip(centre === c),
    "aria-pressed": centre === c,
    onClick: () => setCentreP(c)
  }, c === 'all' ? 'All centres' : c)))), React.createElement("div", {
    className: "avail-list reveal"
  }, rows.map((s, i) => {
    const ex = EXAMS.find(e => e.code === s.code) || {};
    const url = ex.centreUrls && ex.centreUrls[s.centre] || ex.url || '#';
    return React.createElement("a", {
      className: "avail-row",
      key: i,
      href: url,
      target: "_blank",
      rel: "noopener"
    }, React.createElement("span", {
      className: "av-exam"
    }, s.label), React.createElement("span", {
      className: "av-centre"
    }, s.centre), React.createElement("span", {
      className: "av-when"
    }, s.when || [s.date, s.time].filter(Boolean).join(' · ')), s.status ? React.createElement("span", {
      className: `av-pill ${s.status}`
    }, React.createElement("span", {
      className: "pill-dot"
    }), ST[s.status]) : React.createElement("span", {
      "aria-hidden": "true"
    }), React.createElement("span", {
      className: "av-go"
    }, "Book ", React.createElement("span", {
      className: "arrow"
    })));
  }), rows.length === 0 && React.createElement("div", {
    className: "faq-empty"
  }, "No sessions match. Try a different filter."))));
}
function ExamWizard({
  open,
  close
}) {
  const trapRef = useFocusTrap(open, close);
  const [step, setStep] = useF(0);
  const [fam, setFam] = useF(null);
  const [code, setCode] = useF(null);
  const [centre, setCentre] = useF(null);
  useFE(() => {
    if (open) {
      setStep(0);
      setFam(null);
      setCode(null);
      setCentre(null);
    }
  }, [open]);
  if (!open) return null;
  const celpip = EXAMS.filter(e => e.code.startsWith('CELPIP'));
  const cfa = EXAMS.filter(e => e.code.startsWith('CFA'));
  const lsat = EXAMS.filter(e => e.code === 'LSAT');
  const famExams = fam === 'CELPIP' ? celpip : fam === 'CFA' ? cfa : lsat;
  const exam = EXAMS.find(e => e.code === code);
  const centres = fam === 'CFA' ? ['North York', 'Mississauga'] : fam === 'LSAT' ? ['North York'] : ['North York', 'Mississauga'];
  const stepTitles = ['Which exam?', 'Which level?', 'Which centre?', "You're set"];
  return React.createElement("div", {
    className: "modal-bg",
    onClick: close
  }, React.createElement("div", {
    className: "modal wizard",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Find your exam",
    ref: trapRef,
    tabIndex: -1,
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "wiz-top"
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, "Find your exam \xB7 Step ", Math.min(step + 1, 4), " of 4"), React.createElement("div", {
    className: "wiz-dots"
  }, [0, 1, 2, 3].map(i => React.createElement("span", {
    key: i,
    className: i <= step ? 'on' : ''
  })))), React.createElement("h3", null, stepTitles[step]), step === 0 && React.createElement("div", {
    className: "wiz-grid wiz-grid-3"
  }, [['CELPIP', 'English language test', 'Paragon Testing'], ['CFA', 'Finance designation', 'Prometric · CFA Institute'], ['LSAT', 'Law school admissions', 'LSAC']].map(([f, d, p]) => React.createElement("button", {
    className: "wiz-card",
    key: f,
    onClick: () => {
      setFam(f);
      setStep(1);
    }
  }, React.createElement("span", {
    className: "wiz-card-t"
  }, f), React.createElement("span", {
    className: "wiz-card-d"
  }, d), React.createElement("span", {
    className: "wiz-card-p"
  }, p)))), step === 1 && React.createElement("div", {
    className: "wiz-list"
  }, famExams.map(e => React.createElement("button", {
    className: "wiz-opt",
    key: e.code,
    onClick: () => {
      setCode(e.code);
      setStep(2);
    }
  }, React.createElement("span", null, e.name), React.createElement("span", {
    className: "arrow"
  })))), step === 2 && React.createElement("div", {
    className: "wiz-list"
  }, centres.map(c => React.createElement("button", {
    className: "wiz-opt",
    key: c,
    onClick: () => {
      setCentre(c);
      setStep(3);
    }
  }, React.createElement("span", null, c), React.createElement("span", {
    className: "arrow"
  })))), step === 3 && exam && React.createElement("div", {
    className: "wiz-result"
  }, React.createElement("div", {
    className: "wiz-summary"
  }, React.createElement("div", null, React.createElement("span", {
    className: "ws-k"
  }, "Exam"), React.createElement("span", {
    className: "ws-v"
  }, exam.name)), React.createElement("div", null, React.createElement("span", {
    className: "ws-k"
  }, "Centre"), React.createElement("span", {
    className: "ws-v"
  }, centre)), React.createElement("div", null, React.createElement("span", {
    className: "ws-k"
  }, "Provider"), React.createElement("span", {
    className: "ws-v"
  }, exam.org)), React.createElement("div", null, React.createElement("span", {
    className: "ws-k"
  }, "Fee"), React.createElement("span", {
    className: "ws-v"
  }, exam.fee))), React.createElement("p", {
    className: "wiz-note"
  }, "Book on the ", React.createElement("strong", null, exam.org), " portal and select Troy Testing \u2014 ", centre, " as your delivery location. Bring valid photo ID on the day."), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("a", {
    className: "btn",
    href: exam.centreUrls && exam.centreUrls[centre] || exam.url,
    target: "_blank",
    rel: "noopener"
  }, "Continue to ", exam.org, " ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("button", {
    className: "btn ghost",
    onClick: () => setStep(0)
  }, "Start over"))), React.createElement("div", {
    className: "wiz-foot"
  }, step > 0 ? React.createElement("button", {
    className: "wiz-back",
    onClick: () => setStep(step - 1)
  }, "\u2190 Back") : React.createElement("span", null), React.createElement("button", {
    className: "modal-close-x",
    onClick: close
  }, "Close (Esc)"))));
}
function nextCfaDate() {
  const windows = ['2026-02-16', '2026-05-20', '2026-08-18', '2026-11-17', '2027-02-15'];
  const now = Date.now();
  for (const w of windows) {
    const d = new Date(w + 'T08:00:00');
    if (d.getTime() > now) return d;
  }
  return new Date(windows[windows.length - 1] + 'T08:00:00');
}
function Countdown() {
  const [target] = useF(() => nextCfaDate());
  const [now, setNow] = useF(() => Date.now());
  useFE(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  let diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000);
  diff -= d * 86400000;
  const h = Math.floor(diff / 3600000);
  diff -= h * 3600000;
  const m = Math.floor(diff / 60000);
  diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  const fmt = target.toLocaleDateString('en-CA', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const pad = n => String(n).padStart(2, '0');
  return React.createElement("div", {
    className: "countdown reveal"
  }, React.createElement("div", {
    className: "cd-left"
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, "Next CFA exam window"), React.createElement("div", {
    className: "cd-date serif"
  }, fmt), React.createElement("div", {
    className: "cd-note"
  }, "Registration closes weeks before \u2014 plan your prep now.")), React.createElement("div", {
    className: "cd-clock"
  }, [[d, 'Days'], [pad(h), 'Hrs'], [pad(m), 'Min'], [pad(s), 'Sec']].map(([v, l], i) => React.createElement("div", {
    className: "cd-unit",
    key: i
  }, React.createElement("span", {
    className: "cd-n"
  }, v), React.createElement("span", {
    className: "cd-l"
  }, l)))));
}
function SeatAlert() {
  const [email, setEmail] = useF('');
  const [exam, setExam] = useF('CELPIP');
  const [done, setDone] = useF(false);
  const submit = e => {
    e.preventDefault();
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) return;
    try {
      localStorage.setItem('troy.alert', JSON.stringify({
        email,
        exam
      }));
    } catch (_) {}
    setDone(true);
  };
  return React.createElement("div", {
    className: "seat-alert reveal"
  }, React.createElement("div", {
    className: "sa-text"
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, "Seat alerts"), React.createElement("h3", {
    className: "serif"
  }, "Get notified when seats open."), React.createElement("p", null, "We'll email you the moment a new CELPIP, CFA or LSAT session is posted at your preferred centre.")), done ? React.createElement("div", {
    className: "sa-done"
  }, React.createElement(Icon, {
    name: "check",
    size: 16,
    color: "#22a35a",
    style: {
      marginRight: 6,
      verticalAlign: '-3px'
    }
  }), "You're on the list. We'll be in touch at ", React.createElement("strong", null, email), ".") : React.createElement("form", {
    className: "sa-form",
    onSubmit: submit
  }, React.createElement("select", {
    value: exam,
    onChange: e => setExam(e.target.value)
  }, React.createElement("option", null, "CELPIP"), React.createElement("option", null, "CFA"), React.createElement("option", null, "LSAT")), React.createElement("input", {
    type: "email",
    value: email,
    onChange: e => setEmail(e.target.value),
    placeholder: "you@example.com",
    required: true
  }), React.createElement("button", {
    className: "btn",
    type: "submit"
  }, "Notify me ", React.createElement("span", {
    className: "arrow"
  }))));
}
function DiagnosticQuiz({
  open,
  close,
  go
}) {
  const trapRef = useFocusTrap(open, close);
  const [step, setStep] = useF(0);
  const [fam, setFam] = useF(null);
  const [level, setLevel] = useF(null);
  const [hours, setHours] = useF(8);
  useFE(() => {
    if (open) {
      setStep(0);
      setFam(null);
      setLevel(null);
      setHours(8);
    }
  }, [open]);
  if (!open) return null;
  const celpipLevels = [['Starting out', 14], ['Some English', 9], ['Confident', 5]];
  const cfaLevels = [['New to finance', 1.15], ['Some background', 1.0], ['Finance professional', 0.85]];
  let weeks = 0,
    total = 0;
  if (fam === 'CELPIP' && level != null) {
    const base = celpipLevels[level][1];
    weeks = Math.max(3, Math.round(base * (8 / hours)));
    total = weeks * hours;
  } else if (fam === 'CFA' && level != null) {
    const mult = cfaLevels[level][1];
    total = Math.round(300 * mult);
    weeks = Math.max(10, Math.round(total / hours));
  }
  return React.createElement("div", {
    className: "modal-bg",
    onClick: close
  }, React.createElement("div", {
    className: "modal wizard",
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Study planner",
    ref: trapRef,
    tabIndex: -1,
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "wiz-top"
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, "Study planner"), React.createElement("div", {
    className: "wiz-dots"
  }, [0, 1, 2, 3].map(i => React.createElement("span", {
    key: i,
    className: i <= step ? 'on' : ''
  })))), step === 0 && React.createElement(React.Fragment, null, React.createElement("h3", null, "Which exam are you preparing for?"), React.createElement("div", {
    className: "wiz-grid"
  }, ['CELPIP', 'CFA'].map(f => React.createElement("button", {
    className: "wiz-card",
    key: f,
    onClick: () => {
      setFam(f);
      setStep(1);
    }
  }, React.createElement("span", {
    className: "wiz-card-t"
  }, f), React.createElement("span", {
    className: "wiz-card-d"
  }, f === 'CELPIP' ? 'English proficiency' : 'Finance designation'))))), step === 1 && React.createElement(React.Fragment, null, React.createElement("h3", null, "Where are you starting from?"), React.createElement("div", {
    className: "wiz-list"
  }, (fam === 'CELPIP' ? celpipLevels : cfaLevels).map((l, i) => React.createElement("button", {
    className: "wiz-opt",
    key: i,
    onClick: () => {
      setLevel(i);
      setStep(2);
    }
  }, React.createElement("span", null, l[0]), React.createElement("span", {
    className: "arrow"
  }))))), step === 2 && React.createElement(React.Fragment, null, React.createElement("h3", null, "How many hours can you study per week?"), React.createElement("div", {
    className: "hours-pick"
  }, React.createElement("input", {
    type: "range",
    min: "3",
    max: "25",
    value: hours,
    onChange: e => setHours(+e.target.value)
  }), React.createElement("div", {
    className: "hours-val"
  }, React.createElement("strong", null, hours), " hrs / week")), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "btn",
    onClick: () => setStep(3)
  }, "See my plan ", React.createElement("span", {
    className: "arrow"
  })))), step === 3 && React.createElement(React.Fragment, null, React.createElement("h3", null, "Your estimated plan"), React.createElement("div", {
    className: "quiz-result"
  }, React.createElement("div", {
    className: "qr-big"
  }, React.createElement("span", {
    className: "qr-n"
  }, weeks), React.createElement("span", {
    className: "qr-u"
  }, "weeks")), React.createElement("p", null, "At ", React.createElement("strong", null, hours, " hrs/week"), " (~", total, " hours total), most candidates at your starting point reach exam-ready in about ", React.createElement("strong", null, weeks, " weeks"), ". Our ", fam, " prep block is built around exactly this.")), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("button", {
    className: "btn",
    onClick: () => {
      close();
      go('contact');
    }
  }, "Plan with a tutor ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("button", {
    className: "btn ghost",
    onClick: () => setStep(0)
  }, "Start over"))), React.createElement("div", {
    className: "wiz-foot"
  }, step > 0 ? React.createElement("button", {
    className: "wiz-back",
    onClick: () => setStep(step - 1)
  }, "\u2190 Back") : React.createElement("span", null), React.createElement("button", {
    className: "modal-close-x",
    onClick: close
  }, "Close (Esc)"))));
}
const CHECKLIST = [{
  t: 'Valid photo ID',
  d: 'An unexpired, government-issued passport. Name must match your booking exactly.'
}, {
  t: 'Arrive 30 minutes early',
  d: 'Check-in, locker assignment, and ID verification take time. Late arrivals may be turned away.'
}, {
  t: 'Leave devices in the locker',
  d: 'Phones, smartwatches, and bags go in a provided locker. The room is device-free.'
}, {
  t: 'No notes or materials',
  d: 'Scratch paper and (for CFA) an approved calculator are provided or specified by the provider.'
}, {
  t: 'Know your centre',
  d: 'CELPIP and CFA run at North York & Mississauga; LSAT at North York. Double-check before you travel.'
}, {
  t: 'Confirmation email',
  d: 'Bring your provider confirmation — printed or on a device you check in before entering.'
}];
function ExamDayChecklist() {
  return React.createElement("section", {
    className: "block",
    id: "checklist",
    style: {
      background: 'var(--surface)'
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Exam day"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "What to bring, what to leave.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "A quick checklist so nothing on test day is a surprise. Provider rules always take precedence.")), React.createElement("div", {
    className: "check-grid"
  }, CHECKLIST.map((c, i) => React.createElement("div", {
    className: "check-item reveal",
    key: i,
    style: {
      transitionDelay: i % 3 * 80 + 'ms'
    }
  }, React.createElement("span", {
    className: "check-mark"
  }, React.createElement(Icon, {
    name: "check",
    size: 14
  })), React.createElement("div", null, React.createElement("h4", null, c.t), React.createElement("p", null, c.d)))))));
}
const GALLERY = [{
  cls: 'g1',
  cap: 'Testing room · North York'
}, {
  cls: 'g2',
  cap: 'Check-in desk'
}, {
  cls: 'g3',
  cap: 'Workstation'
}, {
  cls: 'g4',
  cap: 'Quiet floor · Mississauga'
}];
function CentreGallery() {
  return React.createElement("section", {
    className: "block",
    id: "gallery"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Inside the centres"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Built to be forgettable \u2014 in the best way.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "Calm, well-lit rooms and reliable equipment. The kind of space you stop noticing five minutes in.")), React.createElement("div", {
    className: "gallery-grid reveal"
  }, GALLERY.map((g, i) => React.createElement("figure", {
    className: `gphoto ${g.cls}`,
    key: i
  }, React.createElement("figcaption", null, g.cap))))));
}
function CallFab() {
  const [open, setOpen] = useF(false);
  return React.createElement("div", {
    className: `fab ${open ? 'open' : ''}`
  }, React.createElement("div", {
    className: "fab-menu"
  }, React.createElement("a", {
    className: "fab-item wa",
    href: "https://wa.me/14372640311",
    target: "_blank",
    rel: "noopener"
  }, React.createElement("span", {
    className: "fab-ico"
  }, React.createElement(Icon, {
    name: "chat",
    size: 15
  })), " WhatsApp"), React.createElement("a", {
    className: "fab-item call",
    href: "tel:+14372640311"
  }, React.createElement("span", {
    className: "fab-ico"
  }, React.createElement(Icon, {
    name: "phone",
    size: 15
  })), " Call centre")), React.createElement("button", {
    className: "fab-btn",
    onClick: () => setOpen(o => !o),
    "aria-label": "Contact",
    "aria-expanded": open
  }, open ? React.createElement(Icon, {
    name: "close",
    size: 22
  }) : React.createElement(Icon, {
    name: "chat",
    size: 22
  })));
}
const GUIDES = [{
  id: 'celpip-vs-ielts',
  tag: 'CELPIP',
  read: '5 min',
  title: 'CELPIP vs IELTS: which should you take?',
  excerpt: 'Both prove English for Canadian immigration. The right pick comes down to format, scoring, and where you test.',
  body: ['CELPIP and IELTS are both accepted by IRCC for most Canadian immigration streams, so the decision is rarely about acceptance — it\'s about which test plays to your strengths.', 'CELPIP is fully computer-delivered and entirely Canadian English, including the speaking section, which is recorded rather than conducted with a live examiner. Many candidates prefer this consistency and the single-sitting, same-day computer format.', 'IELTS offers paper or computer options and uses a live speaking interview. If you are more comfortable speaking with a person than into a microphone, that can matter.', 'Scoring differs too: CELPIP reports bands 1–12 per skill; IELTS uses 0–9. Map your target CRS points back to the band you actually need before you book.', 'Our take: if you are testing in the GTA and want a predictable, all-computer experience in Canadian English, CELPIP is usually the smoother path — and you can sit it with us at North York or Mississauga.']
}, {
  id: 'cfa-level-1-plan',
  tag: 'CFA',
  read: '6 min',
  title: 'A realistic CFA Level I study plan',
  excerpt: 'The CFA Institute suggests ~300 hours. Here is how to spread them without burning out.',
  body: ['The often-quoted figure is roughly 300 hours of study for CFA Level I. Treat it as a floor, not a guarantee, and work backward from your exam date.', 'At 15 hours per week, 300 hours is about 20 weeks — five months. At 10 hours per week you are closer to seven months. Pick a cadence you can actually sustain through work and life.', 'Front-load Ethics and Quantitative Methods; they underpin everything and reward early repetition. Save a full month at the end purely for mock exams and review.', 'Sit at least three full-length, timed mocks under real conditions. Scoring above the mid-60s consistently is a reasonable readiness signal.', 'Book your seat early. CFA windows are fixed and Prometric seats at popular centres go quickly — we host Level I, II and III at our North York and Mississauga centres.']
}, {
  id: 'celpip-speaking',
  tag: 'CELPIP',
  read: '4 min',
  title: 'Five ways to lift your CELPIP speaking band',
  excerpt: 'Speaking is where prepared candidates gain the most. Small habits, big band movement.',
  body: ['CELPIP speaking is recorded against the clock, so structure beats spontaneity. Have a simple template for each task type and practise filling it fast.', 'Speak for the full time. Trailing off early leaves easy points on the table; a complete, organised answer scores better than a perfect half-answer.', 'Use concrete detail. "My cousin Daniel, who moved to Calgary in 2019" is stronger than "someone I know." Specificity reads as fluency.', 'Record yourself and listen back. Most band gains come from hearing your own filler words and flat intonation, then fixing them.', 'Practise on a real keyboard-and-mic setup. The interface should be muscle memory before exam day — which is exactly what our timed practice sessions simulate.']
}, {
  id: 'exam-day',
  tag: 'Both',
  read: '3 min',
  title: 'Your test-day morning, minute by minute',
  excerpt: 'Remove every avoidable variable so the only challenge is the exam itself.',
  body: ['Lay out your passport and confirmation the night before. ID issues are the single most common reason candidates are turned away.', 'Eat a real breakfast and arrive 30 minutes early. Check-in, lockers and verification take time, and rushing spikes your stress before you even sit down.', 'Leave your phone and smartwatch at home or expect to lock them away. The room is device-free, no exceptions.', 'Build in buffer for transit and parking. Know which centre you are booked at — CELPIP and CFA at North York or Mississauga, LSAT at North York.', 'Once you are checked in, the room does the rest. That is the whole point of testing with us.']
}, {
  id: 'lsat-logical-reasoning',
  tag: 'LSAT',
  read: '6 min',
  title: 'LSAT logical reasoning: a beginner\u2019s primer',
  excerpt: 'Two of the LSAT\u2019s scored sections are logical reasoning. Here is how to start reading arguments like the test wants you to.',
  body: ['Logical reasoning rewards a specific reading habit: separate the conclusion from the evidence before you touch the answers. Find the claim the author most wants you to believe, then ask what supports it.', 'Learn the common question stems — strengthen, weaken, assumption, flaw, inference. Each has a predictable answer shape, and recognising the type instantly narrows what a correct answer can look like.', 'Assumption questions are the backbone. The right answer is the unstated link the argument needs to survive; negate a candidate answer and, if the argument collapses, you have found it.', 'Wrong answers are engineered to attract. Watch for choices that are true but irrelevant, or that address the topic but not the specific gap in the argument.', 'Timing comes last. Build accuracy first on untimed sets, then compress. We run timed LSAT practice on the same computer setup used at our North York centre.']
}, {
  id: 'cfa-ethics',
  tag: 'CFA',
  read: '5 min',
  title: 'Why Ethics decides borderline CFA results',
  excerpt: 'The ethics-adjustment rule is real. Here is how to treat the section it applies to.',
  body: ['The CFA Institute applies an "ethics adjustment" to candidates whose overall score sits near the passing line — strong ethics performance can tip a borderline result toward a pass, and weak performance the other way.', 'That makes Ethics disproportionately valuable relative to its exam weight. It is also one of the few areas where the material barely changes year to year, so early study compounds.', 'Ethics is not about memorising rules; it is about applying the Code and Standards to messy scenarios. Practise with vignettes, not flashcards, and articulate why a specific standard is violated.', 'Common traps: assuming disclosure fixes everything, and conflating legal compliance with the higher bar the Standards set. When in doubt, the more conservative, client-first action is usually correct.', 'Revisit Ethics in the final two weeks even if you are comfortable — it is the cheapest insurance against a borderline miss. We host CFA Levels I–III at our North York and Mississauga centres.']
}, {
  id: 'crs-band-mapping',
  tag: 'CELPIP',
  read: '4 min',
  title: 'From CELPIP band to CRS points: what to aim for',
  excerpt: 'Do not over- or under-shoot your English score. Work backward from the CRS points you actually need.',
  body: ['Express Entry ranks candidates by CRS points, and language is one of the biggest movable levers. Small band improvements can translate into meaningful point gains, especially from CLB 7 to CLB 9.', 'CELPIP levels map directly to Canadian Language Benchmarks — a CELPIP 9 in each skill corresponds to CLB 9, the threshold where maximum language points typically kick in.', 'Above CLB 9, additional CELPIP levels usually do not add core language points, so chasing a perfect 12 rarely changes your CRS. Aim for the band that unlocks the points, not the highest possible score.', 'Because skills are scored separately, one weak section can cap your points even if the others are strong. Diagnose your weakest skill early and target it.', 'Bring your target CRS score to your first session and we will map it back to the exact CELPIP band per skill you should be preparing for.']
}];
function GuidesPage({
  go,
  openQuiz
}) {
  const [active, setActive] = useF(null);
  const guide = GUIDES.find(g => g.id === active);
  if (guide) {
    return React.createElement("main", {
      className: "page"
    }, React.createElement("article", {
      className: "guide-article"
    }, React.createElement("div", {
      className: "container",
      style: {
        maxWidth: 760
      }
    }, React.createElement("button", {
      className: "wiz-back",
      onClick: () => setActive(null),
      style: {
        marginBottom: 28
      }
    }, "\u2190 All guides"), React.createElement("div", {
      className: "guide-tag"
    }, guide.tag, " \xB7 ", guide.read, " read"), React.createElement("h1", {
      className: "serif"
    }, guide.title), guide.body.map((p, i) => React.createElement("p", {
      key: i,
      className: "guide-p"
    }, p)), React.createElement("div", {
      className: "guide-cta"
    }, React.createElement("h3", {
      className: "serif"
    }, "Ready to put a plan behind it?"), React.createElement("div", {
      className: "actions"
    }, React.createElement("button", {
      className: "btn",
      onClick: openQuiz
    }, "Estimate my study time ", React.createElement("span", {
      className: "arrow"
    })), React.createElement("a", {
      className: "btn ghost",
      href: "#contact",
      onClick: e => {
        e.preventDefault();
        go('contact');
      }
    }, "Talk to a tutor"))))));
  }
  return React.createElement("main", {
    className: "page"
  }, React.createElement("section", {
    className: "hero",
    style: {
      paddingBottom: 40
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Guides"), React.createElement("h1", {
    className: "serif reveal",
    style: {
      fontSize: 'clamp(46px, 6vw, 84px)',
      margin: '16px 0 18px',
      fontWeight: 420,
      lineHeight: 1.0,
      letterSpacing: '-0.03em',
      transitionDelay: '60ms'
    }
  }, "Plain-English answers to the questions candidates actually ask."), React.createElement("p", {
    className: "lead reveal",
    style: {
      maxWidth: 680,
      transitionDelay: '120ms'
    }
  }, "Short, practical reads on choosing, preparing for, and sitting CELPIP, CFA and LSAT \u2014 written by the people who run the room."))), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 40
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "guides-grid"
  }, GUIDES.map((g, i) => React.createElement("button", {
    className: "guide-card reveal",
    key: g.id,
    style: {
      transitionDelay: i % 2 * 80 + 'ms'
    },
    onClick: () => {
      setActive(g.id);
      window.scrollTo({
        top: 0
      });
    }
  }, React.createElement("div", {
    className: "guide-card-tag"
  }, g.tag, " \xB7 ", g.read), React.createElement("h3", {
    className: "serif"
  }, g.title), React.createElement("p", null, g.excerpt), React.createElement("span", {
    className: "link"
  }, "Read guide ", React.createElement("span", {
    className: "arrow"
  }))))))));
}
Object.assign(window, {
  TR,
  t,
  LangToggle,
  GoogleBadge,
  Stars,
  ExamWizard,
  Countdown,
  SeatAlert,
  DiagnosticQuiz,
  ExamDayChecklist,
  CentreGallery,
  CallFab,
  GuidesPage,
  AvailabilitySection,
  SESSIONS
});
const {
  useState: useM,
  useEffect: useME,
  useRef: useMR
} = React;
const REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAS_GSAP = typeof gsap !== 'undefined';
const HAS_THREE = typeof THREE !== 'undefined';
const MOTION = HAS_GSAP && !REDUCED;
if (HAS_GSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);
if (MOTION && window.matchMedia('(pointer: fine)').matches) {
  const MAG = 5;
  let current = null;
  document.addEventListener('mousemove', e => {
    const btn = e.target.closest && e.target.closest('.btn');
    if (btn !== current && current) {
      gsap.to(current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
      current = null;
    }
    if (!btn) return;
    current = btn;
    const r = btn.getBoundingClientRect();
    const dx = ((e.clientX - r.left) / r.width - 0.5) * 2 * MAG;
    const dy = ((e.clientY - r.top) / r.height - 0.5) * 2 * MAG;
    gsap.to(btn, {
      x: dx,
      y: dy,
      duration: 0.3,
      ease: 'power2.out'
    });
  }, {
    passive: true
  });
  document.addEventListener('mouseleave', () => {
    if (current) {
      gsap.to(current, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
      current = null;
    }
  });
}
function runHeroTimeline() {
  if (!MOTION) return;
  const hero = document.querySelector('.hero-v2');
  if (!hero || hero.dataset.tlDone) return;
  hero.dataset.tlDone = '1';
  const q = s => hero.querySelector(s);
  const parts = [q('.eyebrow-row'), q('h1'), q('.lead'), q('.hero-actions'), q('.hero-trust'), q('.hero-meta'), q('.exam-board'), q('.hero-partner')].filter(Boolean);
  parts.forEach(p => p.classList.add('in', 'gsap'));
  gsap.fromTo(parts, {
    autoAlpha: 0,
    y: 26
  }, {
    autoAlpha: 1,
    y: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    clearProps: 'transform,opacity,visibility'
  });
}
function runScrollReveals() {
  if (!MOTION || typeof ScrollTrigger === 'undefined') return;
  document.querySelectorAll('.reveal:not(.in):not([data-st])').forEach(el => {
    if (el.closest('.hero-v2')) return;
    el.dataset.st = '1';
    el.classList.add('in', 'gsap');
    gsap.fromTo(el, {
      autoAlpha: 0,
      y: 30
    }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.85,
      ease: 'power3.out',
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        once: true
      }
    });
  });
}
window.__pageTransition = function () {
  if (!MOTION) return;
  const main = document.getElementById('main');
  if (!main) return;
  gsap.fromTo(main, {
    autoAlpha: 0,
    y: 18
  }, {
    autoAlpha: 1,
    y: 0,
    duration: 0.5,
    ease: 'power3.out',
    clearProps: 'all'
  });
  setTimeout(() => {
    runHeroTimeline();
    runScrollReveals();
    if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
  }, 60);
};
setTimeout(() => {
  runHeroTimeline();
  runScrollReveals();
}, 300);
const mo = new MutationObserver(() => {
  runScrollReveals();
});
setTimeout(() => {
  const r = document.getElementById('root');
  if (r) mo.observe(r, {
    childList: true,
    subtree: true
  });
}, 500);
let __threeLoad = null;
function loadThree() {
  if (typeof THREE !== 'undefined') return Promise.resolve(true);
  if (__threeLoad) return __threeLoad;
  __threeLoad = new Promise(resolve => {
    const s = document.createElement('script');
    s.src = 'vendor/three.min.js';
    s.onload = () => resolve(typeof THREE !== 'undefined');
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });
  return __threeLoad;
}
function HeroParticles() {
  const ref = useMR(null);
  const [ready, setReady] = useM(typeof THREE !== 'undefined');
  useME(() => {
    if (REDUCED || window.innerWidth < 900) return;
    if (typeof THREE !== 'undefined') {
      setReady(true);
      return;
    }
    let live = true;
    loadThree().then(ok => {
      if (live && ok) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);
  useME(() => {
    if (!ready || REDUCED || window.innerWidth < 900 || !ref.current || typeof THREE === 'undefined') return;
    const wrap = ref.current;
    const W = wrap.clientWidth,
      H = wrap.clientHeight;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(55, W / H, 1, 400);
    cam.position.set(0, 14, 52);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);
    const ROWS = 14,
      COLS = 26,
      GAP = 3.2;
    const pts = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) pts.push((c - COLS / 2) * GAP, 0, (r - ROWS / 2) * GAP);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const dots = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x0a0a0a,
      size: 0.55,
      transparent: true,
      opacity: 0.16
    }));
    scene.add(dots);
    const redIdx = [33, 87, 140, 201, 266, 310];
    const redPts = redIdx.map(i => pts.slice(i * 3, i * 3 + 3)).flat();
    const redGeo = new THREE.BufferGeometry();
    redGeo.setAttribute('position', new THREE.Float32BufferAttribute(redPts, 3));
    const red = new THREE.Points(redGeo, new THREE.PointsMaterial({
      color: 0xe02020,
      size: 1.1,
      transparent: true,
      opacity: 0.8
    }));
    scene.add(red);
    let mx = 0,
      my = 0,
      raf = 0,
      t = 0;
    const onMove = e => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove, {
      passive: true
    });
    const tick = () => {
      t += 0.004;
      dots.rotation.y += (mx * 0.12 - dots.rotation.y) * 0.04;
      dots.rotation.x += (my * 0.06 - dots.rotation.x) * 0.04;
      red.rotation.copy(dots.rotation);
      dots.position.y = Math.sin(t) * 0.6;
      red.position.y = dots.position.y;
      if (!document.hidden) renderer.render(scene, cam);
      raf = requestAnimationFrame(tick);
    };
    tick();
    const onResize = () => {
      const w = wrap.clientWidth,
        h = wrap.clientHeight;
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      wrap.contains(renderer.domElement) && wrap.removeChild(renderer.domElement);
    };
  }, [ready]);
  return React.createElement("div", {
    className: "hero-3d",
    ref: ref,
    "aria-hidden": "true"
  });
}
/* ============================================================
   Photoreal Corporate globe. A textured Earth sphere (day map painted
   at runtime from embedded simplified landmass vectors), real lighting,
   a Fresnel atmosphere rim, a faint drifting cloud layer, 7 exact
   glossy pins with pulsing rings + projected HTML labels, an auto-settle
   that frames North America with the GTA centred, and a static
   orthographic-globe fallback (mobile / reduced-motion / no-WebGL).
   Textures are generated once and cached; the renderer is disposed and
   rendering is paused when the section is off-screen or the tab hidden.
   ============================================================ */

// The 7 real centres — [name, lat, lon] at exact coordinates.
const GLB_PINS = [
  ['North York', 43.77, -79.41],
  ['Mississauga', 43.589, -79.6441],
  ['Calgary', 51.0447, -114.0719],
  ['Montreal', 45.5019, -73.5674],
  ['San Francisco', 37.7749, -122.4194],
  ['Chicago', 41.8781, -87.6298],
  ['Boston', 42.3601, -71.0589]
];
// Labels: North York + Mississauga (~25 km apart) merge into one GTA label.
const GLB_LABELS = [
  ['North York · Mississauga', 43.68, -79.53, 'down'],
  ['Calgary', 51.0447, -114.0719, 'up'],
  ['Montreal', 45.5019, -73.5674, 'up'],
  ['San Francisco', 37.7749, -122.4194, 'down'],
  ['Chicago', 41.8781, -87.6298, 'left'],
  ['Boston', 42.3601, -71.0589, 'right']
];
const GLB_ANCHOR = {
  up: 'translate(-50%,-235%)',
  down: 'translate(-50%,155%)',
  left: 'translate(-108%,-50%)',
  right: 'translate(8%,-50%)'
};
// Same offsets as GLB_ANCHOR, expressed as fractions of the label's own size, so
// the label's rendered box can be computed from its anchor point (px) + fx*w / fy*h.
const GLB_ANCHOR_FRAC = {
  up: [-0.5, -2.35], down: [-0.5, 1.55], left: [-1.08, -0.5], right: [0.08, -0.5]
};
// Screen-space vertical de-clutter for the crowded NE cluster (Chicago / GTA /
// Boston / Montreal). Resets each call, then pushes the lower of any pair that
// overlaps in X apart along Y so the pills never touch. Writes it.dy (px).
function glbDecollide(items, pad) {
  pad = pad == null ? 5 : pad;
  const rect = it => ({ x: it.x + it.fx * it.w, y: it.y + it.dy + it.fy * it.h, w: it.w, h: it.h });
  items.forEach(it => { it.dy = 0; });
  items.sort((a, b) => (a.y + a.fy * a.h) - (b.y + b.fy * b.h));
  for (let pass = 0; pass < 6; pass++) {
    let moved = false;
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const A = rect(items[i]), B = rect(items[j]);
      const ox = Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x);
      const oy = Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y);
      if (ox > 0 && oy > -pad) {
        const push = oy + pad;
        if ((A.y + A.h / 2) <= (B.y + B.h / 2)) items[j].dy += push; else items[i].dy += push;
        moved = true;
      }
    }
    if (!moved) break;
  }
}

// Simplified world landmass rings — [lon,lat]. Recognizability > accuracy.
const GLB_LAND = [
  [[-168,65],[-162,70],[-140,70],[-125,71],[-100,73],[-83,73],[-70,67],[-63,60],[-64,56],[-55,52],[-53,47],[-60,47],[-66,44],[-70,41],[-74,39],[-75,35],[-81,31],[-80,25],[-82,27],[-84,30],[-90,29],[-94,29],[-97,26],[-97,22],[-95,18],[-90,20],[-88,16],[-84,10],[-78,8],[-83,14],[-92,15],[-96,16],[-105,20],[-112,24],[-117,32],[-121,35],[-122,38],[-124,42],[-124,48],[-130,52],[-135,57],[-140,59],[-150,59],[-158,58],[-165,60],[-168,65]],
  [[-45,60],[-42,66],[-30,68],[-22,70],[-19,76],[-25,80],[-40,83],[-55,83],[-62,78],[-55,72],[-50,67],[-45,60]],
  [[-81,7],[-77,8],[-72,11],[-62,10],[-52,5],[-50,0],[-44,-2],[-38,-4],[-35,-6],[-35,-12],[-39,-16],[-41,-22],[-48,-25],[-54,-34],[-58,-39],[-62,-41],[-66,-45],[-69,-51],[-66,-55],[-71,-54],[-73,-46],[-73,-38],[-71,-30],[-71,-20],[-76,-14],[-80,-5],[-81,0],[-79,2],[-81,7]],
  [[-16,15],[-16,20],[-12,25],[-6,30],[0,32],[10,34],[11,37],[19,32],[25,32],[32,31],[34,28],[36,22],[38,16],[43,12],[51,12],[48,6],[42,-1],[40,-8],[35,-18],[32,-25],[27,-33],[20,-35],[18,-33],[15,-27],[12,-16],[9,-2],[5,4],[-2,5],[-8,4],[-13,9],[-16,15]],
  [[-9,37],[-9,43],[-2,43],[-1,46],[-4,48],[-1,49],[2,51],[4,52],[8,54],[8,57],[11,58],[6,60],[8,63],[12,65],[15,68],[20,70],[28,71],[40,68],[55,68],[68,73],[78,73],[95,78],[105,77],[113,74],[125,73],[140,72],[158,71],[170,68],[178,66],[172,62],[162,60],[160,54],[155,52],[143,49],[140,45],[135,43],[130,42],[128,40],[126,37],[122,39],[121,31],[115,23],[110,21],[108,16],[106,10],[100,8],[98,10],[98,16],[94,18],[90,22],[87,21],[83,18],[80,13],[77,8],[73,15],[72,21],[66,25],[60,25],[57,26],[59,22],[58,20],[52,16],[45,13],[43,12],[43,17],[42,21],[39,26],[35,29],[33,31],[36,36],[30,37],[26,40],[19,40],[13,44],[8,44],[3,43],[-2,37],[-9,37]],
  [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-18],[151,-24],[153,-28],[150,-37],[143,-39],[135,-35],[129,-32],[123,-34],[115,-34],[113,-26],[114,-22]],
  [[130,31],[135,34],[140,36],[142,40],[141,43],[137,36],[133,33],[130,31]],
  [[-5,50],[-3,53],[-5,58],[-2,58],[0,53],[1,51],[-5,50]],
  [[173,-35],[176,-38],[178,-38],[176,-41],[171,-44],[167,-46],[170,-42],[173,-38],[173,-35]],
  [[44,-16],[50,-15],[50,-22],[46,-25],[43,-21],[44,-16]],
  [[95,5],[106,6],[118,7],[119,1],[110,-4],[100,-2],[96,2],[95,5]],
  [[109,1],[117,4],[119,-1],[116,-4],[110,-3],[109,1]],
  [[131,-1],[141,-3],[147,-8],[140,-9],[132,-5],[131,-1]],
  [[-24,64],[-18,66],[-14,65],[-19,63],[-24,64]],
  [[80,6],[82,8],[81,9],[79,8],[80,6]],
  [[120,18],[124,17],[126,9],[122,6],[120,12],[120,18]]
];
const GLB_DESERTS = [
  [-13,35,14,30],[34,56,13,32],[55,112,34,49],[66,78,22,30],
  [-118,-101,24,40],[118,147,-32,-18],[11,26,-30,-16],[-72,-64,-50,-35]
];

function glbClear(n) { while (n && n.firstChild) n.removeChild(n.firstChild); }
function glbHash2(x, y) {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}
function glbVnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = glbHash2(xi, yi), b = glbHash2(xi + 1, yi), c = glbHash2(xi, yi + 1), d = glbHash2(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}
function glbFbm(x, y) {
  let s = 0, amp = 0.5, f = 1;
  for (let i = 0; i < 5; i++) { s += amp * glbVnoise(x * f, y * f); f *= 2; amp *= 0.5; }
  return s;
}
function glbMix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function glbInRing(lon, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if (((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}
function glbIsLand(lon, lat) {
  for (let r = 0; r < GLB_LAND.length; r++) if (glbInRing(lon, lat, GLB_LAND[r])) return true;
  return false;
}
// Cached land-mask grid, built once via the polygon test, so per-pixel texture
// generation is an O(1) lookup instead of ~16 polygon tests per pixel (~5x faster build).
let GLB_mask = null;
const GLB_MW = 640, GLB_MH = 320;
function glbLandMask() {
  if (GLB_mask) return GLB_mask;
  const m = new Uint8Array(GLB_MW * GLB_MH);
  for (let py = 0; py < GLB_MH; py++) {
    const lat = 90 - (py + 0.5) / GLB_MH * 180;
    for (let px = 0; px < GLB_MW; px++) {
      const lon = (px + 0.5) / GLB_MW * 360 - 180;
      if (glbIsLand(lon, lat)) m[py * GLB_MW + px] = 1;
    }
  }
  GLB_mask = m;
  return m;
}
function glbLandAt(lon, lat) {
  const m = glbLandMask();
  let px = Math.floor((lon + 180) / 360 * GLB_MW);
  let py = Math.floor((90 - lat) / 180 * GLB_MH);
  px = ((px % GLB_MW) + GLB_MW) % GLB_MW;
  if (py < 0) py = 0; else if (py >= GLB_MH) py = GLB_MH - 1;
  return m[py * GLB_MW + px] === 1;
}
function glbBoxFalloff(lon, lat, box, fw) {
  const dx = Math.max(box[0] - lon, lon - box[1], 0), dy = Math.max(box[2] - lat, lat - box[3], 0);
  const d = Math.max(dx, dy), t = 1 - d / fw;
  return t <= 0 ? 0 : t * t * (3 - 2 * t);
}
function glbDesert(lon, lat) { let s = 0; for (let i = 0; i < GLB_DESERTS.length; i++) s = Math.max(s, glbBoxFalloff(lon, lat, GLB_DESERTS[i], 9)); return s; }

const GLB_OCEAN_DEEP = [9, 32, 60], GLB_OCEAN_SHAL = [26, 78, 122];
const GLB_SNOW = [233, 237, 241], GLB_TAIGA = [44, 72, 50], GLB_TEMP = [70, 108, 62], GLB_TROP = [48, 112, 58], GLB_DES = [198, 178, 124];
// Painted Earth colour (rgb) at a lon/lat — shared by the sphere texture and the fallback globe.
function glbColorAt(lon, lat) {
  const alat = Math.abs(lat);
  let col;
  if (glbLandAt(lon, lat)) {
    let green;
    if (alat > 66) green = GLB_SNOW;
    else if (alat > 52) green = glbMix(GLB_TAIGA, GLB_SNOW, (alat - 52) / 14 * 0.6);
    else if (alat > 33) green = glbMix(GLB_TEMP, GLB_TAIGA, (alat - 33) / 19 * 0.55);
    else if (alat > 15) green = GLB_TEMP;
    else green = GLB_TROP;
    let noiseArid = Math.max(0, glbFbm(lon * 0.03 + 5, lat * 0.03 + 9) - 0.44) * 1.7;
    let ds = glbDesert(lon, lat) * (0.5 + glbFbm(lon * 0.09 + 20, lat * 0.09 + 4) * 0.7);
    let aridT = Math.max(noiseArid, ds);
    if (alat > 50) aridT *= 0.18;
    const base = glbMix(green, GLB_DES, Math.min(0.82, aridT));
    const shade = 0.8 + glbFbm(lon * 0.2 + 3, lat * 0.2 + 7) * 0.36;
    col = [base[0] * shade, base[1] * shade, base[2] * shade];
  } else {
    const d = 0.32 + glbFbm(lon * 0.045, lat * 0.045) * 0.55;
    col = glbMix(GLB_OCEAN_SHAL, GLB_OCEAN_DEEP, d);
    if (alat > 78) col = glbMix(col, GLB_SNOW, (alat - 78) / 12);
  }
  if (lat < -68) { const t = Math.min(1, (-68 - lat) / 14); col = glbMix(col, GLB_SNOW, 0.6 + t * 0.4); }
  return col;
}

let GLB_earthCv = null, GLB_specCv = null, GLB_cloudCv = null;
function glbEarthCanvas() {
  if (GLB_earthCv) return GLB_earthCv;
  const W = 1024, H = 512, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), dat = img.data;
  for (let py = 0; py < H; py++) {
    const lat = 90 - (py / H) * 180;
    for (let px = 0; px < W; px++) {
      const lon = (px / W) * 360 - 180, c = glbColorAt(lon, lat), o = (py * W + px) * 4;
      dat[o] = c[0]; dat[o + 1] = c[1]; dat[o + 2] = c[2]; dat[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  GLB_earthCv = cv;
  return cv;
}
function glbSpecCanvas() {
  if (GLB_specCv) return GLB_specCv;
  const W = 512, H = 256, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), dat = img.data;
  for (let py = 0; py < H; py++) {
    const lat = 90 - (py / H) * 180;
    for (let px = 0; px < W; px++) {
      const lon = (px / W) * 360 - 180;
      const v = glbLandAt(lon, lat) ? 26 : (Math.abs(lat) > 78 ? 60 : 165), o = (py * W + px) * 4;
      dat[o] = v; dat[o + 1] = v; dat[o + 2] = v; dat[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  GLB_specCv = cv;
  return cv;
}
function glbCloudCanvas() {
  if (GLB_cloudCv) return GLB_cloudCv;
  const W = 768, H = 384, cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), dat = img.data;
  for (let py = 0; py < H; py++) {
    const lat = 90 - (py / H) * 180;
    for (let px = 0; px < W; px++) {
      const lon = (px / W) * 360 - 180;
      let n = glbFbm(lon * 0.05 + 40, lat * 0.05 + 12);
      let cov = Math.max(0, (n - 0.52)) * 3.0;
      cov = Math.min(1, cov) * (1 - Math.min(1, Math.abs(lat) / 88 * 0.5));
      const v = Math.round(cov * 255), o = (py * W + px) * 4;
      dat[o] = 255; dat[o + 1] = v; dat[o + 2] = 255; dat[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  GLB_cloudCv = cv;
  return cv;
}
// lon/lat -> Vector3 matching THREE.SphereGeometry UV convention (so pins align with the texture).
function glbVec(lat, lon, r, THREE) {
  const a = (lon + 180) * Math.PI / 180, b = (90 - lat) * Math.PI / 180;
  return new THREE.Vector3(-r * Math.cos(a) * Math.sin(b), r * Math.cos(b), r * Math.sin(a) * Math.sin(b));
}
function glbRadialSprite() {
  const s = 64, cv = document.createElement('canvas');
  cv.width = s; cv.height = s;
  const ctx = cv.getContext('2d'), g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,90,70,0.95)');
  g.addColorStop(0.4, 'rgba(224,32,32,0.55)');
  g.addColorStop(1, 'rgba(224,32,32,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s);
  return cv;
}

// Static orthographic globe centred on (cLat,cLon) for the fallback. Returns {canvas, pts}.
function glbBuildOrtho(size, cLat, cLon) {
  const cv = document.createElement('canvas');
  cv.width = size; cv.height = size;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(size, size), dat = img.data;
  const R = size / 2 - Math.max(6, size * 0.06), cx = size / 2, cy = size / 2;
  const f0 = cLat * Math.PI / 180, l0 = cLon * Math.PI / 180;
  const sf0 = Math.sin(f0), cf0 = Math.cos(f0);
  const L = (function () { const v = [-0.45, 0.55, 0.72], m = Math.hypot(v[0], v[1], v[2]); return [v[0] / m, v[1] / m, v[2] / m]; })();
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = (px - cx) / R, y = -(py - cy) / R, rho2 = x * x + y * y, o = (py * size + px) * 4;
      if (rho2 > 1.28) { dat[o + 3] = 0; continue; }
      if (rho2 > 1) {
        const rr = Math.sqrt(rho2), a = Math.max(0, 1 - (rr - 1) / 0.28);
        dat[o] = 150; dat[o + 1] = 186; dat[o + 2] = 232; dat[o + 3] = Math.round(a * a * 150);
        continue;
      }
      const nz = Math.sqrt(1 - rho2);
      const lat = Math.asin(Math.max(-1, Math.min(1, nz * sf0 + y * cf0))) * 180 / Math.PI;
      let lon = (l0 + Math.atan2(x, nz * cf0 - y * sf0)) * 180 / Math.PI;
      lon = ((lon + 180) % 360 + 360) % 360 - 180;
      const c = glbColorAt(lon, lat);
      const lam = Math.max(0, x * L[0] + y * L[1] + nz * L[2]);
      const sh = 0.42 + 0.62 * lam;
      const rim = rho2 > 0.72 ? (rho2 - 0.72) / 0.28 : 0;
      dat[o] = Math.min(255, c[0] * sh + rim * 40);
      dat[o + 1] = Math.min(255, c[1] * sh + rim * 60);
      dat[o + 2] = Math.min(255, c[2] * sh + rim * 95);
      dat[o + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const pts = [];
  for (let i = 0; i < GLB_PINS.length; i++) {
    const nm = GLB_PINS[i][0], f = GLB_PINS[i][1] * Math.PI / 180, l = GLB_PINS[i][2] * Math.PI / 180;
    const cosc = sf0 * Math.sin(f) + cf0 * Math.cos(f) * Math.cos(l - l0);
    const sx = cx + Math.cos(f) * Math.sin(l - l0) * R;
    const sy = cy - (cf0 * Math.sin(f) - sf0 * Math.cos(f) * Math.cos(l - l0)) * R;
    if (cosc > 0.02) {
      ctx.beginPath(); ctx.arc(sx, sy, size * 0.03, 0, 6.29);
      ctx.fillStyle = 'rgba(224,32,32,0.28)'; ctx.fill();
      ctx.beginPath(); ctx.arc(sx, sy, size * 0.013, 0, 6.29);
      ctx.fillStyle = '#e02020'; ctx.fill();
      ctx.lineWidth = size * 0.006; ctx.strokeStyle = '#fff'; ctx.stroke();
    }
    pts.push({ name: nm, x: sx, y: sy, front: cosc > 0.05 });
  }
  return { canvas: cv, pts: pts };
}

function glbHasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch (e) { return false; }
}

function glbLabelStyle(el) {
  el.style.cssText = 'position:absolute;transform:translate(-50%,-142%);font:600 11px/1 var(--font-mono,monospace);letter-spacing:.02em;color:#171a21;background:rgba(255,255,255,.9);border:1px solid rgba(224,32,32,.32);padding:3px 8px;border-radius:999px;white-space:nowrap;box-shadow:0 6px 16px -8px rgba(0,0,0,.4);pointer-events:none;transition:opacity .25s;will-change:transform,opacity';
}

function CorporateGlobe() {
  const ref = useMR(null);
  const [mode, setMode] = useM('pending');
  useME(() => {
    const small = window.innerWidth < 900;
    if (small || REDUCED || !glbHasWebGL()) { setMode('fallback'); return; }
    if (typeof THREE !== 'undefined') { setMode('gl'); return; }
    let live = true;
    loadThree().then(ok => { if (live) setMode(ok && typeof THREE !== 'undefined' ? 'gl' : 'fallback'); });
    return () => { live = false; };
  }, []);

  // --- Fallback: static orthographic globe centred on North America ---
  useME(() => {
    if (mode !== 'fallback' || !ref.current) return;
    const wrap = ref.current;
    glbClear(wrap);
    wrap.style.position = 'relative';
    const S = Math.max(200, Math.min(wrap.clientWidth || 320, 440));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const built = glbBuildOrtho(Math.round(S * dpr), 40, -95);
    const cv = built.canvas;
    cv.style.width = S + 'px'; cv.style.height = S + 'px';
    cv.style.filter = 'drop-shadow(0 18px 40px rgba(20,40,80,.28))';
    cv.setAttribute('role', 'img');
    cv.setAttribute('aria-label', 'Globe of North America marking our 7 centres, with the Greater Toronto Area highlighted');
    wrap.appendChild(cv);
    const fbItems = [];
    built.pts.forEach(p => {
      if (!p.front || p.name === 'Mississauga') return;
      const el = document.createElement('div');
      glbLabelStyle(el);
      const txt = p.name === 'North York' ? 'North York · Mississauga' : p.name;
      el.textContent = txt;
      const lab = GLB_LABELS.find(x => x[0] === txt);
      const dir = (lab && lab[3]) || 'up';
      el.style.transform = GLB_ANCHOR[dir] || GLB_ANCHOR.up;
      const ax = p.x / dpr, ay = p.y / dpr;
      el.style.left = ax + 'px';
      el.style.top = ay + 'px';
      if (p.name === 'North York') el.style.borderColor = 'rgba(224,32,32,.6)';
      wrap.appendChild(el);
      const fr = GLB_ANCHOR_FRAC[dir] || GLB_ANCHOR_FRAC.up;
      fbItems.push({ el: el, x: ax, y: ay, fx: fr[0], fy: fr[1], w: el.offsetWidth, h: el.offsetHeight, dy: 0 });
    });
    // De-clutter the static fallback the same way the GL globe does (one pass).
    glbDecollide(fbItems);
    fbItems.forEach(it => { it.el.style.top = (it.y + it.dy) + 'px'; });
    return () => { glbClear(wrap); };
  }, [mode]);

  // --- WebGL: photoreal Earth ---
  useME(() => {
    if (mode !== 'gl' || !ref.current || typeof THREE === 'undefined') return;
    const wrap = ref.current;
    glbClear(wrap);
    wrap.style.position = 'relative';
    const S = Math.max(220, Math.min(wrap.clientWidth || 360, 440));
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    cam.position.set(0, 0, 27);
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch (e) { setMode('fallback'); return; }
    renderer.setSize(S, S);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (renderer.outputColorSpace !== undefined && THREE.SRGBColorSpace) renderer.outputColorSpace = THREE.SRGBColorSpace;
    wrap.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const R = 9;
    const root = new THREE.Group(); scene.add(root);

    const earthTex = new THREE.CanvasTexture(glbEarthCanvas());
    if (earthTex.colorSpace !== undefined && THREE.SRGBColorSpace) earthTex.colorSpace = THREE.SRGBColorSpace;
    if (renderer.capabilities) earthTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const specTex = new THREE.CanvasTexture(glbSpecCanvas());
    const earthMat = new THREE.MeshPhongMaterial({ map: earthTex, specularMap: specTex, specular: new THREE.Color(0x6688aa), shininess: 14 });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 48), earthMat);
    root.add(earth);

    const cloudTex = new THREE.CanvasTexture(glbCloudCanvas());
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(R * 1.012, 48, 32),
      new THREE.MeshPhongMaterial({ color: 0xffffff, alphaMap: cloudTex, transparent: true, opacity: 0.5, depthWrite: false }));
    root.add(clouds);

    const atmoMat = new THREE.ShaderMaterial({
      uniforms: { glowColor: { value: new THREE.Color(0x5aa0ea) } },
      vertexShader: 'varying vec3 vN;varying vec3 vP;void main(){vN=normalize(normalMatrix*normal);vec4 mv=modelViewMatrix*vec4(position,1.0);vP=mv.xyz;gl_Position=projectionMatrix*mv;}',
      fragmentShader: 'uniform vec3 glowColor;varying vec3 vN;varying vec3 vP;void main(){vec3 v=normalize(-vP);float f=1.0-abs(dot(vN,v));f=pow(f,2.3);gl_FragColor=vec4(glowColor,f*0.9);}',
      side: THREE.BackSide, blending: THREE.NormalBlending, transparent: true, depthWrite: false
    });
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.15, 48, 32), atmoMat);
    scene.add(atmo);

    scene.add(new THREE.AmbientLight(0xc4d0df, 1.05));
    const sun = new THREE.DirectionalLight(0xfff4e6, 0.95);
    sun.position.set(6, 4, 9); scene.add(sun);
    const rimLight = new THREE.DirectionalLight(0x88aaff, 0.25);
    rimLight.position.set(-8, -2, 3); scene.add(rimLight);

    const glowTex = new THREE.CanvasTexture(glbRadialSprite());
    const beadGeo = new THREE.SphereGeometry(0.22, 16, 12);
    const dotGeo = new THREE.SphereGeometry(0.09, 10, 8);
    const ringGeo = new THREE.RingGeometry(0.34, 0.46, 28);
    const pins = GLB_PINS.map((c, i) => {
      const pos = glbVec(c[1], c[2], R + 0.06, THREE);
      const bead = new THREE.Mesh(beadGeo, new THREE.MeshBasicMaterial({ color: 0xe02020, transparent: true }));
      bead.position.copy(pos);
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xffe2dd, transparent: true }));
      dot.position.copy(glbVec(c[1], c[2], R + 0.19, THREE));
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      glow.position.copy(pos); glow.scale.setScalar(1.5);
      const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xe02020, transparent: true, opacity: 0.7, side: THREE.DoubleSide }));
      ring.position.copy(glbVec(c[1], c[2], R + 0.05, THREE)); ring.lookAt(0, 0, 0);
      ring.userData.t = i * 0.5;
      root.add(bead); root.add(dot); root.add(glow); root.add(ring);
      return { bead: bead, dot: dot, glow: glow, ring: ring, nrm: pos.clone().normalize() };
    });

    const layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;inset:0;pointer-events:none;overflow:hidden';
    wrap.appendChild(layer);
    const offX = (wrap.clientWidth - S) / 2, offY = (wrap.clientHeight - S) / 2;
    const labels = GLB_LABELS.map(l => {
      const el = document.createElement('div'); glbLabelStyle(el); el.textContent = l[0];
      el.style.transform = GLB_ANCHOR[l[3]] || GLB_ANCHOR.up;
      if (l[0].indexOf('·') >= 0) el.style.borderColor = 'rgba(224,32,32,.6)';
      layer.appendChild(el);
      const fr = GLB_ANCHOR_FRAC[l[3]] || GLB_ANCHOR_FRAC.up;
      return { el: el, base: glbVec(l[1], l[2], R + 0.06, THREE), fx: fr[0], fy: fr[1], w: el.offsetWidth, h: el.offsetHeight, x: 0, y: 0, dy: 0, front: false };
    });

    const nGTA = glbVec(43.68, -79.53, 1, THREE).normalize();
    const qFace = new THREE.Quaternion().setFromUnitVectors(nGTA, new THREE.Vector3(0, 0, 1));
    const qTilt = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), 0.4);
    const qTarget = qTilt.clone().multiply(qFace);
    const yAxis = new THREE.Vector3(0, 1, 0);
    const qYaw = new THREE.Quaternion();
    const camDir = cam.position.clone().normalize();
    const tmp = new THREE.Vector3();
    const INTRO = 2.6, A0 = 3.6;
    let raf = 0, visible = true, running = false, clock = 0, last = 0;

    function setYaw(a) { qYaw.setFromAxisAngle(yAxis, a); root.quaternion.copy(qTarget).multiply(qYaw); }
    function updatePins(pulse) {
      pins.forEach(p => {
        tmp.copy(p.nrm).applyQuaternion(root.quaternion);
        const front = tmp.dot(camDir);
        const vis = Math.max(0, Math.min(1, (front - 0.02) / 0.22));
        p.bead.material.opacity = vis; p.bead.visible = vis > 0.01;
        p.dot.material.opacity = vis; p.dot.visible = vis > 0.01;
        p.glow.material.opacity = vis * 0.9; p.glow.visible = vis > 0.01;
        let ro = 0.7, rs = 1;
        if (pulse) { p.ring.userData.t += 0.02; const ph = p.ring.userData.t % 2 / 2; rs = 1 + ph * 1.45; ro = 0.7 * (1 - ph); }
        p.ring.scale.setScalar(rs); p.ring.material.opacity = ro * vis; p.ring.visible = vis > 0.01;
      });
    }
    function updateLabels() {
      const front = [];
      labels.forEach(l => {
        tmp.copy(l.base).applyQuaternion(root.quaternion);
        const facing = tmp.dot(camDir);
        tmp.project(cam);
        l.x = offX + (tmp.x * 0.5 + 0.5) * S;
        l.y = offY + (-tmp.y * 0.5 + 0.5) * S;
        l.front = facing > 0.16;
        l.dy = 0;
        if (l.front) front.push(l);
      });
      glbDecollide(front); // keep the NE cluster's pills from overlapping
      labels.forEach(l => {
        l.el.style.left = l.x + 'px';
        l.el.style.top = (l.y + l.dy) + 'px';
        l.el.style.opacity = l.front ? '1' : '0';
      });
    }
    function easeOut(x) { return 1 - Math.pow(1 - x, 3); }
    // Full loop-pause: the rAF tick only runs while the globe is on-screen AND the
    // tab is visible; `clock` accumulates only running time so pause/resume never jumps.
    function step() {
      const t = clock;
      let a;
      if (t < INTRO) a = A0 * (1 - easeOut(t / INTRO));
      else a = 0.035 * Math.sin((t - INTRO) * 0.5);
      setYaw(a);
      clouds.rotation.y += 0.0006;
      updatePins(true);
      updateLabels();
      renderer.render(scene, cam);
    }
    function frame(ts) {
      if (!running) return;
      const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0;
      last = ts; clock += dt;
      step();
      raf = requestAnimationFrame(frame);
    }
    function start() { if (running || REDUCED) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop() { if (!running) return; running = false; cancelAnimationFrame(raf); raf = 0; }
    function sync() { if (visible && !document.hidden) start(); else stop(); }

    const io = ('IntersectionObserver' in window) ? new IntersectionObserver(es => { visible = es[0].isIntersecting; sync(); }, { threshold: 0.05 }) : null;
    if (io) io.observe(wrap);
    const onVis = () => sync();
    document.addEventListener('visibilitychange', onVis);

    if (REDUCED) { setYaw(0); updatePins(false); updateLabels(); renderer.render(scene, cam); }
    else { sync(); }

    const onResize = () => { const ns = Math.max(220, Math.min(wrap.clientWidth || 360, 440)); renderer.setSize(ns, ns); };
    window.addEventListener('resize', onResize);

    return () => {
      stop();
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', onResize);
      if (io) io.disconnect();
      earthTex.dispose(); specTex.dispose(); cloudTex.dispose(); glowTex.dispose();
      earth.geometry.dispose(); earthMat.dispose();
      clouds.geometry.dispose(); clouds.material.dispose();
      atmo.geometry.dispose(); atmoMat.dispose();
      beadGeo.dispose(); dotGeo.dispose(); ringGeo.dispose();
      pins.forEach(p => { p.bead.material.dispose(); p.dot.material.dispose(); p.glow.material.dispose(); p.ring.material.dispose(); });
      renderer.dispose();
      glbClear(wrap);
    };
  }, [mode]);

  return React.createElement("div", {
    className: "globe-wrap reveal",
    ref: ref,
    "aria-label": "Interactive globe showing our 7 test centres across North America"
  });
}
Object.assign(window, {
  HeroParticles,
  CorporateGlobe
});
const {
  useState: useX,
  useEffect: useXE
} = React;
const EXAM_DETAIL = {
  celpip: {
    key: 'celpip',
    name: 'CELPIP',
    full: 'Canadian English Language Proficiency Index Program',
    org: 'Paragon Testing Enterprises',
    book: 'https://www.celpip.ca/take-celpip/register-for-celpip/',
    centreUrls: {
      'North York': 'https://www.celpip.ca/centre/troy-testing-learning-centers-toronto/',
      'Mississauga': 'https://www.celpip.ca/centre/troy-testing-learning-centers-mississauga/'
    },
    tagline: 'The all-computer English test for Canadian immigration and citizenship.',
    intro: 'CELPIP is a fully computer-delivered English test in Canadian English, accepted by IRCC for permanent residence and by IRCC for citizenship (CELPIP-General LS). Every section — including speaking — is completed on the computer, with no live examiner.',
    format: [['Listening', '47–55 min', 'Comprehension across conversations and news items'], ['Reading', '55–60 min', 'Correspondence, diagrams, and viewpoints'], ['Writing', '53–60 min', 'An email and a survey response'], ['Speaking', '15–20 min', 'Eight recorded tasks — no live interviewer']],
    scoring: 'Reported as CELPIP levels 1–12 per skill. Map your target CRS points back to the level you actually need before booking.',
    fees: 'CELPIP-General CA$290 · CELPIP-General LS CA$195',
    centres: ['North York', 'Mississauga'],
    bring: ['Valid passport (primary ID)', 'Confirmation email from Paragon', 'Arrive 30 minutes early']
  },
  cfa: {
    key: 'cfa',
    name: 'CFA',
    full: 'Chartered Financial Analyst Program',
    org: 'CFA Institute (delivered via Prometric)',
    book: 'https://www.cfainstitute.org/programs/cfa-program',
    tagline: 'The global benchmark for investment-management professionals.',
    intro: 'The CFA Program is a three-level, computer-based credential administered by Prometric on behalf of the CFA Institute. We host Levels I, II and III at our Toronto (North York) and Mississauga centres; you register through the CFA Institute and select us as your test site.',
    format: [['Level I', '2 sessions · 4h30', 'Multiple choice across the ten topic areas'], ['Level II', '2 sessions · 4h30', 'Item sets (vignettes) with multiple choice'], ['Level III', '2 sessions · 4h30', 'Constructed-response essays plus item sets']],
    scoring: 'Pass/fail per level, benchmarked against the Minimum Passing Score. Plan roughly 300 hours of study per level.',
    fees: 'Registration from US$940–1,290 depending on window (set by CFA Institute)',
    centres: ['North York', 'Mississauga'],
    bring: ['Valid international passport', 'CFA-approved calculator', 'Prometric confirmation']
  },
  lsat: {
    key: 'lsat',
    name: 'LSAT',
    full: 'Law School Admission Test',
    org: 'LSAC',
    book: 'https://www.lsac.org/lsat/register-lsat',
    tagline: 'The reasoning test at the heart of law-school admission.',
    intro: 'The LSAT measures reading comprehension and logical reasoning skills central to legal study. Administered by LSAC, it is offered multiple times a year. We host LSAT candidates at our Toronto (North York) centre.',
    format: [['Logical Reasoning', '2 scored sections', 'Argument analysis and evaluation'], ['Reading Comprehension', '1 scored section', 'Dense passages with question sets'], ['Unscored section', 'variable', 'An additional experimental section'], ['Writing sample', 'separate', 'Completed online, on your own schedule']],
    scoring: 'Scored on a 120–180 scale. Most competitive schools look for 160+; know your target school\u2019s median before you book.',
    fees: 'US$238 test fee (set by LSAC); fee waivers available',
    centres: ['North York'],
    bring: ['Government photo ID matching your registration', 'LSAC admission ticket', 'Arrive early for check-in']
  }
};
function ExamDetailPage({
  fam,
  go,
  openReserve
}) {
  const d = EXAM_DETAIL[fam];
  if (!d) return null;
  const exams = EXAMS.filter(e => fam === 'celpip' ? e.code.startsWith('CELPIP') : fam === 'cfa' ? e.code.startsWith('CFA') : e.code === 'LSAT');
  return React.createElement("main", {
    className: "page"
  }, React.createElement(PageHero, {
    eyebrow: `Exam guide · ${d.org}`,
    title: React.createElement(React.Fragment, null, d.name, " ", React.createElement("em", {
      style: {
        fontStyle: 'normal',
        color: 'var(--accent)'
      }
    }, "at Troy Testing"), "."),
    sub: d.tagline
  }), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 8
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "ed-grid"
  }, React.createElement("div", {
    className: "reveal"
  }, React.createElement("p", {
    className: "ed-intro"
  }, d.intro), React.createElement("h3", {
    className: "ed-h serif"
  }, "Test format"), React.createElement("div", {
    className: "ed-format"
  }, d.format.map((f, i) => React.createElement("div", {
    className: "ed-row",
    key: i
  }, React.createElement("span", {
    className: "ed-sec"
  }, f[0]), React.createElement("span", {
    className: "ed-dur"
  }, f[1]), React.createElement("span", {
    className: "ed-desc"
  }, f[2])))), React.createElement("h3", {
    className: "ed-h serif"
  }, "Scoring"), React.createElement("p", {
    className: "ed-p"
  }, d.scoring), React.createElement("h3", {
    className: "ed-h serif"
  }, "What to bring"), React.createElement("ul", {
    className: "ed-bring"
  }, d.bring.map(b => React.createElement("li", {
    key: b
  }, b)))), React.createElement("aside", {
    className: "ed-side reveal",
    style: {
      transitionDelay: '100ms'
    }
  }, React.createElement("div", {
    className: "ed-card"
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, "Book this exam"), React.createElement("div", {
    className: "ed-fact"
  }, React.createElement("span", null, "Provider"), React.createElement("b", null, d.org)), React.createElement("div", {
    className: "ed-fact"
  }, React.createElement("span", null, "Fees"), React.createElement("b", null, d.fees)), React.createElement("div", {
    className: "ed-fact"
  }, React.createElement("span", null, "Centres"), React.createElement("b", null, d.centres.join(' · '))), React.createElement("a", {
    className: "btn",
    href: d.book,
    target: "_blank",
    rel: "noopener",
    style: {
      width: '100%',
      justifyContent: 'center',
      marginTop: 16
    }
  }, "Register with ", d.name === 'CFA' ? 'CFA Institute' : d.name === 'LSAT' ? 'LSAC' : 'Paragon', " ", React.createElement("span", {
    className: "arrow"
  })), d.centreUrls && Object.keys(d.centreUrls).map(c => React.createElement("a", {
    className: "btn ghost",
    key: c,
    href: d.centreUrls[c],
    target: "_blank",
    rel: "noopener",
    style: {
      width: '100%',
      justifyContent: 'center',
      marginTop: 8
    }
  }, "Book at ", c, " ", React.createElement("span", {
    className: "arrow"
  }))), React.createElement("button", {
    className: "btn ghost",
    style: {
      width: '100%',
      justifyContent: 'center',
      marginTop: 8
    },
    onClick: () => go('contact')
  }, "Ask about prep")), React.createElement("div", {
    className: "ed-card",
    style: {
      marginTop: 16
    }
  }, React.createElement("div", {
    className: "eyebrow"
  }, "Add to my plan"), React.createElement("p", {
    style: {
      fontSize: 13,
      color: 'var(--text-dim)',
      margin: '8px 0 12px'
    }
  }, "Save exams you're considering and email yourself the shortlist."), exams.map(e => React.createElement(PlanToggle, {
    key: e.code,
    code: e.code,
    label: e.name
  }))))))), React.createElement(MultiCountdown, {
    only: fam
  }), React.createElement("section", {
    className: "cta-band"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Prep with people who sit the exam"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Ready to book your ", d.name, "?"), React.createElement("div", {
    className: "actions reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, React.createElement("a", {
    className: "btn",
    href: d.book,
    target: "_blank",
    rel: "noopener"
  }, "Register now ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("a", {
    className: "btn ghost",
    href: "#programs",
    onClick: e => {
      e.preventDefault();
      go('programs');
    }
  }, "See prep programs")))));
}
function nextFrom(dates) {
  const now = Date.now();
  for (const d of dates) {
    const t = new Date(d + 'T08:00:00').getTime();
    if (t > now) return t;
  }
  return new Date(dates[dates.length - 1] + 'T08:00:00').getTime();
}
const EXAM_DATES = {
  celpip: {
    label: 'Next CELPIP session',
    note: 'CELPIP runs weekly — new seats open constantly.',
    dates: null
  },
  cfa: {
    label: 'Next CFA exam window',
    note: 'CFA windows are fixed; register weeks ahead.',
    dates: ['2026-02-16', '2026-05-20', '2026-08-18', '2026-11-17', '2027-02-15']
  },
  lsat: {
    label: 'Next LSAT administration',
    note: 'LSAT is offered on set dates through the year.',
    dates: ['2026-06-14', '2026-08-16', '2026-10-11', '2027-01-17']
  }
};
function CountdownCard({
  conf
}) {
  const [target] = useX(() => conf.dates ? nextFrom(conf.dates) : null);
  const [now, setNow] = useX(() => Date.now());
  useXE(() => {
    const iv = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);
  if (!conf.dates) {
    return React.createElement("div", {
      className: "countdown"
    }, React.createElement("div", {
      className: "cd-left"
    }, React.createElement("div", {
      className: "eyebrow",
      style: {
        color: 'var(--accent)'
      }
    }, conf.label), React.createElement("div", {
      className: "cd-date serif"
    }, "Weekly"), React.createElement("div", {
      className: "cd-note"
    }, conf.note)));
  }
  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 864e5);
  const hrs = Math.floor(diff % 864e5 / 36e5);
  const mins = Math.floor(diff % 36e5 / 6e4);
  const secs = Math.floor(diff % 6e4 / 1000);
  const fmt = new Date(target).toLocaleDateString('en-CA', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  return React.createElement("div", {
    className: "countdown"
  }, React.createElement("div", {
    className: "cd-left"
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, conf.label), React.createElement("div", {
    className: "cd-date serif"
  }, fmt), React.createElement("div", {
    className: "cd-note"
  }, conf.note)), React.createElement("div", {
    className: "cd-clock"
  }, [['Days', days], ['Hrs', hrs], ['Min', mins], ['Sec', secs]].map(u => React.createElement("div", {
    className: "cd-unit",
    key: u[0]
  }, React.createElement("span", {
    className: "cd-n"
  }, String(u[1]).padStart(2, '0')), React.createElement("span", {
    className: "cd-u"
  }, u[0])))));
}
function MultiCountdown({
  only
}) {
  const keys = only ? [only] : ['celpip', 'cfa', 'lsat'];
  return React.createElement("section", {
    className: "block",
    style: {
      borderBottom: 'none'
    }
  }, React.createElement("div", {
    className: "container"
  }, !only && React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Key dates"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Count down to your exam.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "Registration closes well before the date \u2014 plan your prep now.")), React.createElement("div", {
    className: "cd-stack reveal"
  }, keys.map(k => React.createElement(CountdownCard, {
    key: k,
    conf: EXAM_DATES[k]
  })))));
}
function getPlan() {
  try {
    return JSON.parse(localStorage.getItem('troy.plan') || '[]');
  } catch (_) {
    return [];
  }
}
function setPlan(list) {
  try {
    localStorage.setItem('troy.plan', JSON.stringify(list));
  } catch (_) {}
  window.dispatchEvent(new CustomEvent('troy:plan'));
}
function togglePlan(code) {
  const p = getPlan();
  const i = p.indexOf(code);
  if (i >= 0) p.splice(i, 1);else p.push(code);
  setPlan(p);
}
function usePlan() {
  const [plan, setP] = useX(getPlan);
  useXE(() => {
    const h = () => setP(getPlan());
    window.addEventListener('troy:plan', h);
    return () => window.removeEventListener('troy:plan', h);
  }, []);
  return plan;
}
function PlanToggle({
  code,
  label
}) {
  const plan = usePlan();
  const on = plan.includes(code);
  return React.createElement("button", {
    className: `plan-toggle ${on ? 'on' : ''}`,
    "aria-pressed": on,
    onClick: () => togglePlan(code)
  }, React.createElement("span", {
    className: "pt-box"
  }, on ? React.createElement(Icon, {
    name: "check",
    size: 13
  }) : React.createElement(Icon, {
    name: "plus",
    size: 13
  })), React.createElement("span", null, label));
}
function PlanBar() {
  const plan = usePlan();
  const [open, setOpen] = useX(false);
  const trapRef = useFocusTrap(open, () => setOpen(false));
  if (plan.length === 0) return null;
  const items = plan.map(c => EXAMS.find(e => e.code === c)).filter(Boolean);
  const body = encodeURIComponent('My Troy Testing shortlist:\n\n' + items.map(e => `- ${e.name} (${e.org}) - ${e.fee}\n  Book: ${e.url}`).join('\n\n') + '\n\n-- Sent from troytesting.com');
  return React.createElement(React.Fragment, null, React.createElement("button", {
    className: "plan-fab",
    onClick: () => setOpen(true),
    "aria-label": `My plan, ${plan.length} exams saved`
  }, React.createElement("span", {
    className: "plan-fab-count"
  }, plan.length), " My plan"), open && React.createElement("div", {
    className: "modal-bg",
    onClick: () => setOpen(false)
  }, React.createElement("div", {
    className: "modal",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "plan-title",
    ref: trapRef,
    tabIndex: -1,
    onClick: e => e.stopPropagation()
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, "My plan \xB7 ", items.length, " exam", items.length > 1 ? 's' : ''), React.createElement("h3", {
    id: "plan-title"
  }, "Your shortlist"), React.createElement("div", {
    className: "plan-items"
  }, items.map(e => React.createElement("div", {
    className: "plan-item",
    key: e.code
  }, React.createElement("div", null, React.createElement("div", {
    className: "pi-name"
  }, e.name), React.createElement("div", {
    className: "pi-meta"
  }, e.org, " \xB7 ", e.fee)), React.createElement("button", {
    className: "pi-remove",
    "aria-label": `Remove ${e.name}`,
    onClick: () => togglePlan(e.code)
  }, "Remove")))), React.createElement("div", {
    className: "modal-actions"
  }, React.createElement("a", {
    className: "btn",
    href: `mailto:?subject=${encodeURIComponent('My Troy Testing exam shortlist')}&body=${body}`
  }, "Email me this plan ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("button", {
    className: "btn ghost",
    onClick: () => {
      setPlan([]);
    }
  }, "Clear all")), React.createElement("button", {
    className: "close",
    onClick: () => setOpen(false)
  }, "Close (Esc)"))));
}
function CorporatePage({
  go
}) {
  const [f, setF] = useX({
    org: '',
    name: '',
    email: '',
    city: '',
    exam: '',
    seats: '',
    date: '',
    format: '',
    notes: '',
    company: ''
  });
  const [err, setErr] = useX({});
  const [sent, setSent] = useX(false);
  const [delivered, setDelivered] = useX(false);
  const [status, setStatus] = useX('idle');
  const set = (k, v) => setF(s => ({
    ...s,
    [k]: v
  }));
  const submit = async e => {
    e.preventDefault();
    const er = {};
    if (!f.org.trim()) er.org = 1;
    if (!f.name.trim()) er.name = 1;
    if (!f.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) er.email = 1;
    if (!f.seats) er.seats = 1;
    setErr(er);
    if (Object.keys(er).length) return;
    if (f.company) {
      setSent(true);
      return;
    }
    const ep = (window.TROY_CONFIG || {}).FORM_ENDPOINT || '';
    if (!ep) {
      setSent(true);
      return;
    }
    setStatus('submitting');
    try {
      const fd = new FormData();
      fd.append('_subject', 'RFP — ' + f.org + ' (' + f.seats + ' seats)');
      Object.entries(f).forEach(([k, v]) => {
        if (k !== 'company') fd.append(k, v);
      });
      const res = await fetch(ep, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: fd
      });
      if (res.ok) {
        setDelivered(true);
        setSent(true);
      } else setStatus('error');
    } catch (_) {
      setStatus('error');
    }
  };
  if (sent) {
    const rfpBody = encodeURIComponent(`Organization: ${f.org}\nContact: ${f.name}\nEmail: ${f.email}\nCity: ${f.city || '—'}\nExam: ${f.exam || '—'}\nSeats: ${f.seats}\nTarget date: ${f.date || '—'}\nFormat: ${f.format || '—'}\n\n${f.notes}`);
    const rfpHref = `mailto:Enquiry@troytesting.com?subject=${encodeURIComponent('RFP — ' + f.org + ' (' + f.seats + ' seats)')}&body=${rfpBody}`;
    return React.createElement("main", {
      className: "page"
    }, React.createElement("section", {
      className: "block",
      style: {
        padding: '120px 0'
      }
    }, React.createElement("div", {
      className: "container",
      style: {
        maxWidth: 680,
        textAlign: 'center'
      }
    }, React.createElement("div", {
      className: "eyebrow",
      style: {
        color: 'var(--accent)'
      }
    }, "Proposal request ready"), React.createElement("h1", {
      className: "serif",
      style: {
        fontSize: 'clamp(40px,5vw,64px)',
        fontWeight: 420,
        letterSpacing: '-0.03em',
        lineHeight: 1.02,
        margin: '16px 0 20px'
      }
    }, "Thanks, ", f.name.split(' ')[0], ". One tap to send it to our events team."), React.createElement("p", {
      style: {
        color: 'var(--text-dim)',
        fontSize: 17
      }
    }, "Press below to send your request to ", React.createElement("strong", null, "Enquiry@troytesting.com"), ". For urgent large-scale events, call ", React.createElement("a", {
      href: "tel:+14372640311",
      style: {
        color: 'var(--accent)'
      }
    }, "+1 (437) 264-0311"), "."), React.createElement("div", {
      style: {
        marginTop: 32,
        display: 'inline-flex',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }
    }, React.createElement("a", {
      className: "btn",
      href: rfpHref
    }, "Send request ", React.createElement("span", {
      className: "arrow"
    })), React.createElement("button", {
      className: "btn ghost",
      onClick: () => go('home')
    }, "Back to home")))));
  }
  return React.createElement("main", {
    className: "page"
  }, React.createElement(PageHero, {
    eyebrow: "For organizations \xB7 North America",
    title: React.createElement(React.Fragment, null, "Large-scale & ", React.createElement("em", {
      style: {
        fontStyle: 'normal',
        color: 'var(--accent)'
      }
    }, "pop-up"), " testing."),
    sub: "Permanent testing partner or a one-time event \u2014 we deploy fully equipped, professionally managed exam centres anywhere in North America, often within 48\u201372 hours."
  }), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 8
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "corp-hero-grid"
  }, React.createElement("div", {
    className: "popup-stats",
    style: {
      gridTemplateColumns: 'repeat(2,1fr)',
      marginBottom: 8,
      flex: 1
    }
  }, [['1560439514-4e9645039924', '48–72 hrs', 'Deployment time'], ['1594122230689-45899d9e6f69', '500+', 'Max seat capacity'], ['1451187580459-43490279c0fa', 'North America', 'Coverage'], ['1552581234-26160f608093', 'Full service', 'Staff & tech']].map(s => React.createElement("div", {
    className: "popup-stat pcard",
    key: s[1]
  }, React.createElement("img", {
    className: "pcard-img",
    src: PHOTO(s[0], 800),
    alt: "",
    loading: "lazy",
    decoding: "async"
  }), React.createElement("div", {
    className: "pcard-scrim"
  }), React.createElement("div", {
    className: "pcard-body"
  }, React.createElement("div", {
    className: "ps-n"
  }, s[1]), React.createElement("div", {
    className: "ps-l"
  }, s[2]))))), typeof CorporateGlobe !== 'undefined' && React.createElement(CorporateGlobe, null)))), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 0
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Request a proposal"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Tell us about your event.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "Share the essentials and we'll come back with a tailored plan and quote \u2014 no obligation.")), React.createElement("form", {
    className: "rfp-form reveal",
    onSubmit: submit,
    noValidate: true
  }, React.createElement("div", {
    className: "rfp-grid"
  }, React.createElement("div", {
    className: `field ${err.org ? 'error' : ''}`
  }, React.createElement("label", null, "Organization *"), React.createElement("input", {
    "aria-label": "Organization",
    "aria-invalid": !!err.org,
    value: f.org,
    onChange: e => set('org', e.target.value),
    placeholder: "Company / institution"
  })), React.createElement("div", {
    className: `field ${err.name ? 'error' : ''}`
  }, React.createElement("label", null, "Contact name *"), React.createElement("input", {
    "aria-label": "Contact name",
    "aria-invalid": !!err.name,
    value: f.name,
    onChange: e => set('name', e.target.value),
    placeholder: "Your name"
  })), React.createElement("div", {
    className: `field ${err.email ? 'error' : ''}`
  }, React.createElement("label", null, "Work email *"), React.createElement("input", {
    type: "email",
    "aria-label": "Work email",
    "aria-invalid": !!err.email,
    value: f.email,
    onChange: e => set('email', e.target.value),
    placeholder: "you@org.com"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "City / region"), React.createElement("input", {
    "aria-label": "City / region",
    value: f.city,
    onChange: e => set('city', e.target.value),
    placeholder: "e.g. Toronto, ON"
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Exam / assessment"), React.createElement("input", {
    "aria-label": "Exam / assessment",
    value: f.exam,
    onChange: e => set('exam', e.target.value),
    placeholder: "e.g. licensing exam, corporate test"
  })), React.createElement("div", {
    className: `field ${err.seats ? 'error' : ''}`
  }, React.createElement("label", null, "Seats needed *"), React.createElement("select", {
    "aria-label": "Seats needed",
    "aria-invalid": !!err.seats,
    value: f.seats,
    onChange: e => set('seats', e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "\u2014 Select \u2014"), React.createElement("option", null, "Under 50"), React.createElement("option", null, "50\u2013100"), React.createElement("option", null, "100\u2013250"), React.createElement("option", null, "250\u2013500"), React.createElement("option", null, "500+"))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Target date"), React.createElement("input", {
    type: "date",
    "aria-label": "Target date",
    value: f.date,
    onChange: e => set('date', e.target.value)
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Format"), React.createElement("select", {
    "aria-label": "Format",
    value: f.format,
    onChange: e => set('format', e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "\u2014 Select \u2014"), React.createElement("option", null, "Computer-based (CBT)"), React.createElement("option", null, "Paper-based (PBT)"), React.createElement("option", null, "Hybrid"), React.createElement("option", null, "Not sure yet")))), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Anything else?"), React.createElement("textarea", {
    "aria-label": "Anything else?",
    value: f.notes,
    onChange: e => set('notes', e.target.value),
    placeholder: "Accommodations, security requirements, timeline\u2026"
  })), React.createElement("input", {
    type: "text",
    name: "company",
    tabIndex: "-1",
    autoComplete: "off",
    "aria-hidden": "true",
    value: f.company,
    onChange: e => set('company', e.target.value),
    style: {
      position: 'absolute',
      left: '-9999px',
      width: 1,
      height: 1,
      opacity: 0
    }
  }), React.createElement("div", null, React.createElement("button", {
    type: "submit",
    className: "btn",
    disabled: status === 'submitting'
  }, status === 'submitting' ? 'Sending…' : React.createElement(React.Fragment, null, "Request a proposal ", React.createElement("span", {
    className: "arrow"
  }))), status === 'error' && React.createElement("div", {
    className: "err",
    role: "alert",
    style: {
      display: 'block',
      marginTop: 12
    }
  }, "Something went wrong. Please try again, or email Enquiry@troytesting.com."))))));
}
Object.assign(window, {
  ExamDetailPage,
  EXAM_DETAIL,
  MultiCountdown,
  CorporatePage,
  PlanBar,
  PlanToggle,
  togglePlan
});
const {
  useState: useP
} = React;
function PageHero({
  eyebrow,
  title,
  sub
}) {
  return React.createElement("section", {
    className: "hero",
    style: {
      paddingBottom: 36
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, eyebrow), React.createElement("h1", {
    className: "serif reveal",
    style: {
      fontSize: 'clamp(44px, 5.6vw, 80px)',
      margin: '16px 0 18px',
      fontWeight: 420,
      lineHeight: 1.02,
      letterSpacing: '-0.03em',
      maxWidth: 1000,
      transitionDelay: '60ms'
    }
  }, title), sub && React.createElement("p", {
    className: "lead reveal",
    style: {
      maxWidth: 680,
      transitionDelay: '120ms'
    }
  }, sub)));
}
function AvailabilityPage({
  go,
  openWizard
}) {
  return React.createElement("main", {
    className: "page"
  }, React.createElement(PageHero, {
    eyebrow: "Live availability",
    title: React.createElement(React.Fragment, null, "Next available ", React.createElement("em", {
      style: {
        fontStyle: 'normal',
        color: 'var(--accent)'
      }
    }, "seats"), "."),
    sub: "A live snapshot of upcoming CELPIP, CFA and LSAT sessions across our centres, plus the next CFA exam window. Booking always happens on the provider's portal."
  }), React.createElement(AvailabilitySection, null), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 0,
      borderBottom: 'none'
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement(Countdown, null))), React.createElement("section", {
    className: "block"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement(SeatAlert, null))), React.createElement("section", {
    className: "cta-band"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Not sure which to book?"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Let us point you to the right seat."), React.createElement("div", {
    className: "actions reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, React.createElement("button", {
    className: "btn",
    onClick: () => openWizard()
  }, "Find my exam ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("a", {
    className: "btn ghost",
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, "Talk to our team")))));
}
const REVIEWS = [{
  name: 'Nandu UK',
  role: 'Google Maps',
  text: 'The centre was really quiet and comfortable. There was no disturbance from any of others not even from the staff to lower the sound while speaking test like some other sites, which was one of my previous experience from another centre.'
}, {
  name: 'Mark Francis Lugtu',
  role: 'Google Maps',
  text: 'I took my CELPIP exam at this testing center. It has a great location, very accessibe. Inside, it looks neat and well-arranged. The staff was nice and helpful. I highly recommend this testing center.'
}, {
  name: 'Roberto Gómez',
  role: 'Local Guide · Google Maps',
  text: 'Nice place, great availability to do the tests, not too crowded inside the room, kind staff.'
}];
function ReviewsPage({
  go
}) {
  return React.createElement("main", {
    className: "page"
  }, React.createElement(PageHero, {
    eyebrow: "Candidate reviews \xB7 verified on Google",
    title: React.createElement(React.Fragment, null, "The GTA's best-rated ", React.createElement("em", {
      style: {
        fontStyle: 'normal',
        color: 'var(--accent)'
      }
    }, "CELPIP"), " centre."),
    sub: "Based on verified Google reviews from candidates who tested with us \u2014 unedited. Read them all on Google."
  }), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 24
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "rating-summary reveal"
  }, React.createElement("div", {
    className: "rs-score"
  }, React.createElement("div", {
    className: "rs-num serif"
  }, "4.9"), React.createElement("div", {
    className: "rs-stars",
    "aria-label": "4.9 out of 5 stars"
  }, [0, 1, 2, 3, 4].map(i => React.createElement(Icon, {
    key: i,
    name: "star",
    size: 18,
    style: {
      marginRight: 2
    }
  }))), React.createElement("div", {
    className: "rs-count"
  }, "Based on verified Google reviews")), React.createElement("div", {
    className: "rs-bars"
  }, [['5', 92], ['4', 6], ['3', 1], ['2', 0], ['1', 1]].map(b => React.createElement("div", {
    className: "rs-bar",
    key: b[0]
  }, React.createElement("span", {
    className: "rs-bl"
  }, b[0], React.createElement(Icon, {
    name: "star",
    size: 10,
    color: "#F5A623",
    style: {
      marginLeft: 3
    }
  })), React.createElement("span", {
    className: "rs-track"
  }, React.createElement("span", {
    className: "rs-fill",
    style: {
      width: b[1] + '%'
    }
  })), React.createElement("span", {
    className: "rs-bp"
  }, b[1], "%")))), React.createElement("div", {
    className: "rs-cta"
  }, React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, React.createElement(GoogleBadge, null)), React.createElement("a", {
    className: "btn ghost",
    href: "https://maps.app.goo.gl/NmTkPejmS3Dfikb2A",
    target: "_blank",
    rel: "noopener"
  }, "Write a review ", React.createElement("span", {
    className: "arrow"
  })))), React.createElement("div", {
    className: "tests",
    style: {
      marginTop: 24
    }
  }, REVIEWS.map((r, i) => React.createElement("article", {
    className: "test reveal",
    key: r.name,
    style: {
      transitionDelay: i * 90 + 'ms'
    }
  }, React.createElement("div", {
    className: "score"
  }, "Google \xB7 CELPIP candidate"), React.createElement("p", {
    className: "quote"
  }, "\"", r.text, "\""), React.createElement("div", {
    className: "who"
  }, React.createElement("div", {
    className: "meta"
  }, React.createElement("div", {
    className: "name"
  }, r.name), React.createElement("div", {
    className: "role"
  }, r.role)))))))), React.createElement("section", {
    className: "cta-band"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Ready to join them?"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Book your seat with confidence."), React.createElement("div", {
    className: "actions reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, React.createElement("a", {
    className: "btn",
    href: "#availability",
    onClick: e => {
      e.preventDefault();
      go('availability');
    }
  }, "See live seats ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("a", {
    className: "btn ghost",
    href: "#centres",
    onClick: e => {
      e.preventDefault();
      go('centres');
    }
  }, "Visit a centre")))));
}
const CENTRES = [{
  tag: 'Canada · North York',
  city: 'Toronto, ON',
  addr: ['2 Sheppard Ave E, Suite 505', 'North York, ON · M2N 5Y7'],
  hosts: 'CELPIP · CFA · LSAT',
  transit: 'Sheppard–Yonge stn · 4 min walk',
  parking: 'Paid underground + green-P nearby',
  tel: '+1 (437) 264-0311',
  map: 'https://maps.app.goo.gl/NmTkPejmS3Dfikb2A'
}, {
  tag: 'Canada · Mississauga',
  city: 'Mississauga, ON',
  addr: ['30 Eglinton Ave W, Suite 720', 'Mississauga, ON · L5R 3E7'],
  hosts: 'CELPIP · CFA',
  transit: 'Square One transit hub · 6 min',
  parking: 'Free on-site surface lot',
  tel: '+1 (437) 264-0311',
  map: 'https://maps.app.goo.gl/Hd1gi1hewtuPHJW17'
}, {
  tag: 'Canada · Calgary',
  city: 'Calgary, AB',
  addr: ['888 3rd Street SW, Bankers Hall', 'Suite 1001, Calgary, AB · T2P 5C5'],
  hosts: 'Corporate & pop-up testing',
  transit: '3 St SW C-Train · 2 min',
  parking: 'Bankers Hall parkade',
  tel: '+1 (437) 264-0311',
  map: 'https://maps.google.com/?q=888+3rd+Street+SW+Bankers+Hall+Calgary'
}, {
  tag: 'Canada · Montreal',
  city: 'Montreal, QC',
  addr: ['2235 Mont-Royal Ave East', 'Montreal, QC · H2H 1K5'],
  hosts: 'Corporate & pop-up testing',
  transit: 'Préfontaine Métro · 7 min',
  parking: 'Street + nearby lots',
  tel: '+1 (437) 264-0311',
  map: 'https://maps.google.com/?q=2235+Mont-Royal+Ave+East+Montreal'
}, {
  tag: 'United States · San Francisco',
  city: 'San Francisco, CA',
  addr: ['1160 Battery St E, Suite 100E', 'San Francisco, CA · 94111'],
  hosts: 'Corporate & pop-up testing',
  transit: 'Embarcadero BART · 10 min',
  parking: 'Battery St garages',
  tel: '+1 (415) 825-6725',
  map: 'https://maps.google.com/?q=1160+Battery+St+E+San+Francisco'
}, {
  tag: 'United States · Chicago',
  city: 'Chicago, IL',
  addr: ['3111 W Jackson Blvd, Suite 18', 'Chicago, IL · 60612'],
  hosts: 'Corporate & pop-up testing',
  transit: 'Medical District ‘L’ · 8 min',
  parking: 'On-site lot',
  tel: '+1 (415) 825-6725',
  map: 'https://maps.google.com/?q=3111+W+Jackson+Blvd+Chicago'
}, {
  tag: 'United States · Boston',
  city: 'Boston, MA',
  addr: ['75 Arlington St, Office 1662', 'Boston, MA · 02116'],
  hosts: 'Corporate & pop-up testing',
  transit: 'Arlington ‘T’ (Green) · 3 min',
  parking: 'Garage at Arlington',
  tel: '+1 (415) 825-6725',
  map: 'https://maps.google.com/?q=75+Arlington+St+Boston'
}];
function CentresPage({
  go
}) {
  return React.createElement("main", {
    className: "page"
  }, React.createElement(PageHero, {
    eyebrow: "Where we are \xB7 North America",
    title: React.createElement(React.Fragment, null, "Seven centres, one ", React.createElement("em", {
      style: {
        fontStyle: 'normal',
        color: 'var(--accent)'
      }
    }, "standard"), "."),
    sub: "Across Canada and the United States, every centre follows the provider's full proctoring specification \u2014 same setup, same staff standard, same calm room."
  }), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 24
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "locations"
  }, CENTRES.map((c, i) => React.createElement("div", {
    className: "loc reveal",
    key: c.city,
    style: {
      transitionDelay: i % 2 * 120 + 'ms'
    }
  }, React.createElement("a", {
    className: "loc-map",
    href: c.map,
    target: "_blank",
    rel: "noopener",
    "aria-label": `Open ${c.city} in Google Maps`
  }, React.createElement("span", {
    className: "loc-pin"
  }), React.createElement("span", {
    className: "loc-map-cta"
  }, "View on Google Maps \u2197")), React.createElement("div", {
    className: "info"
  }, React.createElement("div", {
    className: "eyebrow"
  }, c.tag), React.createElement("h3", {
    className: "serif"
  }, c.city), React.createElement("div", {
    className: "addr"
  }, c.addr[0], React.createElement("br", null), c.addr[1]), React.createElement("div", {
    className: "eyebrow",
    style: {
      marginBottom: 8
    }
  }, "Hosts"), React.createElement("div", {
    style: {
      fontSize: 14,
      color: 'var(--text-dim)',
      marginBottom: 16
    }
  }, c.hosts), React.createElement("div", {
    className: "loc-extra"
  }, React.createElement("span", null, React.createElement("b", null, "Transit"), " ", c.transit), React.createElement("span", null, React.createElement("b", null, "Parking"), " ", c.parking)), React.createElement("div", {
    className: "links"
  }, React.createElement("a", {
    href: c.map,
    target: "_blank",
    rel: "noopener"
  }, "Directions \u2197"), React.createElement("a", {
    href: 'tel:' + c.tel.replace(/[^0-9+]/g, '')
  }, c.tel)))))))), React.createElement(CentreGallery, null), React.createElement("section", {
    className: "cta-band"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Planning your visit?"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Know before you go."), React.createElement("div", {
    className: "actions reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, React.createElement("a", {
    className: "btn",
    href: "#exams",
    onClick: e => {
      e.preventDefault();
      go('test-center');
    }
  }, "Exam-day checklist ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("a", {
    className: "btn ghost",
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, "Ask a question")))));
}
const FAQS = [{
  q: 'Do you administer the official CELPIP General test?',
  a: 'Yes. Troy Testing is an accredited CELPIP delivery site for Paragon Testing. Book your exam on Paragon\'s portal and select our North York or Mississauga centre as your location.'
}, {
  q: 'Can I sit the CFA exam at Troy Testing?',
  a: 'CFA Levels I, II and III are administered by Prometric on behalf of the CFA Institute. Our Toronto (North York) and Mississauga centres are Prometric-authorized sites — book through the CFA portal and select us at check-in.'
}, {
  q: 'Do you administer the LSAT?',
  a: 'Yes. Troy Testing is an official LSAC test centre for the LSAT. Register through LSAC and select our Toronto (North York) centre — that is where we host the LSAT.'
}, {
  q: 'What identification do I need on exam day?',
  a: 'A valid, unexpired, government-issued photo ID — typically a passport. Requirements vary per exam; your confirmation email will list accepted documents.'
}, {
  q: 'Is tutoring bundled with exam booking?',
  a: 'No — you book your exam directly with the provider, and separately enroll in any Troy prep program. Many candidates combine a CELPIP, CFA or LSAT prep block with their test date; ask our team for a tailored plan.'
}, {
  q: 'How early should I arrive on test day?',
  a: 'Arrive 30 minutes before your scheduled start. Check-in, ID verification and locker assignment take time, and late arrivals may be turned away by the provider.'
}, {
  q: 'Can I bring my phone or notes into the room?',
  a: 'No. Phones, smartwatches, bags and notes go into a provided locker. Scratch paper and (for CFA) an approved calculator are provided or specified by the provider.'
}];
function Hi({
  text,
  q
}) {
  if (!q.trim()) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return React.createElement(React.Fragment, null, text.slice(0, i), React.createElement("mark", null, text.slice(i, i + q.length)), text.slice(i + q.length));
}
function FAQPage({
  go
}) {
  const [open, setOpen] = useP('');
  const [query, setQuery] = useP('');
  const match = FAQS.filter(f => (f.q + ' ' + f.a).toLowerCase().includes(query.toLowerCase()));
  return React.createElement("main", {
    className: "page"
  }, React.createElement(PageHero, {
    eyebrow: "Questions",
    title: React.createElement(React.Fragment, null, "Common questions, ", React.createElement("em", {
      style: {
        fontStyle: 'normal',
        color: 'var(--accent)'
      }
    }, "answered"), "."),
    sub: "Most candidates arrive with the same handful of questions. Search or browse below."
  }), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 24
    }
  }, React.createElement("div", {
    className: "container",
    style: {
      maxWidth: 860
    }
  }, React.createElement("input", {
    className: "faq-search reveal",
    type: "search",
    value: query,
    placeholder: "Search questions\u2026",
    "aria-label": "Search questions",
    onChange: e => {
      setQuery(e.target.value);
      if (e.target.value) setOpen('all');
    },
    style: {
      marginBottom: 8
    }
  }), React.createElement("div", {
    className: "faq reveal",
    style: {
      transitionDelay: '80ms'
    }
  }, match.map(f => React.createElement("div", {
    key: f.q,
    className: `faq-item ${open === f.q || open === 'all' && query ? 'open' : ''}`
  }, React.createElement("button", {
    className: "faq-q",
    "aria-expanded": open === f.q,
    onClick: () => setOpen(open === f.q ? '' : f.q)
  }, React.createElement("span", null, React.createElement(Hi, {
    text: f.q,
    q: query
  })), React.createElement("span", {
    className: "plus"
  })), React.createElement("div", {
    className: "faq-a"
  }, React.createElement(Hi, {
    text: f.a,
    q: query
  })))), match.length === 0 && React.createElement("div", {
    className: "faq-empty"
  }, "No matches. ", React.createElement("a", {
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, "Ask us directly \u2192"))))));
}
Object.assign(window, {
  AvailabilityPage,
  ReviewsPage,
  CentresPage,
  FAQPage,
  PageHero
});
function HomePage({
  go,
  openReserve,
  openWizard,
  openQuiz,
  lang
}) {
  const cards = [{
    id: 'programs',
    k: 'Programs',
    d: 'Academic tutoring, CELPIP/CFA/LSAT test prep, and professional skills.'
  }, {
    id: 'test-center',
    k: 'Exams',
    d: 'Every CELPIP, CFA & LSAT exam we host — each with a full exam guide and booking.'
  }, {
    id: 'availability',
    k: 'Availability',
    d: 'Filter live upcoming sessions by exam and centre, with per-exam countdowns.'
  }, {
    id: 'reviews',
    k: 'Reviews',
    d: 'Our 4.9-star Google rating and verified candidate reviews.'
  }, {
    id: 'centres',
    k: 'Centres',
    d: 'All 7 centres across North America with live maps, transit & parking.'
  }, {
    id: 'corporate',
    k: 'Corporate',
    d: 'Large-scale & pop-up exam delivery — request a proposal in minutes.'
  }, {
    id: 'guides',
    k: 'Guides',
    d: 'Practical reads on CELPIP, CFA and LSAT from the people who run the room.'
  }, {
    id: 'faq',
    k: 'FAQ',
    d: 'ID rules, exam-day logistics, and how booking works.'
  }];
  return React.createElement("main", {
    className: "page"
  }, React.createElement("section", {
    className: "hero-v2"
  }, React.createElement("div", {
    className: "hero-bg"
  }), React.createElement("div", {
    className: "hero-glow"
  }), typeof HeroParticles !== 'undefined' && React.createElement(HeroParticles, null), React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "hero-v2-grid"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow-row reveal"
  }, React.createElement("span", {
    className: "tagdot"
  }, React.createElement(Icon, {
    name: "check",
    size: 13
  })), React.createElement("span", {
    className: "eyebrow",
    style: {
      color: 'var(--text-dim)'
    }
  }, t(lang, 'hero.eyebrow'))), React.createElement("h1", {
    className: "reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, t(lang, 'hero.h1a'), " ", React.createElement(Swap, {
    words: ['CELPIP', 'CFA', 'LSAT']
  }), " ", t(lang, 'hero.h1b')), React.createElement("p", {
    className: "lead reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, t(lang, 'hero.sub')), React.createElement("div", {
    className: "hero-actions reveal",
    style: {
      transitionDelay: '180ms'
    }
  }, React.createElement("button", {
    className: "btn",
    onClick: () => openWizard()
  }, t(lang, 'cta.find'), " ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("a", {
    className: "btn ghost",
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, t(lang, 'cta.talk'))), React.createElement("div", {
    className: "hero-trust reveal",
    style: {
      transitionDelay: '210ms'
    }
  }, React.createElement(GoogleBadge, null), React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, "Best-rated CELPIP centre in the GTA")), React.createElement("div", {
    className: "hero-meta reveal",
    style: {
      transitionDelay: '240ms'
    }
  }, React.createElement("div", {
    className: "stat"
  }, React.createElement("div", {
    className: "n"
  }, React.createElement(Counter, {
    to: 2500,
    suffix: "+"
  })), React.createElement("div", {
    className: "l"
  }, t(lang, 'm.tests'))), React.createElement("div", {
    className: "stat"
  }, React.createElement("div", {
    className: "n"
  }, React.createElement(Counter, {
    to: 38,
    suffix: "+"
  })), React.createElement("div", {
    className: "l"
  }, t(lang, 'm.proctors'))), React.createElement("div", {
    className: "stat"
  }, React.createElement("div", {
    className: "n"
  }, React.createElement(Counter, {
    to: 7
  })), React.createElement("div", {
    className: "l"
  }, t(lang, 'm.centres'))))), React.createElement("div", {
    className: "reveal",
    style: {
      transitionDelay: '140ms'
    }
  }, React.createElement(ExamBoard, null))), React.createElement("div", {
    className: "hero-partner reveal",
    style: {
      transitionDelay: '300ms'
    }
  }, React.createElement(PartnerBar, null)))), React.createElement("section", {
    className: "block",
    id: "overview"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Explore the site"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Everything you need, one page each.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "Pick where you want to go. Each part of Troy Testing now has its own focused page.")), React.createElement("div", {
    className: "overview-grid"
  }, cards.map((c, i) => React.createElement("button", {
    className: "overview-card reveal",
    key: c.id,
    style: {
      transitionDelay: i % 3 * 80 + 'ms'
    },
    onClick: () => go(c.id)
  }, React.createElement("div", {
    className: "ov-k serif"
  }, c.k), React.createElement("div", {
    className: "ov-d"
  }, c.d), React.createElement("span", {
    className: "link"
  }, "Open ", c.k, " ", React.createElement("span", {
    className: "arrow"
  }))))))), React.createElement("section", {
    className: "cta-band"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Ready when you are"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Book with the provider. ", React.createElement("em", null, "Pick us"), " as the location."), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "Reserve with the provider and choose Troy as your location \u2014 Paragon for CELPIP, Prometric for CFA, LSAC for LSAT."), React.createElement("div", {
    className: "actions reveal",
    style: {
      transitionDelay: '180ms'
    }
  }, React.createElement("button", {
    className: "btn",
    onClick: () => openWizard()
  }, "Find Your Exam ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("button", {
    className: "btn ghost",
    onClick: () => openQuiz()
  }, "Estimate my study time")))));
}
window.HomePage = HomePage;
const {
  useState: usePrograms
} = React;
const PROGRAMS = [{
  tag: 'Mathematics',
  title: 'From counting to calculus',
  num: '01',
  desc: 'A continuous math pathway from early numeracy through senior calculus — every stage building on the last, with diagnostics at each level.',
  levels: ['Early numeracy & arithmetic', 'Algebra & geometry', 'Functions & pre-calculus', 'Calculus & advanced functions']
}, {
  tag: 'Reading & Comprehension',
  title: 'Building lifelong readers',
  num: '02',
  desc: 'Phonics, fluency, and critical reading strategies that turn reluctant readers into confident, analytical ones.',
  levels: ['Phonics & decoding', 'Fluency & vocabulary', 'Comprehension strategies', 'Critical & analytical reading']
}, {
  tag: 'Writing',
  title: 'Communicate with clarity & confidence',
  num: '03',
  desc: 'Structured writing instruction from sentence mechanics to persuasive essays and research papers.',
  levels: ['Sentence & paragraph craft', 'Narrative & descriptive', 'Persuasive & analytical essays', 'Research & academic writing']
}, {
  tag: 'Science Tutoring',
  title: 'Explore, understand, excel',
  num: '04',
  desc: 'Physics, chemistry and biology taught with real understanding — concept-first, lab-aware, exam-ready.',
  levels: ['Elementary science', 'Biology', 'Chemistry', 'Physics']
}, {
  tag: 'English Language Arts',
  title: 'Language mastery for every learner',
  num: '05',
  desc: 'Grammar, literature, and communication skills for native speakers and English-language learners alike.',
  levels: ['Grammar & mechanics', 'Literature & analysis', 'Speaking & listening', 'ESL / EAL support']
}, {
  tag: 'Test Preparation',
  title: 'Targeted prep for every major exam',
  num: '06',
  desc: 'Focused prep for CELPIP, CFA and LSAT, taught by instructors who have sat and scored top percentiles on the exams they teach.',
  levels: ['CELPIP · 8-week band lift', 'CFA · 300-hour protocol', 'LSAT · logic & reading labs', 'Full-length proctored mocks']
}, {
  tag: 'Professional Skills',
  title: 'Career-ready skills for today\u2019s workforce',
  num: '07',
  desc: 'Business communication, interview readiness and workplace skills — designed for newcomers and career changers.',
  levels: ['Business communication', 'Interview labs', 'Workplace readiness', 'Newcomer pathways']
}, {
  tag: 'Online Learning Platform',
  title: 'World-class education, delivered digitally',
  num: '08',
  desc: 'Live and self-paced learning through our digital hub — the same instructors, the same rigour, on your schedule.',
  levels: ['Live HD video classes', 'Self-paced recorded lessons', 'Adaptive practice tests', 'Real-time progress reports']
}];
const ONLINE_FEATURES = ['Live HD video sessions with screen sharing and digital whiteboard', 'Recorded lessons available 24/7 for review', 'Adaptive practice tests that adjust to your skill level', 'Real-time progress reports for students and parents', 'Direct messaging with your assigned tutor'];
const ONLINE_TILES = [{
  img: '1610484826967-09c5720778c7',
  t: 'Live Classes',
  d: 'Real-time instruction with your tutor'
}, {
  img: '1456513080510-7bf3a84b82f8',
  t: 'Study Materials',
  d: 'Worksheets, notes & resources'
}, {
  img: '1551288049-bebda4e38f71',
  t: 'Analytics',
  d: 'Track progress with detailed reports'
}, {
  img: '1541339907198-e08756dedf3f',
  t: 'Certifications',
  d: 'Earn certificates upon completion'
}];
function ProgramsPage({
  go
}) {
  const [open, setOpen] = usePrograms('01');
  return React.createElement("main", {
    className: "page"
  }, React.createElement("section", {
    className: "hero",
    style: {
      paddingBottom: 40
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Comprehensive learning programs"), React.createElement("h1", {
    className: "serif reveal",
    style: {
      fontSize: 'clamp(46px, 6vw, 84px)',
      margin: '16px 0 20px',
      fontWeight: 420,
      lineHeight: 1.0,
      letterSpacing: '-0.03em',
      maxWidth: 1000,
      transitionDelay: '60ms'
    }
  }, "From kindergarten foundations to", React.createElement("em", {
    style: {
      fontStyle: 'normal',
      color: 'var(--accent)'
    }
  }, " professional certifications.")), React.createElement("p", {
    className: "lead reveal",
    style: {
      maxWidth: 680,
      transitionDelay: '120ms'
    }
  }, "Structured programs designed to build mastery at every level \u2014 in person and online."), React.createElement("div", {
    className: "prog-badges reveal",
    style: {
      transitionDelay: '160ms'
    }
  }, React.createElement("span", null, "One-on-One & Group"), React.createElement("span", null, "Flexible Scheduling"), React.createElement("span", null, "In-Person & Online"), React.createElement("span", null, "Certified Instructors")))), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 24
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Our programs"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Eight pathways, one standard.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "Click any program to expand its curriculum by level.")), React.createElement("div", {
    className: "prog-accordion"
  }, PROGRAMS.map((p, i) => React.createElement("div", {
    className: `prog-item reveal ${open === p.num ? 'open' : ''}`,
    key: p.num,
    style: {
      transitionDelay: i % 4 * 60 + 'ms'
    }
  }, React.createElement("button", {
    className: "prog-q",
    "aria-expanded": open === p.num,
    onClick: () => setOpen(open === p.num ? '' : p.num)
  }, React.createElement("span", {
    className: "prog-num"
  }, p.num), React.createElement("span", {
    className: "prog-head"
  }, React.createElement("span", {
    className: "prog-title serif"
  }, p.tag), React.createElement("span", {
    className: "prog-sub"
  }, p.title)), React.createElement("span", {
    className: "plus"
  })), React.createElement("div", {
    className: "prog-a"
  }, React.createElement("p", null, p.desc), React.createElement("div", {
    className: "prog-levels"
  }, p.levels.map(l => React.createElement("span", {
    key: l
  }, l))))))))), React.createElement("section", {
    className: "block online-band"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "popup-grid"
  }, React.createElement("div", {
    className: "reveal"
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, "Digital learning hub"), React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 'clamp(34px,4vw,56px)',
      fontWeight: 420,
      letterSpacing: '-0.025em',
      lineHeight: 1.05,
      margin: '14px 0 18px'
    }
  }, "Learn without limits."), React.createElement("p", {
    style: {
      color: 'var(--text-dim)',
      fontSize: 17,
      lineHeight: 1.6,
      marginBottom: 24
    }
  }, "Our online learning platform is built for the modern student. Whether you prefer live instruction or self-paced study, our digital tools adapt to your schedule and learning style."), React.createElement("ul", {
    className: "popup-list",
    style: {
      '--tick': 'var(--accent)'
    }
  }, ONLINE_FEATURES.map(f => React.createElement("li", {
    key: f
  }, f))), React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, React.createElement("a", {
    className: "btn",
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, "Get started online ", React.createElement("span", {
    className: "arrow"
  })))), React.createElement("div", {
    className: "online-tiles reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, ONLINE_TILES.map(tile => React.createElement("div", {
    className: "online-tile pcard",
    key: tile.t
  }, React.createElement("img", {
    className: "pcard-img",
    src: PHOTO(tile.img, 800),
    alt: "",
    loading: "lazy",
    decoding: "async"
  }), React.createElement("div", {
    className: "pcard-scrim"
  }), React.createElement("div", {
    className: "pcard-body"
  }, React.createElement("div", {
    className: "ot-t"
  }, tile.t), React.createElement("div", {
    className: "ot-d"
  }, tile.d)))))))), React.createElement("section", {
    className: "cta-band"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Ready to start your journey?"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Book a free ", React.createElement("em", null, "diagnostic"), " assessment."), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "We'll build a personalized learning plan tailored to your goals \u2014 or tell you you don't need us yet."), React.createElement("div", {
    className: "actions reveal",
    style: {
      transitionDelay: '180ms'
    }
  }, React.createElement("a", {
    className: "btn",
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, "Book a free assessment ", React.createElement("span", {
    className: "arrow"
  }))))));
}
window.ProgramsPage = ProgramsPage;
const {
  useState: useStateT
} = React;
const ACCRED = [{
  img: '1513258496099-48168024aec0',
  name: 'CELPIP / Paragon Testing',
  kind: 'Language proficiency'
}, {
  img: '1611974789855-9c2a0a7236a3',
  name: 'CFA Institute',
  kind: 'Financial certification'
}, {
  img: '1589829545856-d10d557cf95f',
  name: 'LSAC',
  kind: 'Law school admissions'
}, {
  img: '1560518883-ce09059eeffa',
  name: 'RECO',
  kind: 'Real estate licensing'
}, {
  img: '1589391886645-d51941baf7fb',
  name: 'Law Society of Ontario',
  kind: 'Legal assessments'
}, {
  img: '1524758631624-e2822e304c36',
  name: 'Corporate Clients',
  kind: 'Custom assessments'
}];
const SERVICES = [{
  t: 'Test Center Setup & Management',
  d: 'We design, equip, and operate fully managed test centres tailored to your specifications — furniture, hardware, network infrastructure and security systems.',
  pts: ['Customized facility design', 'State-of-the-art workstations', 'Biometric & ID verification', 'Backup power and connectivity']
}, {
  t: 'Pop-Up Testing Events',
  featured: true,
  d: 'Need a large-capacity testing facility on short notice? We specialize in rapid deployment of temporary exam centres for high-volume events, anywhere in North America.',
  pts: ['Deployed within 48–72 hours', 'Scalable from 50 to 500+ seats', 'Full proctor and tech staff', 'Licensing, corporate & government']
}, {
  t: 'End-to-End Exam Management',
  d: 'From candidate registration to result reporting, we manage every aspect of your testing event so you can focus on your core mission.',
  pts: ['Registration & scheduling', 'Certified proctor deployment', 'Real-time incident management', 'Detailed post-exam reporting']
}, {
  t: 'Advanced Security Protocols',
  d: 'We uphold the highest standards of exam integrity with multi-layered security measures that protect both candidates and test content.',
  pts: ['Biometric identity verification', 'CCTV surveillance throughout', 'Encrypted data transmission', 'Strict NDA & compliance']
}, {
  t: 'Technology & Proctoring Solutions',
  d: 'We support computer-based, paper-based, and hybrid testing formats with advanced proctoring technology and reliable IT infrastructure.',
  pts: ['Computer-based testing (CBT)', 'Paper-based testing (PBT)', 'Remote proctoring options', 'Redundant, zero-downtime systems']
}, {
  t: 'Candidate Support Services',
  d: 'A stress-free candidate experience is central to our mission. Dedicated support teams ensure every test-taker feels prepared and supported.',
  pts: ['Pre-test orientation & FAQs', 'ADA-compliant accommodation rooms', 'On-site technical support', 'Multilingual staff available']
}, {
  t: 'Logistics & Compliance',
  d: 'We manage all the behind-the-scenes logistics so your exam runs flawlessly — from site selection to regulatory compliance.',
  pts: ['Site identification & leasing', 'Accreditation guidance', 'Furniture & hardware procurement', 'Network & infrastructure install']
}, {
  t: 'Data, Analytics & Reporting',
  d: 'Gain real-time visibility into your testing operations with a comprehensive analytics dashboard and post-event reporting suite.',
  pts: ['Real-time candidate tracking', 'Performance analytics by cohort', 'Incident & exception reports', 'Custom reporting formats']
}];
const FACILITY = [{
  img: '1580582932707-520aed937b7b',
  t: 'Up to 50 Seats',
  d: 'Ergonomic workstations with high-resolution monitors and full keyboard/mouse setups at each location.'
}, {
  img: '1508847154043-be5407fcaa5a',
  t: 'ADA Compliant',
  d: 'Fully wheelchair-accessible premises with ramps, elevators, and accessible restrooms at all locations.'
}, {
  img: '1497215728101-856f4ea42174',
  t: 'Private Accommodation Room',
  d: 'Dedicated rooms for candidates requiring extended time, distraction-free environments, or other accommodations.'
}, {
  img: '1557597774-9d273605dfa9',
  t: 'Secure Environment',
  d: 'CCTV surveillance, secure lockers for personal belongings, and strict entry protocols throughout.'
}, {
  img: '1531482615713-2afd69097998',
  t: 'On-Site Technical Support',
  d: 'Dedicated IT staff to resolve any hardware, software, or connectivity issues immediately.'
}, {
  img: '1509062522246-3755977927d7',
  t: 'Certified Proctors',
  d: 'Trained supervisors experienced in both standard and special-accommodation testing requirements.'
}];
function TestCenterPage({
  go,
  openReserve,
  openWizard,
  openQuiz
}) {
  const [filter, setFilter] = useStateT('all');
  const filters = [{
    id: 'all',
    label: 'All exams'
  }, {
    id: 'lang',
    label: 'CELPIP'
  }, {
    id: 'finance',
    label: 'CFA'
  }, {
    id: 'law',
    label: 'LSAT'
  }];
  const tagOf = code => {
    if (code.startsWith('CELPIP')) return 'lang';
    if (code.startsWith('CFA')) return 'finance';
    if (code === 'LSAT') return 'law';
    return 'other';
  };
  const visible = filter === 'all' ? EXAMS : EXAMS.filter(e => tagOf(e.code) === filter);
  return React.createElement("main", {
    className: "page"
  }, React.createElement("section", {
    className: "hero",
    style: {
      paddingBottom: 40
    }
  }, React.createElement("div", {
    className: "container hero-grid"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Secure \xB7 Professional \xB7 Accredited"), React.createElement("h1", {
    className: "serif reveal",
    style: {
      fontSize: 'clamp(46px, 6vw, 84px)',
      margin: '16px 0 20px',
      fontWeight: 420,
      lineHeight: 1.0,
      letterSpacing: '-0.03em',
      transitionDelay: '60ms'
    }
  }, "Book with the provider. ", React.createElement("em", {
    style: {
      fontStyle: 'normal',
      color: 'var(--accent)'
    }
  }, "Sit"), " the exam with us."), React.createElement("p", {
    className: "lead reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "An official CELPIP, CFA & LSAC test centre \u2014 plus end-to-end exam delivery and management for organizations across North America. Book your exam below, or partner with us for large-scale testing."), React.createElement("div", {
    className: "hero-actions reveal",
    style: {
      transitionDelay: '180ms'
    }
  }, React.createElement("button", {
    className: "btn",
    onClick: () => openWizard ? openWizard() : go('home')
  }, "Find my exam ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("a", {
    className: "btn ghost",
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, "Partner with us"))), React.createElement("div", {
    className: "hero-visual reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, React.createElement("div", {
    className: "ph testcenter-photo"
  }), React.createElement("div", {
    className: "tag"
  }, "Up to 50 seats per location"))), React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "hero-partner reveal",
    style: {
      transitionDelay: '240ms'
    }
  }, React.createElement(PartnerBar, null)))), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 40,
      paddingBottom: 40
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "quickbook reveal"
  }, React.createElement("span", {
    className: "eyebrow"
  }, "Book your exam"), React.createElement("div", {
    className: "quickbook-btns"
  }, React.createElement("a", {
    className: "btn ghost",
    href: "https://www.celpip.ca/take-celpip/register-for-celpip/",
    target: "_blank",
    rel: "noopener"
  }, React.createElement(Icon, {
    name: "flag-ca",
    size: 18,
    style: {
      marginRight: 7,
      verticalAlign: '-4px'
    }
  }), "Book CELPIP"), React.createElement("a", {
    className: "btn ghost",
    href: "https://www.cfainstitute.org/programs/cfa-program",
    target: "_blank",
    rel: "noopener"
  }, React.createElement(Icon, {
    name: "analytics",
    size: 18,
    style: {
      marginRight: 7,
      verticalAlign: '-4px'
    }
  }), "Book CFA"), React.createElement("a", {
    className: "btn ghost",
    href: "https://www.lsac.org/lsat/register-lsat",
    target: "_blank",
    rel: "noopener"
  }, React.createElement(Icon, {
    name: "scales",
    size: 18,
    style: {
      marginRight: 7,
      verticalAlign: '-4px'
    }
  }), "Book LSAT"))), React.createElement("div", {
    className: "tc-stats reveal",
    style: {
      transitionDelay: '80ms'
    }
  }, React.createElement("div", {
    className: "tc-stat"
  }, React.createElement("div", {
    className: "n"
  }, React.createElement(Counter, {
    to: 50,
    suffix: "+"
  })), React.createElement("div", {
    className: "l"
  }, "Seats per location")), React.createElement("div", {
    className: "tc-stat"
  }, React.createElement("div", {
    className: "n"
  }, React.createElement(Counter, {
    to: 7
  })), React.createElement("div", {
    className: "l"
  }, "Active locations")), React.createElement("div", {
    className: "tc-stat"
  }, React.createElement("div", {
    className: "n"
  }, "24/7"), React.createElement("div", {
    className: "l"
  }, "Candidate support")), React.createElement("div", {
    className: "tc-stat"
  }, React.createElement("div", {
    className: "n"
  }, React.createElement(Counter, {
    to: 10,
    suffix: "+"
  })), React.createElement("div", {
    className: "l"
  }, "Years experience"))))), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 0
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Exams we host"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Every major exam, one clear path.")), React.createElement("div", {
    className: "chips",
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      justifySelf: 'end',
      alignItems: 'center'
    }
  }, filters.map(f => React.createElement("button", {
    key: f.id,
    onClick: () => setFilter(f.id),
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      padding: '8px 14px',
      borderRadius: 999,
      background: filter === f.id ? 'var(--accent)' : 'transparent',
      color: filter === f.id ? 'var(--accent-ink)' : 'var(--text-dim)',
      border: '1px solid ' + (filter === f.id ? 'var(--accent)' : 'var(--rule)'),
      cursor: 'pointer',
      transition: 'all .2s'
    }
  }, f.label)))), React.createElement("div", {
    className: "exams"
  }, visible.map(ex => {
    const detailRoute = ex.code.startsWith('CELPIP') ? 'exam-celpip' : ex.code.startsWith('CFA') ? 'exam-cfa' : 'exam-lsat';
    return React.createElement("div", {
      key: ex.code,
      className: `exam ${ex.featured ? 'featured' : ''}`,
      role: "button",
      tabIndex: 0,
      "aria-label": `${ex.name} — book on ${ex.org}`,
      onClick: () => openReserve(ex),
      onKeyDown: e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openReserve(ex);
        }
      }
    }, React.createElement("div", {
      className: "code"
    }, ex.code), React.createElement("h4", {
      className: "serif"
    }, ex.name), React.createElement("div", {
      className: "org"
    }, ex.org), React.createElement("ul", null, React.createElement("li", null, "Fee ", React.createElement("span", null, ex.fee)), React.createElement("li", null, "Duration ", React.createElement("span", null, ex.duration)), React.createElement("li", null, "Availability ", React.createElement("span", null, ex.seats)), React.createElement("li", null, "Center ", React.createElement("span", null, ex.preferredCenter))), React.createElement("div", {
      className: "exam-actions"
    }, React.createElement("button", {
      className: "exam-detail-link",
      onClick: e => {
        e.stopPropagation();
        go(detailRoute);
      }
    }, "Exam guide \u2192"), React.createElement("div", {
      onClick: e => e.stopPropagation()
    }, React.createElement(PlanToggle, {
      code: ex.code,
      label: "Save"
    }))), React.createElement("div", {
      className: "reserve"
    }, "Book on ", ex.org, " ", React.createElement("span", {
      className: "arrow"
    })));
  })))), React.createElement("section", {
    className: "block",
    style: {
      background: 'var(--surface)'
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Official test centre for"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "An authorized delivery partner.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "We are proud to deliver on behalf of the world's most respected certification bodies \u2014 and for corporate and government clients.")), React.createElement("div", {
    className: "accred-grid"
  }, ACCRED.map((a, i) => React.createElement("div", {
    className: "accred pcard reveal",
    key: a.name,
    style: {
      transitionDelay: i % 3 * 70 + 'ms'
    }
  }, React.createElement("img", {
    className: "pcard-img",
    src: PHOTO(a.img, 700),
    alt: "",
    loading: "lazy",
    decoding: "async"
  }), React.createElement("div", {
    className: "pcard-scrim"
  }), React.createElement("div", {
    className: "pcard-body"
  }, React.createElement("div", {
    className: "accred-name"
  }, a.name), React.createElement("div", {
    className: "accred-kind"
  }, a.kind))))))), React.createElement("section", {
    className: "block popup-band"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "popup-grid"
  }, React.createElement("div", {
    className: "reveal"
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, "Rapid deployment capability"), React.createElement("h2", {
    className: "serif",
    style: {
      fontSize: 'clamp(34px,4vw,56px)',
      fontWeight: 420,
      letterSpacing: '-0.025em',
      lineHeight: 1.05,
      margin: '14px 0 18px'
    }
  }, "Large-scale pop-up testing \u2014 on short notice."), React.createElement("p", {
    style: {
      color: 'var(--text-dim)',
      fontSize: 17,
      lineHeight: 1.6,
      marginBottom: 24
    }
  }, "We have the infrastructure, staff, and expertise to set up large-capacity temporary testing facilities anywhere in North America \u2014 often within 48 to 72 hours. Whether you need 50 seats or 500, we deliver a fully equipped, professionally managed exam environment at your chosen location."), React.createElement("ul", {
    className: "popup-list"
  }, React.createElement("li", null, "Rapid deployment within 48\u201372 hours of confirmed booking"), React.createElement("li", null, "Scalable capacity from 50 to 500+ concurrent test-takers"), React.createElement("li", null, "Full proctor team, technical staff, and security personnel"), React.createElement("li", null, "Computer-based, paper-based, or hybrid testing formats"), React.createElement("li", null, "Ideal for government licensing, corporate & university exams"), React.createElement("li", null, "Nationwide coverage across Canada and the United States")), React.createElement("div", {
    style: {
      marginTop: 28
    }
  }, React.createElement("a", {
    className: "btn",
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, "Request a pop-up event ", React.createElement("span", {
    className: "arrow"
  })))), React.createElement("div", {
    className: "popup-stats reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, [['1560439514-4e9645039924', '48–72 hrs', 'Deployment time'], ['1594122230689-45899d9e6f69', '500+', 'Max seat capacity'], ['1451187580459-43490279c0fa', 'North America', 'Coverage area'], ['1552581234-26160f608093', 'Full service', 'Staff & tech included']].map(s => React.createElement("div", {
    className: "popup-stat pcard",
    key: s[1]
  }, React.createElement("img", {
    className: "pcard-img",
    src: PHOTO(s[0], 800),
    alt: "",
    loading: "lazy",
    decoding: "async"
  }), React.createElement("div", {
    className: "pcard-scrim"
  }), React.createElement("div", {
    className: "pcard-body"
  }, React.createElement("div", {
    className: "ps-n"
  }, s[1]), React.createElement("div", {
    className: "ps-l"
  }, s[2])))))))), React.createElement("section", {
    className: "block"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Our testing services"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Exam delivery, end to end.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "A complete suite of exam delivery and management services for organizations of every size.")), React.createElement("div", {
    className: "svc-grid"
  }, SERVICES.map((s, i) => React.createElement("div", {
    className: `svc reveal ${s.featured ? 'featured' : ''}`,
    key: s.t,
    style: {
      transitionDelay: i % 3 * 70 + 'ms'
    }
  }, s.featured && React.createElement("div", {
    className: "svc-badge"
  }, "Featured service"), React.createElement("h3", {
    className: "serif"
  }, s.t), React.createElement("p", null, s.d), React.createElement("ul", null, s.pts.map(p => React.createElement("li", {
    key: p
  }, p)))))))), React.createElement(AvailabilitySection, null), React.createElement(ExamDayChecklist, null), React.createElement("section", {
    className: "block",
    style: {
      background: 'var(--surface)'
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "section-head"
  }, React.createElement("div", null, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Facility specifications"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Purpose-built for professional delivery.")), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "Each Troy Testing location is engineered around the room and the people who run it.")), React.createElement("div", {
    className: "facility-grid"
  }, FACILITY.map((f, i) => React.createElement("div", {
    className: "facility pcard reveal",
    key: f.t,
    style: {
      transitionDelay: i % 3 * 70 + 'ms'
    }
  }, React.createElement("img", {
    className: "pcard-img",
    src: PHOTO(f.img, 700),
    alt: "",
    loading: "lazy",
    decoding: "async"
  }), React.createElement("div", {
    className: "pcard-scrim"
  }), React.createElement("div", {
    className: "pcard-body"
  }, React.createElement("h3", {
    className: "serif"
  }, f.t), React.createElement("p", null, f.d))))))), React.createElement("section", {
    className: "cta-band"
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow reveal"
  }, "Let's build your testing solution"), React.createElement("h2", {
    className: "serif reveal",
    style: {
      transitionDelay: '60ms'
    }
  }, "Permanent partner or a ", React.createElement("em", null, "one-time"), " event."), React.createElement("p", {
    className: "reveal",
    style: {
      transitionDelay: '120ms'
    }
  }, "Whether you need a permanent testing partner or a large-scale event, we have the expertise, infrastructure and team to make it happen."), React.createElement("div", {
    className: "actions reveal",
    style: {
      transitionDelay: '180ms'
    }
  }, React.createElement("a", {
    className: "btn",
    href: "#contact",
    onClick: e => {
      e.preventDefault();
      go('contact');
    }
  }, "Contact our team ", React.createElement("span", {
    className: "arrow"
  })), React.createElement("a", {
    className: "btn ghost",
    href: "tel:+14372640311"
  }, "Call +1 (437) 264-0311")))));
}
window.TestCenterPage = TestCenterPage;
const {
  useState: useStateC
} = React;
const FORM_ENDPOINT = (window.TROY_CONFIG || {}).FORM_ENDPOINT || '';
function ContactPage({
  go
}) {
  const [form, setForm] = useStateC({
    name: '',
    email: '',
    phone: '',
    interest: '',
    center: '',
    targetDate: '',
    level: '',
    message: '',
    company: ''
  });
  const [errors, setErrors] = useStateC({});
  const [submitted, setSubmitted] = useStateC(false);
  const [sent, setSent] = useStateC(false);
  const [status, setStatus] = useStateC('idle');
  const set = (k, v) => setForm(s => ({
    ...s,
    [k]: v
  }));
  const submit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please add your name';
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.email = 'Valid email required';
    if (!form.interest) errs.interest = 'Pick an interest';
    if (!form.message.trim() || form.message.length < 10) errs.message = 'A sentence or two please';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (form.company) {
      setSubmitted(true);
      return;
    }
    if (!FORM_ENDPOINT) {
      setSubmitted(true);
      return;
    }
    setStatus('submitting');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'company') fd.append(k, v);
      });
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: fd
      });
      if (res.ok) {
        setSent(true);
        setSubmitted(true);
      } else setStatus('error');
    } catch (_) {
      setStatus('error');
    }
  };
  if (submitted) {
    const mailBody = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || '—'}\nInterest: ${form.interest}\nPreferred centre: ${form.center || 'No preference'}\n\n${form.message}`);
    const mailHref = `mailto:Enquiry@troytesting.com?subject=${encodeURIComponent('Website enquiry — ' + form.interest)}&body=${mailBody}`;
    return React.createElement("main", {
      className: "page"
    }, React.createElement("section", {
      className: "block",
      style: {
        padding: '120px 0'
      }
    }, React.createElement("div", {
      className: "container",
      style: {
        maxWidth: 680,
        textAlign: 'center'
      }
    }, React.createElement("div", {
      className: "eyebrow",
      style: {
        color: 'var(--accent)'
      }
    }, "Message ready"), React.createElement("h1", {
      className: "serif",
      style: {
        fontFamily: 'var(--font-serif)',
        fontSize: 60,
        fontWeight: 420,
        letterSpacing: '-0.03em',
        lineHeight: 1.04,
        margin: '16px 0 20px'
      }
    }, "Thanks, ", React.createElement("em", {
      style: {
        fontStyle: 'normal',
        color: 'var(--accent)'
      }
    }, form.name.split(' ')[0]), ". ", sent ? 'Your message is on its way.' : 'One tap to send it to us.'), React.createElement("p", {
      style: {
        color: 'var(--text-dim)',
        fontSize: 17
      }
    }, sent ? React.createElement(React.Fragment, null, "We\u2019ve received your message and will reply soon. In a hurry? Call ", React.createElement("a", {
      href: "tel:+14372640311",
      style: {
        color: 'var(--accent)'
      }
    }, "+1 437 264 0311"), ".") : React.createElement(React.Fragment, null, "Press the button below to send your message to ", React.createElement("strong", null, "Enquiry@troytesting.com"), " from your email app. In a hurry? Call ", React.createElement("a", {
      href: "tel:+14372640311",
      style: {
        color: 'var(--accent)'
      }
    }, "+1 437 264 0311"), ".")), React.createElement("div", {
      style: {
        marginTop: 36,
        display: 'inline-flex',
        gap: 12,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }
    }, !sent && React.createElement("a", {
      className: "btn",
      href: mailHref
    }, "Send to Enquiry@troytesting.com ", React.createElement("span", {
      className: "arrow"
    })), React.createElement("a", {
      className: "btn ghost",
      href: "#home",
      onClick: e => {
        e.preventDefault();
        go('home');
      }
    }, "Back to home")))));
  }
  return React.createElement("main", {
    className: "page"
  }, React.createElement("section", {
    className: "hero",
    style: {
      paddingBottom: 48
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "eyebrow"
  }, "Contact"), React.createElement("h1", {
    className: "serif",
    style: {
      fontSize: 'clamp(46px, 6vw, 84px)',
      margin: '16px 0 20px',
      fontWeight: 420,
      lineHeight: 1.0,
      letterSpacing: '-0.03em',
      maxWidth: 1000
    }
  }, "A real person reads every ", React.createElement("em", {
    style: {
      fontStyle: 'normal',
      color: 'var(--accent)'
    }
  }, "message"), "."), React.createElement("p", {
    className: "lead",
    style: {
      maxWidth: 680
    }
  }, "Not sure which exam you need, or how the booking flow works? Tell us what you're preparing for \u2014 we'll reply with next steps, not a form email."))), React.createElement("section", {
    className: "block",
    style: {
      paddingTop: 48
    }
  }, React.createElement("div", {
    className: "container"
  }, React.createElement("div", {
    className: "grid-2"
  }, React.createElement("form", {
    className: "form",
    onSubmit: submit,
    noValidate: true
  }, React.createElement("div", {
    className: `field ${errors.name ? 'error' : ''}`
  }, React.createElement("label", null, "Full name"), React.createElement("input", {
    type: "text",
    "aria-label": "Full name",
    "aria-invalid": !!errors.name,
    value: form.name,
    onChange: e => set('name', e.target.value),
    placeholder: "Priya Ramaswamy"
  }), React.createElement("div", {
    className: "err",
    role: "alert"
  }, errors.name)), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20
    }
  }, React.createElement("div", {
    className: `field ${errors.email ? 'error' : ''}`
  }, React.createElement("label", null, "Email"), React.createElement("input", {
    type: "email",
    "aria-label": "Email",
    "aria-invalid": !!errors.email,
    value: form.email,
    onChange: e => set('email', e.target.value),
    placeholder: "you@example.com"
  }), React.createElement("div", {
    className: "err",
    role: "alert"
  }, errors.email)), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Phone (optional)"), React.createElement("input", {
    type: "tel",
    "aria-label": "Phone (optional)",
    value: form.phone,
    onChange: e => set('phone', e.target.value),
    placeholder: "+1 416 ..."
  }))), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20
    }
  }, React.createElement("div", {
    className: `field ${errors.interest ? 'error' : ''}`
  }, React.createElement("label", null, "I'm interested in"), React.createElement("select", {
    "aria-label": "I'm interested in",
    "aria-invalid": !!errors.interest,
    value: form.interest,
    onChange: e => set('interest', e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "\u2014 Select \u2014"), React.createElement("option", null, "CELPIP \xB7 help with Paragon booking"), React.createElement("option", null, "CELPIP \xB7 prep program"), React.createElement("option", null, "CFA \xB7 help with Prometric booking"), React.createElement("option", null, "CFA \xB7 prep program"), React.createElement("option", null, "LSAT \xB7 help with LSAC booking"), React.createElement("option", null, "LSAT \xB7 prep program"), React.createElement("option", null, "Pop-up / corporate testing"), React.createElement("option", null, "Something else")), React.createElement("div", {
    className: "err",
    role: "alert"
  }, errors.interest)), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Preferred center"), React.createElement("select", {
    "aria-label": "Preferred center",
    value: form.center,
    onChange: e => set('center', e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "No preference"), React.createElement("option", null, "Toronto \xB7 North York"), React.createElement("option", null, "Mississauga")))), React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 20
    }
  }, React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Target test date (optional)"), React.createElement("input", {
    type: "date",
    "aria-label": "Target test date (optional)",
    value: form.targetDate,
    onChange: e => set('targetDate', e.target.value)
  })), React.createElement("div", {
    className: "field"
  }, React.createElement("label", null, "Current level / band (optional)"), React.createElement("select", {
    "aria-label": "Current level / band (optional)",
    value: form.level,
    onChange: e => set('level', e.target.value)
  }, React.createElement("option", {
    value: ""
  }, "\u2014 Select \u2014"), React.createElement("option", null, "Just starting out"), React.createElement("option", null, "CELPIP band 5\u20136 / CFA new to finance"), React.createElement("option", null, "CELPIP band 7\u20138 / CFA some background"), React.createElement("option", null, "CELPIP band 9+ / finance professional")))), React.createElement("div", {
    className: `field ${errors.message ? 'error' : ''}`
  }, React.createElement("label", null, "Tell us a bit more"), React.createElement("textarea", {
    "aria-label": "Tell us a bit more",
    "aria-invalid": !!errors.message,
    value: form.message,
    onChange: e => set('message', e.target.value),
    placeholder: "e.g. I'm preparing for CELPIP in May and looking for next available test dates."
  }), React.createElement("div", {
    className: "err",
    role: "alert"
  }, errors.message)), React.createElement("input", {
    type: "text",
    name: "company",
    tabIndex: "-1",
    autoComplete: "off",
    "aria-hidden": "true",
    value: form.company,
    onChange: e => set('company', e.target.value),
    style: {
      position: 'absolute',
      left: '-9999px',
      width: 1,
      height: 1,
      opacity: 0
    }
  }), React.createElement("div", null, React.createElement("button", {
    type: "submit",
    className: "btn",
    disabled: status === 'submitting'
  }, status === 'submitting' ? 'Sending…' : React.createElement(React.Fragment, null, "Send message ", React.createElement("span", {
    className: "arrow"
  }))), status === 'error' && React.createElement("div", {
    className: "err",
    role: "alert",
    style: {
      display: 'block',
      marginTop: 12
    }
  }, "Something went wrong sending your message. Please try again, or email Enquiry@troytesting.com directly."))), React.createElement("aside", null, React.createElement("div", {
    className: "eyebrow"
  }, "Or reach us directly"), React.createElement("div", {
    style: {
      marginTop: 16,
      borderTop: '1px solid var(--rule-soft)'
    }
  }, [['Phone', '+1 437 264 0311', 'tel:+14372640311'], ['Email', 'Enquiry@troytesting.com', 'mailto:Enquiry@troytesting.com'], ['Hours', 'Mon–Sat · 9:00 – 19:00', null], ['Closed', 'Sundays & Ontario statutory holidays', null]].map(([k, v, href], i) => React.createElement("div", {
    key: i,
    style: {
      padding: '18px 0',
      borderBottom: '1px solid var(--rule-soft)',
      display: 'grid',
      gridTemplateColumns: '120px 1fr',
      alignItems: 'center',
      gap: 16
    }
  }, React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--muted)'
    }
  }, k), React.createElement("div", {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 22,
      letterSpacing: '-0.015em'
    }
  }, href ? React.createElement("a", {
    href: href,
    style: {
      transition: 'color .2s'
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--accent)',
    onMouseLeave: e => e.currentTarget.style.color = ''
  }, v) : v)))), React.createElement("div", {
    style: {
      marginTop: 36,
      padding: 24,
      background: 'var(--surface)',
      border: '1px solid var(--rule-soft)',
      borderRadius: 4
    }
  }, React.createElement("div", {
    className: "eyebrow",
    style: {
      color: 'var(--accent)'
    }
  }, "Tip"), React.createElement("p", {
    style: {
      fontFamily: 'var(--font-serif)',
      fontSize: 20,
      lineHeight: 1.35,
      letterSpacing: '-0.01em',
      margin: '8px 0 0'
    }
  }, "CELPIP bookings happen on Paragon; CFA on Prometric; LSAT on LSAC. Troy is your delivery location \u2014 not your booking agent."), React.createElement("a", {
    className: "link",
    href: "#test-center",
    onClick: e => {
      e.preventDefault();
      go('test-center');
    },
    style: {
      display: 'inline-flex',
      marginTop: 16,
      gap: 8,
      alignItems: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      letterSpacing: '0.16em',
      textTransform: 'uppercase',
      color: 'var(--accent)'
    }
  }, "Go to test center ", React.createElement("span", {
    className: "arrow",
    style: {
      width: 12,
      height: 8,
      display: 'inline-block',
      position: 'relative'
    }
  }))))))));
}
window.ContactPage = ContactPage;
const {
  useState: useStateA,
  useEffect: useEffectA
} = React;
const ROUTE_META = {
  'home': ['Troy Testing | The GTA’s Top-Rated CELPIP Test Centre · CFA · LSAC', 'One of Canada’s best test centre services — the GTA’s top-rated CELPIP centre on Google, and an official CFA & LSAT delivery site.'],
  'programs': ['Programs — Troy Testing', 'Exam prep and tutoring programs for CELPIP, CFA and LSAT at Troy Testing.'],
  'test-center': ['Exams — Troy Testing', 'Every CELPIP, CFA and LSAT exam Troy Testing hosts, with full exam guides and provider booking links.'],
  'availability': ['Availability — Troy Testing', 'Upcoming CELPIP, CFA and LSAT sessions across Troy Testing centres, filterable by exam and centre.'],
  'reviews': ['Reviews — Troy Testing', 'What candidates say about Troy Testing — the GTA’s top-rated CELPIP centre on Google.'],
  'centres': ['Centres — Troy Testing', 'Troy Testing exam-delivery centres, with directions and what each location hosts.'],
  'faq': ['FAQ — Troy Testing', 'ID rules, exam-day logistics and how booking works at Troy Testing.'],
  'guides': ['Exam Guides — Troy Testing', 'Plain-English guides to CELPIP, CFA and LSAT — formats, scoring and what to expect on the day.'],
  'corporate': ['Corporate & Pop-up Testing — Troy Testing', 'Large-scale and pop-up exam delivery for organizations.'],
  'contact': ['Contact — Troy Testing', 'Talk to the Troy Testing team about exams, prep and booking — a real person reads every message.'],
  'exam-celpip': ['CELPIP at Troy Testing', 'Sit CELPIP General or CELPIP-LS at Troy Testing — official Paragon delivery, exam guide and booking.'],
  'exam-cfa': ['CFA at Troy Testing', 'Sit CFA Levels I–III at Troy Testing’s Prometric-authorized Mississauga centre.'],
  'exam-lsat': ['LSAT at Troy Testing', 'Sit the LSAT at Troy Testing — official LSAC delivery, exam guide and booking.']
};
function App() {
  const [route, setRoute] = useStateA(() => {
    let saved = null;
    try {
      saved = localStorage.getItem('troy.route');
    } catch (_) {}
    const hash = window.location.hash.replace('#', '');
    return hash || saved || 'home';
  });
  const [reserve, setReserve] = useStateA(null);
  const [wizardOpen, setWizardOpen] = useStateA(false);
  const [quizOpen, setQuizOpen] = useStateA(false);
  const [lang, setLang] = useStateA(() => {
    try {
      return localStorage.getItem('troy.lang') || 'en';
    } catch (_) {
      return 'en';
    }
  });
  const go = r => {
    setRoute(r);
    try {
      localStorage.setItem('troy.route', r);
    } catch (_) {}
    if (window.__pageTransition) window.__pageTransition();
    window.history.pushState(null, '', '#' + r);
    window.scrollTo({
      top: 0,
      behavior: 'instant'
    });
  };
  const setLangP = l => {
    setLang(l);
    try {
      localStorage.setItem('troy.lang', l);
    } catch (_) {}
  };
  useEffectA(() => {
    const onKey = e => {
      if (e.key === 'Escape') {
        setReserve(null);
        setWizardOpen(false);
        setQuizOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffectA(() => {
    const onNav = () => {
      const h = window.location.hash.replace('#', '');
      if (h) setRoute(h);
    };
    window.addEventListener('hashchange', onNav);
    window.addEventListener('popstate', onNav);
    return () => {
      window.removeEventListener('hashchange', onNav);
      window.removeEventListener('popstate', onNav);
    };
  }, []);
  useEffectA(() => {
    const m = ROUTE_META[route] || ROUTE_META.home;
    document.title = m[0];
    const d = document.querySelector('meta[name="description"]');
    if (d) d.setAttribute('content', m[1]);
  }, [route]);
  useReveal();
  const examMap = {
    'exam-celpip': 'celpip',
    'exam-cfa': 'cfa',
    'exam-lsat': 'lsat'
  };
  const Page = {
    'home': HomePage,
    'programs': ProgramsPage,
    'test-center': TestCenterPage,
    'availability': AvailabilityPage,
    'reviews': ReviewsPage,
    'centres': CentresPage,
    'faq': FAQPage,
    'guides': GuidesPage,
    'corporate': CorporatePage,
    'contact': ContactPage
  }[route] || (examMap[route] ? null : HomePage);
  const openWizard = () => setWizardOpen(true);
  const openQuiz = () => setQuizOpen(true);
  return React.createElement(React.Fragment, null, React.createElement("a", {
    className: "skip-link",
    href: "#main"
  }, "Skip to content"), React.createElement(Header, {
    route: route,
    go: go,
    lang: lang,
    setLang: setLangP,
    openWizard: openWizard
  }), React.createElement("main", {
    id: "main",
    "data-screen-label": route
  }, examMap[route] ? React.createElement(ExamDetailPage, {
    fam: examMap[route],
    go: go,
    openReserve: setReserve
  }) : React.createElement(Page, {
    go: go,
    openReserve: setReserve,
    openWizard: openWizard,
    openQuiz: openQuiz,
    lang: lang
  })), React.createElement(Footer, {
    go: go
  }), reserve && React.createElement(ReserveModal, {
    exam: reserve,
    close: () => setReserve(null)
  }), React.createElement(ExamWizard, {
    open: wizardOpen,
    close: () => setWizardOpen(false)
  }), React.createElement(DiagnosticQuiz, {
    open: quizOpen,
    close: () => setQuizOpen(false),
    go: go
  }), React.createElement(CallFab, null), React.createElement(PlanBar, null));
}
(function mountTroy() {
  const el = document.getElementById('root');
  if (!el) return;
  if (!window.__troyRoot) window.__troyRoot = ReactDOM.createRoot(el);
  window.__troyRoot.render(React.createElement(App, null));
})();