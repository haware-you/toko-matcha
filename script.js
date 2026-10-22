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
  motionQuery.addEventListener('change', function (e) { reduced = e.matches; });

  // calls fn(true|false) as `el` enters and leaves the (margin-padded) viewport
  function whileVisible(el, margin, fn) {
    new IntersectionObserver(function (entries) { fn(entries[0].isIntersecting); },
      { rootMargin: margin }).observe(el);
  }

  /* ---------- 1. page-load sequence ---------- */
  // The hero holds its start-state until the photograph has decoded,
  // so the choreography never plays against an empty box.
  var started = false;
  function beginEntrance() {
    if (started) { return; }
    started = true;
    requestAnimationFrame(function () { root.classList.add('ready'); });
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
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6%' });
  document.querySelectorAll('.reveal, .flavors').forEach(function (el) { io.observe(el); });

  // the footer wordmark is mostly clipped, so it is cued by the legal row above it
  var mark = document.querySelector('.foot__mark');
  var legal = document.querySelector('.foot__legal');
  if (mark && legal) {
    whileVisible(legal, '0px', function (on) { if (on) { mark.classList.add('in'); } });
  }

  /* ---------- 3. continuous loops, gated on visibility ----------
     A rosette that spins and a glass that bobs cost nothing when they are
     on screen and everything when they run off screen. */
  [['.badge', 'spin'], ['.split__product', 'float']].forEach(function (pair) {
    var el = document.querySelector(pair[0]);
    if (el) {
      whileVisible(el, '10% 0px', function (on) { el.classList.toggle(pair[1], on && !reduced); });
    }
  });

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
    if (reduced) { return; }
    var vh = window.innerHeight;

    if (hero) {
      var p = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
      hero.style.setProperty('--hs', (1 + p * 0.2).toFixed(4));
    }

    if (powderImg) {
      var box = powder.getBoundingClientRect();
      if (box.bottom > 0 && box.top < vh) {
        // -1 above the viewport centre, +1 below it
        var centred = (box.top + box.height / 2 - vh / 2) / vh;
        powderImg.style.setProperty('--py', (centred * 26).toFixed(2) + 'px');
      }
    }
  }

  addEventListener('scroll', readScroll, { passive: true });
  addEventListener('resize', readScroll, { passive: true });
  applyScroll();

  /* ---------- 5. ribbon marquee ---------- */
  var marquee = document.getElementById('ribbonMarquee');
  if (marquee) {
    var phrase = ['Pure Matcha Latte', 'Pistachio Creamcheese', 'Matcha Latte Float',
                  'Kukusan Depok', 'Open Every Day'].join(' · ') + ' · ';
    var pathLen = document.getElementById('ribbonPath').getTotalLength();
    var unit = 0;
    var drift = 0;
    var visible = false;
    var running = false;

    // The type size changes at the breakpoints, so the length of one
    // phrase is measured again whenever the viewport is resized.
    var measure = function () {
      marquee.textContent = phrase;
      unit = marquee.getComputedTextLength();
      // repeat enough times that the band is always full, plus one spare cycle
      if (unit) { marquee.textContent = phrase.repeat(Math.ceil(pathLen / unit) + 2); }
    };

    var frame = function () {
      if (!visible || reduced || !unit) { running = false; return; }
      drift -= 0.45;
      // the band also tracks the page, so it sweeps as you scroll past it
      marquee.setAttribute('startOffset', (drift - window.scrollY * 0.6) % unit);
      requestAnimationFrame(frame);
    };

    var run = function () {
      if (running || !visible || reduced) { return; }
      running = true;
      requestAnimationFrame(frame);
    };

    document.fonts.ready.then(function () {
      measure();
      matchMedia('(max-width: 860px)').addEventListener('change', measure);
      matchMedia('(max-width: 560px)').addEventListener('change', measure);
      whileVisible(document.querySelector('.ribbon'), '20% 0px', function (on) {
        visible = on;
        run();
      });
      motionQuery.addEventListener('change', run);
    });
  }

  /* ---------- 6. flavour picker ---------- */
  var cup = document.querySelector('.glow__cup');
  var cupLabel = document.getElementById('cupLabel');
  var cupPrice = document.getElementById('cupPrice');
  var flavors = document.querySelectorAll('.flavor');
  var swapTimer;

  flavors.forEach(function (btn) {
    btn.setAttribute('aria-pressed', btn.classList.contains('is-active'));
    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-active')) { return; }
      flavors.forEach(function (b) {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-pressed', b === btn);
      });

      // the cup dips, swaps its label at the bottom of the dip, and comes back
      cup.classList.add('swap');
      cupPrice.classList.add('swap');
      clearTimeout(swapTimer);
      swapTimer = setTimeout(function () {
        var parts = btn.dataset.label.split('|');
        cupLabel.replaceChildren(parts[0], document.createElement('br'), parts[1] || '');
        cupPrice.textContent = 'Rp' + btn.dataset.price;
        cup.classList.remove('swap');
        cupPrice.classList.remove('swap');
      }, reduced ? 0 : 240);
    });
  });

  /* ---------- 7. menu overlay ---------- */
  var burger = document.getElementById('burger');
  var overlay = document.getElementById('menuOverlay');
  var closeBtn = document.getElementById('burgerClose');
  var shell = document.querySelector('.shell');
  var closeTimer;

  function setOpen(open) {
    clearTimeout(closeTimer);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
    shell.inert = open;                        // keeps focus inside the overlay
    if (open) {
      overlay.hidden = false;
      requestAnimationFrame(function () { overlay.classList.add('open'); });
      closeBtn.focus();
    } else {
      overlay.classList.remove('open');
      // preventScroll: a menu link is about to scroll somewhere else
      burger.focus({ preventScroll: true });
      // exits run shorter than entrances
      closeTimer = setTimeout(function () { overlay.hidden = true; }, reduced ? 0 : 300);
    }
  }

  if (burger && overlay) {
    burger.addEventListener('click', function () { setOpen(true); });
    closeBtn.addEventListener('click', function () { setOpen(false); });
    overlay.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('open')) { setOpen(false); }
    });
  }
})();
