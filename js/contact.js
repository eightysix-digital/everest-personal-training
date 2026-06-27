/* Everest PT - Contact form.
   Preselects enquiry type from ?type=, shows the organisation field when relevant,
   and submits to a configured form endpoint. Until an endpoint is set it falls back
   to opening a pre-filled email, so the form is never a dead end. */
(function () {
  'use strict';

  /* Set this to your form backend (Formspree, Basin, Netlify Forms, etc.). */
  var FORM_ENDPOINT = '';
  var FALLBACK_EMAIL = 'hello@everestpt.co.nz';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var typeSel = document.getElementById('type');
  var orgField = document.getElementById('org-field');
  var status = document.getElementById('form-status');

  function syncOrg() {
    var t = typeSel.value;
    var show = (t === 'organisation' || t === 'partnership');
    orgField.hidden = !show;
  }

  var params = new URLSearchParams(location.search);
  var preset = params.get('type');
  if (preset) {
    var ok = Array.prototype.some.call(typeSel.options, function (o) { return o.value === preset; });
    if (ok) typeSel.value = preset;
  }
  syncOrg();
  typeSel.addEventListener('change', syncOrg);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    var data = {
      type: typeSel.value,
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      organisation: form.organisation ? form.organisation.value.trim() : '',
      message: form.message.value.trim()
    };

    if (FORM_ENDPOINT) {
      status.textContent = 'Sending...';
      fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (r.ok) { form.reset(); syncOrg(); status.textContent = 'Thanks. We will be in touch soon.'; }
        else throw new Error('bad response');
      }).catch(function () {
        status.textContent = 'Something went wrong. Please email us at ' + FALLBACK_EMAIL + '.';
      });
    } else {
      var subject = 'Website enquiry (' + data.type + ') from ' + data.name;
      var body = 'Name: ' + data.name + '\nEmail: ' + data.email +
        (data.organisation ? '\nOrganisation: ' + data.organisation : '') +
        '\nType: ' + data.type + '\n\n' + data.message;
      window.location.href = 'mailto:' + FALLBACK_EMAIL +
        '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      status.textContent = 'Opening your email app. If nothing happens, email us at ' + FALLBACK_EMAIL + '.';
    }
  });
})();
