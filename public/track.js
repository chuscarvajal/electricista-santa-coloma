/* Seguimiento de CTAs y leads para GA4 (gtag).
   - Llamadas (tel:)      -> evento "generate_lead"  method=phone
   - WhatsApp (wa.me)     -> evento "generate_lead"  method=whatsapp
   - Formulario           -> evento "generate_lead"  method=form
   - Resto de botones/enlaces -> evento "cta_click"
   Cada evento incluye de dónde viene (cta_location = id de la sección, "nav" o "footer")
   y el texto del botón (cta_text), para poder segmentar los informes. */
(function () {
  function loc(el) {
    var s = el.closest('section[id]');
    if (s) return s.id;
    if (el.closest('header')) return 'nav';
    if (el.closest('footer')) return 'footer';
    return 'page';
  }
  function label(el) {
    var t = (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim();
    return t.slice(0, 80) || '(sin texto)';
  }
  function ev(name, params) {
    if (typeof gtag === 'function') gtag('event', name, params);
    else { window.dataLayer = window.dataLayer || []; window.dataLayer.push(['event', name, params]); }
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('a, button');
    if (!el) return;
    var href = (el.getAttribute('href') || '').trim();
    var base = { cta_location: loc(el), cta_text: label(el), page_path: location.pathname };

    if (/^tel:/i.test(href)) {
      ev('generate_lead', Object.assign({ method: 'phone' }, base));
      ev('phone_click', base);
    } else if (/(wa\.me|api\.whatsapp\.com|wa\.link|whatsapp)/i.test(href)) {
      ev('generate_lead', Object.assign({ method: 'whatsapp' }, base));
      ev('whatsapp_click', base);
    } else if (el.tagName === 'A' && href && !/^#/.test(href)) {
      ev('cta_click', Object.assign({ link_url: href }, base));
    } else if (el.tagName === 'BUTTON' || (el.tagName === 'A' && /^#/.test(href))) {
      ev('cta_click', base);
    }
  }, true);

  // Envío de formulario de presupuesto
  document.addEventListener('submit', function (e) {
    var f = e.target;
    var base = { cta_location: loc(f), cta_text: 'formulario presupuesto', page_path: location.pathname };
    ev('generate_lead', Object.assign({ method: 'form' }, base));
    ev('form_submit', base);
  }, true);
})();
