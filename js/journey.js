/* Everest - scroll journey primitives.

   Powers the body-journey sections: a sticky visual that stays put while its
   copy steps scroll past, with a 0..1 progress value exposed to CSS so visuals
   can respond to scroll position without any animation library.

   Contract for markup:

     <section class="journey" data-journey>
       <div class="journey-visual">   <- sticks while the steps scroll
         ...svg / canvas / graphic...
       </div>
       <div class="journey-steps">
         <div class="jstep">...</div>
         <div class="jstep">...</div>
       </div>
     </section>

   What this sets on the .journey element:
     --p          0 at the moment the section starts passing, 1 when it ends
     data-step    index of the step currently in view (0-based)
     .is-active   on the current .jstep

   Everything degrades safely: with reduced motion, no JS, or no
   IntersectionObserver, the section renders as plain stacked content with all
   steps visible. No information is ever locked inside the animation. */
(function () {
  'use strict';

  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- shared rAF scheduler so multiple readers share one frame ---- */
  var readers = [];
  var queued = false;

  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(function () {
      queued = false;
      for (var i = 0; i < readers.length; i++) readers[i]();
    });
  }

  function listen() {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  }

  function clamp01(n) { return n < 0 ? 0 : (n > 1 ? 1 : n); }

  /* ---- ScrollProgressIndicator ----
     Thin bar showing how far through the page the reader is. Purely
     decorative, so it is hidden from assistive tech and skipped entirely
     when reduced motion is requested. */
  function initScrollProgress() {
    if (reduce) return;
    var bar = document.querySelector('.scroll-progress span');
    if (!bar) return;

    readers.push(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? clamp01(window.pageYOffset / max) : 0;
      bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    });
  }

  /* ---- BodyJourneySection ---- */
  function initJourneys() {
    var sections = document.querySelectorAll('[data-journey]');
    if (!sections.length) return;

    Array.prototype.forEach.call(sections, function (section) {
      var steps = section.querySelectorAll('.jstep');

      /* Static, complete state: every step visible, progress finished. */
      if (reduce || !('IntersectionObserver' in window)) {
        section.style.setProperty('--p', '1');
        section.setAttribute('data-step', String(Math.max(0, steps.length - 1)));
        Array.prototype.forEach.call(steps, function (s) { s.classList.add('is-active'); });
        return;
      }

      var active = false;

      /* Only read layout while the section is actually on screen. */
      var io = new IntersectionObserver(function (entries) {
        active = entries[0].isIntersecting;
        if (active) schedule();
      }, { rootMargin: '10% 0px 10% 0px' });
      io.observe(section);

      readers.push(function () {
        if (!active) return;

        var box = section.getBoundingClientRect();
        var vh = window.innerHeight;

        /* 0 when the section's top reaches the viewport top,
           1 when its bottom reaches the viewport bottom. */
        var travel = box.height - vh;
        var p = travel > 0 ? clamp01(-box.top / travel) : (box.top <= 0 ? 1 : 0);
        section.style.setProperty('--p', p.toFixed(4));

        if (!steps.length) return;

        /* Which step is active is decided by measuring where the steps
           actually are, not by dividing progress by their count. The steps
           have large padding and gaps, so an even split drifts out of sync
           and highlights the wrong copy. Nearest to the viewport's reading
           line (slightly above centre) wins. */
        var line = vh * 0.42;
        var idx = 0, bestDist = Infinity;
        for (var i = 0; i < steps.length; i++) {
          var r = steps[i].getBoundingClientRect();
          var dist = Math.abs((r.top + r.height / 2) - line);
          if (dist < bestDist) { bestDist = dist; idx = i; }
        }

        if (section.getAttribute('data-step') !== String(idx)) {
          section.setAttribute('data-step', String(idx));
          for (var i = 0; i < steps.length; i++) {
            steps[i].classList.toggle('is-active', i === idx);
          }
        }
      });
    });
  }

  function init() {
    initScrollProgress();
    initJourneys();
    if (readers.length) { listen(); schedule(); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
