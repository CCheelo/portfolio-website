/* ═══════════════════════════════════════════════════════════════
   UNISDA demo — shared chrome and helpers (window.UNISDA).
   Each page is a bare <main class="page"> with <body data-page>;
   this wraps it in the rail + topbar shell, so navigation lives in
   one place: edit NAV below.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var D = window.UNISDA_DATA;

  var ICON = {
    dash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></svg>',
    grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/></svg>',
    cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M7 9v.01M17 15v.01"/></svg>',
    chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15 18l-6-6 6-6"/></svg>',
    cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v8M8 12h8"/></svg>',
    wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a1 1 0 0 1-1-1z"/><path d="M4 7l11-3v3M16 13h2"/></svg>',
    org: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="3" width="6" height="5" rx="1"/><rect x="3" y="16" width="6" height="5" rx="1"/><rect x="15" y="16" width="6" height="5" rx="1"/><path d="M12 8v4M6 16v-4h12v4"/></svg>',
    reset: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 4v6h6"/><path d="M5.5 15a7 7 0 1 0 1-8L4 10"/></svg>'
  };

  var NAV = [
    { group: null, items: [
      { key: 'dashboard', label: 'Dashboard', href: 'index.html', icon: 'dash' },
      { key: 'coming', label: 'Coming up', href: 'coming.html', icon: 'cal' } ] },
    { group: 'My department', items: [
      { key: 'scorecard', label: 'Scorecard', href: 'scorecard.html', icon: 'grid' },
      { key: 'plan', label: 'Plan new work', href: 'plan.html', icon: 'plus' },
      { key: 'requests',  label: 'Payment requests', href: 'requests.html', icon: 'cash' },
      { key: 'budget', label: 'Yearly budget', href: 'budget.html', icon: 'wallet' } ] },
    { group: 'The board', items: [
      { key: 'board', label: 'Church at a glance', href: 'board.html', icon: 'chart' },
      { key: 'departments', label: 'Departments', href: 'departments.html', icon: 'org' } ] },
    { group: 'This demo', items: [
      { key: 'reset', label: 'Reset the demo data', href: '#reset', icon: 'reset' },
      { key: 'back', label: 'Back to the portfolio', href: '../project-unisda.html', icon: 'back' } ] }
  ];

  /* A cross shape inside a rounded square — a neutral mark, not the church's logo */
  var MARK = '<svg viewBox="0 0 36 36" width="26" height="26"><path d="M18 6v24M10 14h16" stroke="#0f2a43" stroke-width="3.2" stroke-linecap="round"/><path d="M8 28c4-3 16-3 20 0" stroke="#d99a20" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>';

  /* ───────── Persona (view-as) ───────── */
  function store(k, v) {
    try { if (v === undefined) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function persona() {
    var id = store('unisda-demo-persona') || 'leader';
    return D.personas.filter(function (p) { return p.id === id; })[0] || D.personas[0];
  }

  function buildShell() {
    var page = document.querySelector('main.page');
    var active = document.body.getAttribute('data-page');
    var me = persona();

    var rail = '<aside class="rail" id="rail"><div class="brand"><span class="brand__mark">' + MARK + '</span>' +
      '<span><span class="brand__name">Strategic Planning</span><br><span class="brand__sub">University SDA Church</span></span></div>';
    NAV.forEach(function (g) {
      if (g.group) rail += '<div class="rail__group">' + g.group + '</div>';
      g.items.forEach(function (n) {
        rail += '<a href="' + n.href + '"' + (n.key === active ? ' class="active" aria-current="page"' : '') + '>' + ICON[n.icon] + n.label + '</a>';
      });
    });
    rail += '</aside>';

    var opts = D.personas.map(function (p) {
      return '<option value="' + p.id + '"' + (p.id === me.id ? ' selected' : '') + '>' + p.name + ' — ' + p.office + '</option>';
    }).join('');

    var top = '<header class="topbar">' +
      '<button class="topbar__menu" id="railToggle" aria-controls="rail" aria-expanded="false">☰ Menu</button>' +
      '<label class="search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>' +
      '<input id="globalSearch" type="search" placeholder="Search activities, requests, departments…" aria-label="Search"></label>' +
      '<div class="who"><span class="avatar">' + me.initials + '</span>' +
      '<select id="personaSelect" aria-label="View the demo as">' + opts + '</select></div></header>';

    var ribbon = '<div class="demo-ribbon">Interactive demo of a system I built · every name and figure is invented · ' +
      '<a href="../project-unisda.html">About this project</a></div>';

    var wrap = document.createElement('div');
    wrap.innerHTML = ribbon + '<div class="shell">' + rail + '<div class="main">' + top + '</div></div>';
    document.body.insertBefore(wrap, document.body.firstChild);
    wrap.querySelector('.main').appendChild(page);
    while (wrap.firstChild) document.body.insertBefore(wrap.firstChild, wrap);
    wrap.remove();

    document.getElementById('personaSelect').addEventListener('change', function (e) {
      store('unisda-demo-persona', e.target.value);
      location.reload();
    });

    var rt = document.getElementById('railToggle'), railEl = document.getElementById('rail');
    rt.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = railEl.classList.toggle('open');
      rt.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (railEl.classList.contains('open') && !railEl.contains(e.target)) { railEl.classList.remove('open'); rt.setAttribute('aria-expanded', 'false'); }
    });

    /* Global search across activities, requests and departments */
    var search = document.getElementById('globalSearch');
    var box = document.createElement('div'); box.className = 'search-results'; box.hidden = true;
    search.parentElement.appendChild(box);
    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      if (q.length < 2) { box.hidden = true; return; }
      var hits = [];
      D.departments.forEach(function (d) { if (d.name.toLowerCase().indexOf(q) > -1 || d.leader.toLowerCase().indexOf(q) > -1) hits.push({ k: 'Department', t: d.name, s: 'Led by ' + d.leader, h: 'scorecard.html?dept=' + d.id }); });
      D.activities.forEach(function (a) { if (a.name.toLowerCase().indexOf(q) > -1 || a.main.toLowerCase().indexOf(q) > -1) hits.push({ k: 'Activity', t: a.name, s: D.dept(a.dept).name + ' · Q' + a.quarter, h: 'scorecard.html?dept=' + a.dept + '#row-' + a.id }); });
      D.requests.forEach(function (r) { if ((r.id + ' ' + r.lines.map(function (l) { return l.act; }).join(' ')).toLowerCase().indexOf(q) > -1) hits.push({ k: 'Request', t: r.id, s: D.dept(r.dept).name + ' · K' + D.fmt(r.lines.reduce(function (s, l) { return s + l.amount; }, 0)), h: 'requests.html' }); });
      box.innerHTML = hits.length ? hits.slice(0, 8).map(function (x) { return '<a href="' + x.h + '"><span class="pill pill--navy">' + x.k + '</span> <b>' + x.t + '</b><small>' + x.s + '</small></a>'; }).join('') : '<div class="empty">Nothing matches “' + search.value.replace(/</g, '&lt;') + '”.</div>';
      box.hidden = false;
    });
    document.addEventListener('click', function (e) { if (!search.parentElement.contains(e.target)) box.hidden = true; });

    var resetLink = document.querySelector('a[href="#reset"]');
    resetLink.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.confirm('Put the demo back to how it started? This clears the reports, requests and decisions you made.')) { D.reset(); location.reload(); }
    });
  }

  /* ───────── Helpers ───────── */
  function statusOf(a) {
    if (a.band == null) return { label: 'Not reported', cls: 'none' };
    var b = D.bands[a.band];
    return { label: b.status, cls: b.cls, band: b.label };
  }
  function statusHTML(a) {
    var s = statusOf(a);
    return '<span class="status status--' + s.cls + '">' + s.label + '</span>';
  }
  function qLabel(q) { return ['First', 'Second', 'Third', 'Fourth'][q - 1] + ' quarter'; }
  function dateParts(iso) {
    var d = new Date(iso + 'T00:00:00');
    return { day: d.getDate(), mon: d.toLocaleString('en', { month: 'short' }), full: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) };
  }
  function money(n) { return '<small>K</small>' + D.fmt(n); }

  var toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove('show'); }, 2800);
  }

  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (e) { io.observe(e); });
  }

  /* Fill bars after paint so the width transition plays */
  function animateBars(root) {
    requestAnimationFrame(function () {
      (root || document).querySelectorAll('[data-w]').forEach(function (el) {
        if (el.tagName === 'I' && el.parentElement.classList.contains('split')) el.style.flexGrow = el.getAttribute('data-w');
        else el.style.width = el.getAttribute('data-w') + '%';
      });
    });
  }

  function countUp(el, to, decimals) {
    var start = performance.now(), dur = 900;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = decimals ? D.fmt(to) : D.fmt0(to); return; }
    function step(t) {
      var p = Math.min(1, (t - start) / dur), v = to * (1 - Math.pow(1 - p, 3));
      el.textContent = decimals ? D.fmt(v) : D.fmt0(Math.round(v));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* Download rows as a CSV file Excel opens directly */
  function downloadCSV(name, rows) {
    var csv = rows.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? '' : c).replace(/"/g, '""') + '"'; }).join(','); }).join(String.fromCharCode(13, 10));
    var a = document.createElement('a');
    /* the byte-order mark makes Excel read the file as UTF-8 */
    a.href = URL.createObjectURL(new Blob([String.fromCharCode(0xFEFF) + csv], { type: 'text/csv' }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  window.UNISDA = {
    downloadCSV: downloadCSV,
    persona: persona, statusOf: statusOf, statusHTML: statusHTML, qLabel: qLabel,
    dateParts: dateParts, money: money, toast: toast, animateBars: animateBars,
    countUp: countUp, initReveal: initReveal
  };

  document.addEventListener('DOMContentLoaded', function () {
    buildShell();
    if (typeof window.renderPage === 'function') window.renderPage();
    initReveal();
    animateBars();
  });
})();
