/* Everest PT - shared layout (header, footer, sticky CTA, mobile nav).
   Single source of truth injected into every page so markup stays DRY. */
(function () {
  'use strict';

  /* Everest Group is the parent brand. Everest Personal Training is the
     division that coaching and programs sit under, so they are grouped
     rather than listed flat — eight top-level items had outgrown the header.
     An item with `children` renders as a submenu. */
  var NAV = [
    { label: 'Everest Personal Training', short: 'Personal Training', href: '/programs/', children: [
      { label: 'Programs', href: '/programs/', desc: 'App plans, coached programs and one-off services' },
      { label: 'Coaching', href: '/coaching/', desc: 'Personalised coaching, in person or online worldwide' }
    ] },
    { label: 'Performance', href: '/performance/' },
    { label: 'EMPOWER', href: '/empower/' },
    { label: 'Organisations', href: '/organisations/' },
    { label: 'Impact', href: '/impact/' },
    { label: 'About', href: '/about/' },
    { label: 'Team', href: '/team/' }
  ];

  var path = location.pathname.replace(/index\.html$/, '');
  if (path.length > 1) path = path.replace(/\/?$/, '/');

  function isActive(href) {
    if (href === '/') return path === '/';
    return path.indexOf(href) === 0;
  }

  function headerHTML() {
    var links = NAV.map(function (n, i) {
      if (!n.children) {
        return '<a href="' + n.href + '"' +
          (isActive(n.href) ? ' aria-current="page"' : '') +
          '>' + n.label + '</a>';
      }
      /* Grouped item. The trigger is a button rather than a link: it opens a
         menu, it does not navigate, and announcing it as a link would be a
         lie to anyone using a screen reader. Every child is reachable from
         the menu, so nothing is lost by not linking the parent. */
      var open = n.children.some(function (c) { return isActive(c.href); });
      var id = 'navsub-' + i;
      var kids = n.children.map(function (c) {
        return '<a href="' + c.href + '"' + (isActive(c.href) ? ' aria-current="page"' : '') + '>' +
          '<span class="ns-label">' + c.label + '</span>' +
          (c.desc ? '<span class="ns-desc">' + c.desc + '</span>' : '') +
          '</a>';
      }).join('');
      return '<div class="nav-group' + (open ? ' is-current' : '') + '">' +
          '<button type="button" class="nav-trigger" aria-expanded="false" aria-controls="' + id + '">' +
            (n.short || n.label) +
            '<i class="ti ti-chevron-down" aria-hidden="true"></i>' +
          '</button>' +
          '<div class="nav-sub" id="' + id + '">' + kids + '</div>' +
        '</div>';
    }).join('');
    return '' +
      '<header class="site-header">' +
        '<a class="logo" href="/"><img class="logo-mark" src="/assets/img/everest-logo.svg" alt="" aria-hidden="true" width="750" height="750" /><span>EVEREST</span></a>' +
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
            '<a class="logo" href="/"><img class="logo-mark" src="/assets/img/everest-logo.svg" alt="" aria-hidden="true" width="750" height="750" /><span>EVEREST</span></a>' +
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
              '<a href="/empower/">EMPOWER</a>' +
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

  /* Cursor glow trail.
     A short comet of teal light that follows the pointer. Purely decorative:
     the real cursor is untouched, so nothing about pointing, clicking or
     accessibility changes — this only adds light behind it.

     Skipped entirely for reduced-motion, and for touch or coarse pointers
     where there is no cursor to trail. The animation loop stops once the
     trail has caught up and restarts on the next movement, so an idle page
     costs nothing. */
  (function cursorTrail() {
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return;

    var COUNT = 8;
    var wrap = document.createElement('div');
    wrap.className = 'cursor-trail';
    wrap.setAttribute('aria-hidden', 'true');

    var dots = [];
    for (var i = 0; i < COUNT; i++) {
      var d = document.createElement('span');
      var t = i / (COUNT - 1);
      d.style.width = d.style.height = (26 - t * 16).toFixed(1) + 'px';
      d.style.opacity = (0.30 * (1 - t) + 0.04).toFixed(3);
      wrap.appendChild(d);
      dots.push({ el: d, x: -100, y: -100 });
    }
    document.body.appendChild(wrap);

    var mx = -100, my = -100, running = false, idle = 0;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY; idle = 0;
      if (!running) { running = true; window.requestAnimationFrame(step); }
    }, { passive: true });

    function step() {
      var px = mx, py = my, moved = false;
      for (var i = 0; i < dots.length; i++) {
        var dot = dots[i];
        var dx = px - dot.x, dy = py - dot.y;
        if (Math.abs(dx) > 0.4 || Math.abs(dy) > 0.4) moved = true;
        /* each dot chases the one ahead of it, easing more the further back
           it sits, which is what gives the trail its taper */
        dot.x += dx * (0.34 - i * 0.02);
        dot.y += dy * (0.34 - i * 0.02);
        dot.el.style.transform =
          'translate3d(' + dot.x.toFixed(1) + 'px,' + dot.y.toFixed(1) + 'px,0) translate(-50%,-50%)';
        px = dot.x; py = dot.y;
      }
      idle = moved ? 0 : idle + 1;
      if (idle > 30) { running = false; return; }   /* settled — stop burning frames */
      window.requestAnimationFrame(step);
    }
  })();

  /* Nav submenus.
     Opens on hover for pointer users and on click/Enter for everyone else,
     so it is usable by keyboard and on touch, where hover does not exist.
     Escape closes and returns focus to the trigger; clicking outside closes. */
  (function navGroups() {
    var groups = document.querySelectorAll('.nav-group');
    if (!groups.length) return;

    function close(group) {
      group.classList.remove('is-open');
      var t = group.querySelector('.nav-trigger');
      if (t) t.setAttribute('aria-expanded', 'false');
    }
    function closeAll(except) {
      Array.prototype.forEach.call(groups, function (g) { if (g !== except) close(g); });
    }

    Array.prototype.forEach.call(groups, function (group) {
      var trigger = group.querySelector('.nav-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', function (e) {
        e.preventDefault();
        var isOpen = group.classList.contains('is-open');
        closeAll(group);
        group.classList.toggle('is-open', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });

      group.addEventListener('mouseenter', function () {
        if (window.matchMedia('(hover: hover) and (min-width: 921px)').matches) {
          closeAll(group);
          group.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
      group.addEventListener('mouseleave', function () {
        if (window.matchMedia('(hover: hover) and (min-width: 921px)').matches) close(group);
      });

      group.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && group.classList.contains('is-open')) {
          close(group);
          trigger.focus();
        }
      });
      /* leaving the group by tabbing closes it */
      group.addEventListener('focusout', function (e) {
        if (!group.contains(e.relatedTarget)) close(group);
      });
    });

    document.addEventListener('click', function (e) {
      var inside = false;
      Array.prototype.forEach.call(groups, function (g) { if (g.contains(e.target)) inside = true; });
      if (!inside) closeAll(null);
    });
  })();

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
