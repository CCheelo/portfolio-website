/* ═══════════════════════════════════════════════════════════════
   Copper · Forecast Lab — shared chrome, animations, helpers,
   Chart.js factories, and interactive widgets. Loaded on every page.
   Navbar/footer are injected so all pages stay in sync (mirrors
   emh-demo/js/app.js). To change navigation, edit the NAV array below
   only — every page picks it up via <body data-page>.

   Drawn paths are SIMULATED from the study's real estimated parameters
   with a seeded RNG (deterministic). Real point estimates are passed
   in as anchors. See window.COPPER_DATA.honesty.
   ═══════════════════════════════════════════════════════════════ */
(function () {

  /* ───────── Navigation model ───────── */
  var NAV = [
    { key: 'home',       label: 'Home',       href: 'index.html' },
    { key: 'forecast',   label: 'Forecast',   href: 'forecast.html' },
    { key: 'volatility', label: 'Volatility', href: 'volatility.html' },
  ];

  function buildNavbar(active) {
    var links = NAV.map(function (n) {
      var cls = 'cu-nav-link' + (n.key === active ? ' active' : '');
      return '<a class="' + cls + '" href="' + n.href + '">' + n.label + '</a>';
    }).join('');
    return (
      '<nav class="cu-navbar" id="cuNavbar">' +
        '<div class="cu-navbar__inner">' +
          '<a class="cu-brand" href="index.html"><span class="cu-brand__mark">Cu</span>Copper <span>·</span> Forecast Lab</a>' +
          '<button class="cu-nav-toggle" id="cuNavToggle" aria-label="Toggle menu" aria-expanded="false">☰ Menu</button>' +
          '<div class="cu-nav-links" id="cuNavLinks">' +
            links +
            '<a class="cu-nav-link cu-nav-cta" href="../reports/copper-forecasting-report.pdf" target="_blank" rel="noopener">Full Report ↗</a>' +
          '</div>' +
        '</div>' +
      '</nav>'
    );
  }

  function buildFooter() {
    var m = (window.COPPER_DATA && COPPER_DATA.meta) || {};
    return (
      '<footer class="cu-footer">' +
        '<div class="cu-footer__inner">' +
          '<div>' +
            '<div class="cu-footer__brand">Copper <span>Forecast Lab</span></div>' +
            '<div style="font-size:.78rem;color:var(--muted);margin-top:.3rem">' +
              (m.author || 'Choolwe Cheelo') + ' · ' + (m.programme || 'University of Zambia') +
            '</div>' +
          '</div>' +
          '<div class="text-center"><span class="cu-demo-tag">⚠ Interactive demo · real estimates · simulated paths</span></div>' +
          '<div style="font-size:.78rem;color:var(--muted)">© 2026 · <a href="../project-copper.html" style="color:var(--text-2)">Back to portfolio</a></div>' +
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

    var toggle = document.getElementById('cuNavToggle');
    var links = document.getElementById('cuNavLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    var nav = document.getElementById('cuNavbar');
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
    var prefix = el.getAttribute('data-prefix') || '';
    var decimals = (el.getAttribute('data-decimals') | 0);
    var dur = 1150, start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = prefix + (decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = prefix + (decimals ? target.toFixed(decimals) : Math.round(target).toLocaleString()) + suffix;
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

  /* ───────── whenVisible — defer chart creation until on-screen ───────── */
  function whenVisible(el, cb) {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { cb(); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); cb(); }
      });
    }, { threshold: 0.18 });
    io.observe(el);
  }

  /* ───────── Helpers (shared) ───────── */
  function getQueryParam(name) { return new URLSearchParams(window.location.search).get(name); }

  /* ───────── Seeded RNG (deterministic) ───────── */
  function makeRng(seed) {
    var s = (seed >>> 0) || 1;
    return function () {
      s |= 0; s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function seedFromString(str) {
    var h = 2166136261 >>> 0;
    str = String(str);
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function gauss(rng) {
    var u = 0, v = 0;
    while (u === 0) u = rng();
    while (v === 0) v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  /* Student-t sample with v d.f. (heavy tails): Z / sqrt(W/v), W ~ chi-square. */
  function studentT(rng, v) {
    var k = Math.max(3, Math.round(v));
    var w = 0;
    for (var i = 0; i < k; i++) { var g = gauss(rng); w += g * g; }
    return gauss(rng) / Math.sqrt(w / k);
  }

  /* iid log-returns ~ N(mean, sd) */
  function seededReturns(mean, sd, n, seed) {
    var rng = makeRng(seed >>> 0);
    var out = [];
    for (var i = 0; i < n; i++) out.push(mean + sd * gauss(rng));
    return out;
  }
  /* AR(1) log-returns: rₜ = mean + φ·rₜ₋₁ + ε,  Var preserved at sd² */
  function ar1Returns(mean, sd, phi, n, seed) {
    var rng = makeRng(seed >>> 0);
    var innov = sd * Math.sqrt(Math.max(1e-4, 1 - phi * phi));
    var out = [], prev = 0;
    for (var i = 0; i < n; i++) {
      var r = phi * prev + innov * gauss(rng);
      prev = r;
      out.push(mean + r);
    }
    return out;
  }
  /* GARCH(1,1) returns + conditional-SD path (units: same as ω/α/β — percent).
     σ²ₜ = ω + α·ε²ₜ₋₁ + β·σ²ₜ₋₁,  εₜ = σₜ·zₜ  (z heavy-tailed). */
  function garchReturns(mean, omega, alpha, beta, n, seed, shape) {
    var rng = makeRng(seed >>> 0);
    var uncond = omega / Math.max(1e-4, 1 - alpha - beta);
    var s2 = uncond, rets = [], vol = [], prevEps = 0;
    for (var i = 0; i < n; i++) {
      s2 = omega + alpha * prevEps * prevEps + beta * s2;
      var sd = Math.sqrt(Math.max(1e-6, s2));
      var z = shape ? studentT(rng, shape) : gauss(rng);
      var eps = sd * z;
      prevEps = eps;
      rets.push(mean + eps);
      vol.push(sd);
    }
    return { rets: rets, vol: vol, uncondSd: Math.sqrt(uncond) };
  }

  /* ═══════════════ Chart.js — dark theme defaults ═══════════════ */
  var C = {
    copper: '#d08a4a', copperSoft: 'rgba(208,138,74,.18)',
    forecast: '#ea6a2c', forecastSoft: 'rgba(234,106,44,.16)',
    accent: '#d08a4a', accentSoft: 'rgba(208,138,74,.18)',
    red: '#f87171', redSoft: 'rgba(248,113,113,.20)',
    green: '#34d399', greenSoft: 'rgba(52,211,153,.20)',
    gold: '#d4a24c', goldSoft: 'rgba(212,162,76,.16)',
    muted: '#a89a7c', mutedSoft: 'rgba(168,154,124,.22)',
    grid: 'rgba(255,255,255,.055)', text: '#cdbfa6', tick: '#a89a7c',
  };
  if (window.Chart) {
    Chart.defaults.color = C.text;
    Chart.defaults.borderColor = C.grid;
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.maintainAspectRatio = false;
    Chart.defaults.animation = { duration: 950, easing: 'easeOutCubic' };
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.padding = 14;
    var tt = Chart.defaults.plugins.tooltip;
    tt.backgroundColor = 'rgba(14,11,6,.96)'; tt.borderColor = '#52442b'; tt.borderWidth = 1;
    tt.titleColor = '#fff'; tt.bodyColor = '#cdbfa6'; tt.padding = 10; tt.cornerRadius = 8;
    tt.titleFont = { family: "'JetBrains Mono', monospace", weight: '700' };
  }

  function gridScale(extra) {
    var base = { grid: { color: C.grid, drawTicks: false }, ticks: { color: C.tick }, border: { display: false } };
    return Object.assign(base, extra || {});
  }

  var DATA = window.COPPER_DATA || {};

  /* ── Simulated 2000–2025 copper price path through real landmark anchors. ── */
  function buildCopperPath(seed) {
    /* [yearDecimal, price] control points — endpoints (~1,800 → ~9,400) and the
       2008/2011/2020/2022 landmarks are real; the path between is illustrative. */
    var anchors = [
      [2000.9, 1820], [2004, 3100], [2006, 7000], [2007.5, 8000], [2008.2, 8700],
      [2008.9, 3100], [2010, 7500], [2011.1, 9800], [2013, 7300], [2015.5, 5100],
      [2016.1, 4600], [2018, 6800], [2020.2, 4700], [2021, 9300], [2022.2, 10800],
      [2022.8, 7300], [2023.5, 8400], [2024.5, 9700], [2025.4, 9400],
    ];
    var rng = makeRng(seed || 2025);
    var pts = [], months = 12, wobble = 0;
    for (var ai = 0; ai < anchors.length - 1; ai++) {
      var y0 = anchors[ai][0], p0 = anchors[ai][1], y1 = anchors[ai + 1][0], p1 = anchors[ai + 1][1];
      var steps = Math.max(2, Math.round((y1 - y0) * months));
      for (var s = 0; s < steps; s++) {
        var f = s / steps;
        var base = p0 * Math.pow(p1 / p0, f);            // log-linear interp
        wobble = wobble * 0.78 + (rng() - 0.5) * 0.05;   // smooth AR(1) jitter
        pts.push({ x: y0 + (y1 - y0) * f, y: base * (1 + wobble) });
      }
    }
    pts.push({ x: anchors[anchors.length - 1][0], y: anchors[anchors.length - 1][1] });
    return pts;
  }

  /* Home hero: simulated price 2000→2025 + a flat-ish random-walk forecast cone. */
  function pricePathChart(el, opts) {
    if (!window.Chart) return null;
    opts = opts || {};
    var hist = buildCopperPath(opts.seed || 2025);
    var last = hist[hist.length - 1];
    var fc = [{ x: last.x, y: last.y }], up = [{ x: last.x, y: last.y }], lo = [{ x: last.x, y: last.y }];
    var rng = makeRng(opts.fcSeed || 88), p = last.y, vol = last.y * 0.018;
    for (var k = 1; k <= 30; k++) {
      p = p * Math.exp((rng() - 0.5) * 0.02);            // random walk (no drift)
      var spread = vol * Math.sqrt(k);                   // widening ±band
      var xk = last.x + k / 12;
      fc.push({ x: xk, y: p }); up.push({ x: xk, y: p + 1.6 * spread }); lo.push({ x: xk, y: p - 1.6 * spread });
    }
    return new Chart(el, {
      type: 'line',
      data: {
        datasets: [
          { label: 'Daily copper price', data: hist, borderColor: C.copper, backgroundColor: C.copperSoft,
            borderWidth: 2, fill: true, tension: 0.15, pointRadius: 0 },
          { label: 'Forecast band', data: up, borderColor: 'transparent', backgroundColor: C.forecastSoft,
            fill: '+1', pointRadius: 0, tension: 0.2 },
          { label: '_lo', data: lo, borderColor: 'transparent', pointRadius: 0, tension: 0.2 },
          { label: 'Random-walk forecast', data: fc, borderColor: C.forecast, borderDash: [6, 4],
            borderWidth: 2, pointRadius: 0, tension: 0.2 },
        ],
      },
      options: {
        plugins: {
          legend: { display: opts.legend !== false, position: 'top', align: 'start',
            labels: { filter: function (i) { return i.text.indexOf('_') !== 0; } } },
          tooltip: { callbacks: { title: function (it) { return 'Year ' + it[0].parsed.x.toFixed(1); },
            label: function (it) { return '$' + Math.round(it.parsed.y).toLocaleString() + ' / t'; } } },
        },
        interaction: { intersect: false, mode: 'nearest', axis: 'x' },
        scales: {
          x: gridScale({ type: 'linear', min: 2000, max: 2028,
            ticks: { color: C.tick, maxTicksLimit: 8, callback: function (v) { return Math.round(v); } } }),
          y: gridScale({ title: { display: true, text: 'US$ / tonne', color: C.tick },
            ticks: { color: C.tick, callback: function (v) { return (v / 1000) + 'k'; } } }),
        },
      },
    });
  }

  /* Forecast page: hold-out actual vs AR(2) one-step forecast (≈ lagged price). */
  function backtestChart(el, opts) {
    if (!window.Chart) return null;
    opts = opts || {};
    var n = opts.n || 120, base = opts.base || 9300;
    var rng = makeRng(opts.seed || 252);
    var actual = [], fcast = [], labels = [], p = base, prev = base;
    for (var i = 0; i < n; i++) {
      labels.push(i + 1);
      actual.push(p);
      /* AR(2) one-step forecast ≈ yesterday's price with a tiny mean-reversion nudge */
      fcast.push(prev + (p - prev) * -0.08);
      prev = p;
      p = p * Math.exp((rng() - 0.5) * 0.026);
    }
    return new Chart(el, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Actual price', data: actual, borderColor: C.copper, backgroundColor: C.copperSoft,
            borderWidth: 2, fill: false, tension: 0.15, pointRadius: 0 },
          { label: 'ARMA(2,0) one-step forecast', data: fcast, borderColor: C.forecast, borderDash: [5, 3],
            borderWidth: 1.8, pointRadius: 0, tension: 0.15 },
        ],
      },
      options: {
        plugins: { legend: { position: 'top', align: 'start' },
          tooltip: { callbacks: { label: function (it) { return it.dataset.label + ': $' + Math.round(it.parsed.y).toLocaleString(); } } } },
        interaction: { intersect: false, mode: 'index' },
        scales: {
          x: gridScale({ title: { display: true, text: 'Hold-out trading day (last 252)', color: C.tick },
            ticks: { color: C.tick, maxTicksLimit: 8 } }),
          y: gridScale({ title: { display: true, text: 'US$ / tonne', color: C.tick },
            ticks: { color: C.tick, callback: function (v) { return (v / 1000).toFixed(1) + 'k'; } } }),
        },
      },
    });
  }

  /* Forecast page: ACF & PACF of returns with ±1.96/√n band (real AR(2) coefs). */
  function acfPacfChart(el, opts) {
    if (!window.Chart) return null;
    opts = opts || {};
    var maxLag = opts.maxLag || 14, n = opts.n || (DATA.meta ? DATA.meta.nObs : 6298);
    var coef = (DATA.ar2 && DATA.ar2.coef) || [];
    var a1 = (coef[0] && coef[0].est) || -0.0806, a2 = (coef[1] && coef[1].est) || -0.0847;
    var band = 1.96 / Math.sqrt(n);
    var rng = makeRng(opts.seed || 17);
    /* ACF by Yule-Walker recursion; PACF cuts off after lag 2 for AR(2). */
    var acf = [], pacf = [], labels = [], r1 = a1 / (1 - a2), r2 = a2 + a1 * r1, prev2 = 1, prev1 = r1;
    for (var k = 1; k <= maxLag; k++) {
      var av;
      if (k === 1) av = r1; else if (k === 2) av = r2; else { av = a1 * prev1 + a2 * prev2; }
      prev2 = (k === 1) ? r1 : prev1; prev1 = av;
      acf.push(av + (k > 2 ? (rng() - 0.5) * band * 0.5 : 0));
      var pv = (k === 1) ? r1 : (k === 2) ? a2 : (rng() - 0.5) * band * 0.8;
      pacf.push(pv);
      labels.push(k);
    }
    function bar(arr, col, colSoft) {
      return arr.map(function (v) { return Math.abs(v) > band ? col : colSoft; });
    }
    return new Chart(el, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'ACF', data: acf, backgroundColor: bar(acf, C.copper, C.mutedSoft),
            borderColor: bar(acf, C.copper, C.muted), borderWidth: 1, categoryPercentage: 0.7, barPercentage: 0.9 },
          { label: 'PACF', data: pacf, backgroundColor: bar(pacf, C.gold, C.mutedSoft),
            borderColor: bar(pacf, C.gold, C.muted), borderWidth: 1, categoryPercentage: 0.7, barPercentage: 0.9 },
          { type: 'line', label: '±1.96/√n', data: labels.map(function () { return band; }),
            borderColor: C.forecast, borderDash: [5, 4], borderWidth: 1.2, pointRadius: 0 },
          { type: 'line', label: '_negband', data: labels.map(function () { return -band; }),
            borderColor: C.forecast, borderDash: [5, 4], borderWidth: 1.2, pointRadius: 0 },
        ],
      },
      options: {
        plugins: {
          legend: { position: 'top', align: 'start', labels: { filter: function (i) { return i.text.indexOf('_') !== 0; } } },
          tooltip: { callbacks: { title: function (it) { return 'Lag ' + it[0].label; },
            label: function (it) { return it.dataset.label + ': ' + (typeof it.raw === 'number' ? it.raw.toFixed(4) : it.raw); } } },
        },
        scales: {
          x: gridScale({ title: { display: true, text: 'Lag', color: C.tick }, grid: { display: false } }),
          y: gridScale({ suggestedMin: -0.12, suggestedMax: 0.12 }),
        },
      },
    });
  }

  /* Forecast page: direction-accuracy gauge vs the 50% coin-flip line. */
  function directionGauge(el, pct) {
    if (!window.Chart) return null;
    pct = pct == null ? 49.2 : pct;
    var centerText = {
      id: 'cuCenterText',
      afterDraw: function (chart) {
        var ctx = chart.ctx, area = chart.chartArea;
        var cx = (area.left + area.right) / 2, cy = (area.top + area.bottom) / 2 + 6;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff'; ctx.font = "700 30px 'JetBrains Mono', monospace";
        ctx.fillText(pct.toFixed(1) + '%', cx, cy);
        ctx.fillStyle = C.tick; ctx.font = "600 11px 'Inter', sans-serif";
        ctx.fillText('correct direction', cx, cy + 20);
        ctx.restore();
      },
    };
    return new Chart(el, {
      type: 'doughnut',
      data: {
        labels: ['Called correctly', 'Called wrong'],
        datasets: [{ data: [pct, 100 - pct], backgroundColor: [C.copperSoft, 'rgba(168,154,124,.12)'],
          borderColor: [C.copper, C.muted], borderWidth: 1.5, hoverOffset: 4 }],
      },
      options: { cutout: '72%', rotation: -90, circumference: 360,
        plugins: { legend: { position: 'bottom' },
          tooltip: { callbacks: { label: function (it) { return it.label + ': ' + it.raw.toFixed(1) + '%'; } } } } },
      plugins: [centerText],
    });
  }

  /* Volatility page: BIC comparison (lower = better). */
  function bicCompareBars(el, models) {
    if (!window.Chart) return null;
    models = models || DATA.modelCompare || [];
    return new Chart(el, {
      type: 'bar',
      data: {
        labels: models.map(function (m) { return m.name; }),
        datasets: [{ label: 'BIC (lower is better)', data: models.map(function (m) { return m.bic; }),
          backgroundColor: [C.mutedSoft, C.copperSoft], borderColor: [C.muted, C.copper],
          borderWidth: 1.5, borderRadius: 7, categoryPercentage: 0.62, barPercentage: 0.8 }],
      },
      options: {
        indexAxis: 'y',
        plugins: { legend: { display: false },
          tooltip: { callbacks: { label: function (it) { return 'BIC ' + Math.round(it.raw).toLocaleString(); } } } },
        scales: {
          x: gridScale({ suggestedMin: 20000, title: { display: true, text: 'Bayesian Information Criterion', color: C.tick },
            ticks: { color: C.tick, callback: function (v) { return (v / 1000) + 'k'; } } }),
          y: gridScale({ grid: { display: false }, ticks: { color: C.text, font: { family: "'JetBrains Mono', monospace" } } }),
        },
      },
    });
  }

  /* Volatility page: returns + conditional-vol band. mode 'garch' | 'constant'. */
  function volatilityChart(el, opts) {
    if (!window.Chart) return null;
    opts = opts || {};
    var g = DATA.garch || { omega: 0.08, alpha1: 0.105, beta1: 0.868, shape: 4.58 };
    var n = opts.n || 320;
    var sim = garchReturns(0, g.omega, g.alpha1, g.beta1, n, opts.seed || 2008, g.shape);
    var labels = []; for (var i = 0; i < n; i++) labels.push(i + 1);
    var mode = opts.mode || 'garch';
    var band = sim.vol.map(function (s) { return mode === 'garch' ? 1.96 * s : 1.96 * sim.uncondSd; });
    var upper = band, lower = band.map(function (b) { return -b; });
    var bandLabel = mode === 'garch' ? 'GARCH ±1.96σₜ (time-varying)' : 'ARMA ±1.96σ (constant)';
    var bandCol = mode === 'garch' ? C.copper : C.muted;
    var bandFill = mode === 'garch' ? C.copperSoft : C.mutedSoft;
    return new Chart(el, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Daily log return (%)', data: sim.rets, borderColor: 'rgba(205,191,166,.55)',
            borderWidth: 1, pointRadius: 0, tension: 0, fill: false, order: 3 },
          { label: bandLabel, data: upper, borderColor: bandCol, backgroundColor: bandFill,
            borderWidth: 1.6, pointRadius: 0, fill: '+1', tension: 0.25, order: 1 },
          { label: '_lower', data: lower, borderColor: bandCol, borderWidth: 1.6, pointRadius: 0, tension: 0.25, order: 1 },
        ],
      },
      options: {
        plugins: {
          legend: { position: 'top', align: 'start', labels: { filter: function (i) { return i.text.indexOf('_') !== 0; } } },
          tooltip: { mode: 'index', intersect: false,
            callbacks: { label: function (it) { return it.dataset.label.replace('_lower', 'band') + ': ' + it.raw.toFixed(2) + '%'; } } },
        },
        scales: {
          x: gridScale({ title: { display: true, text: 'Trading day', color: C.tick }, ticks: { color: C.tick, maxTicksLimit: 8 } }),
          y: gridScale({ suggestedMin: -8, suggestedMax: 8, title: { display: true, text: 'Return / band (%)', color: C.tick } }),
        },
      },
    });
  }

  /* Volatility page: return histogram (Student-t) vs Normal reference — fat tails. */
  function fatTailHist(el, opts) {
    if (!window.Chart) return null;
    opts = opts || {};
    var v = opts.shape || (DATA.garch ? DATA.garch.shape : 4.58);
    var sd = opts.sd || 1.6, n = opts.n || 4000, bins = opts.bins || 41;
    var rng = makeRng(opts.seed || 71), samples = [], lo = -7, hi = 7;
    for (var i = 0; i < n; i++) {
      var x = sd * studentT(rng, v);
      if (x < lo) x = lo; if (x > hi) x = hi;
      samples.push(x);
    }
    var w = (hi - lo) / bins, counts = new Array(bins).fill(0), centers = [];
    for (var b = 0; b < bins; b++) centers.push(lo + w * (b + 0.5));
    samples.forEach(function (x) { counts[Math.min(bins - 1, Math.max(0, Math.floor((x - lo) / w)))]++; });
    var maxCount = Math.max.apply(null, counts);
    var pdf = centers.map(function (c) { return Math.exp(-0.5 * Math.pow(c / sd, 2)); });
    var maxPdf = Math.max.apply(null, pdf);
    var normLine = pdf.map(function (q) { return q / maxPdf * maxCount; });
    return new Chart(el, {
      type: 'bar',
      data: {
        labels: centers.map(function (c) { return c.toFixed(1); }),
        datasets: [
          { label: 'Simulated returns (t, ' + v.toFixed(1) + ' d.f.)', data: counts,
            backgroundColor: C.copperSoft, borderColor: C.copper, borderWidth: 1,
            categoryPercentage: 1, barPercentage: 1, order: 2 },
          { type: 'line', label: 'Normal reference', data: normLine, borderColor: C.gold,
            borderWidth: 1.8, pointRadius: 0, tension: 0.35, order: 1 },
        ],
      },
      options: {
        plugins: { legend: { position: 'top', align: 'start' },
          tooltip: { callbacks: { title: function (it) { return 'Return ≈ ' + it[0].label + '%'; } } } },
        scales: {
          x: gridScale({ grid: { display: false }, ticks: { color: C.tick, maxTicksLimit: 9 },
            title: { display: true, text: 'Daily log return (%)', color: C.tick } }),
          y: gridScale({ title: { display: true, text: 'Frequency', color: C.tick } }),
        },
      },
    });
  }

  /* Volatility page: how a shock's impact decays — (α+β)^h vs a low-persistence ref. */
  function persistenceDecayChart(el, persistence) {
    if (!window.Chart) return null;
    var H = 40, labels = [], hi = [], loRef = [];
    for (var h = 0; h <= H; h++) {
      labels.push(h);
      hi.push(Math.pow(persistence, h) * 100);
      loRef.push(Math.pow(0.5, h) * 100);
    }
    return new Chart(el, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Copper  α+β = ' + persistence.toFixed(3), data: hi, borderColor: C.copper,
            backgroundColor: C.copperSoft, borderWidth: 2.4, fill: true, tension: 0.2, pointRadius: 0 },
          { label: 'Low persistence (0.50)', data: loRef, borderColor: C.muted, borderDash: [6, 4],
            borderWidth: 1.5, fill: false, tension: 0.2, pointRadius: 0 },
        ],
      },
      options: {
        plugins: { legend: { position: 'top', align: 'start' },
          tooltip: { callbacks: { title: function (it) { return 'After ' + it[0].label + ' days'; },
            label: function (it) { return it.dataset.label.split('  ')[0] + ': ' + it.raw.toFixed(1) + '% of shock remains'; } } } },
        scales: {
          x: gridScale({ title: { display: true, text: 'Days after a volatility shock', color: C.tick } }),
          y: gridScale({ suggestedMin: 0, suggestedMax: 100, title: { display: true, text: '% of shock remaining', color: C.tick },
            ticks: { color: C.tick, callback: function (val) { return val + '%'; } } }),
        },
      },
    });
  }

  /* ═══════════════ Interactive widgets ═══════════════ */

  /* Beat-the-random-walk: predict UP/DOWN; hit-rate lands near 50%. */
  function initGuessGame(root) {
    if (!root) return;
    var maxRounds = parseInt(root.getAttribute('data-rounds') || '15', 10);
    var seq = seededReturns(0, 0.017, maxRounds + 1, parseInt(root.getAttribute('data-seed') || '4317', 10));
    var priceEl  = root.querySelector('[data-cu-price]');
    var moveEl   = root.querySelector('[data-cu-move]');
    var upBtn    = root.querySelector('[data-cu-up]');
    var downBtn  = root.querySelector('[data-cu-down]');
    var youEl    = root.querySelector('[data-cu-you]');
    var roundsEl = root.querySelector('[data-cu-rounds]');
    var barEl    = root.querySelector('[data-cu-progress] > i');
    var resultEl = root.querySelector('[data-cu-result]');
    var resultTx = root.querySelector('[data-cu-result-text]');
    var resultHd = root.querySelector('[data-cu-result-head]');

    var price = 9450, idx = 0, rounds = 0, hits = 0;
    function render() {
      if (priceEl) priceEl.innerHTML = '$' + Math.round(price).toLocaleString() + '<span class="unit">/ t</span>';
      if (youEl) youEl.textContent = hits;
      if (roundsEl) roundsEl.textContent = rounds + ' / ' + maxRounds;
      if (barEl) barEl.style.width = (rounds / maxRounds * 100) + '%';
    }
    function guess(dir) {
      if (rounds >= maxRounds) return;
      var r = seq[idx++];
      var actual = r >= 0 ? 'up' : 'down';
      var correct = (dir === actual);
      if (correct) hits++;
      rounds++;
      price = price * Math.exp(r);
      if (moveEl) {
        moveEl.className = 'game__move ' + actual;
        moveEl.textContent = (actual === 'up' ? '▲ +' : '▼ −') + Math.abs(r * 100).toFixed(2) + '%  ·  you were ' +
          (correct ? 'right ✓' : 'wrong ✗');
      }
      render();
      if (rounds >= maxRounds) finish();
    }
    function finish() {
      if (upBtn) upBtn.disabled = true;
      if (downBtn) downBtn.disabled = true;
      var pct = Math.round(hits / maxRounds * 100);
      if (resultHd) resultHd.textContent = 'You called ' + hits + ' / ' + maxRounds + ' right  ·  ' + pct + '%';
      if (resultTx) resultTx.innerHTML =
        'The fitted <b>ARMA(2,0)</b> model managed just <b>49.2%</b> over the 252-day hold-out — and a coin flip is 50%. ' +
        'Whatever you scored, the takeaway is the same: copper’s next-day <b>direction</b> is essentially ' +
        '<b>unforecastable</b>. The predictability lives in its <em>volatility</em>, not its direction.';
      if (resultEl) resultEl.classList.add('show');
    }
    if (upBtn) upBtn.addEventListener('click', function () { guess('up'); });
    if (downBtn) downBtn.addEventListener('click', function () { guess('down'); });
    render();
  }

  /* Constant-vs-GARCH toggle over the volatility chart. */
  function initVolToggle(root) {
    if (!root) return;
    var canvas = root.querySelector('[data-cu-vol-canvas]');
    var btns = root.querySelectorAll('[data-cu-vol-mode]');
    if (!canvas) return;
    var chart = null;
    function build(mode) {
      if (chart) chart.destroy();
      chart = volatilityChart(canvas, { mode: mode });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        build(b.getAttribute('data-cu-vol-mode'));
      });
    });
    whenVisible(canvas, function () { build('garch'); });
  }

  /* Volatility persistence slider → decay curve + shock half-life readout. */
  function initPersistenceSlider(root) {
    if (!root) return;
    var input = root.querySelector('[data-cu-persistence]');
    var valEl = root.querySelector('[data-cu-persistence-val]');
    var halfEl = root.querySelector('[data-cu-halflife]');
    var canvas = root.querySelector('[data-cu-persistence-canvas]');
    if (!input || !canvas) return;
    var chart = null;
    function update() {
      var p = parseFloat(input.value);
      if (valEl) valEl.textContent = p.toFixed(3);
      if (halfEl) {
        var hl = Math.log(0.5) / Math.log(p);
        halfEl.textContent = isFinite(hl) ? Math.round(hl) + ' days' : '∞';
      }
      if (chart) chart.destroy();
      chart = persistenceDecayChart(canvas, p);
    }
    input.addEventListener('input', update);
    whenVisible(canvas, update);
  }

  /* ═══════════════ Declarative auto-init ═══════════════ */
  var CHART_FACTORIES = {
    pricePath:   function (el) { return pricePathChart(el, {}); },
    backtest:    function (el) { return backtestChart(el, {}); },
    acfPacf:     function (el) { return acfPacfChart(el, {}); },
    direction:   function (el) { return directionGauge(el, DATA.backtest ? DATA.backtest.directionPct : 49.2); },
    bicCompare:  function (el) { return bicCompareBars(el, DATA.modelCompare); },
    fatTail:     function (el) { return fatTailHist(el, {}); },
  };
  function initCharts() {
    document.querySelectorAll('[data-cu-chart]').forEach(function (el) {
      var name = el.getAttribute('data-cu-chart');
      var f = CHART_FACTORIES[name];
      if (f) whenVisible(el, function () { f(el); });
    });
  }
  function initWidgets() {
    document.querySelectorAll('[data-cu-game]').forEach(initGuessGame);
    document.querySelectorAll('[data-cu-vol]').forEach(initVolToggle);
    document.querySelectorAll('[data-cu-persistence-widget]').forEach(initPersistenceSlider);
  }

  /* ───────── Boot ───────── */
  function boot() { mountChrome(); initReveal(); initCounts(); initCharts(); initWidgets(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.COPPER = {
    getQueryParam: getQueryParam, animateCount: animateCount, whenVisible: whenVisible,
    makeRng: makeRng, seedFromString: seedFromString, gauss: gauss, studentT: studentT,
    seededReturns: seededReturns, ar1Returns: ar1Returns, garchReturns: garchReturns,
    pricePathChart: pricePathChart, backtestChart: backtestChart, acfPacfChart: acfPacfChart,
    directionGauge: directionGauge, bicCompareBars: bicCompareBars, volatilityChart: volatilityChart,
    fatTailHist: fatTailHist, persistenceDecayChart: persistenceDecayChart,
    initGuessGame: initGuessGame, initVolToggle: initVolToggle, initPersistenceSlider: initPersistenceSlider,
    colors: C,
  };
})();
