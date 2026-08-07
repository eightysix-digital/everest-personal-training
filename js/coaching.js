/* Everest PT - Coaching page: tabbed delivery options, single-open FAQ,
   and client testimonials rendered from data/testimonials.json. */
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* Testimonials come from the same verified file the homepage uses, so
     there is one place reviews live and no way for invented copy to be
     hard-coded into a page. The whole section hides if there is nothing
     real to show. */
  var tGrid = document.getElementById('coach-testimonials');
  if (tGrid) {
    fetch('/data/testimonials.json', { cache: 'no-cache' })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var reviews = (data.reviews || []).filter(function (r) { return r && r.quote; });
        var section = tGrid.closest('section');
        if (!reviews.length) { if (section) section.hidden = true; return; }
        tGrid.innerHTML = reviews.slice(0, 3).map(function (r) {
          return '<figure class="testimonial reveal">' +
            '<i class="ti ti-quote" aria-hidden="true"></i>' +
            '<blockquote>' + esc(r.quote) + '</blockquote>' +
            '<figcaption>' + esc(r.name) +
              (r.source ? ', ' + esc(r.source) + ' review' : '') +
            '</figcaption></figure>';
        }).join('');
        /* these are injected after layout.js has already swept the page for
           .reveal elements, so reveal them directly */
        tGrid.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
      })
      .catch(function (e) { console.error(e); });
  }

  /* Tabs */
  var tabs = document.getElementById('coach-tabs');
  if (tabs) {
    var btns = tabs.querySelectorAll('.tab-btn');
    var panels = tabs.querySelectorAll('.tab-panel');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-tab');
        btns.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        panels.forEach(function (p) {
          var active = p.getAttribute('data-panel') === key;
          p.classList.toggle('is-active', active);
          p.hidden = !active;
        });
      });
    });
  }

})();
