// Programs page
function ProgramsPage({ go }) {
  const programs = [
    {
      num: '01',
      tag: 'Academic tutoring',
      title: 'Foundations that hold under pressure.',
      desc: 'One-on-one and 4:1 group tutoring across math, physics, chemistry, biology, English and French — from grade 6 through first-year university. Every program starts with a diagnostic and ends with a proctored mock.',
      features: ['Grade 6 – Univ. Year 1', 'Diagnostic-first model', 'Weekly proctored checkpoints', 'Parent progress reports', 'In-person + hybrid options', 'Ontario curriculum aligned'],
      photoClass: 'prog-academic'
    },
    {
      num: '02',
      tag: 'Test preparation',
      title: 'Built for the exams we actually host.',
      desc: 'Prep blocks for CELPIP and CFA (I, II, III). Taught by instructors who have sat and scored top percentiles on the exams they teach. Full-length timed practice on the same machines you\'ll use on test day.',
      features: ['CELPIP · 8-week band lift', 'CFA · 300-hour protocol', 'Speaking & writing labs', 'Mock-exam schedule', 'Score-tracked scorebands', 'Test-day walkthrough'],
      photoClass: 'prog-testprep'
    },
    {
      num: '03',
      tag: 'Professional skills',
      title: 'Credentials that move you up the ladder.',
      desc: 'CFA post-exam bridging, and business communication for newcomers entering the Canadian workforce. Evening and weekend cohorts — designed around a full-time job.',
      features: ['CFA post-exam bridging', 'Business communication', 'Interview labs', 'Evening cohorts', 'Weekend intensives', 'Newcomer pathways'],
      photoClass: 'prog-professional'
    },
  ];

  return (
    <main className="page">
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="container">
          <div className="eyebrow">Programs</div>
          <h1 className="serif" style={{ fontSize: 'clamp(46px, 6vw, 84px)', margin: '16px 0 20px', fontWeight: 420, lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: 1000 }}>
            Tutoring, test prep, and career credentials —
            <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}> taught by people who still sit the exams.</em>
          </h1>
          <p className="lead" style={{ maxWidth: 680 }}>
            Our instructors are current or recent top-percentile scorers on the exams they teach.
            Everything below is bookable as private, semi-private, or small-group.
          </p>
        </div>
      </section>

      <section className="block">
        <div className="container">
          {programs.map(p => (
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
                    Request a diagnostic <span className="arrow" />
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
          <div className="eyebrow">Not sure which program fits?</div>
          <h2 className="serif">Book a 20-min <em>diagnostic</em>.</h2>
          <p>We'll map your current score to a realistic target date and recommend a path — or tell you you don't need us yet.</p>
          <div className="actions">
            <a className="btn" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>
              Book diagnostic <span className="arrow" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

window.ProgramsPage = ProgramsPage;
