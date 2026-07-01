/* Everest PT - Programs page: catalogue rendering, filtering, and program finder. */
(function () {
  'use strict';

  var DATA = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  var PROG_IMG = ['/assets/img/placeholder-horizontal.jpg', '/assets/img/placeholder-vertical.jpg'];
  var DELIVERY = { gym: 'In gym', home: 'At home', mixed: 'App based', online: 'Online' };
  function cap(s) { s = String(s || ''); return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }

  function cardHTML(p, i) {
    var href = p.checkoutUrl || '/contact/';
    var external = /^https?:\/\//.test(href);
    var priced = !!p.billing;
    var priceHtml = priced
      ? '<div class="pprice">' + esc(p.price) + '<small>' + esc(p.billing) + '</small></div>'
      : '<div class="pprice tbd">' + esc(p.price) + '</div>';
    var meta = [cap(p.goal), cap(p.level), DELIVERY[p.location] || 'Flexible', cap(p.support)]
      .filter(Boolean)
      .map(function (m) { return '<span>' + esc(m) + '</span>'; }).join('');
    return '' +
      '<article class="product">' +
        '<div class="pic" style="background-image:url(\'' + PROG_IMG[i % PROG_IMG.length] + '\')">' +
          '<span class="plabel">' + esc(p.label) + '</span>' +
        '</div>' +
        '<div class="pbody">' +
          '<h3>' + esc(p.name) + '</h3>' +
          '<p class="pdesc">' + esc(p.headline) + '</p>' +
          '<div class="pmeta">' + meta + '</div>' +
          '<div class="pfoot">' + priceHtml +
            '<a class="btn ' + (priced ? 'btn-deep' : 'btn-outline') + '" href="' + href + '"' +
              (external ? ' target="_blank" rel="noopener"' : '') + '>' + esc(p.cta) +
              ' <i class="ti ti-' + (external ? 'external-link' : 'arrow-right') + '" aria-hidden="true"></i></a>' +
          '</div>' +
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

  /* ---- Program finder: interactive step wizard ---- */
  var answers = {};
  var fsteps = [], fcurr = 0;
  var prefersReduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function wireFinder() {
    var finder = document.getElementById('finder');
    if (!finder) return;
    fsteps = [].slice.call(finder.querySelectorAll('.fstep'));
    fsteps.forEach(function (step) {
      var key = step.getAttribute('data-key');
      step.querySelectorAll('.fopt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          step.querySelectorAll('.fopt').forEach(function (b) { b.classList.remove('selected'); });
          btn.classList.add('selected');
          answers[key] = btn.getAttribute('data-value');
          window.setTimeout(function () {
            if (fcurr < fsteps.length - 1) goToStep(fcurr + 1);
            else finishFinder();
          }, 240);
        });
      });
    });
    var back = document.getElementById('finder-back');
    if (back) back.addEventListener('click', function () { if (fcurr > 0) goToStep(fcurr - 1); });
    var restart = document.getElementById('finder-restart');
    if (restart) restart.addEventListener('click', resetFinder);
    updateFinder();
  }

  function goToStep(i) {
    var res = document.getElementById('finder-result');
    if (res) res.classList.remove('show');
    var stage = document.getElementById('finder-stage');
    if (stage) stage.hidden = false;
    if (fsteps[fcurr]) fsteps[fcurr].classList.remove('is-active');
    fcurr = i;
    if (fsteps[fcurr]) fsteps[fcurr].classList.add('is-active');
    updateFinder();
  }

  function updateFinder() {
    var bar = document.getElementById('finder-bar');
    var count = document.getElementById('finder-count');
    var back = document.getElementById('finder-back');
    if (bar) bar.style.width = (((fcurr + 1) / fsteps.length) * 100) + '%';
    if (count) count.textContent = 'Question ' + (fcurr + 1) + ' of ' + fsteps.length;
    if (back) back.hidden = fcurr === 0;
  }

  function score(p) {
    var s = 0;
    if (answers.goal && p.goal === answers.goal) s += 3;
    if (answers.level && p.level === answers.level) s += 2;
    if (answers.support && p.support === answers.support) s += 3;
    if (answers.audience && p.audience === answers.audience) s += 4;
    return s;
  }

  function finishFinder() {
    var best = null, bestScore = -1;
    activePrograms().forEach(function (p) {
      var sc = score(p);
      if (sc > bestScore) { bestScore = sc; best = p; }
    });
    if (!best) return;

    var stage = document.getElementById('finder-stage');
    if (stage) stage.hidden = true;
    var bar = document.getElementById('finder-bar'); if (bar) bar.style.width = '100%';
    var count = document.getElementById('finder-count'); if (count) count.textContent = 'Your match';
    var back = document.getElementById('finder-back'); if (back) back.hidden = true;

    document.getElementById('finder-result-name').textContent = best.name;
    document.getElementById('finder-result-desc').textContent = best.headline;
    var why = document.getElementById('finder-result-why');
    if (why) {
      var reasons = [];
      if (answers.goal) reasons.push('Matches your goal: ' + cap(answers.goal));
      if (answers.level) reasons.push(cap(answers.level) + ' level programming');
      if (answers.support) reasons.push(cap(answers.support) + ' support');
      if (answers.audience) reasons.push('Built for: ' + cap(answers.audience));
      why.innerHTML = reasons.map(function (r) {
        return '<li><i class="ti ti-check" aria-hidden="true"></i>' + esc(r) + '</li>';
      }).join('');
    }
    var cta = document.getElementById('finder-result-cta');
    var href = best.checkoutUrl || '/contact/';
    cta.setAttribute('href', href);
    if (/^https?:\/\//.test(href)) { cta.setAttribute('target', '_blank'); cta.setAttribute('rel', 'noopener'); }
    cta.innerHTML = esc(best.cta) + ' <i class="ti ti-arrow-right" aria-hidden="true"></i>';

    var box = document.getElementById('finder-result');
    box.classList.add('show');
    box.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'nearest' });
  }

  function resetFinder() {
    answers = {};
    fsteps.forEach(function (s) {
      s.querySelectorAll('.fopt').forEach(function (b) { b.classList.remove('selected'); });
    });
    var box = document.getElementById('finder-result'); if (box) box.classList.remove('show');
    var stage = document.getElementById('finder-stage'); if (stage) stage.hidden = false;
    goToStep(0);
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
