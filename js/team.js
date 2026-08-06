/* Everest PT - Team page: render coach profiles from data/team.json */
(function () {
  'use strict';
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function initials(name) {
    return name.split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
  }
  function card(m) {
    var photo = m.photo
      ? '<img class="coach-photo" src="' + esc(m.photo) + '" alt="' + esc(m.name) + ', ' + esc(m.role) + '" loading="lazy" />'
      : '<div class="coach-photo">' + esc(initials(m.name)) + '</div>';
    var quals = (m.quals || []).map(function (q) { return '<span class="tag">' + esc(q) + '</span>'; }).join('');
    /* Only render the fields that are actually filled in. A profile with just
       a name and role should look deliberate, not like a broken card with
       empty "Specialties:" labels hanging off it. */
    function line(label, val) {
      if (!val) return '';
      return '<p>' + (label ? '<strong>' + label + ':</strong> ' : '') + esc(val) + '</p>';
    }
    return '' +
      '<article class="coach">' + photo +
        '<div class="coach-body">' +
          '<h3>' + esc(m.name) + '</h3>' +
          '<p class="coach-role">' + esc(m.role) + '</p>' +
          line('Specialties', m.specialties) +
          line('Best for', m.bestFor) +
          line('', m.philosophy) +
          (quals ? '<div class="coach-quals">' + quals + '</div>' : '') +
          (m.bookingUrl ? '<div style="margin-top:14px"><a class="btn btn-outline" style="padding:9px 16px;font-size:13px" href="' + esc(m.bookingUrl) + '">Book or enquire <i class="ti ti-arrow-right" aria-hidden="true"></i></a></div>' : '') +
        '</div>' +
      '</article>';
  }
  fetch('/data/team.json', { cache: 'no-cache' })
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var grid = document.getElementById('team-grid');
      if (!grid) return;
      grid.innerHTML = (data.team || []).filter(function (m) { return m.status === 'active'; }).map(card).join('');
    })
    .catch(function (e) { console.error(e); });
})();
