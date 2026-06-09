// Test Center page
const { useState: useStateT } = React;

const TC_TX = {
  en: {
    fAll: 'All exams',
    heroEyebrow: 'Test centre', heroH1a: 'Book with the provider.', heroEm: 'Sit', heroH1b: ' the exam with us.',
    heroLead: 'Troy Testing is an authorized delivery site for Paragon (CELPIP) and CFA Institute via Prometric. Pick your exam below — each card links to the official booking portal, where you select us as your delivery location.',
    findMy: 'Find my exam', ask: 'Ask a question', roomTag: 'Room capacity · 24 seats',
    examsEyebrow: 'Exams we host', examsH2: 'Two exams, two rooms, one clear path.',
    lFee: 'Fee', lDuration: 'Duration', lAvail: 'Availability', lCenter: 'Center', bookOn: 'Book on', registerWith: 'Register with',
    facEyebrow: 'Facilities', facH2a: 'A', facEm: ' well-run', facH2b: " room, a team who's been doing this for years.",
    facLead: 'Two things matter on test day: the room and the people running it. We sweat both.',
    fac1Title: 'A well-facilitated testing room',
    fac1Desc: "Quiet, purpose-built workstations with reliable equipment, proper lighting, and sound separation between speaking and non-speaking candidates. Every seat is set up to the provider's specification before you walk in.",
    fac2Title: 'Professional, friendly test administrators',
    fac2Desc: "Certified proctors trained to Paragon and Prometric standards — the same people, shift after shift. They're calm, clear with instructions, and happy to answer questions before you start.",
    ctaEyebrow: 'Still deciding?', ctaH2a: "We'll walk you", ctaEm: 'through', ctaH2b: " the provider's booking.",
    ctaSub: "Many candidates are booking one of these exams for the first time. Call or message — we'll guide you through the provider portal in 10 minutes.",
    ctaCall: 'Call +1 437 264 0311', ctaMsg: 'Message us',
  },
  fr: {
    fAll: 'Tous les examens',
    heroEyebrow: "Centre d'examen", heroH1a: 'Réservez auprès du fournisseur.', heroEm: 'Passez', heroH1b: " l'examen chez nous.",
    heroLead: "Troy Testing est un site de livraison agréé pour Paragon (CELPIP) et le CFA Institute via Prometric. Choisissez votre examen ci-dessous — chaque carte mène au portail officiel, où vous nous sélectionnez comme lieu de livraison.",
    findMy: 'Trouver mon examen', ask: 'Posez une question', roomTag: 'Capacité · 24 places',
    examsEyebrow: 'Examens accueillis', examsH2: 'Deux examens, deux salles, un parcours clair.',
    lFee: 'Frais', lDuration: 'Durée', lAvail: 'Disponibilité', lCenter: 'Centre', bookOn: 'Réserver sur', registerWith: "S'inscrire auprès de",
    facEyebrow: 'Installations', facH2a: 'Une salle', facEm: ' bien gérée', facH2b: ', une équipe aguerrie depuis des années.',
    facLead: 'Deux choses comptent le jour J : la salle et les gens qui la gèrent. Nous soignons les deux.',
    fac1Title: "Une salle d'examen bien équipée",
    fac1Desc: "Des postes calmes et dédiés, un équipement fiable, un bon éclairage et une séparation sonore entre les candidats à l'oral et les autres. Chaque place est configurée selon les spécifications du fournisseur avant votre arrivée.",
    fac2Title: 'Des surveillants professionnels et accueillants',
    fac2Desc: "Des surveillants certifiés, formés aux normes de Paragon et de Prometric — les mêmes personnes, quart après quart. Calmes, clairs dans leurs consignes et heureux de répondre à vos questions avant le début.",
    ctaEyebrow: 'Encore en train de décider?', ctaH2a: 'Nous vous guidons', ctaEm: ' pas à pas', ctaH2b: ' dans la réservation du fournisseur.',
    ctaSub: "Beaucoup réservent l'un de ces examens pour la première fois. Appelez ou écrivez — nous vous guidons dans le portail du fournisseur en 10 minutes.",
    ctaCall: 'Appelez le +1 437 264 0311', ctaMsg: 'Écrivez-nous',
  },
};

function TestCenterPage({ go, openReserve, openWizard, openQuiz, lang = 'en' }) {
  const [filter, setFilter] = useStateT('all');
  const C = TC_TX[lang] || TC_TX.en;
  const filters = [
    { id: 'all', label: C.fAll },
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
            <div className="eyebrow reveal">{C.heroEyebrow}</div>
            <h1 className="serif reveal" style={{ fontSize: 'clamp(46px, 6vw, 84px)', margin: '16px 0 20px', fontWeight: 420, lineHeight: 1.0, letterSpacing: '-0.03em', transitionDelay: '60ms' }}>
              {C.heroH1a} <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{C.heroEm}</em>{C.heroH1b}
            </h1>
            <p className="lead reveal" style={{ transitionDelay: '120ms' }}>
              {C.heroLead}
            </p>
            <div className="hero-actions reveal" style={{ transitionDelay: '180ms' }}>
              <button className="btn" onClick={() => (openWizard ? openWizard() : go('home'))}>
                {C.findMy} <span className="arrow" />
              </button>
              <a className="btn ghost" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>
                {C.ask}
              </a>
            </div>
          </div>
          <div className="hero-visual reveal" style={{ transitionDelay: '120ms' }}>
            <div className="ph testcenter-photo" />
            <div className="tag">{C.roomTag}</div>
          </div>
        </div>
        <div className="container">
          <div className="hero-partner reveal" style={{ transitionDelay: '240ms' }}>
            <PartnerBar lang={lang} />
          </div>
        </div>
      </section>

      <section className="block">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow reveal">{C.examsEyebrow}</div>
              <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>{C.examsH2}</h2>
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
                  <li>{C.lFee} <span>{ex.fee}</span></li>
                  <li>{C.lDuration} <span>{ex.duration}</span></li>
                  <li>{C.lAvail} <span>{ex.seats}</span></li>
                  <li>{C.lCenter} <span>{ex.preferredCenter}</span></li>
                </ul>
                <div className="reserve">{ex.flow === 'cfa' ? C.registerWith : C.bookOn} {ex.org} <span className="arrow" /></div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AVAILABILITY */}
      <AvailabilitySection lang={lang} />

      {/* EXAM-DAY CHECKLIST */}
      <ExamDayChecklist lang={lang} />

      {/* Facilities */}
      <section className="block" style={{ background: 'var(--surface)' }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">{C.facEyebrow}</div>
              <h2 className="serif">{C.facH2a}<em>{C.facEm}</em>{C.facH2b}</h2>
            </div>
            <p>{C.facLead}</p>
          </div>
          <div className="programs" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="program">
              <div className="num">01</div>
              <h3 className="serif">{C.fac1Title}</h3>
              <p>{C.fac1Desc}</p>
            </div>
            <div className="program">
              <div className="num">02</div>
              <h3 className="serif">{C.fac2Title}</h3>
              <p>{C.fac2Desc}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div className="eyebrow">{C.ctaEyebrow}</div>
          <h2 className="serif">{C.ctaH2a} <em>{C.ctaEm}</em>{C.ctaH2b}</h2>
          <p>{C.ctaSub}</p>
          <div className="actions">
            <a className="btn" href="tel:+14372640311">
              {C.ctaCall} <span className="arrow" />
            </a>
            <a className="btn ghost" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>
              {C.ctaMsg}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

window.TestCenterPage = TestCenterPage;
