// Troy Testing — feature components
const { useState: useF, useEffect: useFE, useRef: useFR } = React;

/* ─────────────────────────────────────────────
   i18n — lightweight EN / FR for nav + home hero
───────────────────────────────────────────── */
const TR = {
  en: {
    'nav.home': 'Home', 'nav.programs': 'Programs', 'nav.testcenter': 'Exams',
    'nav.availability': 'Availability', 'nav.reviews': 'Reviews', 'nav.centres': 'Centres', 'nav.faq': 'FAQ',
    'nav.guides': 'Guides', 'nav.contact': 'Contact',
    'cta.find': 'Find Your Exam', 'cta.talk': 'Talk to our team', 'cta.ask': 'Ask a question',
    'cta.message': 'Message us', 'cta.estimate': 'Estimate my study time',
    'hero.eyebrow': 'Authorized CELPIP & CFA test centre · GTA',
    'hero.h1a': 'Sit your', 'hero.h1b': 'exam in a room that runs like clockwork.',
    'hero.sub': "We're an authorized delivery site for CELPIP (Paragon) and CFA (Prometric). You book with the provider; we run the room — quiet, on-time, every session.",
    'hero.trust': 'Rated by real candidates',
    'm.tests': 'Tests administered every month', 'm.proctors': 'Certified proctors on staff', 'm.centres': 'Centres across the GTA',
    'm.years': 'Years delivering exams in the GTA', 'm.providers': 'Official providers — Paragon & Prometric',
    'cta.bookCelpip': 'Book CELPIP', 'cta.bookCfa': 'Book CFA', 'cta.seeAvail': 'See upcoming sessions',
    'foot.privacy': 'Privacy', 'contact.consent': 'We use your details only to reply to your enquiry — see our Privacy Policy.',
    // Home overview + CTA band
    'home.ov.eyebrow': 'Explore the site', 'home.ov.title': 'Everything you need, one page each.',
    'home.ov.sub': 'Pick where you want to go. Each part of Troy Testing now has its own focused page.',
    'home.ov.open': 'Open',
    'home.card.programs': 'Academic tutoring, CELPIP & CFA test prep, and professional skills.',
    'home.card.test-center': 'Every CELPIP & CFA exam we host, with a one-tap route to booking.',
    'home.card.availability': 'Typical session cadence and the next CFA exam window.',
    'home.card.reviews': 'Verified Google reviews from candidates who tested here.',
    'home.card.centres': 'North York & Mississauga — directions, transit and parking.',
    'home.card.faq': 'ID rules, exam-day logistics, and how booking works.',
    'home.cta.eyebrow': 'Ready when you are',
    'home.cta.a': 'Book with the provider.', 'home.cta.em': 'Pick us', 'home.cta.b': 'as the location.',
    'home.cta.sub': 'Reserve with the provider and choose Troy as your location — Paragon for CELPIP, Prometric for CFA.',
    // Footer
    'foot.blurb': 'An accredited testing and learning center delivering CELPIP and CFA exams across Toronto and Mississauga.',
    'foot.explore': 'Explore', 'foot.visit': 'Visit', 'foot.contact': 'Contact',
    'foot.hours': 'Mon–Sat · 9:00 – 19:00', 'foot.rights': 'All rights reserved',
    // Contact page
    'contact.eyebrow': 'Contact', 'contact.title.a': 'A real person reads every', 'contact.title.em': 'message',
    'contact.lead': "Not sure which exam you need, or how the booking flow works? Tell us what you're preparing for — we'll reply with next steps, not a form email.",
    'contact.f.name': 'Full name', 'contact.f.email': 'Email', 'contact.f.phone': 'Phone (optional)',
    'contact.f.interest': "I'm interested in", 'contact.f.center': 'Preferred center',
    'contact.f.date': 'Target test date (optional)', 'contact.f.level': 'Current level / band (optional)',
    'contact.f.more': 'Tell us a bit more', 'contact.send': 'Send message', 'contact.sending': 'Sending…',
    'contact.opt.select': '— Select —', 'contact.opt.celpipBook': 'CELPIP · help with Paragon booking',
    'contact.opt.celpipPrep': 'CELPIP · prep program', 'contact.opt.cfaBook': 'CFA · help with Prometric booking',
    'contact.opt.cfaPrep': 'CFA · prep program', 'contact.opt.other': 'Something else',
    'contact.opt.noPref': 'No preference', 'contact.opt.l0': 'Just starting out',
    'contact.opt.l1': 'CELPIP band 5–6 / CFA new to finance', 'contact.opt.l2': 'CELPIP band 7–8 / CFA some background',
    'contact.opt.l3': 'CELPIP band 9+ / finance professional',
    'contact.ph.message': "e.g. I'm preparing for CELPIP in May and looking for next available test dates.",
    'contact.err.name': 'Please add your name', 'contact.err.email': 'Valid email required',
    'contact.err.interest': 'Pick an interest', 'contact.err.message': 'A sentence or two please',
    'contact.err.send': "Couldn't send that just now.", 'contact.err.emailUs': 'Email us directly →',
    'contact.ok.eyebrow': 'Message received', 'contact.ok.title.a': 'Thanks,',
    'contact.ok.title.b': ". We'll reply within one business day.",
    'contact.ok.hurry': 'In a hurry? Call', 'contact.ok.hurry2': '— someone is usually at the front desk Mon–Sat.',
    'contact.ok.back': 'Back to home', 'contact.ok.browse': 'Browse exams',
    'contact.aside.reach': 'Or reach us directly', 'contact.aside.phone': 'Phone', 'contact.aside.email': 'Email',
    'contact.aside.hours': 'Hours', 'contact.aside.hoursV': 'Mon–Sat · 9:00 – 19:00',
    'contact.aside.closed': 'Closed', 'contact.aside.closedV': 'Sundays & Ontario statutory holidays',
    'contact.aside.tip': 'Tip',
    'contact.aside.tipBody': 'CELPIP bookings happen on Paragon; CFA bookings happen on Prometric. Troy is your delivery location — not your booking agent.',
    'contact.aside.goto': 'Go to test center',
    // FAQ page
    'faq.eyebrow': 'Questions', 'faq.title.a': 'Common questions,', 'faq.title.em': 'answered',
    'faq.sub': 'Most candidates arrive with the same handful of questions. Search or browse below.',
    'faq.search': 'Search questions…', 'faq.empty': 'No matches.', 'faq.empty.link': 'Ask us directly →',
    'faq.q1': 'Do you administer the official CELPIP General test?',
    'faq.a1': "Yes. Troy Testing is an accredited CELPIP delivery site for Paragon Testing. Book your exam on Paragon's portal and select our North York or Mississauga centre as your location.",
    'faq.q2': 'Can I sit the CFA exam at Troy Testing?',
    'faq.a2': 'CFA Levels I, II and III are administered by Prometric on behalf of the CFA Institute. Our Mississauga centre is a Prometric-authorized site — book through the CFA portal and select us at check-in.',
    'faq.q3': 'What identification do I need on exam day?',
    'faq.a3': 'A valid, unexpired, government-issued photo ID — typically a passport. Requirements vary per exam; your confirmation email will list accepted documents.',
    'faq.q4': 'Is tutoring bundled with exam booking?',
    'faq.a4': 'No — you book your exam directly with the provider, and separately enroll in any Troy prep program. Many candidates combine a CELPIP or CFA prep block with their test date; ask our team for a tailored plan.',
    'faq.q5': 'How early should I arrive on test day?',
    'faq.a5': 'Arrive 30 minutes before your scheduled start. Check-in, ID verification and locker assignment take time, and late arrivals may be turned away by the provider.',
    'faq.q6': 'Can I bring my phone or notes into the room?',
    'faq.a6': 'No. Phones, smartwatches, bags and notes go into a provided locker. Scratch paper and (for CFA) an approved calculator are provided or specified by the provider.',
    // Wizard
    'wiz.eyebrow': 'Find your exam', 'wiz.step': 'Step', 'wiz.of': 'of',
    'wiz.t0': 'Which exam?', 'wiz.t1': 'Which level?', 'wiz.t2': 'Which centre?', 'wiz.t3': "You're set",
    'wiz.celpip.d': 'English language test', 'wiz.cfa.d': 'Finance designation',
    'wiz.s.exam': 'Exam', 'wiz.s.centre': 'Centre', 'wiz.s.provider': 'Provider', 'wiz.s.fee': 'Fee',
    'wiz.continue': 'Continue to', 'wiz.startover': 'Start over', 'wiz.back': 'Back', 'wiz.close': 'Close (Esc)',
  },
  fr: {
    'nav.home': 'Accueil', 'nav.programs': 'Programmes', 'nav.testcenter': 'Examens',
    'nav.availability': 'Disponibilité', 'nav.reviews': 'Avis', 'nav.centres': 'Centres', 'nav.faq': 'FAQ',
    'nav.guides': 'Guides', 'nav.contact': 'Contact',
    'cta.find': 'Trouvez votre examen', 'cta.talk': 'Parlez à notre équipe', 'cta.ask': 'Posez une question',
    'cta.message': 'Écrivez-nous', 'cta.estimate': "Estimez mon temps d'étude",
    'hero.eyebrow': "Centre d'examen agréé CELPIP et CFA · RGT",
    'hero.h1a': 'Passez votre examen', 'hero.h1b': 'dans une salle réglée comme une horloge.',
    'hero.sub': "Nous sommes un site de livraison agréé pour le CELPIP (Paragon) et le CFA (Prometric). Vous réservez auprès du fournisseur; nous gérons la salle — calme et ponctuelle.",
    'hero.trust': 'Évalué par de vrais candidats',
    'm.tests': 'Examens administrés chaque mois', 'm.proctors': 'Surveillants certifiés', 'm.centres': 'Centres dans la RGT',
    'm.years': "Années à offrir des examens dans le Grand Toronto", 'm.providers': 'Fournisseurs officiels — Paragon et Prometric',
    'cta.bookCelpip': 'Réserver le CELPIP', 'cta.bookCfa': 'Réserver le CFA', 'cta.seeAvail': 'Voir les prochaines séances',
    'foot.privacy': 'Confidentialité', 'contact.consent': 'Vos coordonnées servent uniquement à répondre à votre demande — voir notre politique de confidentialité.',
    'home.ov.eyebrow': 'Explorez le site', 'home.ov.title': "Tout ce qu'il vous faut, une page à la fois.",
    'home.ov.sub': 'Choisissez votre destination. Chaque section de Troy Testing a maintenant sa propre page.',
    'home.ov.open': 'Ouvrir',
    'home.card.programs': 'Tutorat scolaire, préparation au CELPIP et au CFA, et compétences professionnelles.',
    'home.card.test-center': 'Tous les examens CELPIP et CFA que nous accueillons, avec un accès direct à la réservation.',
    'home.card.availability': "Cadence habituelle des séances et la prochaine fenêtre d'examen du CFA.",
    'home.card.reviews': 'Avis Google vérifiés de candidats ayant passé leur examen ici.',
    'home.card.centres': 'North York et Mississauga — itinéraires, transport et stationnement.',
    'home.card.faq': "Règles d'identité, déroulement du jour J et fonctionnement de la réservation.",
    'home.cta.eyebrow': "Prêts quand vous l'êtes",
    'home.cta.a': 'Réservez auprès du fournisseur.', 'home.cta.em': 'Choisissez-nous', 'home.cta.b': "comme lieu d'examen.",
    'home.cta.sub': 'Réservez auprès du fournisseur et choisissez Troy comme lieu — Paragon pour le CELPIP, Prometric pour le CFA.',
    'foot.blurb': "Un centre d'examen et d'apprentissage agréé offrant les examens CELPIP et CFA à Toronto et Mississauga.",
    'foot.explore': 'Explorer', 'foot.visit': 'Nous visiter', 'foot.contact': 'Contact',
    'foot.hours': 'Lun–Sam · 9 h – 19 h', 'foot.rights': 'Tous droits réservés',
    'contact.eyebrow': 'Contact', 'contact.title.a': 'Une vraie personne lit chaque', 'contact.title.em': 'message',
    'contact.lead': "Vous ne savez pas quel examen choisir ou comment réserver? Dites-nous ce que vous préparez — nous répondrons avec les prochaines étapes, pas un courriel automatique.",
    'contact.f.name': 'Nom complet', 'contact.f.email': 'Courriel', 'contact.f.phone': 'Téléphone (facultatif)',
    'contact.f.interest': "Je m'intéresse à", 'contact.f.center': 'Centre préféré',
    'contact.f.date': "Date d'examen visée (facultatif)", 'contact.f.level': 'Niveau actuel (facultatif)',
    'contact.f.more': 'Dites-nous-en un peu plus', 'contact.send': 'Envoyer le message', 'contact.sending': 'Envoi…',
    'contact.opt.select': '— Choisir —', 'contact.opt.celpipBook': 'CELPIP · aide à la réservation Paragon',
    'contact.opt.celpipPrep': 'CELPIP · programme de préparation', 'contact.opt.cfaBook': 'CFA · aide à la réservation Prometric',
    'contact.opt.cfaPrep': 'CFA · programme de préparation', 'contact.opt.other': 'Autre chose',
    'contact.opt.noPref': 'Aucune préférence', 'contact.opt.l0': 'Tout début',
    'contact.opt.l1': 'CELPIP niveau 5–6 / CFA débutant en finance', 'contact.opt.l2': 'CELPIP niveau 7–8 / CFA quelques bases',
    'contact.opt.l3': 'CELPIP niveau 9+ / professionnel de la finance',
    'contact.ph.message': "p. ex. Je prépare le CELPIP en mai et je cherche les prochaines dates disponibles.",
    'contact.err.name': 'Veuillez indiquer votre nom', 'contact.err.email': 'Courriel valide requis',
    'contact.err.interest': 'Choisissez un intérêt', 'contact.err.message': 'Une phrase ou deux, svp',
    'contact.err.send': "Échec de l'envoi pour le moment.", 'contact.err.emailUs': 'Écrivez-nous directement →',
    'contact.ok.eyebrow': 'Message reçu', 'contact.ok.title.a': 'Merci,',
    'contact.ok.title.b': '. Nous répondrons sous un jour ouvrable.',
    'contact.ok.hurry': 'Pressé? Appelez', 'contact.ok.hurry2': "— il y a généralement quelqu'un à l'accueil du lun au sam.",
    'contact.ok.back': "Retour à l'accueil", 'contact.ok.browse': 'Voir les examens',
    'contact.aside.reach': 'Ou joignez-nous directement', 'contact.aside.phone': 'Téléphone', 'contact.aside.email': 'Courriel',
    'contact.aside.hours': 'Heures', 'contact.aside.hoursV': 'Lun–Sam · 9 h – 19 h',
    'contact.aside.closed': 'Fermé', 'contact.aside.closedV': "Dimanches et jours fériés de l'Ontario",
    'contact.aside.tip': 'Conseil',
    'contact.aside.tipBody': "Les réservations CELPIP se font sur Paragon; les réservations CFA sur Prometric. Troy est votre lieu d'examen — pas votre agent de réservation.",
    'contact.aside.goto': "Aller au centre d'examen",
    'faq.eyebrow': 'Questions', 'faq.title.a': 'Questions fréquentes,', 'faq.title.em': 'répondues',
    'faq.sub': 'La plupart des candidats ont les mêmes questions. Cherchez ou parcourez ci-dessous.',
    'faq.search': 'Rechercher…', 'faq.empty': 'Aucun résultat.', 'faq.empty.link': 'Demandez-nous directement →',
    'faq.q1': 'Administrez-vous le test officiel CELPIP General?',
    'faq.a1': "Oui. Troy Testing est un site de livraison CELPIP agréé pour Paragon Testing. Réservez votre examen sur le portail de Paragon et choisissez notre centre de North York ou de Mississauga.",
    'faq.q2': 'Puis-je passer le CFA chez Troy Testing?',
    'faq.a2': "Les niveaux I, II et III du CFA sont administrés par Prometric pour le compte du CFA Institute. Notre centre de Mississauga est un site agréé par Prometric — réservez sur le portail du CFA et choisissez-nous à l'enregistrement.",
    'faq.q3': "Quelle pièce d'identité dois-je apporter le jour de l'examen?",
    'faq.a3': "Une pièce d'identité avec photo valide, non expirée et émise par le gouvernement — généralement un passeport. Les exigences varient selon l'examen; votre courriel de confirmation indique les documents acceptés.",
    'faq.q4': "Le tutorat est-il inclus avec la réservation d'examen?",
    'faq.a4': "Non — vous réservez votre examen directement auprès du fournisseur et vous inscrivez séparément à un programme de préparation Troy. De nombreux candidats combinent un bloc de préparation CELPIP ou CFA avec leur date d'examen; demandez un plan personnalisé à notre équipe.",
    'faq.q5': "À quelle heure dois-je arriver le jour de l'examen?",
    'faq.a5': "Arrivez 30 minutes avant l'heure prévue. L'enregistrement, la vérification d'identité et l'attribution des casiers prennent du temps, et les retardataires peuvent être refusés par le fournisseur.",
    'faq.q6': 'Puis-je apporter mon téléphone ou mes notes dans la salle?',
    'faq.a6': "Non. Téléphones, montres connectées, sacs et notes vont dans un casier fourni. Le papier brouillon et (pour le CFA) une calculatrice approuvée sont fournis ou précisés par le fournisseur.",
    'wiz.eyebrow': 'Trouvez votre examen', 'wiz.step': 'Étape', 'wiz.of': 'sur',
    'wiz.t0': 'Quel examen?', 'wiz.t1': 'Quel niveau?', 'wiz.t2': 'Quel centre?', 'wiz.t3': "C'est prêt",
    'wiz.celpip.d': 'Test de langue anglaise', 'wiz.cfa.d': 'Titre en finance',
    'wiz.s.exam': 'Examen', 'wiz.s.centre': 'Centre', 'wiz.s.provider': 'Fournisseur', 'wiz.s.fee': 'Frais',
    'wiz.continue': 'Continuer vers', 'wiz.startover': 'Recommencer', 'wiz.back': 'Retour', 'wiz.close': 'Fermer (Échap)',
  },
};
function t(lang, key) { return (TR[lang] && TR[lang][key]) || TR.en[key] || key; }

