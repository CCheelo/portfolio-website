/* ═══════════════════════════════════════════════════════════════
   Resource Analytics demo — shared chrome, analytics and charts
   (window.RA). Pages are a bare <main class="page"> with
   <body data-page>; this wraps them in the sidebar shell.
   To change navigation, edit NAV below.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var D = window.RA_DATA;

  var I = {
    home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    paper: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>',
    fuel: '<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M4 21h11M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M7 7h5v4H7z"/>',
    budget: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    leaf: '<path d="M5 19c0-8 6-14 15-14 0 9-6 15-14 15"/><path d="M5 19l7-7"/>',
    pack: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    data: '<path d="M12 3v12M7 10l5 5 5-5"/><path d="M4 17v3h16v-3"/>',
    car: '<path d="M5 16l1.5-5a2 2 0 0 1 2-1.5h7a2 2 0 0 1 2 1.5L19 16"/><rect x="3" y="16" width="18" height="4" rx="1"/>',
    cog: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 15.6H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 9.6 4V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>',
    reset: '<path d="M4 4v6h6"/><path d="M5.5 15a7 7 0 1 0 1-8L4 10"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'
  };
  function icon(n) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + I[n] + '</svg>'; }

  var NAV = [
    ['Analyse', [['overview', 'Overview', 'index.html', 'home'], ['paper', 'Paper', 'paper.html', 'paper'], ['fleet', 'Fleet fuel', 'fleet.html', 'fuel'], ['carbon', 'Carbon', 'carbon.html', 'leaf']]],
    ['Plan', [['budget', 'Budget & savings', 'budget.html', 'budget'], ['pack', 'Monthly pack', 'pack.html', 'pack']]],
    ['Manage', [['data', 'Data', 'data.html', 'data'], ['register', 'Register', 'register.html', 'car'], ['settings', 'Settings', 'settings.html', 'cog']]],
    ['This demo', [['reset', 'Reset the demo data', '#reset', 'reset'], ['back', 'Back to the portfolio', '../project-resource-analytics.html', 'back']]]
  ];

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ───────── Theme ───────── */
  function theme() {
    var t = store('ra-demo-theme');
    if (!t) t = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    return t;
  }
  document.documentElement.setAttribute('data-theme', theme());

  /* ───────── Period filter: all 8 months, or the last 6 / 3 ───────── */
  function period() { return +(store('ra-demo-period') || 8); }
  function idx() { var n = period(), out = []; for (var i = D.months.length - n; i < D.months.length; i++) out.push(i); return out; }
  function labels() { return idx().map(function (i) { return D.labels[i]; }); }

  /* ───────── Analytics ───────── */
  function sum(a) { return a.reduce(function (s, x) { return s + (x || 0); }, 0); }
  function avg(a) { return a.length ? sum(a) / a.length : 0; }
  /* first three months vs last three, so one odd month doesn't swing the verdict */
  function growth(series) {
    if (series.length < 4) { var f = series[0], l = series[series.length - 1]; return f ? (l - f) / f : 0; }
    var a = avg(series.slice(0, 3)), b = avg(series.slice(-3));
    return a ? (b - a) / a : 0;
  }
  function monthly(fn) { return idx().map(fn); }

  var series = {
    events: function () { return monthly(function (m) { return sum(D.branches.map(function (b) { return D.business[b][m].accounts + D.business[b][m].loans; })); }); },
    loans: function () { return monthly(function (m) { return sum(D.branches.map(function (b) { return D.business[b][m].loans; })); }); },
    pages: function () { return monthly(function (m) { return sum(D.branches.map(function (b) { return D.paper[b][m].pages; })); }); },
    paperCost: function () {
      var s = D.settings;
      return monthly(function (m) { return sum(D.branches.map(function (b) { var p = D.paper[b][m]; return (p.pages - p.colour) * s.costBW + p.colour * s.costColour; })); });
    },
    fuelSpend: function () { return monthly(function (m) { return sum(D.active().map(function (v) { return v.months[m].spend; })) + D.generators[m].spend; }); },
    litres: function () { return monthly(function (m) { return sum(D.active().map(function (v) { return v.months[m].litres; })); }); },
    km: function () { return monthly(function (m) { return sum(D.active().map(function (v) { return v.months[m].km || 0; })); }); },
    kmPerL: function () {
      return monthly(function (m) {
        var km = 0, l = 0;
        D.active().forEach(function (v) { if (v.type === 'Car' && v.months[m].km) { km += v.months[m].km; l += v.months[m].litres; } });
        return l ? km / l : 0;
      });
    }
  };
  function indexed(a) { return a.map(function (x) { return a[0] ? x / a[0] * 100 : 0; }); }

  function verdict(resourceG, businessG, what, against) {
    var diff = resourceG - businessG;
    if (diff <= 0.01) return { good: true, head: 'Growth explains it', text: what + ' rose ' + pct(resourceG) + ', less than ' + against + ' (' + pct(businessG) + '), so each unit of business uses less.' };
    return { good: false, head: 'Rising faster than business', text: what + ' rose ' + pct(resourceG) + ', well ahead of ' + against + ' (' + pct(businessG) + '). Each unit of business uses more.' };
  }

  /* ───────── Formatting ───────── */
  function short(n) {
    var a = Math.abs(n);
    if (a >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (a >= 1e4) return (n / 1e3).toFixed(1) + 'K';
    return Math.round(n).toLocaleString('en');
  }
  function zmw(n) { return 'ZMW ' + short(n); }
  function pct(g) { return (Math.abs(g * 100)).toFixed(1) + '%'; }
  /* direction-aware pill: for costs, up is bad; for business, up is good */
  function pill(g, upIsGood) {
    if (Math.abs(g) < 0.005) return '<span class="pill pill--flat">flat</span>';
    var up = g > 0, good = upIsGood ? up : !up;
    return '<span class="pill pill--' + (up ? 'up' : 'down') + '-' + (good ? 'good' : 'bad') + '">' + (up ? '↗ ' : '↘ ') + pct(g) + '</span>';
  }

  /* ───────── Charts (Chart.js) ───────── */
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); }
  function chartDefaults() {
    if (!window.Chart) return;
    Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
    Chart.defaults.font.size = 11;
    Chart.defaults.color = css('--muted');
    Chart.defaults.borderColor = css('--line');
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.tooltip.backgroundColor = css('--ink');
    Chart.defaults.plugins.tooltip.titleColor = css('--panel');
    Chart.defaults.plugins.tooltip.bodyColor = css('--panel');
    Chart.defaults.maintainAspectRatio = false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) Chart.defaults.animation = false;
  }
  function alpha(hex, a) {
    var h = hex.replace('#', ''); var n = parseInt(h.length === 3 ? h.split('').map(function (c) { return c + c; }).join('') : h, 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function lineDataset(label, data, color, fill) {
    return { label: label, data: data, borderColor: color, backgroundColor: fill ? alpha(color, .12) : color, fill: !!fill, tension: .35, pointRadius: 2.5, pointHoverRadius: 5, borderWidth: 2 };
  }
  function colors() { return [css('--s1'), css('--s2'), css('--s3'), css('--s4')]; }

  /* ───────── Shell ───────── */
  function buildShell() {
    var page = document.querySelector('main.page');
    var active = document.body.getAttribute('data-page');
    var side = '<aside class="side" id="side"><div class="side__brand"><span class="side__logo"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 20V12M12 20V5M19 20v-9"/></svg></span>' +
      '<span><div class="side__name">Resource Analytics</div><div class="side__sub">Admin · Demo Bank</div></span></div>';
    NAV.forEach(function (g) {
      side += '<div class="side__group">' + g[0] + '</div>';
      g[1].forEach(function (n) { side += '<a href="' + n[2] + '"' + (n[0] === active ? ' class="active" aria-current="page"' : '') + '>' + icon(n[3]) + n[1] + '</a>'; });
    });
    side += '<div class="side__foot"><span><span class="dot">●</span> Last import 4 Oct</span><span class="side__sample">Sample data</span>' +
      '<a href="#" id="themeToggle">' + icon('moon') + '<span>' + (theme() === 'dark' ? 'Light mode' : 'Dark mode') + '</span></a></div></aside>';

    var title = document.title.split(' · ')[0];
    var crumbs = '<div class="crumbs"><span><button class="menu-btn" id="menuBtn" aria-controls="side" aria-expanded="false">☰</button> Analyse / <b>' + title + '</b></span><span class="crumbs__brand">Demo Bank</span></div>';
    var ribbon = '<div class="demo-ribbon">Interactive demo of an analytics app I built · a fictional bank, every figure invented · <a href="../project-resource-analytics.html">About this project</a></div>';

    var wrap = document.createElement('div');
    wrap.innerHTML = ribbon + '<div class="shell">' + side + '<div class="main">' + crumbs + '</div></div>';
    wrap.querySelector('.main').appendChild(page);
    document.body.prepend(wrap.children[1]);   // shell
    document.body.prepend(wrap.children[0]);   // ribbon above it

    document.querySelector('.side a[href="#reset"]').addEventListener('click', function (e) {
      e.preventDefault();
      if (window.confirm('Put the demo back to how it started? This clears your register edits, settings and imports.')) { D.reset(); location.reload(); }
    });
    document.getElementById('themeToggle').addEventListener('click', function (e) {
      e.preventDefault();
      store('ra-demo-theme', theme() === 'dark' ? 'light' : 'dark');
      location.reload();
    });
    var mb = document.getElementById('menuBtn'), sideEl = document.getElementById('side');
    mb.addEventListener('click', function (e) { e.stopPropagation(); var o = sideEl.classList.toggle('open'); mb.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    document.addEventListener('click', function (e) { if (sideEl.classList.contains('open') && !sideEl.contains(e.target)) sideEl.classList.remove('open'); });

    var sel = document.getElementById('periodSelect');
    if (sel) {
      sel.value = String(period());
      sel.addEventListener('change', function () { store('ra-demo-period', sel.value); if (window.renderPage) window.renderPage(); });
    }
  }

  function animateRows(root) {
    requestAnimationFrame(function () {
      (root || document).querySelectorAll('.row__bar[data-w]').forEach(function (b) { b.style.width = 'calc(' + b.getAttribute('data-w') + '% - 1.2rem)'; });
    });
  }

  /* Download rows as a CSV file Excel opens directly */
  function downloadCSV(name, rows) {
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(','); }).join(String.fromCharCode(13, 10));
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('show');
    clearTimeout(toastEl._t); toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }

  window.RA = {
    downloadCSV: downloadCSV, toast: toast,
    series: series, growth: growth, indexed: indexed, verdict: verdict, sum: sum, avg: avg,
    idx: idx, labels: labels, period: period,
    short: short, zmw: zmw, pct: pct, pill: pill,
    css: css, alpha: alpha, lineDataset: lineDataset, colors: colors, animateRows: animateRows
  };

  document.addEventListener('DOMContentLoaded', function () {
    chartDefaults();
    buildShell();
    if (typeof window.renderPage === 'function') window.renderPage();
  });
})();
