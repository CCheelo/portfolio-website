/* ═══════════════════════════════════════════════════════════════
   EMH on LUSE — shared chrome, animations, helpers, Chart.js factories.
   Loaded on every page. Navbar/footer are injected so all pages stay
   in sync (mirrors prc-demo/js/app.js). To change navigation, edit the
   NAV array below only — every page picks it up via <body data-page>.

   Drawn paths are SIMULATED from each stock's real estimated parameters
   with a seeded RNG (deterministic). Real point estimates are passed in
   as anchors. See window.EMH_DATA.honesty.
   ═══════════════════════════════════════════════════════════════ */
(function () {

  /* ───────── Navigation model ───────── */
  var NAV = [
    { key: 'home',        label: 'Home',        href: 'index.html' },
    { key: 'dashboard',   label: 'Dashboard',   href: 'dashboard.html' },
    { key: 'stocks',      label: 'Stocks',      href: 'stocks.html' },
    { key: 'methodology', label: 'Methodology', href: 'methodology.html' },
  ];

  function buildNavbar(active) {
    var links = NAV.map(function (n) {
      var cls = 'emh-nav-link' + (n.key === active ? ' active' : '');
      return '<a class="' + cls + '" href="' + n.href + '">' + n.label + '</a>';
    }).join('');
    return (
      '<nav class="emh-navbar" id="emhNavbar">' +
        '<div class="emh-navbar__inner">' +
          '<a class="emh-brand" href="index.html"><span class="emh-brand__mark">EMH</span>LUSE <span>·</span> Efficiency Lab</a>' +
          '<button class="emh-nav-toggle" id="emhNavToggle" aria-label="Toggle menu" aria-expanded="false">☰ Menu</button>' +
          '<div class="emh-nav-links" id="emhNavLinks">' +
            links +
            '<a class="emh-nav-link emh-nav-cta" href="../reports/emh-research-report.pdf" target="_blank" rel="noopener">Full Report ↗</a>' +
          '</div>' +
        '</div>' +
      '</nav>'
    );
  }

  function buildFooter() {
    var m = (window.EMH_DATA && EMH_DATA.meta) || {};
    return (
      '<footer class="emh-footer">' +
        '<div class="emh-footer__inner">' +
          '<div>' +
            '<div class="emh-footer__brand">LUSE <span>Efficiency Lab</span></div>' +
            '<div style="font-size:.78rem;color:var(--muted);margin-top:.3rem">' +
              (m.author || 'Choolwe Cheelo') + ' · ' + (m.programme || 'University of Zambia') +
            '</div>' +
          '</div>' +
          '<div class="text-center"><span class="emh-demo-tag">⚠ Interactive demo · real estimates · simulated paths</span></div>' +
          '<div style="font-size:.78rem;color:var(--muted)">© 2026 · <a href="../project-emh.html" style="color:var(--text-2)">Back to portfolio</a></div>' +
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

    var toggle = document.getElementById('emhNavToggle');
    var links = document.getElementById('emhNavLinks');
    if (toggle && links) {
      toggle.addEventListener('click', function () {
        var open = links.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    var nav = document.getElementById('emhNavbar');
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

  function statusBadge(v) {
    var map = {
      inefficient:  ['badge-inefficient',  '✗ Inefficient'],
      efficient:    ['badge-efficient',    '✓ Efficient'],
      inconclusive: ['badge-inconclusive', '? Inconclusive'],
    };
    var m = map[v] || map.inconclusive;
    return '<span class="badge-e ' + m[0] + '">' + m[1] + '</span>';
  }
  function sectorBadge(sector) { return '<span class="badge-sector">' + sector + '</span>'; }

  function tickerAvatar(ticker, size, verdict) {
    size = size || 38;
    var cls = verdict === 'inefficient' ? ' is-inefficient' : verdict === 'efficient' ? ' is-efficient' : '';
    var fs = Math.max(9, Math.round(size * 0.30));
    return '<span class="ticker-chip' + cls + '" style="width:' + size + 'px;height:' + size +
           'px;font-size:' + fs + 'px">' + ticker + '</span>';
  }

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
  /* unit skew-normal sample (Azzalini) — alpha sets skew direction/strength */
  function skewNormalUnit(rng, alpha) {
    var delta = alpha / Math.sqrt(1 + alpha * alpha);
    var u0 = gauss(rng), v = gauss(rng);
    var u1 = delta * u0 + Math.sqrt(1 - delta * delta) * v;
    return (u0 >= 0 ? u1 : -u1);
  }

  /* iid log-returns ~ N(mean, sd)  (spec signature) */
  function seededReturns(mean, sd, n, seed) {
    var rng = makeRng(seed >>> 0);
    var out = [];
    for (var i = 0; i < n; i++) out.push(mean + sd * gauss(rng));
    return out;
  }
  /* AR(1) log-returns: rₜ = mean + φ·(rₜ₋₁−mean) + ε,  Var preserved at sd² */
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

  /* ═══════════════ Chart.js — dark theme defaults ═══════════════ */
  var C = {
    accent: '#ea580c', accentSoft: 'rgba(234,88,12,.18)',
    red: '#f87171', redSoft: 'rgba(248,113,113,.18)',
    green: '#34d399', greenSoft: 'rgba(52,211,153,.18)',
    gold: '#d4a24c', goldSoft: 'rgba(212,162,76,.16)',
    muted: '#6b7a9e', mutedSoft: 'rgba(107,122,158,.25)',
    grid: 'rgba(255,255,255,.06)', text: '#b8c4e0', tick: '#8595b8',
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
    tt.backgroundColor = 'rgba(11,17,32,.96)'; tt.borderColor = '#314471'; tt.borderWidth = 1;
    tt.titleColor = '#fff'; tt.bodyColor = '#b8c4e0'; tt.padding = 10; tt.cornerRadius = 8;
    tt.titleFont = { family: "'JetBrains Mono', monospace", weight: '700' };
  }

  function gridScale(extra) {
    var base = { grid: { color: C.grid, drawTicks: false }, ticks: { color: C.tick }, border: { display: false } };
    return Object.assign(base, extra || {});
  }

  /* Animated equity-curve sim: random walk vs estimated-parameter path. */
  function priceWalkChart(el, opts) {
    if (!window.Chart) return null;
    opts = opts || {};
    var n = opts.n || 130, base = opts.base || 100;
    var series = opts.series || [
      { label: 'Random walk (μ = 0)', mean: 0, sd: 0.02, phi: 0, color: C.muted, dash: [6, 4] },
      { label: 'Estimated-parameter path', mean: 0.004, sd: 0.03, phi: 0.18, color: C.accent },
    ];
    var labels = []; for (var i = 0; i <= n; i++) labels.push(i);
    var datasets = series.map(function (s, idx) {
      var seed = (opts.seed || 7) + idx * 9173;
      var rets = ar1Returns(s.mean || 0, s.sd || 0.02, s.phi || 0, n, seed);
      var price = base, pts = [base];
      for (var k = 0; k < n; k++) { price *= Math.exp(rets[k]); pts.push(price); }
      return {
        label: s.label, data: pts, borderColor: s.color,
        backgroundColor: s.fill ? s.fillColor || C.accentSoft : 'transparent',
        borderWidth: 2, borderDash: s.dash || [], pointRadius: 0, tension: 0.12, fill: !!s.fill,
      };
    });
    return new Chart(el, {
      type: 'line',
      data: { labels: labels, datasets: datasets },
      options: {
        plugins: { legend: { display: opts.legend !== false, position: 'top', align: 'start' } },
        interaction: { intersect: false, mode: 'index' },
        scales: {
          x: gridScale({ title: { display: true, text: 'Trading day', color: C.tick }, ticks: { maxTicksLimit: 8, color: C.tick } }),
          y: gridScale({ title: { display: true, text: 'Index (base 100)', color: C.tick } }),
        },
      },
    });
  }

  /* ACF bar chart + ±1.96/√n significance band (real lag-1 anchor). */
  function acfChart(el, opts) {
    if (!window.Chart) return null;
    opts = opts || {};
    var lag1 = opts.lag1 || 0, maxLag = opts.maxLag || 12, n = opts.n || 950;
    var band = 1.96 / Math.sqrt(n);
    var rng = makeRng(opts.seed || 99);
    var labels = [], acf = [];
    for (var k = 1; k <= maxLag; k++) {
      var val;
      if (k === 1) val = lag1;                                   // real anchor
      else val = lag1 * Math.pow(0.55, k - 1) + (rng() - 0.5) * band * 0.9;  // AR-style decay + noise
      acf.push(val); labels.push(k);
    }
    var barColors = acf.map(function (v) { return Math.abs(v) > band ? C.red : C.mutedSoft; });
    var borderColors = acf.map(function (v) { return Math.abs(v) > band ? C.red : C.muted; });
    return new Chart(el, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          { label: 'ACF', data: acf, backgroundColor: barColors, borderColor: borderColors, borderWidth: 1, order: 3,
            categoryPercentage: 0.55, barPercentage: 0.85 },
          { type: 'line', label: '+1.96/√n', data: labels.map(function () { return band; }),
            borderColor: C.gold, borderDash: [5, 4], borderWidth: 1.4, pointRadius: 0, order: 1 },
          { type: 'line', label: '−1.96/√n', data: labels.map(function () { return -band; }),
            borderColor: C.gold, borderDash: [5, 4], borderWidth: 1.4, pointRadius: 0, order: 1 },
        ],
      },
      options: {
        plugins: { legend: { display: false },
          tooltip: { callbacks: { title: function (it) { return 'Lag ' + it[0].label; },
            label: function (it) { return (it.datasetIndex === 0 ? 'ACF: ' : '') + (typeof it.raw === 'number' ? it.raw.toFixed(4) : it.raw); } } } },
        scales: {
          x: gridScale({ title: { display: true, text: 'Lag', color: C.tick }, grid: { display: false } }),
          y: gridScale({ suggestedMin: Math.min(-band * 2, lag1 - 0.1), suggestedMax: Math.max(band * 2, lag1 + 0.1) }),
        },
      },
    });
  }

  /* Variance-ratio curve VR(k) vs random-walk reference (real k=2 anchor). */
  function vrCurveChart(el, opts) {
    if (!window.Chart) return null;
    opts = opts || {};
    var vr2 = opts.vr2 != null ? opts.vr2 : 0.5, maxK = opts.maxK || 16;
    var rng = makeRng(opts.seed || 33);
    var labels = [], vr = [], ref = [];
    for (var k = 2; k <= maxK; k++) {
      var val;
      if (k === 2) val = vr2;                                          // real anchor
      else val = Math.max(0.04, Math.min(1, vr2 * Math.pow(2 / k, 0.32) + (rng() - 0.5) * 0.015));
      vr.push(val); ref.push(1); labels.push(k);
    }
    return new Chart(el, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          { label: 'Random walk (VR = 1)', data: ref, borderColor: C.muted, borderDash: [6, 4], borderWidth: 1.5, pointRadius: 0, tension: 0 },
          { label: 'Estimated VR(k)', data: vr, borderColor: C.accent, backgroundColor: C.accentSoft,
            borderWidth: 2.5, fill: true, tension: 0.25,
            pointRadius: labels.map(function (k) { return k === 2 ? 5 : 0; }),
            pointBackgroundColor: C.gold, pointBorderColor: '#fff', pointBorderWidth: 1 },
        ],
      },
      options: {
        plugins: { legend: { position: 'top', align: 'start' },
          tooltip: { callbacks: { title: function (it) { return 'k = ' + it[0].label; },
            label: function (it) { return it.dataset.label + ': ' + it.raw.toFixed(4); } } } },
        scales: {
          x: gridScale({ title: { display: true, text: 'Holding period  k', color: C.tick } }),
          y: gridScale({ suggestedMin: 0, suggestedMax: 1.1, title: { display: true, text: 'Variance ratio', color: C.tick } }),
        },
      },
    });
  }

  /* Return histogram simulated from real mean/sd/skew + a normal reference. */
  function histogramChart(el, opts) {
    if (!window.Chart) return null;
    opts = opts || {};
    var mean = opts.mean || 0, sd = opts.sd || 0.02, skew = opts.skew || 0;
    var n = opts.n || 1400, bins = opts.bins || 33;
    var alpha = Math.sign(skew) * Math.min(8, Math.abs(skew));
    var rng = makeRng(opts.seed || 71);
    var samples = [];
    var lo = Infinity, hi = -Infinity;
    for (var i = 0; i < n; i++) {
      var x = mean + sd * skewNormalUnit(rng, alpha);
      samples.push(x); if (x < lo) lo = x; if (x > hi) hi = x;
    }
    var span = (hi - lo) || 1, w = span / bins;
    var counts = new Array(bins).fill(0), centers = [];
    for (var b = 0; b < bins; b++) centers.push(lo + w * (b + 0.5));
    samples.forEach(function (x) {
      var idx = Math.min(bins - 1, Math.floor((x - lo) / w));
      counts[idx]++;
    });
    /* normal reference scaled to histogram area */
    var maxCount = Math.max.apply(null, counts);
    var normPdf = centers.map(function (c) { return Math.exp(-0.5 * Math.pow((c - mean) / sd, 2)); });
    var maxPdf = Math.max.apply(null, normPdf);
    var normLine = normPdf.map(function (p) { return p / maxPdf * maxCount; });
    return new Chart(el, {
      type: 'bar',
      data: {
        labels: centers.map(function (c) { return (c * 100).toFixed(1); }),
        datasets: [
          { label: 'Simulated returns', data: counts, backgroundColor: C.accentSoft, borderColor: C.accent,
            borderWidth: 1, categoryPercentage: 1, barPercentage: 1, order: 2 },
          { type: 'line', label: 'Normal reference', data: normLine, borderColor: C.gold, borderWidth: 1.8,
            pointRadius: 0, tension: 0.35, order: 1 },
        ],
      },
      options: {
        plugins: { legend: { position: 'top', align: 'start' },
          tooltip: { callbacks: { title: function (it) { return 'Return ≈ ' + it[0].label + '%'; } } } },
        scales: {
          x: gridScale({ grid: { display: false }, ticks: { maxTicksLimit: 9, color: C.tick }, title: { display: true, text: 'Daily log return (%)', color: C.tick } }),
          y: gridScale({ title: { display: true, text: 'Frequency', color: C.tick } }),
        },
      },
    });
  }

  /* Dashboard: % of stocks rejecting the random walk, per test. */
  function testSummaryBars(el, summary) {
    if (!window.Chart) return null;
    return new Chart(el, {
      type: 'bar',
      data: {
        labels: ['Runs', 'Ljung–Box', 'Variance Ratio'],
        datasets: [{
          label: '% rejecting random walk',
          data: [summary.runsPct, summary.acfPct, summary.vrPct],
          backgroundColor: [C.mutedSoft, C.goldSoft, C.accentSoft],
          borderColor: [C.muted, C.gold, C.accent], borderWidth: 1.5,
          borderRadius: 6, categoryPercentage: 0.6, barPercentage: 0.8,
        }],
      },
      options: {
        plugins: { legend: { display: false },
          tooltip: { callbacks: { label: function (it) {
            if (it.dataIndex === 0) return 'Runs: statistic N/A (degenerate)';
            return it.raw + '% of stocks reject H₀';
          } } } },
        scales: {
          x: gridScale({ grid: { display: false } }),
          y: gridScale({ suggestedMin: 0, suggestedMax: 100, ticks: { color: C.tick, callback: function (v) { return v + '%'; } } }),
        },
      },
    });
  }

  /* Dashboard: efficient vs inefficient doughnut. */
  function verdictDoughnut(el, summary) {
    if (!window.Chart) return null;
    return new Chart(el, {
      type: 'doughnut',
      data: {
        labels: ['Inefficient (rejects RW)', 'Efficient (fails to reject)'],
        datasets: [{
          data: [summary.inefficient, summary.efficient],
          backgroundColor: [C.redSoft, C.greenSoft], borderColor: [C.red, C.green],
          borderWidth: 1.5, hoverOffset: 6,
        }],
      },
      options: { cutout: '64%', plugins: { legend: { position: 'bottom' },
        tooltip: { callbacks: { label: function (it) { return it.label + ': ' + it.raw + ' stocks'; } } } } },
    });
  }

  /* Dashboard: VR vs |Z| scatter, coloured by verdict, with |Z|=1.96 threshold. */
  function vrScatter(el, companies) {
    if (!window.Chart) return null;
    var pts = companies.map(function (c) {
      return { x: c.vr.vr, y: Math.abs(c.vr.z), t: c.ticker, v: c.verdict };
    });
    var maxK = Math.max.apply(null, pts.map(function (p) { return p.y; }));
    return new Chart(el, {
      type: 'scatter',
      data: {
        datasets: [
          { label: 'Inefficient', data: pts.filter(function (p) { return p.v === 'inefficient'; }),
            backgroundColor: C.redSoft, borderColor: C.red, borderWidth: 1.5, pointRadius: 6, pointHoverRadius: 8 },
          { label: 'Efficient', data: pts.filter(function (p) { return p.v === 'efficient'; }),
            backgroundColor: C.greenSoft, borderColor: C.green, borderWidth: 1.5, pointRadius: 6, pointHoverRadius: 8 },
          { type: 'line', label: '|Z| = 1.96 threshold', data: [{ x: 0, y: 1.96 }, { x: 1.05, y: 1.96 }],
            borderColor: C.gold, borderDash: [6, 4], borderWidth: 1.4, pointRadius: 0, fill: false },
        ],
      },
      options: {
        plugins: { legend: { position: 'top', align: 'start' },
          tooltip: { callbacks: { label: function (it) {
            if (it.dataset.type === 'line') return '|Z| = 1.96';
            return it.raw.t + ' · VR ' + it.raw.x.toFixed(3) + ' · |Z| ' + it.raw.y.toFixed(2);
          } } } },
        scales: {
          x: gridScale({ suggestedMin: 0, suggestedMax: 1.05, title: { display: true, text: 'Variance ratio (RW = 1)', color: C.tick } }),
          y: gridScale({ suggestedMin: 0, suggestedMax: Math.ceil(maxK + 1), title: { display: true, text: '|Z| statistic', color: C.tick } }),
        },
      },
    });
  }

  /* Dashboard: market context — index trajectory (line) + trade growth (bars). */
  function marketGrowthChart(el, market) {
    if (!window.Chart) return null;
    var months = market.indexMonths || 10;
    var rng = makeRng(4242);
    var idxLabels = [], idxData = [];
    for (var m = 0; m <= months; m++) {
      var t = m / months;
      var eased = Math.pow(t, 1.15);                                   // gentle ramp between real endpoints
      var jitter = m === 0 || m === months ? 0 : (rng() - 0.5) * 350;  // illustrative wobble (interior only)
      idxLabels.push('M' + m);
      idxData.push(Math.round(market.indexFrom + (market.indexTo - market.indexFrom) * eased + jitter));
    }
    /* trades: real endpoints 2020 → 2024, interior years interpolated (illustrative) */
    var y0 = market.tradesFromYear, y1 = market.tradesToYear;
    var tradeLabels = [], tradeData = [];
    for (var y = y0; y <= y1; y++) {
      var tt2 = (y - y0) / (y1 - y0);
      tradeLabels.push(String(y));
      tradeData.push(Math.round(market.tradesFrom + (market.tradesTo - market.tradesFrom) * Math.pow(tt2, 1.6)));
    }
    return new Chart(el, {
      type: 'line',
      data: {
        labels: idxLabels,
        datasets: [
          { label: 'All-Share Index', data: idxData, yAxisID: 'yIdx',
            borderColor: C.accent, backgroundColor: C.accentSoft, borderWidth: 2.5, fill: true, tension: 0.3, pointRadius: 0 },
        ],
      },
      options: {
        plugins: { legend: { position: 'top', align: 'start' },
          tooltip: { callbacks: { label: function (it) { return 'Index ≈ ' + Math.round(it.raw).toLocaleString() + ' pts'; } } } },
        scales: {
          x: gridScale({ grid: { display: false }, ticks: { color: C.tick }, title: { display: true, text: 'Months (≈ 10-month surge window)', color: C.tick } }),
          yIdx: gridScale({ position: 'left', suggestedMin: market.indexFrom - 1500, title: { display: true, text: 'Index points', color: C.tick },
            ticks: { color: C.tick, callback: function (v) { return (v / 1000) + 'k'; } } }),
        },
      },
    });
  }

  /* small standalone bar: annual trade-count growth */
  function tradeGrowthChart(el, market) {
    if (!window.Chart) return null;
    var y0 = market.tradesFromYear, y1 = market.tradesToYear, labels = [], data = [];
    for (var y = y0; y <= y1; y++) {
      var t = (y - y0) / (y1 - y0);
      labels.push(String(y));
      data.push(Math.round(market.tradesFrom + (market.tradesTo - market.tradesFrom) * Math.pow(t, 1.6)));
    }
    return new Chart(el, {
      type: 'bar',
      data: { labels: labels, datasets: [{ label: 'Annual trades', data: data,
        backgroundColor: C.goldSoft, borderColor: C.gold, borderWidth: 1.5, borderRadius: 6 }] },
      options: {
        plugins: { legend: { display: false },
          tooltip: { callbacks: { label: function (it) { return Math.round(it.raw).toLocaleString() + ' trades'; } } } },
        scales: {
          x: gridScale({ grid: { display: false } }),
          y: gridScale({ suggestedMin: 0, ticks: { color: C.tick, callback: function (v) { return (v / 1000) + 'k'; } } }),
        },
      },
    });
  }

  /* ───────── Boot ───────── */
  function boot() { mountChrome(); initReveal(); initCounts(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  window.EMH = {
    getQueryParam: getQueryParam, statusBadge: statusBadge, sectorBadge: sectorBadge,
    tickerAvatar: tickerAvatar, animateCount: animateCount, whenVisible: whenVisible,
    makeRng: makeRng, seedFromString: seedFromString, seededReturns: seededReturns, ar1Returns: ar1Returns,
    priceWalkChart: priceWalkChart, acfChart: acfChart, vrCurveChart: vrCurveChart,
    histogramChart: histogramChart, testSummaryBars: testSummaryBars, verdictDoughnut: verdictDoughnut,
    vrScatter: vrScatter, marketGrowthChart: marketGrowthChart, tradeGrowthChart: tradeGrowthChart,
    colors: C,
  };
})();
