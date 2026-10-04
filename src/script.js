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
function gaTrack(name, params) {
  if (window.gtag) gtag('event', name, Object.assign({
    page_lang: document.documentElement.lang || 'en'
  }, params));
}

// WhatsApp buttons on the page (the chat tracks its own)
document.addEventListener('click', function (e) {
  var a = e.target.closest('a[href*="wa.me"]');
  if (!a || a.closest('.sa')) return;
  gaTrack('whatsapp_click', { link_text: a.textContent.trim().slice(0, 50) });
});

// Contact form (the chat's question box is a form too, so skip it)
document.addEventListener('submit', function (e) {
  var form = e.target;
  if (form.closest('.sa')) return;
  var select = form.querySelector('select');
  gaTrack('enquiry_submit', {
    interest: select ? select.options[select.selectedIndex].text : ''
  });
});
