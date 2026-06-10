// Troy Testing — section pages (split out from the old long home)
const { useState: useP, useEffect: usePE } = React;

function PageHero({ eyebrow, title, sub }) {
  return (
    <section className="hero" style={{ paddingBottom: 36 }}>
      <div className="container">
        <div className="eyebrow reveal">{eyebrow}</div>
        <h1 className="serif reveal" style={{ fontSize: 'clamp(44px, 5.6vw, 80px)', margin: '16px 0 18px', fontWeight: 420, lineHeight: 1.02, letterSpacing: '-0.03em', maxWidth: 1000, transitionDelay: '60ms' }}>
          {title}
        </h1>
        {sub && <p className="lead reveal" style={{ maxWidth: 680, transitionDelay: '120ms' }}>{sub}</p>}
      </div>
    </section>
  );
}

/* ── Availability page ── */
function AvailabilityPage({ go, openWizard, lang = 'en' }) {
  const fr = lang === 'fr';
  return (
    <main className="page">
      <PageHero
        eyebrow={fr ? 'Quand les examens ont lieu' : 'When exams run'}
        title={fr ? <>Quand chaque examen <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>a lieu</em>.</> : <>When each exam <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>runs</em>.</>}
        sub={fr ? "Cadence représentative des séances CELPIP et CFA aux deux centres, plus la prochaine fenêtre d'examen du CFA. Ce ne sont pas des places en temps réel — confirmez et réservez sur le portail du fournisseur." : "Representative session cadence for CELPIP and CFA across both centres, plus the next CFA exam window. These are not live seat counts — confirm and book on the provider's portal."} />
      <AvailabilitySection lang={lang} />
      <section className="block" style={{ paddingTop: 0, borderBottom: 'none' }}>
        <div className="container"><Countdown lang={lang} /></div>
      </section>
      <section className="block"><div className="container"><SeatAlert lang={lang} /></div></section>
      <section className="cta-band">
        <div className="container">
          <div className="eyebrow reveal">{fr ? 'Vous ne savez pas quoi réserver?' : 'Not sure which to book?'}</div>
          <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>{fr ? 'Laissez-nous vous orienter vers la bonne place.' : 'Let us point you to the right seat.'}</h2>
          <div className="actions reveal" style={{ transitionDelay: '120ms' }}>
            <button className="btn" onClick={() => openWizard()}>{fr ? 'Trouver mon examen' : 'Find my exam'} <span className="arrow" /></button>
            <a className="btn ghost" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>{fr ? 'Parlez à notre équipe' : 'Talk to our team'}</a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── Reviews page ── */
const REVIEWS = [
  { name: 'Nandu UK', role: 'Google Maps', text: 'The centre was really quiet and comfortable. There was no disturbance from any of others not even from the staff to lower the sound while speaking test like some other sites, which was one of my previous experience from another centre.' },
  { name: 'Mark Francis Lugtu', role: 'Google Maps', text: 'I took my CELPIP exam at this testing center. It has a great location, very accessibe. Inside, it looks neat and well-arranged. The staff was nice and helpful. I highly recommend this testing center.' },
  { name: 'Roberto Gómez', role: 'Local Guide · Google Maps', text: 'Nice place, great availability to do the tests, not too crowded inside the room, kind staff.' },
];
function ReviewsPage({ go, lang = 'en' }) {
  const fr = lang === 'fr';
  return (
    <main className="page">
      <PageHero
        eyebrow={fr ? 'Avis de candidats · vérifiés sur Google' : 'Candidate reviews · verified on Google'}
        title={fr ? <>Ce que disent les candidats après l’<em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>examen</em>.</> : <>What candidates say after the <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>exam</em>.</>}
        sub={fr ? 'Avis non modifiés de candidats au CELPIP qui ont passé leur examen chez nous. Lisez-les tous sur Google.' : 'Unedited reviews from CELPIP candidates who tested with us. Read them all on Google.'} />
      <section className="block" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="reveal" style={{ marginBottom: 32 }}><GoogleBadge /></div>
          <div className="tests">
            {REVIEWS.map((r, i) => (
              <article className="test reveal" key={r.name} style={{ transitionDelay: (i * 90) + 'ms' }}>
                <div className="score">{fr ? 'Google · candidat CELPIP' : 'Google · CELPIP candidate'}</div>
                <p className="quote">"{r.text}"</p>
                <div className="who">
                  <div className="meta">
                    <div className="name">{r.name}</div>
                    <div className="role">{r.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-band">
        <div className="container">
          <div className="eyebrow reveal">{fr ? 'Prêt à les rejoindre?' : 'Ready to join them?'}</div>
          <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>{fr ? 'Réservez votre place en toute confiance.' : 'Book your seat with confidence.'}</h2>
          <div className="actions reveal" style={{ transitionDelay: '120ms' }}>
            <a className="btn" href="#availability" onClick={e => { e.preventDefault(); go('availability'); }}>{fr ? 'Voir les prochaines séances' : 'See upcoming sessions'} <span className="arrow" /></a>
            <a className="btn ghost" href="#centres" onClick={e => { e.preventDefault(); go('centres'); }}>{fr ? 'Visiter un centre' : 'Visit a centre'}</a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── Centres page ── */
const CENTRES = [
  { tag: 'Centre 01 · North York', city: 'Toronto', addr: ['2 Sheppard Ave E, Suite 505', 'Toronto, ON · M2N 5Y7'], hosts: 'CELPIP General · CELPIP LS',
    transit: 'Sheppard–Yonge stn · 4 min walk', transitFr: 'Station Sheppard–Yonge · 4 min à pied',
    parking: 'Paid underground + green-P nearby', parkingFr: 'Souterrain payant + Green P à proximité', map: 'https://maps.app.goo.gl/NmTkPejmS3Dfikb2A' },
  { tag: 'Centre 02 · Mississauga', city: 'Mississauga', addr: ['30 Eglinton Ave W, Suite 720', 'Mississauga, ON · L5R 3E7'], hosts: 'CFA Level I · II · III',
    transit: 'Square One transit hub · 6 min', transitFr: 'Pôle de transport Square One · 6 min',
    parking: 'Free on-site surface lot', parkingFr: 'Stationnement de surface gratuit sur place', map: 'https://maps.app.goo.gl/Hd1gi1hewtuPHJW17' },
];
function CentresPage({ go, lang = 'en' }) {
  const fr = lang === 'fr';
  return (
    <main className="page">
      <PageHero
        eyebrow={fr ? 'Où nous sommes' : 'Where we are'}
        title={fr ? <>Deux centres, une seule <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>norme</em>.</> : <>Two centres, one <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>standard</em>.</>}
        sub={fr ? "Les deux centres respectent l'ensemble des spécifications de surveillance du fournisseur — même installation, même standard de personnel, même salle calme." : "Both centres follow the provider's full proctoring specification — same setup, same staff standard, same calm room."} />
      <section className="block" style={{ paddingTop: 24 }}>
        <div className="container">
          <div className="locations">
            {CENTRES.map((c, i) => (
              <div className="loc reveal" key={c.city} style={{ transitionDelay: (i * 120) + 'ms' }}>
                <a className="map" href={c.map} target="_blank" rel="noopener" aria-label={fr ? `Ouvrir le centre de ${c.city} dans Google Maps` : `Open the ${c.city} centre in Google Maps`}>
                  <span className="map-cta">{fr ? 'Voir la carte ↗' : 'View map ↗'}</span>
                </a>
                <div className="info">
                  <div className="eyebrow">{c.tag}</div>
                  <h3 className="serif">{c.city}</h3>
                  <div className="addr">{c.addr[0]}<br />{c.addr[1]}</div>
                  <div className="eyebrow" style={{ marginBottom: 8 }}>{fr ? 'Examens' : 'Hosts'}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-dim)', marginBottom: 16 }}>{c.hosts}</div>
                  <div className="loc-extra">
                    <span><b>{fr ? 'Transport' : 'Transit'}</b> {fr ? c.transitFr : c.transit}</span>
                    <span><b>{fr ? 'Stationnement' : 'Parking'}</b> {fr ? c.parkingFr : c.parking}</span>
                  </div>
                  <div className="links">
                    <a href={c.map} target="_blank" rel="noopener">{fr ? 'Itinéraire ↗' : 'Directions ↗'}</a>
                    <a href="tel:+14372640311">{fr ? 'Appeler le centre' : 'Call centre'}</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CentreGallery lang={lang} />
      <section className="cta-band">
        <div className="container">
          <div className="eyebrow reveal">{fr ? 'Vous planifiez votre visite?' : 'Planning your visit?'}</div>
          <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>{fr ? 'À savoir avant de venir.' : 'Know before you go.'}</h2>
          <div className="actions reveal" style={{ transitionDelay: '120ms' }}>
            <a className="btn" href="#exams" onClick={e => { e.preventDefault(); go('test-center'); }}>{fr ? 'Liste du jour J' : 'Exam-day checklist'} <span className="arrow" /></a>
            <a className="btn ghost" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>{fr ? 'Posez une question' : 'Ask a question'}</a>
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── FAQ page ── */
const FAQS = [
  { q: 'Do you administer the official CELPIP General test?',
    a: 'Yes. Troy Testing is an accredited CELPIP delivery site for Paragon Testing. Book your exam on Paragon\'s portal and select our North York or Mississauga centre as your location.' },
  { q: 'Can I sit the CFA exam at Troy Testing?',
    a: 'CFA Levels I, II and III are administered by Prometric on behalf of the CFA Institute. Our Mississauga centre is a Prometric-authorized site — book through the CFA portal and select us at check-in.' },
  { q: 'What identification do I need on exam day?',
    a: 'A valid, unexpired, government-issued photo ID — typically a passport. Requirements vary per exam; your confirmation email will list accepted documents.' },
  { q: 'Is tutoring bundled with exam booking?',
    a: 'No — you book your exam directly with the provider, and separately enroll in any Troy prep program. Many candidates combine a CELPIP or CFA prep block with their test date; ask our team for a tailored plan.' },
  { q: 'How early should I arrive on test day?',
    a: 'Arrive 30 minutes before your scheduled start. Check-in, ID verification and locker assignment take time, and late arrivals may be turned away by the provider.' },
  { q: 'Can I bring my phone or notes into the room?',
    a: 'No. Phones, smartwatches, bags and notes go into a provided locker. Scratch paper and (for CFA) an approved calculator are provided or specified by the provider.' },
];
function FAQPage({ go, lang = 'en' }) {
  const [open, setOpen] = useP('');
  const [query, setQuery] = useP('');
  const faqs = [1, 2, 3, 4, 5, 6].map(i => ({ q: t(lang, 'faq.q' + i), a: t(lang, 'faq.a' + i) }));
  const match = faqs.filter(f => (f.q + ' ' + f.a).toLowerCase().includes(query.toLowerCase()));
  // Report searches with no answer (debounced) so the owner learns what content is missing.
  usePE(() => {
    if (!query.trim() || match.length) return;
    const tmr = setTimeout(() => {
      try { window.troyTrack && window.troyTrack('faq_no_match', { query: query.trim().slice(0, 80), lang }); } catch (_) {}
    }, 1000);
    return () => clearTimeout(tmr);
  }, [query, match.length]);
  return (
    <main className="page">
      <PageHero
        eyebrow={t(lang, 'faq.eyebrow')}
        title={<>{t(lang, 'faq.title.a')} <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{t(lang, 'faq.title.em')}</em>.</>}
        sub={t(lang, 'faq.sub')} />
      <section className="block" style={{ paddingTop: 24 }}>
        <div className="container" style={{ maxWidth: 860 }}>
          <input className="faq-search reveal" type="search" value={query} placeholder={t(lang, 'faq.search')} aria-label={t(lang, 'faq.search')} onChange={e => setQuery(e.target.value)} style={{ marginBottom: 8 }} />
          <div className="faq reveal" style={{ transitionDelay: '80ms' }}>
            {match.map((f, mi) => {
              const qid = 'faq-q-' + mi, aid = 'faq-a-' + mi, isOpen = open === f.q;
              return (
                <div key={f.q} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button className="faq-q" id={qid} aria-expanded={isOpen} aria-controls={aid} onClick={() => setOpen(isOpen ? '' : f.q)}>
                    <span>{f.q}</span><span className="plus" aria-hidden="true" />
                  </button>
                  <div className="faq-a" id={aid} role="region" aria-labelledby={qid}>
                    <div className="faq-a-inner">{f.a}</div>
                  </div>
                </div>
              );
            })}
            {match.length === 0 && (
              <div className="faq-empty">{t(lang, 'faq.empty')} <a href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>{t(lang, 'faq.empty.link')}</a></div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

/* ── Privacy page ──
   Plain-language starter policy. TODO: have the owner review/customize with their
   actual retention periods, processor names (e.g. Formspree) and legal contact. */
function PrivacyPage({ go, lang = 'en' }) {
  const fr = lang === 'fr';
  const P = (props) => <p style={{ color: 'var(--text-dim)', fontSize: 17, lineHeight: 1.65, margin: '0 0 18px' }}>{props.children}</p>;
  const H = (props) => <h3 className="serif" style={{ fontSize: 24, margin: '34px 0 10px' }}>{props.children}</h3>;
  return (
    <main className="page">
      <PageHero
        eyebrow={fr ? 'Confidentialité' : 'Privacy'}
        title={fr ? <>Vos données, traitées <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>simplement</em>.</> : <>Your data, handled <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>plainly</em>.</>}
        sub={fr ? "Comment Troy Testing & Learning Centers recueille, utilise et protège les renseignements que vous nous confiez." : 'How Troy Testing & Learning Centers collects, uses and protects the information you share with us.'} />
      <section className="block" style={{ paddingTop: 16 }}>
        <div className="container" style={{ maxWidth: 760 }}>
          {fr ? <>
            <H>Ce que nous recueillons</H>
            <P>Lorsque vous utilisez notre formulaire de contact, nous recueillons le nom, le courriel, le téléphone (facultatif), la date d'examen visée, le niveau actuel et le message que vous fournissez. Si vous vous inscrivez aux alertes de places, votre courriel et l'examen choisi sont stockés localement dans votre navigateur et, si vous soumettez, nous sont envoyés.</P>
            <H>Pourquoi nous les recueillons</H>
            <P>Uniquement pour répondre à votre demande, vous aider à atteindre la bonne réservation auprès du fournisseur et — si vous le demandez — faire un suivi sur les programmes de préparation. Nous ne vendons ni ne louons vos renseignements, et ne les utilisons pas à des fins publicitaires.</P>
            <H>Comment nous les traitons</H>
            <P>Les soumissions du formulaire nous parviennent par courriel (et, le cas échéant, via un service de traitement de formulaires). Nous conservons les demandes seulement le temps nécessaire pour vous aider, puis les supprimons. Nous n'utilisons pas de témoins publicitaires; toute analyse est respectueuse de la vie privée et agrégée.</P>
            <H>Vos droits</H>
            <P>En vertu des lois canadiennes sur la protection de la vie privée (la LPRPDE, et la Loi 25 du Québec lorsqu'elle s'applique), vous pouvez nous demander d'accéder à vos renseignements personnels, de les corriger ou de les supprimer. Écrivez à <a href="mailto:hello@troytesting.com" style={{ color: 'var(--accent)' }}>hello@troytesting.com</a> et nous répondrons rapidement.</P>
            <H>Questions</H>
            <P>Appelez le <a href="tel:+14372640311" style={{ color: 'var(--accent)' }}>+1 437 264 0311</a> ou <a href="#contact" onClick={e => { e.preventDefault(); go('contact'); }} style={{ color: 'var(--accent)' }}>écrivez-nous</a>. Cette page est un point de départ et peut être mise à jour à mesure que nos pratiques évoluent.</P>
          </> : <>
            <H>What we collect</H>
            <P>When you use our contact form we collect the name, email, optional phone, target test date, current level and message you provide. If you sign up for seat alerts, your email and chosen exam are stored locally in your browser and, if you submit, sent to us.</P>
            <H>Why we collect it</H>
            <P>Solely to reply to your enquiry, help you reach the right provider booking, and—if you ask—follow up about prep programs. We do not sell or rent your information, and we don’t use it for advertising.</P>
            <H>How it’s handled</H>
            <P>Form submissions are delivered to us by email (and, if configured, a form-processing service). We keep enquiries only as long as needed to help you, then delete them. We don’t set advertising cookies; any analytics we use is privacy-friendly and aggregate.</P>
            <H>Your rights</H>
            <P>Under Canadian privacy law (PIPEDA, and Québec’s Law 25 where it applies) you may ask us to access, correct or delete the personal information we hold about you. Email <a href="mailto:hello@troytesting.com" style={{ color: 'var(--accent)' }}>hello@troytesting.com</a> and we’ll respond promptly.</P>
            <H>Questions</H>
            <P>Call <a href="tel:+14372640311" style={{ color: 'var(--accent)' }}>+1 437 264 0311</a> or <a href="#contact" onClick={e => { e.preventDefault(); go('contact'); }} style={{ color: 'var(--accent)' }}>message us</a>. This page is a starting point and may be updated as our practices evolve.</P>
          </>}
        </div>
      </section>
    </main>
  );
}

Object.assign(window, { AvailabilityPage, ReviewsPage, CentresPage, FAQPage, PageHero, PrivacyPage });
