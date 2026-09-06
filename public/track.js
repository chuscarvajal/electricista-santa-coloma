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

/* Analítica propia de CTAs (sin terceros, sin cookies): registra cada clic en
   Llamar / WhatsApp / email / mapa / formulario con página + sección + hora en
   Netlify Blobs vía /.netlify/functions/track. Panel: /.netlify/functions/stats?key=
   Sección = data-section más cercano, o id/1ª clase del <section> contenedor. */
(function(){
  function ctaOf(a){
    var h=(a.getAttribute('href')||'');
    if(h.indexOf('tel:')===0)return'llamar';
    if(/wa\.me|whatsapp|api\.whatsapp/i.test(h))return'whatsapp';
    if(h.indexOf('mailto:')===0)return'email';
    if(/google\.[a-z.]+\/maps|maps\.app\.goo/i.test(h))return'mapa';
    return a.getAttribute('data-cta')||null;
  }
  function sectionOf(el){
    var d=el.closest('[data-section]'); if(d)return d.getAttribute('data-section');
    if(el.closest('footer'))return'footer';
    if(el.closest('nav'))return'menu';
    if(el.closest('header'))return'cabecera';
    var s=el.closest('section,aside'); if(!s)return'otro';
    var id=s.getAttribute('id'); if(id)return id;
    /* Sin id (plantillas Tailwind): etiqueta = titular de la sección slugificado */
    var h=s.querySelector('h1,h2,h3');
    if(h){var t=(h.textContent||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,32); if(t)return t;}
    return (s.className||'').toString().trim().split(/\s+/)[0]||'seccion';
  }
  function send(cta,section){
    try{
      var b=JSON.stringify({cta:cta,section:section,page:location.pathname,ts:new Date().toISOString()});
      if(navigator.sendBeacon){navigator.sendBeacon('/.netlify/functions/track',b);}
      else{fetch('/.netlify/functions/track',{method:'POST',body:b,keepalive:true});}
    }catch(e){}
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href],[data-cta]'); if(!a)return;
    var c=ctaOf(a); if(!c)return; send(c,sectionOf(a));
  },true);
  document.addEventListener('submit',function(e){
    var f=e.target;
    if(f&&(f.getAttribute('data-cta-form')!=null||f.id==='leadform')) send('formulario',sectionOf(f)||'formulario');
  },true);
})();
