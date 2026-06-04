/* ═══════════════════════════════════════════════════════════════
   Zambezi Futures demo — shared chrome, animations, helpers.
   Loaded on every page. Navbar/footer are injected so all pages
   stay in sync (mirrors the real app's app.js approach).
   ═══════════════════════════════════════════════════════════════ */
(function () {

  /* ───────── Navigation model ───────── */
  var NAV = [
    { key: 'home',      label: 'Home',      href: 'index.html' },
    { key: 'dashboard', label: 'Dashboard', href: 'dashboard.html' },
    { key: 'players',   label: 'Players',   href: 'players.html' },
    { key: 'academies', label: 'Academies', href: 'database.html' },
    { key: 'archive',   label: 'Archive',   href: 'archives.html' },
  ];

  function buildNavbar(active) {
    var links = NAV.map(function (n) {
      var cls = 'zf-nav-link' + (n.key === active ? ' active' : '');
      return '<a class="' + cls + '" href="' + n.href + '">' + n.label + '</a>';
    }).join('');
    return (
      '<nav class="zf-navbar" id="zfNavbar">' +
        '<div class="zf-navbar__inner">' +
          '<a class="zf-brand" href="index.html"><span class="zf-brand__mark">ZF</span>ZAMBEZI <span>FUTURES</span></a>' +
          '<button class="zf-nav-toggle" id="zfNavToggle" aria-label="Toggle menu" aria-expanded="false">☰ Menu</button>' +
          '<div class="zf-nav-links" id="zfNavLinks">' +
            links +
            '<a class="zf-nav-link zf-nav-cta" href="register.html">+ Register Player</a>' +
          '</div>' +
        '</div>' +
      '</nav>'
    );
  }

  function buildFooter() {
    return (
      '<footer class="zf-footer">' +
        '<div class="zf-footer__inner">' +
          '<div>' +
            '<div class="zf-footer__brand">ZAMBEZI <span>FUTURES</span></div>' +
            '<div style="font-size:.8rem;opacity:.6;margin-top:.25rem">Player Registry Centre · Season 2025/26</div>' +
          '</div>' +
          '<div class="text-center">' +
            '<span class="zf-demo-tag">⚠ Interactive demo · dummy data only</span>' +
          '</div>' +
          '<div style="font-size:.8rem;opacity:.6">© 2026 Zambezi Futures. All rights reserved.</div>' +
        '</div>' +
      '</footer>'
    );
  }

  function mountChrome() {
    var active = document.body.getAttribute('data-page') || '';
    var navMount = document.getElementById('navbarContainer');
    var footMount = document.getElementById('footerContainer');
    if (navMount)  navMount.innerHTML  = buildNavbar(active);
    if (footMount) footMount.innerHTML = buildFooter();

    /* mobile toggle */
    var toggle = document.getElementById('zfNavToggle');
    var links = document.getElementById('zfNavLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    /* navbar shadow on scroll */
    var nav = document.getElementById('zfNavbar');
    if (nav) {
      var onScroll = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  /* ───────── Scroll reveal ───────── */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ───────── Count-up ───────── */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var decimals = (el.getAttribute('data-decimals') | 0);
    var dur = 1100, start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);          // easeOutCubic
      var val = target * eased;
      el.textContent = (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = (decimals ? target.toFixed(decimals) : target.toLocaleString()) + suffix;
    }
    requestAnimationFrame(frame);
  }
  function initCounts() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(animateCount); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ───────── Mix-bar fill on reveal ───────── */
  function initMixBars() {
    var bars = document.querySelectorAll('.mix-fill[data-pct]');
    if (!bars.length || !('IntersectionObserver' in window)) {
      bars.forEach(function (b) { b.style.width = b.getAttribute('data-pct') + '%'; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.style.width = e.target.getAttribute('data-pct') + '%'; io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    bars.forEach(function (b) { io.observe(b); });
  }

  /* ───────── Helpers (shared) ───────── */
  function getQueryParam(name) { return new URLSearchParams(window.location.search).get(name); }

  function statusBadge(status) {
    var map = { Active:'badge-active', Pending:'badge-pending', Rejected:'badge-rejected', Inactive:'badge-inactive' };
    return '<span class="zf-badge ' + (map[status] || 'badge-inactive') + '">' + status + '</span>';
  }
  function divisionBadge(d) { return '<span class="zf-badge badge-division">' + d + '</span>'; }

  function initialsAvatar(name, size) {
    size = size || 40;
    var parts = name.trim().split(' ');
    var initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
    return '<div class="zf-avatar" style="width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * 0.34) + 'px">' + initials + '</div>';
  }

  /* Star/gear polygon point generator (deterministic — no randomness). */
  function poly(cx, cy, outerR, innerR, points, rotDeg) {
    var pts = [], rot = (rotDeg || 0) * Math.PI / 180;
    for (var i = 0; i < points * 2; i++) {
      var r = i % 2 === 0 ? outerR : innerR;
      var a = rot + i * Math.PI / points - Math.PI / 2;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }

  /* Distinct emblem motif per academy — themed to the club name. */
  function crestMotif(id, color, gold) {
    switch (id) {
      case 1: /* Victoria Falls FC — waterfall */
        return '<g stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round">' +
          '<path d="M40 30 q-4 8 0 16 q4 8 0 16"/><path d="M50 28 q-4 8 0 16 q4 8 0 16"/><path d="M60 30 q-4 8 0 16 q4 8 0 16"/></g>' +
          '<ellipse cx="50" cy="68" rx="17" ry="3.5" fill="rgba(255,255,255,.9)"/>';
      case 2: /* Zambezi Lions Academy — lion */
        return '<polygon points="' + poly(50, 48, 27, 18, 12) + '" fill="' + gold + '"/>' +
          '<circle cx="50" cy="49" r="15" fill="#fff"/>' +
          '<circle cx="44" cy="46" r="2.3" fill="' + color + '"/><circle cx="56" cy="46" r="2.3" fill="' + color + '"/>' +
          '<path d="M50 50 l-3.5 5 h7 z" fill="' + color + '"/><path d="M50 55 v3.5" stroke="' + color + '" stroke-width="1.6"/>';
      case 3: /* Riverside United — bridge + water */
        return '<path d="M28 56 A22 22 0 0 1 72 56" fill="none" stroke="#fff" stroke-width="4"/>' +
          '<path d="M28 56 V66 M72 56 V66 M50 45 V66" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M26 72 q6 -4 12 0 t12 0 t12 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
      case 4: /* Luapula Stars — stars */
        return '<polygon points="' + poly(50, 47, 23, 9.5, 5) + '" fill="' + gold + '"/>' +
          '<polygon points="' + poly(33, 66, 6.5, 2.6, 5) + '" fill="#fff"/>' +
          '<polygon points="' + poly(67, 66, 6.5, 2.6, 5) + '" fill="#fff"/>';
      case 5: /* Copperbelt Elite FC — gear */
        return '<polygon points="' + poly(50, 50, 27, 20, 9) + '" fill="' + gold + '"/>' +
          '<circle cx="50" cy="50" r="13" fill="#fff"/><circle cx="50" cy="50" r="6" fill="' + color + '"/>';
      case 6: /* Southern Cross Academy — constellation */
        return '<g fill="#fff">' +
          '<polygon points="' + poly(50, 30, 6, 2.4, 5) + '"/>' +
          '<polygon points="' + poly(50, 72, 6, 2.4, 5) + '"/>' +
          '<polygon points="' + poly(35, 52, 5, 2, 5) + '"/>' +
          '<polygon points="' + poly(65, 49, 5, 2, 5) + '"/>' +
          '<polygon points="' + poly(55, 61, 4, 1.6, 5) + '"/></g>';
      case 7: /* Kafue River Youth FC — fish + wave */
        return '<path d="M58 50 q-12 -11 -26 0 q14 11 26 0 z" fill="#fff"/>' +
          '<path d="M58 50 l11 -7 v14 z" fill="#fff"/>' +
          '<circle cx="39" cy="48" r="1.9" fill="' + color + '"/>' +
          '<path d="M24 66 q6 -4 12 0 t12 0 t12 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>';
      case 8: /* North Star Elite — compass star */
      default:
        return '<polygon points="' + poly(50, 50, 29, 8, 8) + '" fill="' + gold + '"/>' +
          '<polygon points="' + poly(50, 50, 15, 5, 4, 45) + '" fill="#fff"/>' +
          '<circle cx="50" cy="50" r="3" fill="' + color + '"/>';
    }
  }

  /* Generate a club-crest roundel SVG from an academy record. No external assets. */
  function academyLogo(academy, size) {
    size = size || 56;
    var color = academy.color || '#1b3a2d';
    var gold = '#c9a84c';
    return (
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + (academy.name || '') + ' crest">' +
        '<circle cx="50" cy="50" r="47" fill="' + color + '" stroke="' + gold + '" stroke-width="4"/>' +
        '<circle cx="50" cy="50" r="39" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1.5"/>' +
        crestMotif(academy.id, color, gold) +
      '</svg>'
    );
  }

  /* ───────── Boot ───────── */
  function boot() { mountChrome(); initReveal(); initCounts(); initMixBars(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.PRC = { getQueryParam, statusBadge, divisionBadge, initialsAvatar, academyLogo, animateCount };
})();
