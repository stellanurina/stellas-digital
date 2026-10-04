// Mobile menu toggle
(function () {
  var btn = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (!btn || !links) return;
  btn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
})();

// Contact form: turns the enquiry into a pre-filled WhatsApp message (English or Bahasa)
(function () {
  var form = document.getElementById('wa-form');
  if (!form) return;
  var isID = document.documentElement.lang === 'id';
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = form.querySelector('#f-name').value.trim() || '-';
    var biz = form.querySelector('#f-business').value.trim();
    var interest = form.querySelector('#f-interest').value;
    var msg = form.querySelector('#f-message').value.trim();
    var text = isID
      ? 'Halo Stella! Saya ' + name + (biz ? ' dari ' + biz : '') + '. Saya tertarik dengan: ' + interest + '.'
      : 'Hi Stella! My name is ' + name + (biz ? ' from ' + biz : '') + '. I am interested in: ' + interest + '.';
    if (msg) text += '\n\n' + msg;
    window.location.href = 'https://wa.me/' + (form.getAttribute('data-wa') || '62811181901') + '?text=' + encodeURIComponent(text);
  });
})();

// ---- Analytics events ----
gaTrack(name, params) {
  if (window.gtag) gtag('event', name, Object.assign({
    page_lang: document.documentElement.lang || 'en'
  }, params));
}

// Strip anything that looks like a phone number or email before sending text to GA
gaClean(text) {
  return (text || '')
    .replace(/\S+@\S+/g, '[email]')
    .replace(/\+?\d[\d\s-]{6,}/g, '[number]')
    .slice(0, 100);
}

// Every WhatsApp link on the site, including the chat hand-off button
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href*="wa.me"]');
  if (!a) return;

  var inChat = a.closest('[class*="chat"]');
  if (inChat) {
    var msg = new URL(a.href).searchParams.get('text');
    track('chat_handoff', { question: clean(msg) });
  } else {
    track('whatsapp_click', { link_text: a.textContent.trim().slice(0, 50) });
  }
});

// Contact form ("Open WhatsApp" button)
document.addEventListener('submit', function (e) {
  var form = e.target;
  var select = form.querySelector('select');
  track('enquiry_submit', {
    interest: select ? select.options[select.selectedIndex].text : ''
  });
});
