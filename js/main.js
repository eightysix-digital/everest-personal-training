/* Everest PT - home page interactivity
   Renders the program deck and impact metrics from editable JSON,
   animates counters, and respects reduced-motion. */
(function () {
  'use strict';

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Featured program deck ---- */
  function renderPrograms(data) {
    var deck = document.getElementById('program-deck');
    if (!deck || !data || !data.programs) return;
    var bySlug = {};
    data.programs.forEach(function (p) { bySlug[p.slug] = p; });
    var order = (data.featured && data.featured.length) ? data.featured
      : data.programs.map(function (p) { return p.slug; });

    deck.innerHTML = order.map(function (slug) {
      var p = bySlug[slug];
      if (!p || p.status !== 'active') return '';
      var href = p.checkoutUrl || '/programs/';
      var external = /^https?:\/\//.test(href);
      var ctaIcon = external ? 'ti-external-link' : (p.cta === 'Enquire' ? 'ti-arrow-right' : 'ti-arrow-right');
      var priceHtml = p.billing
        ? p.price + '<small>' + p.billing + '</small>'
        : '<span style="font-size:19px">' + p.price + '</span>';
      var btnClass = (p.theme === 'dark') ? 'btn-accent'
        : (p.theme === 'teal') ? 'btn-accent'
        : (p.theme === 'accent') ? 'btn-deep' : 'btn-deep';
      return '' +
        '<article class="deck-card theme-' + p.theme + '">' +
          '<div>' +
            '<span class="label">' + esc(p.label) + '</span>' +
            '<h3>' + esc(p.name) + '</h3>' +
            '<p class="desc">' + esc(p.headline) + '</p>' +
          '</div>' +
          '<div class="deck-foot">' +
            '<div class="price">' + priceHtml + '</div>' +
            '<a class="btn ' + btnClass + '" style="padding:11px 18px;font-size:13px" href="' + href + '"' +
              (external ? ' target="_blank" rel="noopener"' : '') + '>' +
              esc(p.cta) + ' <i class="ti ' + ctaIcon + '" aria-hidden="true"></i></a>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* ---- Impact counters (only verified metrics with display:true) ---- */
  function renderImpact(data) {
    var section = document.getElementById('impact');
    var grid = document.getElementById('impact-grid');
    if (!section || !grid || !data || !data.metrics) return;
    var visible = data.metrics.filter(function (m) { return m.display; });
    if (!visible.length) return; // keep section hidden until figures are verified

    grid.innerHTML = visible.map(function (m) {
      return '<div class="metric"><div class="num" data-target="' + m.value + '" data-suffix="' +
        (m.suffix || '') + '">0</div><div class="cap">' + esc(m.label) + '</div></div>';
    }).join('');
    section.hidden = false;
    observeCounters(grid);
  }

  function observeCounters(grid) {
    var nums = grid.querySelectorAll('.num');
    if (prefersReduced) {
      nums.forEach(function (n) { n.textContent = n.dataset.target + (n.dataset.suffix || ''); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function animate(el) {
    var target = parseFloat(el.dataset.target) || 0;
    var suffix = el.dataset.suffix || '';
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * p) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function load(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('Failed to load ' + url);
      return r.json();
    });
  }

  load('/data/programs.json').then(renderPrograms).catch(function (e) { console.error(e); });
  load('/data/impact.json').then(renderImpact).catch(function (e) { console.error(e); });
})();