/* ─────────────────────────────────────────────
   Language toggle (header)
───────────────────────────────────────────── */
function LangToggle({ lang, setLang }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {['en', 'fr'].map(l => (
        <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Google rating badge
───────────────────────────────────────────── */
function Stars({ size = 13 }) {
  return (
    <span className="stars" style={{ fontSize: size }} aria-hidden="true">
      {[0, 1, 2, 3, 4].map(i => <span key={i}>★</span>)}
    </span>
  );
}
// Single source of truth for the rating shown in the hero + Reviews page.
// TODO: set these to the REAL Google Business Profile values and point url at the reviews tab.
const GOOGLE_RATING = { score: '4.9', count: '120+', url: 'https://www.google.com/search?q=Troy+Testing+%26+Learning+Centers+reviews' };
function GoogleBadge({ compact }) {
  return (
    <a className={`gbadge ${compact ? 'compact' : ''}`} href={GOOGLE_RATING.url} target="_blank" rel="noopener"
      aria-label={`Google rating ${GOOGLE_RATING.score} out of 5 from ${GOOGLE_RATING.count} reviews — opens Google`}>
      <span className="g-mark" aria-hidden="true">G</span>
      <span className="g-body">
        <span className="g-top"><strong>{GOOGLE_RATING.score}</strong><Stars /></span>
        <span className="g-sub">{GOOGLE_RATING.count} Google reviews</span>
      </span>
    </a>
  );
}

/* ─────────────────────────────────────────────
   Sessions data (drives availability + wizard)
───────────────────────────────────────────── */
// Representative cadence per exam/centre — NOT live seat data (mirrors the illustrative board).
const SESSIONS = [
  { code: 'CELPIP-G', label: 'CELPIP General', centre: 'North York', cadence: 'Daily seats' },
  { code: 'CELPIP-LS', label: 'CELPIP General LS', centre: 'North York', cadence: 'Weekly seats' },
  { code: 'CELPIP-G', label: 'CELPIP General', centre: 'Mississauga', cadence: 'Weekly seats' },
  { code: 'CFA-I', label: 'CFA Level I', centre: 'Mississauga', cadence: 'Feb · May · Aug · Nov' },
  { code: 'CFA-II', label: 'CFA Level II', centre: 'Mississauga', cadence: 'May · Aug · Nov' },
];

function AvailabilitySection() {
  return (
    <section className="block" id="availability">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow reveal">Upcoming sessions <span className="sample-chip">Sample</span></div>
            <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>When each exam runs.</h2>
          </div>
          <p className="reveal" style={{ transitionDelay: '120ms' }}>Representative session cadence at each centre — not live seat counts. Confirm and book live seats on the provider's portal.</p>
        </div>
        <div className="avail-list reveal">
          {SESSIONS.map((s, i) => {
            const ex = EXAMS.find(e => e.code === s.code) || {};
            const track = () => { try { window.troyTrack && window.troyTrack('provider_click', { exam: s.code, org: ex.org, source: 'availability' }); } catch (_) {} };
            return (
              <a className="avail-row" key={i} href={ex.url || '#'} target="_blank" rel="noopener" onClick={track}>
                <span className="av-exam">{s.label}</span>
                <span className="av-centre">{s.centre}</span>
                <span className="av-when">{s.cadence}</span>
                <span className="av-go">{ex.flow === 'cfa' ? 'Register' : 'Book'} <span className="arrow" /></span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Find-my-exam wizard
───────────────────────────────────────────── */
function ExamWizard({ open, close, lang = 'en' }) {
  const [step, setStep] = useF(0);
  const [fam, setFam] = useF(null);     // 'CELPIP' | 'CFA'
  const [code, setCode] = useF(null);   // exam code
  const [centre, setCentre] = useF(null);
  useFE(() => { if (open) { setStep(0); setFam(null); setCode(null); setCentre(null); } }, [open]);
  const dref = useDialogA11y(open);
  if (!open) return null;

  const celpip = EXAMS.filter(e => e.code.startsWith('CELPIP'));
  const cfa = EXAMS.filter(e => e.code.startsWith('CFA'));
  const exam = EXAMS.find(e => e.code === code);
  const centres = fam === 'CFA' ? ['Mississauga'] : ['North York', 'Mississauga'];

  const stepTitles = [t(lang, 'wiz.t0'), t(lang, 'wiz.t1'), t(lang, 'wiz.t2'), t(lang, 'wiz.t3')];

  return (
    <div className="modal-bg" onClick={close}>
      <div className="modal wizard" ref={dref} role="dialog" aria-modal="true" aria-label="Find your exam" tabIndex={-1} onClick={e => e.stopPropagation()}>
        <div className="wiz-top">
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>{t(lang, 'wiz.eyebrow')} · {t(lang, 'wiz.step')} {Math.min(step + 1, 4)} {t(lang, 'wiz.of')} 4</div>
          <div className="wiz-dots">{[0, 1, 2, 3].map(i => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
        </div>
        <h3>{stepTitles[step]}</h3>

        {step === 0 && (
          <div className="wiz-grid">
            {[['CELPIP', 'wiz.celpip.d', 'Paragon Testing'], ['CFA', 'wiz.cfa.d', 'Prometric · CFA Institute']].map(([f, d, p]) => (
              <button className="wiz-card" key={f} onClick={() => { setFam(f); setStep(1); }}>
                <span className="wiz-card-t">{f}</span>
                <span className="wiz-card-d">{t(lang, d)}</span>
                <span className="wiz-card-p">{p}</span>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="wiz-list">
            {(fam === 'CELPIP' ? celpip : cfa).map(e => (
              <button className="wiz-opt" key={e.code} onClick={() => { setCode(e.code); setStep(2); }}>
                <span>{e.name}</span><span className="arrow" />
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="wiz-list">
            {centres.map(c => (
              <button className="wiz-opt" key={c} onClick={() => { setCentre(c); setStep(3); }}>
                <span>{c}</span><span className="arrow" />
              </button>
            ))}
          </div>
        )}

        {step === 3 && exam && (
          <div className="wiz-result">
            <div className="wiz-summary">
              <div><span className="ws-k">{t(lang, 'wiz.s.exam')}</span><span className="ws-v">{exam.name}</span></div>
              <div><span className="ws-k">{t(lang, 'wiz.s.centre')}</span><span className="ws-v">{centre}</span></div>
              <div><span className="ws-k">{t(lang, 'wiz.s.provider')}</span><span className="ws-v">{exam.org}</span></div>
              <div><span className="ws-k">{t(lang, 'wiz.s.fee')}</span><span className="ws-v">{exam.fee}</span></div>
            </div>
            <p className="wiz-note">Book on the <strong>{exam.org}</strong> portal and select Troy Testing — {centre} as your delivery location. Bring valid photo ID on the day.</p>
            <div className="modal-actions">
              <a className="btn" href={exam.url} target="_blank" rel="noopener">{t(lang, 'wiz.continue')} {exam.org} <span className="arrow" /></a>
              <button className="btn ghost" onClick={() => setStep(0)}>{t(lang, 'wiz.startover')}</button>
            </div>
          </div>
        )}

        <div className="wiz-foot">
          {step > 0 ? <button className="wiz-back" onClick={() => setStep(step - 1)}>← {t(lang, 'wiz.back')}</button> : <span />}
          <button className="modal-close-x" onClick={close}>{t(lang, 'wiz.close')}</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CFA window countdown
───────────────────────────────────────────── */
function nextCfaDate() {
  // CFA windows (approx first day); pick next future one
  const windows = ['2026-02-16', '2026-05-20', '2026-08-18', '2026-11-17', '2027-02-15'];
  const now = Date.now();
  for (const w of windows) { const d = new Date(w + 'T08:00:00'); if (d.getTime() > now) return d; }
  return new Date(windows[windows.length - 1] + 'T08:00:00');
}
function Countdown() {
  const [target] = useF(() => nextCfaDate());
  const [now, setNow] = useF(() => Date.now());
  useFE(() => { const iv = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(iv); }, []);
  let diff = Math.max(0, target.getTime() - now);
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const m = Math.floor(diff / 60000); diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  const fmt = target.toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' });
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div className="countdown reveal">
      <div className="cd-left">
        <div className="eyebrow" style={{ color: 'var(--accent)' }}>Next CFA exam window</div>
        <div className="cd-date serif">{fmt}</div>
        <div className="cd-note">Registration closes weeks before — plan your prep now.</div>
      </div>
      <div className="cd-clock">
        {[[d, 'Days'], [pad(h), 'Hrs'], [pad(m), 'Min'], [pad(s), 'Sec']].map(([v, l], i) => (
          <div className="cd-unit" key={i}><span className="cd-n">{v}</span><span className="cd-l">{l}</span></div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Seat email alert
───────────────────────────────────────────── */
function SeatAlert() {
  const [email, setEmail] = useF('');
  const [exam, setExam] = useF('CELPIP');
  const [done, setDone] = useF(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) return;
    try { localStorage.setItem('troy.alert', JSON.stringify({ email, exam })); } catch (_) {}
    setDone(true);
  };
  return (
    <div className="seat-alert reveal">
      <div className="sa-text">
        <div className="eyebrow" style={{ color: 'var(--accent)' }}>Seat alerts</div>
        <h3 className="serif">Get notified when seats open.</h3>
        <p>We'll email you the moment a new CELPIP or CFA session is posted at your preferred centre.</p>
      </div>
      {done ? (
        <div className="sa-done">✓ You're on the list. We'll be in touch at <strong>{email}</strong>.</div>
      ) : (
        <form className="sa-form" onSubmit={submit}>
          <select value={exam} onChange={e => setExam(e.target.value)} aria-label="Which exam">
            <option>CELPIP</option><option>CFA</option>
          </select>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email address for seat alerts" required />
          <button className="btn" type="submit">Notify me <span className="arrow" /></button>
        </form>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Diagnostic quiz → study-weeks estimate
───────────────────────────────────────────── */
function DiagnosticQuiz({ open, close, go, lang = 'en' }) {
  const [step, setStep] = useF(0);
  const [fam, setFam] = useF(null);
  const [level, setLevel] = useF(null);
  const [hours, setHours] = useF(8);
  useFE(() => { if (open) { setStep(0); setFam(null); setLevel(null); setHours(8); } }, [open]);
  const dref = useDialogA11y(open);
  if (!open) return null;

  const celpipLevels = [['Starting out', 14], ['Some English', 9], ['Confident', 5]];
  const cfaLevels = [['New to finance', 1.15], ['Some background', 1.0], ['Finance professional', 0.85]];

  let weeks = 0, total = 0;
  if (fam === 'CELPIP' && level != null) {
    const base = celpipLevels[level][1];
    weeks = Math.max(3, Math.round(base * (8 / hours)));
    total = weeks * hours;
  } else if (fam === 'CFA' && level != null) {
    const mult = cfaLevels[level][1];
    total = Math.round(300 * mult);
    weeks = Math.max(10, Math.round(total / hours));
  }

  return (
    <div className="modal-bg" onClick={close}>
      <div className="modal wizard" ref={dref} role="dialog" aria-modal="true" aria-label="Study planner" tabIndex={-1} onClick={e => e.stopPropagation()}>
        <div className="wiz-top">
          <div className="eyebrow" style={{ color: 'var(--accent)' }}>Study planner</div>
          <div className="wiz-dots">{[0, 1, 2, 3].map(i => <span key={i} className={i <= step ? 'on' : ''} />)}</div>
        </div>

        {step === 0 && (<>
          <h3>Which exam are you preparing for?</h3>
          <div className="wiz-grid">
            {['CELPIP', 'CFA'].map(f => (
              <button className="wiz-card" key={f} onClick={() => { setFam(f); setStep(1); }}>
                <span className="wiz-card-t">{f}</span>
                <span className="wiz-card-d">{f === 'CELPIP' ? 'English proficiency' : 'Finance designation'}</span>
              </button>
            ))}
          </div>
        </>)}

        {step === 1 && (<>
          <h3>Where are you starting from?</h3>
          <div className="wiz-list">
            {(fam === 'CELPIP' ? celpipLevels : cfaLevels).map((l, i) => (
              <button className="wiz-opt" key={i} onClick={() => { setLevel(i); setStep(2); }}>
                <span>{l[0]}</span><span className="arrow" />
              </button>
            ))}
          </div>
        </>)}

        {step === 2 && (<>
          <h3>How many hours can you study per week?</h3>
          <div className="hours-pick">
            <input type="range" min="3" max="25" value={hours} onChange={e => setHours(+e.target.value)} />
            <div className="hours-val"><strong>{hours}</strong> hrs / week</div>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => setStep(3)}>See my plan <span className="arrow" /></button>
          </div>
        </>)}

        {step === 3 && (<>
          <h3>Your estimated plan</h3>
          <div className="quiz-result">
            <div className="qr-big"><span className="qr-n">{weeks}</span><span className="qr-u">weeks</span></div>
            <p>At <strong>{hours} hrs/week</strong> (~{total} hours total), most candidates at your starting point reach exam-ready in about <strong>{weeks} weeks</strong>. Our {fam} prep block is built around exactly this.</p>
          </div>
          <div className="modal-actions">
            <button className="btn" onClick={() => { close(); go('contact'); }}>Plan with a tutor <span className="arrow" /></button>
            <button className="btn ghost" onClick={() => setStep(0)}>Start over</button>
          </div>
        </>)}

        <div className="wiz-foot">
          {step > 0 ? <button className="wiz-back" onClick={() => setStep(step - 1)}>← {t(lang, 'wiz.back')}</button> : <span />}
          <button className="modal-close-x" onClick={close}>{t(lang, 'wiz.close')}</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Exam-day checklist
───────────────────────────────────────────── */
const CHECKLIST = [
  { t: 'Valid photo ID', d: 'An unexpired, government-issued passport. Name must match your booking exactly.' },
  { t: 'Arrive 30 minutes early', d: 'Check-in, locker assignment, and ID verification take time. Late arrivals may be turned away.' },
  { t: 'Leave devices in the locker', d: 'Phones, smartwatches, and bags go in a provided locker. The room is device-free.' },
  { t: 'No notes or materials', d: 'Scratch paper and (for CFA) an approved calculator are provided or specified by the provider.' },
  { t: 'Know your centre', d: 'CELPIP runs at North York & Mississauga; CFA at Mississauga. Double-check before you travel.' },
  { t: 'Confirmation email', d: 'Bring your provider confirmation — printed or on a device you check in before entering.' },
];
function ExamDayChecklist() {
  return (
    <section className="block" id="checklist" style={{ background: 'var(--surface)' }}>
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow reveal">Exam day</div>
            <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>What to bring, what to leave.</h2>
          </div>
          <p className="reveal" style={{ transitionDelay: '120ms' }}>A quick checklist so nothing on test day is a surprise. Provider rules always take precedence.</p>
        </div>
        <div className="check-grid">
          {CHECKLIST.map((c, i) => (
            <div className="check-item reveal" key={i} style={{ transitionDelay: (i % 3) * 80 + 'ms' }}>
              <span className="check-mark">✓</span>
              <div>
                <h4>{c.t}</h4>
                <p>{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Centre gallery
───────────────────────────────────────────── */
// Non-claiming captions: these are representative stock images, NOT photos of the actual
// rooms. TODO: replace with real self-hosted photos of the North York & Mississauga centres,
// then caption them specifically.
const GALLERY = [
  { cls: 'g1', cap: 'Calm, purpose-built testing rooms' },
  { cls: 'g2', cap: 'Staffed check-in & lockers' },
  { cls: 'g3', cap: 'Individual workstations' },
  { cls: 'g4', cap: 'Quiet, sound-separated floor' },
];
function CentreGallery() {
  return (
    <section className="block" id="gallery">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow reveal">Inside the centres</div>
            <h2 className="serif reveal" style={{ transitionDelay: '60ms' }}>Built to be forgettable — in the best way.</h2>
          </div>
          <p className="reveal" style={{ transitionDelay: '120ms' }}>Calm, well-lit rooms and reliable equipment. The kind of space you stop noticing five minutes in.</p>
        </div>
        <div className="gallery-grid reveal">
          {GALLERY.map((g, i) => (
            <figure className={`gphoto ${g.cls}`} key={i}><figcaption>{g.cap}</figcaption></figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Floating call / WhatsApp
───────────────────────────────────────────── */
function CallFab() {
  const [open, setOpen] = useF(false);
  return (
    <div className={`fab ${open ? 'open' : ''}`}>
      <div className="fab-menu" role="menu" aria-hidden={!open}>
        <a className="fab-item wa" href="https://wa.me/14372640311" target="_blank" rel="noopener" tabIndex={open ? 0 : -1}>
          <span className="fab-ico" aria-hidden="true">✆</span> WhatsApp
        </a>
        <a className="fab-item call" href="tel:+14372640311" tabIndex={open ? 0 : -1}>
          <span className="fab-ico" aria-hidden="true">☎</span> Call centre
        </a>
      </div>
      <button className="fab-btn" onClick={() => setOpen(o => !o)} aria-expanded={open} aria-label={open ? 'Close contact options' : 'Contact us'}>
        <span aria-hidden="true">{open ? '✕' : '✆'}</span>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Guides
───────────────────────────────────────────── */
const GUIDES = [
  {
    id: 'celpip-vs-ielts', tag: 'CELPIP', read: '5 min',
    title: 'CELPIP vs IELTS: which should you take?',
    excerpt: 'Both prove English for Canadian immigration. The right pick comes down to format, scoring, and where you test.',
    body: [
      'CELPIP and IELTS are both accepted by IRCC for most Canadian immigration streams, so the decision is rarely about acceptance — it\'s about which test plays to your strengths.',
      'CELPIP is fully computer-delivered and entirely Canadian English, including the speaking section, which is recorded rather than conducted with a live examiner. Many candidates prefer this consistency and the single-sitting, same-day computer format.',
      'IELTS offers paper or computer options and uses a live speaking interview. If you are more comfortable speaking with a person than into a microphone, that can matter.',
      'Scoring differs too: CELPIP reports bands 1–12 per skill; IELTS uses 0–9. Map your target CRS points back to the band you actually need before you book.',
      'Our take: if you are testing in the GTA and want a predictable, all-computer experience in Canadian English, CELPIP is usually the smoother path — and you can sit it with us at North York or Mississauga.',
    ],
  },
  {
    id: 'cfa-level-1-plan', tag: 'CFA', read: '6 min',
    title: 'A realistic CFA Level I study plan',
    excerpt: 'The CFA Institute suggests ~300 hours. Here is how to spread them without burning out.',
    body: [
      'The often-quoted figure is roughly 300 hours of study for CFA Level I. Treat it as a floor, not a guarantee, and work backward from your exam date.',
      'At 15 hours per week, 300 hours is about 20 weeks — five months. At 10 hours per week you are closer to seven months. Pick a cadence you can actually sustain through work and life.',
      'Front-load Ethics and Quantitative Methods; they underpin everything and reward early repetition. Save a full month at the end purely for mock exams and review.',
      'Sit at least three full-length, timed mocks under real conditions. Scoring above the mid-60s consistently is a reasonable readiness signal.',
      'Book your seat early. CFA windows are fixed and Prometric seats at popular centres go quickly — we host Level I, II and III at our Mississauga centre.',
    ],
  },
  {
    id: 'celpip-speaking', tag: 'CELPIP', read: '4 min',
    title: 'Five ways to lift your CELPIP speaking band',
    excerpt: 'Speaking is where prepared candidates gain the most. Small habits, big band movement.',
    body: [
      'CELPIP speaking is recorded against the clock, so structure beats spontaneity. Have a simple template for each task type and practise filling it fast.',
      'Speak for the full time. Trailing off early leaves easy points on the table; a complete, organised answer scores better than a perfect half-answer.',
      'Use concrete detail. "My cousin Daniel, who moved to Calgary in 2019" is stronger than "someone I know." Specificity reads as fluency.',
      'Record yourself and listen back. Most band gains come from hearing your own filler words and flat intonation, then fixing them.',
      'Practise on a real keyboard-and-mic setup. The interface should be muscle memory before exam day — which is exactly what our timed practice sessions simulate.',
    ],
  },
  {
    id: 'exam-day', tag: 'Both', read: '3 min',
    title: 'Your test-day morning, minute by minute',
    excerpt: 'Remove every avoidable variable so the only challenge is the exam itself.',
    body: [
      'Lay out your passport and confirmation the night before. ID issues are the single most common reason candidates are turned away.',
      'Eat a real breakfast and arrive 30 minutes early. Check-in, lockers and verification take time, and rushing spikes your stress before you even sit down.',
      'Leave your phone and smartwatch at home or expect to lock them away. The room is device-free, no exceptions.',
      'Build in buffer for transit and parking. Know which centre you are booked at — CELPIP at North York or Mississauga, CFA at Mississauga.',
      'Once you are checked in, the room does the rest. That is the whole point of testing with us.',
    ],
  },
];

function GuidesPage({ go, openQuiz }) {
  const [active, setActive] = useF(null);
  const guide = GUIDES.find(g => g.id === active);

  if (guide) {
    return (
      <main className="page">
        <article className="guide-article">
          <div className="container" style={{ maxWidth: 760 }}>
            <button className="wiz-back" onClick={() => setActive(null)} style={{ marginBottom: 28 }}>← All guides</button>
            <div className="guide-tag">{guide.tag} · {guide.read} read</div>
            <h1 className="serif">{guide.title}</h1>
            {guide.body.map((p, i) => <p key={i} className="guide-p">{p}</p>)}
            <div className="guide-cta">
              <h3 className="serif">Ready to put a plan behind it?</h3>
              <div className="actions">
                <button className="btn" onClick={openQuiz}>Estimate my study time <span className="arrow" /></button>
                <a className="btn ghost" href="#contact" onClick={e => { e.preventDefault(); go('contact'); }}>Talk to a tutor</a>
              </div>
            </div>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero" style={{ paddingBottom: 40 }}>
        <div className="container">
          <div className="eyebrow reveal">Guides</div>
          <h1 className="serif reveal" style={{ fontSize: 'clamp(46px, 6vw, 84px)', margin: '16px 0 18px', fontWeight: 420, lineHeight: 1.0, letterSpacing: '-0.03em', transitionDelay: '60ms' }}>
            Plain-English answers to the questions candidates actually ask.
          </h1>
          <p className="lead reveal" style={{ maxWidth: 680, transitionDelay: '120ms' }}>
            Short, practical reads on choosing, preparing for, and sitting CELPIP and CFA — written by the people who run the room.
          </p>
        </div>
      </section>
      <section className="block" style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="guides-grid">
            {GUIDES.map((g, i) => (
              <button className="guide-card reveal" key={g.id} style={{ transitionDelay: (i % 2) * 80 + 'ms' }} onClick={() => { setActive(g.id); window.scrollTo({ top: 0 }); }}>
                <div className="guide-card-tag">{g.tag} · {g.read}</div>
                <h3 className="serif">{g.title}</h3>
                <p>{g.excerpt}</p>
                <span className="link">Read guide <span className="arrow" /></span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

Object.assign(window, {
  TR, t, LangToggle, GoogleBadge, Stars, ExamWizard, Countdown, SeatAlert,
  DiagnosticQuiz, ExamDayChecklist, CentreGallery, CallFab, GuidesPage, AvailabilitySection, SESSIONS, SectionNav,
});

/* ─────────────────────────────────────────────
   Sticky section sub-nav with scroll-spy
───────────────────────────────────────────── */
function SectionNav({ items }) {
  const [active, setActive] = useF(items[0] ? items[0].id : '');
  useFE(() => {
    const onScroll = () => {
      const probe = window.scrollY + 150;
      let cur = items[0] ? items[0].id : '';
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= probe) cur = it.id;
        }
      }
      setActive(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [items]);
  const jump = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 104;
    try { window.scrollTo({ top, behavior: 'smooth' }); }
    catch (_) { window.scrollTo(0, top); }
    // Failsafe: if smooth scroll doesn't engage (throttled/unsupported), land anyway
    setTimeout(() => { if (Math.abs(window.scrollY - top) > 80) window.scrollTo(0, top); }, 600);
  };
  return (
    <div className="section-nav">
      <div className="container section-nav-inner">
        <span className="section-nav-label">On this page</span>
        <div className="section-nav-links">
          {items.map(it => (
            <button key={it.id} className={active === it.id ? 'active' : ''} onClick={() => jump(it.id)}>{it.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
