/* Everest PT - shared layout (header, footer, sticky CTA, mobile nav).
   Single source of truth injected into every page so markup stays DRY. */
(function () {
  'use strict';

  var NAV = [
    { label: 'Programs', href: '/programs/' },
    { label: 'Coaching', href: '/coaching/' },
    { label: 'Performance', href: '/performance/' },
    { label: 'EMPOWER', href: '/empower/' },
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
        (isActive(n.href) ? ' aria-current="page"' : '') +
        '>' + n.label + '</a>';
    }).join('');
    return '' +
      '<header class="site-header">' +
        '<a class="logo" href="/"><span class="logo-mark"><i class="ti ti-mountain" aria-hidden="true"></i></span><span>EVEREST</span></a>' +
        '<nav class="nav" aria-label="Primary">' + links +
          '<a class="nav-cta" href="/contact/">Book a call</a>' +
        '</nav>' +
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
          /* Required by the CC BY 2.5 licence on the skeleton illustration used
             in the homepage body journey. Do not remove while that image is in
             use. The Gray's Anatomy plates alongside it are public domain and
             carry no such obligation. */
          '<p class="footer-credits">Skeleton illustration by <a href="https://commons.wikimedia.org/wiki/File:Skeleton_whole_body.svg" target="_blank" rel="noopener">Patrick J. Lynch, medical illustrator</a>, used under <a href="https://creativecommons.org/licenses/by/2.5/" target="_blank" rel="noopener">CC BY 2.5</a>. Other anatomical illustrations from Gray&rsquo;s Anatomy (1918), public domain.</p>' +
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

  /* Skip link, injected as the first focusable thing on the page. The journey
     sections make these pages long, so keyboard users need a way past the nav
     and straight to content. Targets <main>, which every page has. */
  if (!document.querySelector('.skip-link')) {
    var main = document.querySelector('main');
    if (main) {
      if (!main.id) main.id = 'main-content';
      var skip = document.createElement('a');
      skip.className = 'skip-link';
      skip.href = '#' + main.id;
      skip.textContent = 'Skip to content';
      document.body.insertBefore(skip, document.body.firstChild);
    }
  }

  /* Reading-progress bar. Decorative only — the same information is available
     from the scrollbar, so it is hidden from assistive tech. js/journey.js
     drives it where present; without that file it simply stays at zero width. */
  if (!document.querySelector('.scroll-progress')) {
    var prog = document.createElement('div');
    prog.className = 'scroll-progress';
    prog.setAttribute('aria-hidden', 'true');
    prog.innerHTML = '<span></span>';
    document.body.insertBefore(prog, document.body.firstChild);
  }

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

  /* scroll reveal (site-wide) */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      reveals.forEach(function (r) { r.classList.add('is-visible'); });
    } else {
      var ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add('is-visible'); ro.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (r) { ro.observe(r); });
    }
  }

  /* FAQ accordion: close others when one opens (site-wide) */
  var faqs = document.querySelectorAll('.faq-item');
  faqs.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (item.open) faqs.forEach(function (o) { if (o !== item) o.open = false; });
    });
  });

  /* Keep the hero kettlebell in true proportion.
     The ascent SVG uses preserveAspectRatio="none" so the route always spans
     the full hero, which stretches its contents unevenly (harmless for a dot,
     very visible on a kettlebell). Counter-scale the climber horizontally so it
     renders round on every viewport. */
  function fitClimber() {
    var svgs = document.querySelectorAll('.ascent svg');
    for (var i = 0; i < svgs.length; i++) {
      var box = svgs[i].getBoundingClientRect();
      if (!box.width || !box.height) continue;
      var kx = box.width / 1400;
      var ky = box.height / 800;
      var g = svgs[i].querySelector('.climber-scale');
      if (g) g.setAttribute('transform', 'scale(' + (ky / kx).toFixed(4) + ',1)');
    }
  }
  fitClimber();
  var fitTimer;
  window.addEventListener('resize', function () {
    clearTimeout(fitTimer);
    fitTimer = setTimeout(fitClimber, 120);
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
