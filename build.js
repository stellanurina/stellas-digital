// Builds the bilingual stellas.digital site from content.json.
// English pages go to dist/, Bahasa Indonesia pages to dist/id/.
// Run with `npm run build`. No dependencies: plain Node.js 18+.
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
// Only this site's own files may run; fonts come from Google Fonts. No inline scripts allowed.
const CSP = "default-src 'self'; script-src 'self' https://*.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com; connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests";
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'content.json'), 'utf8'));
const P = C.prices;

// ---------- helpers ----------
// A non-breaking space keeps "Rp" and the amount on one line.
const rupiah = n => 'Rp\u00a0' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Values calculated from prices, so they can never drift out of date.
const DERIVED = {
  regular: P.business + P.sellSetup,
  saving: (P.sell + P.basicCare) - P.bundleMonthly
};

function fill(str) {
  return str
    .replace(/\{p:(\w+)\}/g, (m, k) => {
      if (!(k in P)) throw new Error(`Unknown price "${k}" in: ${str}`);
      return rupiah(P[k]);
    })
    .replace(/\{(regular|saving)\}/g, (m, k) => rupiah(DERIVED[k]));
}

function check(items) {
  return '<ul class="checks">' + items.map(i => `<li>${i}</li>`).join('') + '</ul>';
}

