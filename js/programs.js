/* Everest PT - Programs page: catalogue rendering, filtering, and program finder. */
(function () {
  'use strict';

  var DATA = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function cardHTML(p) {
    var href = p.checkoutUrl || '/contact/';
    var external = /^https?:\/\//.test(href);
    var priceHtml = p.billing
      ? '<span class="price">' + esc(p.price) + '<small>' + esc(p.billing) + '</small></span>'
      : '<span class="price" style="font-size:18px">' + esc(p.price) + '</span>';
    var tags = [p.goal, p.level, p.support].filter(Boolean).map(function (t) {
      return '<span class="tag">' + esc(t) + '</span>';
    }).join('');
    return '' +
      '<article class="prog-card' + (p.best ? ' is-best' : '') + '">' +
        (p.best ? '<span class="prog-badge">Best value</span>' : '') +
        '<span class="label">' + esc(p.label) + '</span>' +
        '<h3>' + esc(p.name) + '</h3>' +
        '<p class="desc">' + esc(p.headline) + '</p>' +
        '<div class="prog-meta">' + tags + '</div>' +
        '<div class="prog-foot">' + priceHtml +
          '<a class="btn btn-deep" style="padding:10px 16px;font-size:13px" href="' + href + '"' +
            (external ? ' target="_blank" rel="noopener"' : '') + '>' + esc(p.cta) +
            ' <i class="ti ti-' + (external ? 'external-link' : 'arrow-right') + '" aria-hidden="true"></i></a>' +
        '</div>' +
      '</article>';
  }

  function activePrograms() {
    return DATA.programs.filter(function (p) { return p.status === 'active'; });
  }

  function render() {
    var grid = document.getElementById('catalogue');
    var empty = document.getElementById('catalogue-empty');
    if (!grid) return;
    var f = {
      goal: val('f-goal'), level: val('f-level'),
      support: val('f-support'), audience: val('f-audience')
    };
    var list = activePrograms().filter(function (p) {
      return (!f.goal || p.goal === f.goal) &&
        (!f.level || p.level === f.level) &&
        (!f.support || p.support === f.support) &&
        (!f.audience || p.audience === f.audience);
    });
    grid.innerHTML = list.map(cardHTML).join('');
    if (empty) empty.style.display = list.length ? 'none' : 'block';
  }

  function val(id) { var e = document.getElementById(id); return e ? e.value : ''; }

  /* ---- Program finder ---- */
  var answers = {};
  function wireFinder() {
    var finder = document.getElementById('finder');
    if (!finder) return;
    finder.querySelectorAll('.quiz-step').forEach(function (step) {
      var key = step.getAttribute('data-key');
      step.querySelectorAll('.quiz-opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          step.querySelectorAll('.quiz-opt').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          answers[key] = btn.getAttribute('data-value');
          maybeRecommend();
        });
      });
    });
  }

  function score(p) {
    var s = 0;
    if (answers.goal && p.goal === answers.goal) s += 3;
    if (answers.level && p.level === answers.level) s += 2;
    if (answers.support && p.support === answers.support) s += 3;
    if (answers.audience && p.audience === answers.audience) s += 4;
    return s;
  }

  function maybeRecommend() {
    if (Object.keys(answers).length < 4) return;
    var best = null, bestScore = -1;
    activePrograms().forEach(function (p) {
      var sc = score(p);
      if (sc > bestScore) { bestScore = sc; best = p; }
    });
    if (!best) return;
    var box = document.getElementById('finder-result');
    document.getElementById('finder-result-name').textContent = best.name;
    document.getElementById('finder-result-desc').textContent = best.headline;
    var cta = document.getElementById('finder-result-cta');
    var href = best.checkoutUrl || '/contact/';
    cta.setAttribute('href', href);
    if (/^https?:\/\//.test(href)) { cta.setAttribute('target', '_blank'); cta.setAttribute('rel', 'noopener'); }
    cta.textContent = best.cta;
    box.classList.add('show');
  }

  /* ---- init ---- */
  fetch('/data/programs.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      DATA = data;
      render();
      ['f-goal', 'f-level', 'f-support', 'f-audience'].forEach(function (id) {
        var e = document.getElementById(id);
        if (e) e.addEventListener('change', render);
      });
      var reset = document.getElementById('reset-filters');
      if (reset) reset.addEventListener('click', function () {
        ['f-goal', 'f-level', 'f-support', 'f-audience'].forEach(function (id) {
          var e = document.getElementById(id); if (e) e.value = '';
        });
        render();
      });
      wireFinder();
    })
    .catch(function (e) { console.error(e); });
})();
