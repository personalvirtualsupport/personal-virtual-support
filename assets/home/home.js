/* Personal Virtual Support — homepage interactions (no dependencies) */
(function () {
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Hero entrance */
  function loaded() { requestAnimationFrame(function () { doc.classList.add('is-loaded'); }); }
  if (document.fonts && document.fonts.ready) {
    var done = false, go = function () { if (!done) { done = true; loaded(); } };
    document.fonts.ready.then(go); setTimeout(go, 900);
  } else { loaded(); }

  /* Mobile menu */
  var header = document.querySelector('.site-header');
  var btn = document.getElementById('menuBtn');
  var menu = document.getElementById('navMenu');
  function setMenu(open) {
    doc.classList.toggle('menu-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (btn && menu) {
    btn.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && doc.classList.contains('menu-open')) { setMenu(false); btn.focus(); }
    });
  }

  /* Calendly popup when the widget has loaded; plain link otherwise */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a.js-calendly');
    if (!a || !window.Calendly || !window.Calendly.initPopupWidget) return;
    e.preventDefault();
    window.Calendly.initPopupWidget({ url: a.href });
  });

  /* Nav colour follows the section underneath; hide on scroll down */
  var themed = [].slice.call(document.querySelectorAll('[data-theme]'));
  var bar = document.querySelector('.progress span');
  var wa = document.querySelector('.wa-float');
  var parallax = [].slice.call(document.querySelectorAll('[data-parallax]'));
  var lastY = window.pageYOffset, ticking = false;

  function onScroll() {
    var y = window.pageYOffset, vh = window.innerHeight;
    var probe = 40;
    for (var i = 0; i < themed.length; i++) {
      var r = themed[i].getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { header.setAttribute('data-nav', themed[i].getAttribute('data-theme')); break; }
    }
    if (!doc.classList.contains('menu-open')) {
      header.classList.toggle('is-hidden', y > lastY && y > vh * 0.6);
    }
    lastY = y;
    if (wa) wa.classList.toggle('is-shown', y > vh * 0.7);
    var h = document.body.scrollHeight - vh;
    if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    if (!reduce) {
      parallax.forEach(function (el) {
        var rr = el.getBoundingClientRect();
        if (rr.bottom < 0 || rr.top > vh) return;
        var c = rr.top + rr.height / 2 - vh / 2;
        el.style.translate = '0 ' + (c * parseFloat(el.getAttribute('data-parallax'))).toFixed(1) + 'px';
      });
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* Scroll reveals */
  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Testimonials: full review dialogs */
  document.querySelectorAll('[data-dialog]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = document.getElementById(b.getAttribute('data-dialog'));
      if (d && d.showModal) { d.showModal(); d._opener = b; }
    });
  });
  document.querySelectorAll('dialog.review').forEach(function (d) {
    d.querySelector('.review-close').addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.addEventListener('close', function () { if (d._opener) d._opener.focus(); });
  });

  /* Hand-over picker */
  var opts = [].slice.call(document.querySelectorAll('.pick-opt'));
  var panel = document.getElementById('pick-panel');
  var pTitle = document.getElementById('pick-title'), pText = document.getElementById('pick-text');
  opts.forEach(function (b) {
    b.addEventListener('click', function () {
      opts.forEach(function (o) { o.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      pTitle.innerHTML = b.getAttribute('data-title');
      pText.innerHTML = b.getAttribute('data-text');
      panel.classList.remove('fade'); void panel.offsetWidth; panel.classList.add('fade');
    });
  });

  /* Deep links /#need-admin and /#need-tech pick an option and scroll to the picker */
  function fromHash() {
    var m = (location.hash || '').match(/^#need-(\w+)$/);
    if (!m) return;
    var b = document.querySelector('.pick-opt[data-need="' + m[1] + '"]');
    if (b) b.click();
    var t = document.getElementById('hand-over');
    if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  window.addEventListener('hashchange', fromHash); fromHash();

  /* "It starts with a quick call" film: play only while on screen */
  var vid = document.getElementById('hv-vid');
  if (vid) {
    if (reduce) { vid.setAttribute('controls', ''); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) { var p = vid.play(); if (p && p.catch) p.catch(function () { vid.setAttribute('controls', ''); }); }
          else vid.pause();
        });
      }, { threshold: 0.25 }).observe(vid);
    } else { vid.setAttribute('controls', ''); }
  }

  var yEl = document.getElementById('year');
  if (yEl) yEl.textContent = new Date().getFullYear();
})();
