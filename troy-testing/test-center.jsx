// Test Center page
const { useState: useStateT } = React;

function TestCenterPage({ go, openReserve, openWizard, openQuiz }) {
  const [filter, setFilter] = useStateT('all');
  const filters = [
    { id: 'all', label: 'All exams' },
    { id: 'lang', label: 'CELPIP' },
    { id: 'finance', label: 'CFA' },
  ];
  const tagOf = (code) => {
    if (code.startsWith('CELPIP')) return 'lang';
    if (code.startsWith('CFA')) return 'finance';
    return 'other';
  };
  const visible = filter === 'all' ? EXAMS : EXAMS.filter(e => tagOf(e.code) === filter);

  return (
    <main className="page">
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="container hero-grid">
          <div>
            <div className="eyebrow reveal">Test centre</div>
            <h1 className="serif reveal" style={{ fontSize: 'clamp(46px, 6vw, 84px)', margin: '16px 0 20px', fontWeight: 420, lineHeight: 1.0, letterSpacing: '-0.03em', transitionDelay: '60ms' }}>
              Book with the provider. <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>Sit</em> the exam with us.
            </h1>
            <p className="lead reveal" style={{ transitionDelay: '120ms' }}>
              Troy Testing is an authorized delivery site for Paragon (CELPIP) and CFA Institute via Prometric. Pick your exam below — each card links to the official booking portal, where you select us as your delivery location.
            </p>
            <div className="hero-actions reveal" style={{ transitionDelay: '180ms' }}>
              <button className="btn" onClick={() => (openWizard ? openWizard() : go('home'))}>
                Find my exam <span className="arrow" />
              </button>
              <a className="btn ghost" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>
                Ask a question
              </a>
            </div>
          </div>
          <div className="hero-visual reveal" style={{ transitionDelay: '120ms' }}>
            <div className="ph testcenter-photo" />
            <div className="tag">Room capacity · 24 seats</div>
          </div>
        </div>
        <div className="container">
          <div className="hero-partner reveal" style={{ transitionDelay: '240ms' }}>
            <PartnerBar />
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow reveal">Exams we host</div>
              <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>Two exams, two rooms, one clear path.</h2>
            </div>
            <div className="chips" role="group" aria-label="Filter exams" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifySelf: 'end', alignItems: 'center' }}>
              {filters.map(f => (
                <button key={f.id} type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  style={{
                    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em',
                    textTransform: 'uppercase', padding: '8px 14px', borderRadius: 999,
                    background: filter === f.id ? 'var(--accent)' : 'transparent',
                    color: filter === f.id ? 'var(--accent-ink)' : 'var(--text-dim)',
                    border: '1px solid ' + (filter === f.id ? 'var(--accent)' : 'var(--rule)'),
                    cursor: 'pointer', transition: 'all .2s',
                  }}>{f.label}</button>
              ))}
            </div>
          </div>
          <div className="exams">
            {visible.map(ex => (
              <button type="button" key={ex.code} className={`exam ${ex.featured ? 'featured' : ''}`}
                aria-label={`${ex.name} — ${ex.flow === 'cfa' ? 'register with' : 'book on'} ${ex.org}`}
                onClick={() => openReserve(ex)}>
                <div className="code">{ex.code}</div>
                <h4 className="serif">{ex.name}</h4>
                <div className="org">{ex.org}</div>
                <ul>
                  <li>Fee <span>{ex.fee}</span></li>
                  <li>Duration <span>{ex.duration}</span></li>
                  <li>Availability <span>{ex.seats}</span></li>
                  <li>Center <span>{ex.preferredCenter}</span></li>
                </ul>
                <div className="reserve">{ex.flow === 'cfa' ? 'Register with' : 'Book on'} {ex.org} <span className="arrow" /></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AVAILABILITY */}
      <AvailabilitySection />

      {/* EXAM-DAY CHECKLIST */}
      <ExamDayChecklist />

      {/* Facilities */}
      <section className="block" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Facilities</div>
              <h2 className="serif">A <em>well-run</em> room, a team who's been doing this for years.</h2>
            </div>
            <p>Two things matter on test day: the room and the people running it. We sweat both.</p>
          </div>
          <div className="programs" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="program">
              <div className="num">01</div>
              <h3 className="serif">A well-facilitated testing room</h3>
              <p>Quiet, purpose-built workstations with reliable equipment, proper lighting, and sound separation between speaking and non-speaking candidates. Every seat is set up to the provider's specification before you walk in.</p>
            </div>
            <div className="program">
              <div className="num">02</div>
              <h3 className="serif">Professional, friendly test administrators</h3>
              <p>Certified proctors trained to Paragon and Prometric standards — the same people, shift after shift. They're calm, clear with instructions, and happy to answer questions before you start.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div className="eyebrow">Still deciding?</div>
          <h2 className="serif">We'll walk you <em>through</em> the provider's booking.</h2>
          <p>Many candidates are booking one of these exams for the first time. Call or message — we'll guide you through the provider portal in 10 minutes.</p>
          <div className="actions">
            <a className="btn" href="tel:+14372640311">
              Call +1 437 264 0311 <span className="arrow" />
            </a>
            <a className="btn ghost" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>
              Message us
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

window.TestCenterPage = TestCenterPage;
