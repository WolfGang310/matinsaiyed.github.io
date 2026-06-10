// Contact page — working form with validation
const { useState: useStateC } = React;

/* The form endpoint lives in config.js (owner-editable, no rebuild needed).
   Left blank there, the form composes an email in the visitor's mail client
   instead — so the contact form delivers a message out of the box. */
const FORM_ENDPOINT = (window.TROY_CONFIG || {}).FORM_ENDPOINT || "";

function buildMailto(form) {
  const subject = `Website enquiry — ${form.interest || 'General'}`;
  const body = [
    `Name: ${form.name}`,
    `Email: ${form.email}`,
    form.phone && `Phone: ${form.phone}`,
    `Interest: ${form.interest}`,
    form.center && `Preferred centre: ${form.center}`,
    form.targetDate && `Target test date: ${form.targetDate}`,
    form.level && `Current level: ${form.level}`,
    '', form.message,
  ].filter(v => v !== false && v !== undefined).join('\n');
  return `mailto:hello@troytesting.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function ContactPage({ go, lang = 'en' }) {
  const [form, setForm] = useStateC({
    name: '', email: '', phone: '', interest: '', center: '', targetDate: '', level: '', message: '', company: ''
  });
  const [errors, setErrors] = useStateC({});
  const [submitted, setSubmitted] = useStateC(false);
  const [status, setStatus] = useStateC('idle'); // idle | submitting | error

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = t(lang, 'contact.err.name');
    if (!form.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) errs.email = t(lang, 'contact.err.email');
    if (!form.interest) errs.interest = t(lang, 'contact.err.interest');
    if (!form.message.trim() || form.message.length < 10) errs.message = t(lang, 'contact.err.message');
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const first = ['name', 'email', 'interest', 'message'].find(k => errs[k]);
      if (first) setTimeout(() => { const el = document.getElementById('cf-' + first); if (el) el.focus(); }, 0);
      return;
    }

    // Honeypot: real users never see or fill the hidden "company" field.
    if (form.company) { setSubmitted(true); return; }

    // No endpoint configured → fall back to the visitor's email client so the message still gets sent.
    if (!FORM_ENDPOINT) { window.location.href = buildMailto(form); setSubmitted(true); return; }

    setStatus('submitting');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'company') fd.append(k, v); });
      const res = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: fd });
      if (res.ok) { setStatus('idle'); setSubmitted(true); }
      else { setStatus('error'); }
    } catch (_) { setStatus('error'); }
  };

  if (submitted) {
    return (
      <main className="page">
        <section className="block" style={{ padding: '120px 0' }}>
          <div className="container" style={{ maxWidth: 680, textAlign: 'center' }}>
            <div className="eyebrow" style={{ color: 'var(--accent)' }}>{t(lang, 'contact.ok.eyebrow')}</div>
            <h1 className="serif" style={{ fontFamily: 'var(--font-serif)', fontSize: 60, fontWeight: 420, letterSpacing: '-0.03em', lineHeight: 1.04, margin: '16px 0 20px' }}>
              {t(lang, 'contact.ok.title.a')} <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{form.name.split(' ')[0]}</em>{t(lang, 'contact.ok.title.b')}
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: 17 }}>
              {t(lang, 'contact.ok.hurry')} <a href="tel:+14372640311" style={{ color: 'var(--accent)' }}>+1 437 264 0311</a>
              {' '}{t(lang, 'contact.ok.hurry2')}
            </p>
            <div style={{ marginTop: 36, display: 'inline-flex', gap: 12 }}>
              <a className="btn" href="#home" onClick={e => { e.preventDefault(); go('home'); }}>
                {t(lang, 'contact.ok.back')} <span className="arrow" />
              </a>
              <a className="btn ghost" href="#test-center" onClick={e => { e.preventDefault(); go('test-center'); }}>
                {t(lang, 'contact.ok.browse')}
              </a>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero" style={{ paddingBottom: 48 }}>
        <div className="container">
          <div className="eyebrow">{t(lang, 'contact.eyebrow')}</div>
          <h1 className="serif" style={{ fontSize: 'clamp(46px, 6vw, 84px)', margin: '16px 0 20px', fontWeight: 420, lineHeight: 1.0, letterSpacing: '-0.03em', maxWidth: 1000 }}>
            {t(lang, 'contact.title.a')} <em style={{ fontStyle: 'normal', color: 'var(--accent)' }}>{t(lang, 'contact.title.em')}</em>.
          </h1>
          <p className="lead" style={{ maxWidth: 680 }}>
            {t(lang, 'contact.lead')}
          </p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="grid-2">
            <form className="form" onSubmit={submit} noValidate>
              <div className={`field ${errors.name ? 'error' : ''}`}>
                <label htmlFor="cf-name">{t(lang, 'contact.f.name')}</label>
                <input id="cf-name" type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Priya Ramaswamy" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'cf-name-err' : undefined} />
                <div className="err" id="cf-name-err">{errors.name}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className={`field ${errors.email ? 'error' : ''}`}>
                  <label htmlFor="cf-email">{t(lang, 'contact.f.email')}</label>
                  <input id="cf-email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'cf-email-err' : undefined} />
                  <div className="err" id="cf-email-err">{errors.email}</div>
                </div>
                <div className="field">
                  <label htmlFor="cf-phone">{t(lang, 'contact.f.phone')}</label>
                  <input id="cf-phone" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 416 ..." />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className={`field ${errors.interest ? 'error' : ''}`}>
                  <label htmlFor="cf-interest">{t(lang, 'contact.f.interest')}</label>
                  <select id="cf-interest" value={form.interest} onChange={e => set('interest', e.target.value)} aria-invalid={!!errors.interest} aria-describedby={errors.interest ? 'cf-interest-err' : undefined}>
                  <option value="">{t(lang, 'contact.opt.select')}</option>
                  <option value="CELPIP · help with Paragon booking">{t(lang, 'contact.opt.celpipBook')}</option>
                  <option value="CELPIP · prep program">{t(lang, 'contact.opt.celpipPrep')}</option>
                  <option value="CFA · help with Prometric booking">{t(lang, 'contact.opt.cfaBook')}</option>
                  <option value="CFA · prep program">{t(lang, 'contact.opt.cfaPrep')}</option>
                  <option value="Something else">{t(lang, 'contact.opt.other')}</option>
                  </select>
                  <div className="err" id="cf-interest-err">{errors.interest}</div>
                </div>
                <div className="field">
                  <label htmlFor="cf-center">{t(lang, 'contact.f.center')}</label>
                  <select id="cf-center" value={form.center} onChange={e => set('center', e.target.value)}>
                    <option value="">{t(lang, 'contact.opt.noPref')}</option>
                    <option value="Toronto · North York">Toronto · North York</option>
                    <option value="Mississauga">Mississauga</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="field">
                  <label htmlFor="cf-date">{t(lang, 'contact.f.date')}</label>
                  <input id="cf-date" type="date" value={form.targetDate} onChange={e => set('targetDate', e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="cf-level">{t(lang, 'contact.f.level')}</label>
                  <select id="cf-level" value={form.level} onChange={e => set('level', e.target.value)}>
                    <option value="">{t(lang, 'contact.opt.select')}</option>
                    <option value="Just starting out">{t(lang, 'contact.opt.l0')}</option>
                    <option value="CELPIP band 5–6 / CFA new to finance">{t(lang, 'contact.opt.l1')}</option>
                    <option value="CELPIP band 7–8 / CFA some background">{t(lang, 'contact.opt.l2')}</option>
                    <option value="CELPIP band 9+ / finance professional">{t(lang, 'contact.opt.l3')}</option>
                  </select>
                </div>
              </div>
              <div className={`field ${errors.message ? 'error' : ''}`}>
                <label htmlFor="cf-message">{t(lang, 'contact.f.more')}</label>
                <textarea id="cf-message" value={form.message} onChange={e => set('message', e.target.value)}
                  placeholder={t(lang, 'contact.ph.message')}
                  aria-invalid={!!errors.message} aria-describedby={errors.message ? 'cf-message-err' : undefined}
                />
                <div className="err" id="cf-message-err">{errors.message}</div>
              </div>
              {/* Honeypot anti-spam field — visually hidden, ignored by humans, often filled by bots */}
              <input type="text" name="company" tabIndex="-1" autoComplete="off" aria-hidden="true"
                value={form.company} onChange={e => set('company', e.target.value)}
                style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }} />
              <div>
                <button type="submit" className="btn" disabled={status === 'submitting'}>
                  {status === 'submitting' ? t(lang, 'contact.sending') : <>{t(lang, 'contact.send')} <span className="arrow" /></>}
                </button>
                {status === 'error' && (
                  <p role="alert" style={{ marginTop: 14, fontSize: 14, color: 'var(--danger)' }}>
                    {t(lang, 'contact.err.send')} <a href={buildMailto(form)} style={{ color: 'var(--accent)', textDecoration: 'underline' }}>{t(lang, 'contact.err.emailUs')}</a>
                  </p>
                )}
                <p className="consent-note">
                  {t(lang, 'contact.consent')}{' '}
                  <a href="#privacy" onClick={e => { e.preventDefault(); go('privacy'); }}>{t(lang, 'foot.privacy')}</a>
                </p>
              </div>
            </form>

            <aside>
              <div className="eyebrow">{t(lang, 'contact.aside.reach')}</div>
              <div style={{ marginTop: 16, borderTop: '1px solid var(--rule-soft)' }}>
                {[
                  [t(lang, 'contact.aside.phone'), '+1 437 264 0311', 'tel:+14372640311'],
                  [t(lang, 'contact.aside.email'), 'hello@troytesting.com', 'mailto:hello@troytesting.com'],
                  [t(lang, 'contact.aside.hours'), t(lang, 'contact.aside.hoursV'), null],
                  [t(lang, 'contact.aside.closed'), t(lang, 'contact.aside.closedV'), null],
                ].map(([k, v, href], i) => (
                  <div key={i} style={{ padding: '18px 0', borderBottom: '1px solid var(--rule-soft)', display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', gap: 16 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--muted)' }}>{k}</div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 22, letterSpacing: '-0.015em' }}>
                      {href ? <a href={href} style={{ transition: 'color .2s' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = ''}>{v}</a> : v}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 36, padding: 24, background: 'var(--surface)', border: '1px solid var(--rule-soft)', borderRadius: 4 }}>
                <div className="eyebrow" style={{ color: 'var(--accent)' }}>{t(lang, 'contact.aside.tip')}</div>
                <p style={{ fontFamily: 'var(--font-serif)', fontSize: 20, lineHeight: 1.35, letterSpacing: '-0.01em', margin: '8px 0 0' }}>
                  {t(lang, 'contact.aside.tipBody')}
                </p>
                <a className="link" href="#test-center" onClick={e => { e.preventDefault(); go('test-center'); }}
                  style={{ display: 'inline-flex', marginTop: 16, gap: 8, alignItems: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                  {t(lang, 'contact.aside.goto')} <span className="arrow" style={{ width: 12, height: 8, display: 'inline-block', position: 'relative' }} />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

window.ContactPage = ContactPage;