const ICONS = {
  website: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 8h18M8 21h8M12 18v3"/>',
  chat: '<path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/><path d="M9 10h6M9 13.5h4"/>',
  shield: '<path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;


// ---------- one language ----------
function build(lang) {
  const ID = lang === 'id';
  // t() picks the language from an {en, id} pair (or passes plain strings through) and fills prices.
  const t = v => fill(v && typeof v === 'object' ? v[lang] : v);
  const L = C.labels;
  const S = C.site;
  // Bahasa Indonesia is the main site at the root; English lives in /en/.
  const outDir = ID ? DIST : path.join(DIST, 'en');
  fs.mkdirSync(outDir, { recursive: true });
  const asset = ID ? '' : '../';
  const WA = `https://wa.me/${S.whatsapp}?text=` + encodeURIComponent(t(S.waMessage));
  const waBtn = t(L.waButton);
  const mo = t(L.perMonth);
  const logo = `<img src="${asset}images/logo.webp" alt="stellas.digital" width="112" height="32">`;

  const url = (lg, f) => S.url + (lg === 'en' ? '/en/' : '/') + (f === 'index.html' ? '' : f);
  const otherHref = f => (ID ? 'en/' : '../') + f;

  const header = fname => {
    const nav = [['pricing.html', L.nav.pricing], ['work.html', L.nav.work], ['about.html', L.nav.about], ['contact.html', L.nav.contact]]
      .map(([f, lbl]) => `<li><a href="${f}"${f === fname ? ' aria-current="page"' : ''}>${t(lbl)}</a></li>`).join('');
    const sw = ID
      ? `<span aria-current="true">ID</span><a href="${otherHref(fname)}" hreflang="en" lang="en" aria-label="English version">EN</a>`
      : `<a href="${otherHref(fname)}" hreflang="id" lang="id" aria-label="Versi Bahasa Indonesia">ID</a><span aria-current="true">EN</span>`;
    return `<header class="site-header">
  <nav class="wrap nav" aria-label="${t(L.nav.main)}">
    <a class="brand" href="index.html">${logo}</a>
    <div class="nav-right">
      <ul class="nav-links" id="nav-links">
        ${nav}
        <li><a class="btn btn-primary" href="${WA}" target="_blank" rel="noopener">${waBtn}</a></li>
      </ul>
      <div class="lang-switch">${sw}</div>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="${t(L.nav.openMenu)}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
    </div>
  </nav>
</header>`;
  };

  const footer = `<footer class="site-footer">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="brand" href="index.html">${logo}</a>
        <p style="margin-top:14px;max-width:38ch">${t(L.footerTagline)}</p>
      </div>
      <div>
        <h4>${t(L.footerPages)}</h4>
        <ul>
          <li><a href="pricing.html">${t(L.nav.pricing)}</a></li>
          <li><a href="work.html">${t(L.nav.work)}</a></li>
          <li><a href="about.html">${t(L.nav.about)}</a></li>
          <li><a href="contact.html">${t(L.nav.contact)}</a></li>
        </ul>
      </div>
      <div>
        <h4>${t(L.nav.contact)}</h4>
        <ul>
          <li><a href="${WA}" target="_blank" rel="noopener">WhatsApp ${S.whatsappDisplay}</a></li>
          <li><a href="mailto:${S.email}">${S.email}</a></li>
          <li><a href="https://www.instagram.com/${S.instagram}/" target="_blank" rel="noopener">Instagram @${S.instagram}</a></li>
          <li>${t(S.address)}</li>
          <li>${t(S.hours)}</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${S.year} ${S.legalName} · ${t(S.address)} · ${S.whatsappDisplay}</span>
      <span>${t(L.footerTech)} <a href="https://stellas.tech" style="color:var(--accent)">stellas.tech</a></span>
    </div>
  </div>
</footer>`;

  const cta = `<section>
  <div class="wrap">
    <div class="cta">
      <div>
        <h2>${t(L.cta.title)}</h2>
        <p>${t(L.cta.text)}</p>
      </div>
      <a class="btn btn-star" href="${WA}" target="_blank" rel="noopener">${waBtn}</a>
    </div>
  </div>
</section>`;

  // Chat data for this language, written into every page for chat.js.
  const chatData = {
    whatsapp: S.whatsapp,
    waMessage: t(S.waMessage),
    greeting: t(C.chat.greeting),
    fallback: t(C.chat.fallback),
    chips: C.chat.chips.map(c => ({ label: t(c.label), query: c.query })),
    answers: C.chat.answers.map(a => ({
      keywords: a.keywords,
      answer: t(a.answer),
      links: a.links ? a.links.map(l => ({ href: l.href, label: t(l.label) })) : undefined,
      whatsapp: !!a.whatsapp
    }))
  };
  // Written to its own file so the security policy can block all inline scripts.
  fs.writeFileSync(path.join(outDir, 'chat-data.js'), `window.STELLAS_CHAT=${JSON.stringify(chatData).replace(/</g, '\\u003c')};\n`);
  const chatScript = `<script src="chat-data.js"></script>`;
// GA setup in its own file, so the security policy can stay strict
if (S.gaId) {
  fs.writeFileSync(path.join(outDir, 'ga.js'),
    `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(S.gaId)});`);
}
${S.gaId ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${S.gaId}"></script>
<script src="ga.js"></script>` : ''}
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${S.gaId}');
</script>` : ''}
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(t(meta.title))}</title>
<meta name="description" content="${esc(t(meta.description))}">
<link rel="canonical" href="${url(lang, fname)}">
<link rel="alternate" hreflang="en" href="${url('en', fname)}">
<link rel="alternate" hreflang="id" href="${url('id', fname)}">
<link rel="alternate" hreflang="x-default" href="${url('id', fname)}">
<link rel="icon" href="${asset}favicon.svg" type="image/svg+xml">
<link rel="icon" href="${asset}images/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="${asset}images/favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="${asset}images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${asset}styles.css">
</head>
<body>
${header(fname)}
<main>
${body}
</main>
${footer}
<script src="${asset}script.js"></script>
${chatScript}
<script src="${asset}chat.js" defer></script>
</body>
</html>
`;
    fs.writeFileSync(path.join(outDir, fname), html);
  }

  const plan = (p, priceHtml, sub) => {
    const btn = p.featured ? 'btn-primary' : 'btn-ghost';
    const badge = p.featured ? `<span class="badge">${t(p.badge)}</span>` : '';
    return `<article class="plan${p.featured ? ' featured' : ''}">${badge}
  <div class="plan-head"><h3>${p.name}</h3><p>${t(p.blurb)}</p></div>
  <div><div class="price">${priceHtml}</div><div class="price-sub">${sub}</div></div>
  ${check(p.features.map(t))}
  <a class="btn ${btn}" href="contact.html">${t(L.choose)} ${p.name}</a>
</article>`;
  };

  // ---------- HOME ----------
  const H = C.pages.home;
  const home = `<section class="hero">
  <div class="wrap hero-grid">
    <div class="hero-copy">
      <span class="pill">${t(H.pill)}</span>
      <h1>${t(H.headline)}</h1>
      <p class="lede">${t(H.lede)}</p>
      <div class="btn-row">
        <a class="btn btn-primary" href="${WA}" target="_blank" rel="noopener">${t(H.primaryCta)}</a>
        <a class="btn btn-ghost" href="pricing.html">${t(H.secondaryCta)}</a>
      </div>
      <div class="trust">${H.trust.map(x => `<span>${t(x)}</span>`).join('')}</div>
    </div>
    <div class="chat" role="img" aria-label="${esc(t(H.demo.label))}">
      <div class="chat-top"><div class="avatar">${H.demo.initials}</div><div><strong>${H.demo.business}</strong><small>${t(H.demo.status)}</small></div></div>
      <div class="chat-body">
        ${H.demo.messages.map(m => `<div class="bubble ${m.from === 'customer' ? 'out' : 'in'}">${m.text}<time>${m.time}</time></div>`).join('\n        ')}
      </div>
      <p class="chat-note">${t(H.demo.note)}</p>
    </div>
  </div>
</section>

<div class="wrap clients">
  <span class="clients-label">${t(H.clientsLabel)}</span>
  ${C.cases.map(c => `<a href="work.html#${c.slug}">${c.name}</a>`).join('\n  ')}
</div>

<section class="band">
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${t(H.servicesEyebrow)}</span>
      <h2>${t(H.servicesTitle)}</h2>
      <p class="lede">${t(H.servicesLede)}</p>
    </div>
    <div class="grid-3">
      ${H.services.map(s => `<div class="service">
        ${icon(s.icon)}
        <h3>${t(s.title)}</h3>
        <p class="muted">${t(s.text)}</p>
        <p class="price-from num">${t(L.from)} ${rupiah(P[s.fromPrice])}${s.monthly ? mo : ''}</p>
      </div>`).join('\n      ')}
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="section-head">
      <span class="eyebrow">${t(H.stepsEyebrow)}</span>
      <h2>${t(H.stepsTitle)}</h2>
    </div>
    <ol class="steps">
      ${C.steps.map(s => `<li><span class="day">${t(s.day)}</span><h3>${t(s.title)}</h3><p class="muted">${t(s.text)}</p></li>`).join('\n      ')}
    </ol>
  </div>
</section>
${cta}`;
  page('index.html', H, home);

  // ---------- PRICING ----------
  const PR = C.pages.pricing;
  const B = C.bundle;
  const groupHead = g => `<div class="plan-group-head">
        <div><span class="eyebrow">${t(g.eyebrow)}</span><h2 style="margin-top:8px">${t(g.title)}</h2></div>
        <p>${t(g.note)}</p>
      </div>`;
  const bundleMonthly = t(B.monthly) + (DERIVED.saving > 0 ? ' ' + t(B.saving) : '');
  const pricing = `<div class="wrap page-head">
  <span class="eyebrow">${t(PR.eyebrow)}</span>
  <h1>${t(PR.headline)}</h1>
  <p class="lede">${t(PR.lede)}</p>
</div>

<section style="padding-top:40px">
  <div class="wrap">
    <div class="plan-group">
      ${groupHead(PR.websites)}
      <div class="plans">
        ${C.websitePlans.map(p => plan(p, rupiah(P[p.price]), t(L.oneTime))).join('\n        ')}
      </div>
    </div>

    <div class="plan-group">
      ${groupHead(PR.assistants)}
      <div class="plans">
        ${C.assistantPlans.map(p => plan(p, `${p.fromPrice ? `<small>${t(L.from)}</small> ` : ''}${rupiah(P[p.price])}<small>${mo}</small>`, `+ ${p.fromPrice ? t(L.from).toLowerCase() + ' ' : ''}${rupiah(P[p.setup])} ${t(L.setup)}`)).join('\n        ')}
      </div>
    </div>

    <div class="plan-group">
      ${groupHead(PR.care)}
      <div class="care">
        ${C.carePlans.map(c => `<div class="care-card"><div class="care-top"><strong>${c.name}</strong><span>${rupiah(P[c.price])}${mo}</span></div>${c.yearly ? `<p class="care-yearly num">${t(L.orYearly).replace('{x}', rupiah(P[c.yearly]))}</p>` : ''}${check(c.features.map(t))}</div>`).join('\n        ')}
      </div>
      <div class="bundle">
        <div style="display:flex;flex-direction:column;gap:12px">
          <span class="eyebrow">${t(B.eyebrow)}</span>
          <h2>${t(B.title)}</h2>
          <p>${bundleMonthly}</p>
        </div>
        <div style="display:flex;flex-direction:column;gap:16px">
          <div class="price">${rupiah(P.bundle)} <small>${t(L.oneTime)}</small></div>
          <p class="num">${t(B.instead)}</p>
          <a class="btn btn-star" href="contact.html">${t(B.button)}</a>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap grid-2" style="align-items:start">
    <div class="section-head" style="margin:0"><span class="eyebrow">FAQ</span><h2>${t(PR.faqTitle)}</h2></div>
    <div class="faq">
      ${C.faq.map(f => `<details><summary>${t(f.q)}</summary><p>${t(f.a)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>
${cta}`;
  page('pricing.html', PR, pricing);

  // ---------- WORK ----------
  const W = C.pages.work;
  const caseHtml = c => `<article class="case" id="${c.slug}">
  <div class="case-head">
    <span class="tag">${t(c.tag)}</span>
    <h2>${c.name}</h2>
    <a class="case-link" href="https://${c.domain}" target="_blank" rel="noopener">${c.domain} ↗</a>
  </div>
  <figure class="case-shot">
    <div class="browser-bar" aria-hidden="true"><span></span><span></span><span></span><em>${c.domain}</em></div>
    <img src="${asset}images/work/${c.slug}.webp" alt="${esc(t(W.shotAlt))} ${esc(c.name)}" width="800" height="500" loading="lazy">
  </figure>
  <div class="case-body">
    <p class="lede" style="color:var(--ink)">${t(c.summary)}</p>
    <div class="case-cols">
      <div><h3>${t(W.did)}</h3>${check(c.did.map(t))}</div>
      <div class="case-side">
        <div><h3>${t(W.result)}</h3><p class="muted">${t(c.result)}</p>${c.note ? `<p class="case-note">${t(c.note)}</p>` : ''}</div>
        <div><h3>${t(W.timeline)}</h3><p class="muted num">${t(c.timeline)}</p></div>
      </div>
    </div>
  </div>
</article>`;
  const work = `<div class="wrap page-head">
  <span class="eyebrow">${t(W.eyebrow)}</span>
  <h1>${t(W.headline)}</h1>
  <p class="lede">${t(W.lede)}</p>
</div>
<section style="padding-top:40px">
  <div class="wrap cases">
    ${C.cases.map(caseHtml).join('\n\n    ')}
  </div>
</section>
<section class="band">
  <div class="wrap" style="display:flex;flex-direction:column;gap:14px;max-width:760px">
    <span class="eyebrow">${t(W.nextEyebrow)}</span>
    <h2>${t(W.nextTitle)}</h2>
    <p class="lede">${t(W.nextText)}</p>
    <div class="btn-row" style="margin-top:8px"><a class="btn btn-primary" href="${WA}" target="_blank" rel="noopener">${waBtn}</a></div>
  </div>
</section>`;
  page('work.html', W, work);

  // ---------- ABOUT ----------
  const A = C.pages.about;
  const about = `<div class="wrap page-head">
  <span class="eyebrow">${t(A.eyebrow)}</span>
  <h1>${t(A.headline)}</h1>
</div>
<section style="padding-top:40px">
  <div class="wrap about-grid">
    <img class="portrait" src="${asset}images/stella.webp" alt="${esc(t(A.photoLabel))}" width="800" height="1000">
    <div class="prose">
      <p class="lede" style="color:var(--ink)">${t(A.lede)}</p>
      ${A.paragraphs.map(p => `<p class="muted">${t(p)}</p>`).join('\n      ')}
      <p><a href="work.html">${t(A.workLink)}</a></p>
    </div>
  </div>
</section>
<section class="band">
  <div class="wrap">
    <div class="section-head"><span class="eyebrow">${t(A.valuesEyebrow)}</span><h2>${t(A.valuesTitle)}</h2></div>
    <div class="values">
      ${A.values.map(v => `<div class="service"><h3>${t(v.title)}</h3><p class="muted">${t(v.text)}</p></div>`).join('\n      ')}
    </div>
  </div>
</section>
${cta}`;
  page('about.html', A, about);

  // ---------- CONTACT ----------
  const K = C.pages.contact;
  const contact = `<div class="wrap page-head">
  <span class="eyebrow">${t(K.eyebrow)}</span>
  <h1>${t(K.headline)}</h1>
  <p class="lede">${t(K.lede)}</p>
</div>
<section style="padding-top:40px">
  <div class="wrap contact-grid">
    <form class="wa-card" id="wa-form" data-wa="${S.whatsapp}">
      <h3>${t(K.formTitle)}</h3>
      <p class="muted" style="font-size:.95rem">${t(K.formNote)}</p>
      <div class="field"><label for="f-name">${t(K.name)}</label><input id="f-name" name="name" type="text" autocomplete="name" required></div>
      <div class="field"><label for="f-business">${t(K.business)}</label><input id="f-business" name="business" type="text" autocomplete="organization"></div>
      <div class="field"><label for="f-interest">${t(K.interest)}</label>
        <select id="f-interest" name="interest">${K.options.map(o => `<option>${t(o)}</option>`).join('')}</select>
      </div>
      <div class="field"><label for="f-message">${t(K.message)}</label><textarea id="f-message" name="message"></textarea></div>
      <button class="btn btn-primary" type="submit">${t(K.submit)}</button>
    </form>
    <div>
      <ul class="contact-list">
        <li><span>WhatsApp</span><strong><a href="${WA}" target="_blank" rel="noopener">${S.whatsappDisplay}</a></strong></li>
        <li><span>Email</span><strong><a href="mailto:${S.email}">${S.email}</a></strong></li>
        <li><span>Instagram</span><strong><a href="https://www.instagram.com/${S.instagram}/" target="_blank" rel="noopener">@${S.instagram}</a></strong></li>
        <li><span>${t(K.office)}</span><strong>${t(S.address)}</strong></li>
        <li><span>${t(K.hoursLabel)}</span><strong>${t(S.hours)}</strong></li>
      </ul>
    </div>
  </div>
</section>`;
  page('contact.html', K, contact);
}

// ---------- run ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.cpSync(SRC, DIST, { recursive: true });
build('id');
build('en');

// ---------- robots, sitemap, security contact, 404 ----------
const PAGES = ['index.html', 'pricing.html', 'work.html', 'about.html', 'contact.html'];
const pageUrl = (lg, f) => C.site.url + (lg === 'en' ? '/en/' : '/') + (f === 'index.html' ? '' : f);
const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${C.site.url}/sitemap.xml\n`);
fs.writeFileSync(path.join(DIST, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
  PAGES.flatMap(f => ['id', 'en'].map(lg => `  <url><loc>${pageUrl(lg, f)}</loc><lastmod>${today}</lastmod>` +
    `<xhtml:link rel="alternate" hreflang="id" href="${pageUrl('id', f)}"/><xhtml:link rel="alternate" hreflang="en" href="${pageUrl('en', f)}"/></url>`)).join('\n') +
  '\n</urlset>\n');
const expires = new Date(Date.now() + 365 * 864e5).toISOString().replace(/\.\d+Z$/, 'Z');
fs.mkdirSync(path.join(DIST, '.well-known'), { recursive: true });
fs.writeFileSync(path.join(DIST, '.well-known', 'security.txt'),
  `Contact: mailto:${C.site.email}\nExpires: ${expires}\nPreferred-Languages: id, en\nCanonical: ${C.site.url}/.well-known/security.txt\n`);
fs.writeFileSync(path.join(DIST, '404.html'), `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="robots" content="noindex">
<title>Halaman tidak ditemukan · stellas.digital</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/styles.css">
</head>
<body>
<main class="wrap" style="padding-block:96px;display:flex;flex-direction:column;gap:18px;max-width:640px">
  <a class="brand" href="/"><img src="/images/logo.webp" alt="stellas.digital" width="112" height="32"></a>
  <h1>Halaman tidak ditemukan</h1>
  <p class="lede">Halaman yang Anda cari tidak ada atau sudah dipindahkan. <span lang="en">This page doesn't exist or has moved.</span></p>
  <div class="btn-row"><a class="btn btn-primary" href="/">Kembali ke beranda</a><a class="btn btn-ghost" href="/en/" lang="en">English site</a></div>
</main>
</body>
</html>
`);

// Catch typos: every case study needs a screenshot.
for (const c of C.cases) {
  if (!fs.existsSync(path.join(SRC, 'images', 'work', c.slug + '.webp'))) {
    console.warn(`Warning: no screenshot at src/images/work/${c.slug}.webp`);
  }
}
if (DERIVED.saving <= 0) {
  console.log('Note: the bundle has no monthly saving, so the pricing page does not claim one.');
}
console.log('Built dist/ (Bahasa Indonesia) and dist/en/ (English).');
