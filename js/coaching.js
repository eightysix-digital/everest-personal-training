/* Everest PT - Coaching page: tabbed delivery options + single-open FAQ. */
(function () {
  'use strict';

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
