// Home page — hero + overview that routes to each section page
function HomePage({ go, openReserve, openWizard, openQuiz, lang }) {
  const navKey = { programs: 'nav.programs', 'test-center': 'nav.testcenter', availability: 'nav.availability', reviews: 'nav.reviews', centres: 'nav.centres', faq: 'nav.faq' };
  const cards = ['programs', 'test-center', 'availability', 'reviews', 'centres', 'faq'];
  return (
    <main className="page">

      {/* HERO — dynamic */}
      <section className="hero-v2">
        <div className="hero-bg" />
        <div className="hero-glow" />
        <div className="container">
          <div className="hero-v2-grid">
            <div>
              <div className="eyebrow-row reveal">
                <span className="tagdot">✓</span>
                <span className="eyebrow" style={{ color: 'var(--text-dim)' }}>{t(lang, 'hero.eyebrow')}</span>
              </div>
              <h1 className="reveal" style={{ transitionDelay: '60ms' }}>
                {t(lang, 'hero.h1a')} <Swap words={['CELPIP', 'CFA']} /> {t(lang, 'hero.h1b')}
              </h1>
              <p className="lead reveal" style={{ transitionDelay: '120ms' }}>
                {t(lang, 'hero.sub')}
              </p>
              <div className="hero-actions reveal" style={{ transitionDelay: '180ms' }}>
                <button className="btn" onClick={() => openWizard()}>
                  {t(lang, 'cta.find')} <span className="arrow" />
                </button>
                <a className="btn ghost" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>
                  {t(lang, 'cta.talk')}
                </a>
              </div>
              {/* Express shortcuts for decided candidates — straight to the provider hand-off */}
              <div className="hero-chips reveal" style={{ transitionDelay: '200ms' }}>
                <button className="chip-link" onClick={() => openReserve(EXAMS.find(e => e.code === 'CELPIP-G'))}>
                  {t(lang, 'cta.bookCelpip')} <span className="arrow" />
                </button>
                <button className="chip-link" onClick={() => openReserve(EXAMS.find(e => e.code === 'CFA-I'))}>
                  {t(lang, 'cta.bookCfa')} <span className="arrow" />
                </button>
              </div>
              <div className="hero-trust reveal" style={{ transitionDelay: '210ms' }}>
                <GoogleBadge />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>{t(lang, 'hero.trust')}</span>
              </div>
              {/* Defensible trust signals (no unverifiable ops figures). Since 2014 per the footer. */}
              <div className="hero-meta reveal" style={{ transitionDelay: '240ms' }}>
                <div className="stat">
                  <div className="n"><Counter to={10} suffix="+" /></div>
                  <div className="l">{t(lang, 'm.years')}</div>
                </div>
                <div className="stat">
                  <div className="n"><Counter to={2} /></div>
                  <div className="l">{t(lang, 'm.centres')}</div>
                </div>
                <div className="stat">
                  <div className="n"><Counter to={2} /></div>
                  <div className="l">{t(lang, 'm.providers')}</div>
                </div>
              </div>
            </div>
            <div className="reveal" style={{ transitionDelay: '140ms' }}>
              <ExamBoard />
              <button className="board-cta" onClick={() => go('availability')}>
                {t(lang, 'cta.seeAvail')} <span className="arrow" />
              </button>
            </div>
          </div>
          <div className="hero-partner reveal" style={{ transitionDelay: '300ms' }}>
            <PartnerBar />
          </div>
        </div>
      </section>

      {/* OVERVIEW — route to each page */}
      <section className="block" id="overview">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow reveal">{t(lang, 'home.ov.eyebrow')}</div>
              <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>{t(lang, 'home.ov.title')}</h2>
            </div>
            <p className="reveal" style={{ transitionDelay: '120ms' }}>{t(lang, 'home.ov.sub')}</p>
          </div>
          <div className="overview-grid">
            {cards.map((id, i) => {
              const label = t(lang, navKey[id]);
              return (
                <button className="overview-card reveal" key={id} style={{ transitionDelay: (i % 3) * 80 + 'ms' }}
                  onClick={() => go(id)}>
                  <div className="ov-k serif">{label}</div>
                  <div className="ov-d">{t(lang, 'home.card.' + id)}</div>
                  <span className="link">{t(lang, 'home.ov.open')} {label} <span className="arrow" /></span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="container">
          <div className="eyebrow reveal">{t(lang, 'home.cta.eyebrow')}</div>
          <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>{t(lang, 'home.cta.a')} <em>{t(lang, 'home.cta.em')}</em> {t(lang, 'home.cta.b')}</h2>
          <p className="reveal" style={{ transitionDelay: '120ms' }}>{t(lang, 'home.cta.sub')}</p>
          <div className="actions reveal" style={{ transitionDelay: '180ms' }}>
            <button className="btn" onClick={() => openWizard()}>
              {t(lang, 'cta.find')} <span className="arrow" />
            </button>
            <button className="btn ghost" onClick={() => openQuiz()}>
              {t(lang, 'cta.estimate')}
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}

window.HomePage = HomePage;
