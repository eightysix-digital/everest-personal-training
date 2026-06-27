/* Everest PT - shared layout (header, footer, sticky CTA, mobile nav).
   Single source of truth injected into every page so markup stays DRY. */
(function () {
  'use strict';

  var NAV = [
    { label: 'Programs', href: '/programs/' },
    { label: 'Coaching', href: '/coaching/' },
    { label: 'Performance', href: '/performance/' },
    { label: 'EMPOWER', href: '/empower/', brand: true },
    { label: 'Organisations', href: '/organisations/' },
    { label: 'Impact', href: '/impact/' },
    { label: 'About', href: '/about/' }
  ];

  var path = location.pathname.replace(/index\.html$/, '');
  if (path.length > 1) path = path.replace(/\/?$/, '/');

  function isActive(href) {
    if (href === '/') return path === '/';
    return path.indexOf(href) === 0;
  }

  function headerHTML() {
    var links = NAV.map(function (n) {
      return '<a href="' + n.href + '"' +
        (n.brand ? ' class="is-brand"' : '') +
        (isActive(n.href) ? ' aria-current="page"' : '') +
        '>' + n.label + '</a>';
    }).join('');
    return '' +
      '<header class="site-header">' +
        '<a class="logo" href="/"><span class="logo-mark"><i class="ti ti-mountain" aria-hidden="true"></i></span><span>EVEREST</span></a>' +
        '<nav class="nav" aria-label="Primary">' + links + '</nav>' +
        '<div class="header-cta">' +
          '<a class="btn btn-accent header-call" href="/contact/">Book a call</a>' +
          '<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false"><i class="ti ti-menu-2" aria-hidden="true"></i></button>' +
        '</div>' +
      '</header>';
  }

  function footerHTML() {
    var year = new Date().getFullYear();
    return '' +
      '<footer class="site-footer">' +
        '<div class="wrap footer-top">' +
          '<div class="footer-brand">' +
            '<a class="logo" href="/"><span class="logo-mark"><i class="ti ti-mountain" aria-hidden="true"></i></span><span>EVEREST</span></a>' +
            '<p>Structured training, expert coaching and human performance solutions for everyday people, athletes, young people and organisations.</p>' +
            '<div class="footer-social">' +
              '<a href="#" aria-label="Instagram"><i class="ti ti-brand-instagram" aria-hidden="true"></i></a>' +
              '<a href="#" aria-label="Facebook"><i class="ti ti-brand-facebook" aria-hidden="true"></i></a>' +
              '<a href="#" aria-label="LinkedIn"><i class="ti ti-brand-linkedin" aria-hidden="true"></i></a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-cols">' +
            '<div class="footer-col">' +
              '<h3>Train</h3>' +
              '<a href="/programs/">Programs</a>' +
              '<a href="/coaching/">Coaching</a>' +
              '<a href="/performance/">Performance</a>' +
              '<a href="/empower/">EMPOWER youth</a>' +
            '</div>' +
            '<div class="footer-col">' +
              '<h3>Organisations</h3>' +
              '<a href="/organisations/">Workforce wellness</a>' +
              '<a href="/organisations/#preventative">Preventative performance</a>' +
              '<a href="/contact/?type=organisation">Book a strategy call</a>' +
              '<a href="/impact/">Impact &amp; evidence</a>' +
            '</div>' +
            '<div class="footer-col">' +
              '<h3>Company</h3>' +
              '<a href="/about/">About</a>' +
              '<a href="/team/">Team</a>' +
              '<a href="/resources/">Resources</a>' +
              '<a href="/contact/">Contact</a>' +
            '</div>' +
            '<div class="footer-col">' +
              '<h3>Get in touch</h3>' +
              '<a href="mailto:hello@everestpt.co.nz">hello@everestpt.co.nz</a>' +
              '<a href="tel:+6400000000">Call the team</a>' +
              '<span class="footer-meta">Christchurch, New Zealand</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="wrap footer-bottom">' +
          '<span>&copy; ' + year + ' Everest Personal Training. All rights reserved.</span>' +
          '<nav class="footer-legal" aria-label="Legal">' +
            '<a href="/legal/#privacy">Privacy</a>' +
            '<a href="/legal/#terms">Terms</a>' +
            '<a href="/legal/#disclaimer">Health disclaimer</a>' +
          '</nav>' +
        '</div>' +
        '<div class="wrap footer-note">' +
          '<p>Everest provides fitness coaching and human performance services. This is not clinical healthcare. We work alongside health professionals and refer where appropriate.</p>' +
          '<span class="footer-credit">Another website designed and built by <a href="https://eightysix.digital/web-design/web-design-christchurch/" target="_blank" rel="noopener">EightySix Digital</a></span>' +
        '</div>' +
      '</footer>';
  }

  function mount(id, html) {
    var el = document.getElementById(id);
    if (el) el.outerHTML = html;
  }

  mount('site-header', headerHTML());
  mount('site-footer', footerHTML());

  var stickyHost = document.getElementById('sticky-cta');
  if (stickyHost) {
    stickyHost.outerHTML = '<div class="sticky-cta"><a class="btn btn-deep" href="/contact/">Book a call</a></div>';
  }

  /* structured data: LocalBusiness + WebSite (every page) + BreadcrumbList */
  function injectSchema() {
    var origin = location.origin;
    var graph = [
      {
        "@type": ["Organization", "LocalBusiness"],
        "@id": origin + "/#business",
        "name": "Everest Personal Training",
        "description": "Personal training, fitness and human performance coaching in Christchurch and across Canterbury, New Zealand. Online, in-person and hybrid coaching for individuals, athletes, young people and organisations.",
        "url": origin + "/",
        "email": "hello@everestpt.co.nz",
        "areaServed": [
          { "@type": "City", "name": "Christchurch" },
          { "@type": "AdministrativeArea", "name": "Canterbury" }
        ],
        "address": { "@type": "PostalAddress", "addressLocality": "Christchurch", "addressRegion": "Canterbury", "addressCountry": "NZ" }
      },
      {
        "@type": "WebSite",
        "@id": origin + "/#website",
        "url": origin + "/",
        "name": "Everest Personal Training",
        "publisher": { "@id": origin + "/#business" }
      }
    ];

    var parts = location.pathname.split('/').filter(Boolean);
    if (parts.length) {
      var items = [{ "@type": "ListItem", "position": 1, "name": "Home", "item": origin + "/" }];
      var acc = '';
      parts.forEach(function (seg, i) {
        acc += '/' + seg;
        var name = seg.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        items.push({ "@type": "ListItem", "position": i + 2, "name": name, "item": origin + acc + '/' });
      });
      graph.push({ "@type": "BreadcrumbList", "itemListElement": items });
    }

    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(s);
  }
  injectSchema();

  /* FAQ accordion: close others when one opens (site-wide) */
  var faqs = document.querySelectorAll('.faq-item');
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) faqs.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* mobile nav toggle */
  var header = document.querySelector('.site-header');
  var toggle = header && header.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.innerHTML = '<i class="ti ti-' + (open ? 'x' : 'menu-2') + '" aria-hidden="true"></i>';
    });
  }
})();
