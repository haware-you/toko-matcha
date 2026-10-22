/* ============================================================
   Toko Matcha — motion
   Character: poured and settled. Long, weighted, decelerating.
   Budget: mid-range Android at 60fps. Transform and opacity only,
   one scroll handler, and every loop pauses when it leaves the screen.
   ============================================================ */
(function () {
  'use strict';

  var root = document.documentElement;
  var motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = motionQuery.matches;

  /* ---------- 1. page-load sequence ---------- */
  // The hero holds its start-state until the first frame after the photograph
  // has decoded, so the choreography never plays against an empty box.
  function beginEntrance() {
    requestAnimationFrame(function () {
      root.classList.add('ready');
    });
  }

  var heroImg = document.querySelector('.hero__media img');
  if (!heroImg || heroImg.complete) {
    beginEntrance();
  } else {
    heroImg.addEventListener('load', beginEntrance, { once: true });
    heroImg.addEventListener('error', beginEntrance, { once: true });
    setTimeout(beginEntrance, 1200);           // never wait on a stalled image
  }

  /* ---------- 2. scroll reveals ---------- */
  var revealables = document.querySelectorAll('.reveal, .flavors');

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6%' });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- 3. continuous loops, gated on visibility ----------
     A rosette that spins and a glass that bobs cost nothing when they are
     on screen and everything when six of them run off screen at once. */
  function gateLoop(el, className) {
    if (!el || reduced) { return; }
    if (!('IntersectionObserver' in window)) { el.classList.add(className); return; }
    new IntersectionObserver(function (entries) {
      el.classList.toggle(className, entries[0].isIntersecting);
    }, { rootMargin: '10% 0px' }).observe(el);
  }

  gateLoop(document.querySelector('.badge'), 'spin');
  gateLoop(document.querySelector('.split__product'), 'float');

  /* ---------- 4. one scroll handler: hero zoom + powder parallax ---------- */
  var hero = document.querySelector('.hero');
  var powder = document.querySelector('.essence__pill');
  var powderImg = powder && powder.querySelector('img');
  var scrollTicking = false;

  function readScroll() {
    if (scrollTicking) { return; }
    scrollTicking = true;
    requestAnimationFrame(applyScroll);
  }

  function applyScroll() {
    scrollTicking = false;
    var y = window.scrollY;

    if (hero) {
      var p = Math.min(Math.max(y / hero.offsetHeight, 0), 1);
      hero.style.setProperty('--hs', (1 + p * 0.2).toFixed(4));
    }

    if (powderImg) {
      var box = powder.getBoundingClientRect();
      if (box.bottom > 0 && box.top < window.innerHeight) {
        // -1 above the viewport centre, +1 below it
        var centred = (box.top + box.height / 2 - window.innerHeight / 2) / window.innerHeight;
        powderImg.style.setProperty('--py', (centred * 26).toFixed(2) + 'px');
      }
    }
  }

  if (!reduced && (hero || powderImg)) {
    addEventListener('scroll', readScroll, { passive: true });
    addEventListener('resize', readScroll, { passive: true });
    applyScroll();
  }

  /* ---------- 5. ribbon marquee ---------- */
  var marquee = document.getElementById('ribbonMarquee');
  if (marquee) {
    var WORDS = ['Matcha Fruit Latte', 'Pistachio Cream Cheese', 'Sweet Matcha',
                 'Kukusan Depok', 'Open Every Day'];
    var phrase = WORDS.join(' · ') + ' · ';

    var startRibbon = function () {
      var pathLen = document.getElementById('ribbonPath').getTotalLength();
      marquee.textContent = phrase;
      var unit = marquee.getComputedTextLength();
      if (!unit) { return; }

      // repeat enough times that the band is always full, plus one spare cycle
      marquee.textContent = phrase.repeat(Math.ceil(pathLen / unit) + 2);
      if (reduced) { return; }

      var ribbon = document.querySelector('.ribbon');
      var visible = true;
      var running = false;
      var drift = 0;

      function frame() {
        if (!visible) { running = false; return; }
        drift -= 0.45;
        // the band also tracks the page, so it sweeps as you scroll past it
        marquee.setAttribute('startOffset', (drift - window.scrollY * 0.6) % unit);
        requestAnimationFrame(frame);
      }

      function run() {
        if (running) { return; }
        running = true;
        requestAnimationFrame(frame);
      }

      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          visible = entries[0].isIntersecting;
          if (visible) { run(); }
        }, { rootMargin: '20% 0px' }).observe(ribbon);
      } else {
        run();
      }
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(startRibbon);
    } else {
      addEventListener('load', startRibbon);
    }
  }

  /* ---------- 6. flavour picker ---------- */
  var cup = document.querySelector('.glow__cup');
  var cupLabel = document.getElementById('cupLabel');
  var cupPrice = document.getElementById('cupPrice');
  var flavors = document.querySelectorAll('.flavor');

  flavors.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-active')) { return; }
      flavors.forEach(function (b) { b.classList.remove('is-active'); });
      btn.classList.add('is-active');

      // the cup dips, swaps its label at the bottom of the dip, and comes back
      cup.classList.add('swap');
      setTimeout(function () {
        var parts = btn.dataset.name.split('& ');
        cupLabel.textContent = '';
        cupLabel.append(parts[0] + '&', document.createElement('br'), parts[1] || '');
        cupPrice.textContent = 'Rp' + btn.dataset.price;
        cup.classList.remove('swap');
      }, reduced ? 0 : 240);
    });
  });

  /* ---------- 7. menu overlay ---------- */
  var burger = document.getElementById('burger');
  var overlay = document.getElementById('menuOverlay');
  var closeBtn = document.getElementById('burgerClose');
  var closeTimer;

  function openMenu() {
    clearTimeout(closeTimer);
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('open'); });
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeMenu() {
    overlay.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    burger.focus();
    // exits run shorter than entrances
    closeTimer = setTimeout(function () { overlay.hidden = true; }, reduced ? 0 : 300);
  }

  if (burger && overlay) {
    burger.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    overlay.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) { closeMenu(); } });
  }

  /* ---------- 8. honour a mid-session preference change ---------- */
  motionQuery.addEventListener('change', function (e) { reduced = e.matches; });
})();
