// Stellas assistant: a floating chat that answers common questions instantly
// and hands visitors over to Stella on WhatsApp. Runs fully in the browser,
// so it works on any static host with no server or API key.
(function () {
  // Answers, quick topics and the WhatsApp number come from content.json.
  // The build step writes them into each page as window.STELLAS_CHAT.
  var D = window.STELLAS_CHAT;
  if (!D) return;
  var ID = document.documentElement.lang === 'id';
  var WA = 'https://wa.me/' + D.whatsapp + '?text=';
  function t(en, id) { return ID ? id : en; }
  function wa(msg) { return WA + encodeURIComponent(msg); }

  var KB = D.answers.map(function (e) {
    return { k: e.keywords, a: e.answer, wa: !!e.whatsapp,
             l: e.links ? e.links.map(function (l) { return { h: l.href, x: l.label }; }) : null };
  });
  var CHIPS = D.chips.map(function (c) { return { x: c.label, q: c.query }; });

  function match(text) {
    var s = text.toLowerCase();
    var best = null, score = 0;
    KB.forEach(function (e) {
      var n = 0;
      e.k.forEach(function (k) {
        // whole-word match, so "ai" does not fire on "Bali" or "detail"
        var re = new RegExp('(^|[^a-z])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)');
        if (re.test(s)) n += k.length > 4 ? 2 : 1;
      });
      if (n > score) { score = n; best = e; }
    });
    return best;
  }

  // ---- UI ----
  var root = document.createElement('div');
  root.className = 'sa';
  root.innerHTML =
    '<div class="sa-panel" id="sa-panel" role="dialog" aria-label="' + t('Stellas assistant', 'Asisten Stellas') + '" hidden>' +
      '<div class="sa-head"><div class="sa-avatar" aria-hidden="true">S</div>' +
        '<div class="sa-title"><strong>' + t('Stellas assistant', 'Asisten Stellas') + '</strong>' +
        '<small>' + t('Instant answers · Stella on WhatsApp', 'Jawaban instan · Stella di WhatsApp') + '</small></div>' +
        '<button type="button" class="sa-close" aria-label="' + t('Close chat', 'Tutup chat') + '">×</button></div>' +
      '<div class="sa-log" aria-live="polite"></div>' +
      '<div class="sa-chips"></div>' +
      '<form class="sa-form"><label class="sa-sr" for="sa-input">' + t('Your question', 'Pertanyaan Anda') + '</label>' +
        '<input id="sa-input" type="text" autocomplete="off" placeholder="' + t('Ask about prices, timing…', 'Tanya soal harga, waktu…') + '">' +
        '<button type="submit" aria-label="' + t('Send', 'Kirim') + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>' +
    '</div>' +
    '<button type="button" class="sa-fab" aria-controls="sa-panel" aria-expanded="false" aria-label="' + t('Open chat', 'Buka chat') + '">' +
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l1-4.1A8 8 0 1 1 20 12z"/><path d="M9 10h6M9 13.5h4"/></svg>' +
      '<span class="sa-dot" aria-hidden="true">1</span></button>';
  document.body.appendChild(root);

  var panel = root.querySelector('.sa-panel');
  var fab = root.querySelector('.sa-fab');
  var log = root.querySelector('.sa-log');
  var chips = root.querySelector('.sa-chips');
  var form = root.querySelector('.sa-form');
  var input = root.querySelector('#sa-input');
  var dot = root.querySelector('.sa-dot');
  var started = false;

  function bubble(who, text, links, showWa, lastQ) {
    var b = document.createElement('div');
    b.className = 'sa-msg ' + who;
    var p = document.createElement('p');
    p.textContent = text;
    b.appendChild(p);
    if (links || showWa) {
      var row = document.createElement('div');
      row.className = 'sa-links';
      (links || []).forEach(function (l) {
        var a = document.createElement('a'); a.href = l.h; a.textContent = l.x; row.appendChild(a);
      });
      if (showWa) {
        var w = document.createElement('a');
        w.href = wa(lastQ ? t('Hi Stella, I have a question: ', 'Halo Stella, saya mau tanya: ') + lastQ : D.waMessage);
        w.target = '_blank'; w.rel = 'noopener'; w.className = 'sa-wa';
        w.textContent = t('Chat on WhatsApp', 'Chat via WhatsApp');
        row.appendChild(w);
      }
      b.appendChild(row);
    }
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  }

  function answer(q, label) {
    bubble('me', label || q);
    var e = match(q);
    setTimeout(function () {
      if (e) bubble('bot', e.a, e.l, !!e.wa || !e.l);
      else bubble('bot', D.fallback, null, true, q);
    }, 350);
  }

  CHIPS.forEach(function (c) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = c.x;
    b.addEventListener('click', function () { answer(c.q, c.x); });
    chips.appendChild(b);
  });

  function open() {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    dot.hidden = true;
    if (!started) {
      started = true;
      bubble('bot', D.greeting);
    }
    input.focus();
  }
  function close() { panel.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.focus(); }

  fab.addEventListener('click', function () { panel.hidden ? open() : close(); });
  root.querySelector('.sa-close').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) close(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.trim();
    if (!q) return;
    input.value = '';
    answer(q);
  });
})();
