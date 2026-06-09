// Programs page
const PROGRAMS_TX = {
  en: {
    eyebrow: 'Programs',
    h1: 'Tutoring, test prep, and career credentials —', h1em: ' taught by people who still sit the exams.',
    lead: 'Our instructors are current or recent top-percentile scorers on the exams they teach. Everything below is bookable as private, semi-private, or small-group.',
    request: 'Request a diagnostic',
    ctaEyebrow: 'Not sure which program fits?', ctaH: 'Book a 20-min', ctaEm: 'diagnostic', ctaH2: '.',
    ctaSub: "We'll map your current score to a realistic target date and recommend a path — or tell you you don't need us yet.",
    ctaBtn: 'Book diagnostic',
    programs: [
      { num: '01', tag: 'Academic tutoring', title: 'Foundations that hold under pressure.',
        desc: 'One-on-one and 4:1 group tutoring across math, physics, chemistry, biology, English and French — from grade 6 through first-year university. Every program starts with a diagnostic and ends with a proctored mock.',
        features: ['Grade 6 – Univ. Year 1', 'Diagnostic-first model', 'Weekly proctored checkpoints', 'Parent progress reports', 'In-person + hybrid options', 'Ontario curriculum aligned'], photoClass: 'prog-academic' },
      { num: '02', tag: 'Test preparation', title: 'Built for the exams we actually host.',
        desc: "Prep blocks for CELPIP and CFA (I, II, III). Taught by instructors who have sat and scored top percentiles on the exams they teach. Full-length timed practice on the same machines you'll use on test day.",
        features: ['CELPIP · 8-week band lift', 'CFA · 300-hour protocol', 'Speaking & writing labs', 'Mock-exam schedule', 'Score-tracked scorebands', 'Test-day walkthrough'], photoClass: 'prog-testprep' },
      { num: '03', tag: 'Professional skills', title: 'Credentials that move you up the ladder.',
        desc: 'CFA post-exam bridging, and business communication for newcomers entering the Canadian workforce. Evening and weekend cohorts — designed around a full-time job.',
        features: ['CFA post-exam bridging', 'Business communication', 'Interview labs', 'Evening cohorts', 'Weekend intensives', 'Newcomer pathways'], photoClass: 'prog-professional' },
    ],
  },
  fr: {
    eyebrow: 'Programmes',
    h1: 'Tutorat, préparation aux examens et titres professionnels —', h1em: ' enseignés par des gens qui passent encore les examens.',
    lead: "Nos instructeurs figurent parmi les meilleurs centiles, actuels ou récents, aux examens qu'ils enseignent. Tout ci-dessous est offert en privé, semi-privé ou en petit groupe.",
    request: 'Demander un diagnostic',
    ctaEyebrow: 'Vous hésitez sur le programme?', ctaH: 'Réservez un', ctaEm: 'diagnostic', ctaH2: ' de 20 min.',
    ctaSub: "Nous relierons votre score actuel à une date cible réaliste et recommanderons un parcours — ou vous dirons que vous n'avez pas encore besoin de nous.",
    ctaBtn: 'Réserver un diagnostic',
    programs: [
      { num: '01', tag: 'Tutorat scolaire', title: 'Des bases solides, même sous pression.',
        desc: "Tutorat individuel ou en petit groupe (4:1) en mathématiques, physique, chimie, biologie, anglais et français — de la 6e année à la première année universitaire. Chaque programme commence par un diagnostic et se termine par un examen blanc surveillé.",
        features: ['6e année – 1re année univ.', 'Diagnostic en premier', 'Points de contrôle hebdomadaires surveillés', 'Rapports de progrès aux parents', 'En personne + hybride', "Aligné au programme de l'Ontario"], photoClass: 'prog-academic' },
      { num: '02', tag: 'Préparation aux examens', title: 'Conçue pour les examens que nous accueillons.',
        desc: "Blocs de préparation pour le CELPIP et le CFA (I, II, III). Enseignés par des instructeurs ayant obtenu les meilleurs centiles aux examens qu'ils enseignent. Examens pratiques chronométrés complets sur les mêmes postes qu'au jour J.",
        features: ['CELPIP · gain de niveau en 8 semaines', 'CFA · protocole de 300 heures', "Ateliers d'expression orale et écrite", "Calendrier d'examens blancs", 'Suivi des scores par niveau', 'Visite guidée du jour J'], photoClass: 'prog-testprep' },
      { num: '03', tag: 'Compétences professionnelles', title: 'Des titres qui vous font gravir les échelons.',
        desc: "Passerelle post-examen du CFA et communication d'affaires pour les nouveaux arrivants sur le marché du travail canadien. Cohortes en soirée et la fin de semaine — pensées autour d'un emploi à temps plein.",
        features: ['Passerelle post-examen CFA', "Communication d'affaires", "Ateliers d'entrevue", 'Cohortes en soirée', 'Intensifs de fin de semaine', 'Parcours nouveaux arrivants'], photoClass: 'prog-professional' },
    ],
  },
};
function ProgramsPage({ go, lang = 'en' }) {
  const C = PROGRAMS_TX[lang] || PROGRAMS_TX.en;
  return (
    <main className="page">
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="container">
          <div className="eyebrow">{C.eyebrow}</div>
          <h1 className="serif" style={{ fontSize: 'clamp(46px, 6vw, 84px)', margin: '16px 0 20px', fontWeight: 420, lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: 1000 }}>
            {C.h1}
            <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{C.h1em}</em>
          </h1>
          <p className="lead" style={{ maxWidth: 680 }}>{C.lead}</p>
        </div>
      </section>

      <section className="block">
        <div className="container">
          {C.programs.map(p => (
            <div className="program-deep" key={p.num}>
              <div>
                <div className="num-big serif">{p.num}</div>
                <div className="eyebrow" style={{ marginTop: 8 }}>{p.tag}</div>
                <h3 className="serif">{p.title}</h3>
                <p>{p.desc}</p>
                <ul className="features">
                  {p.features.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
                <div style={{ marginTop: 32 }}>
                  <a className="btn ghost" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>
                    {C.request} <span className="arrow" />
                  </a>
                </div>
              </div>
              <div className="visual">
                <div className={`ph ${p.photoClass}`} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <div className="eyebrow">{C.ctaEyebrow}</div>
          <h2 className="serif">{C.ctaH} <em>{C.ctaEm}</em>{C.ctaH2}</h2>
          <p>{C.ctaSub}</p>
          <div className="actions">
            <a className="btn" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>
              {C.ctaBtn} <span className="arrow" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

window.ProgramsPage = ProgramsPage;
