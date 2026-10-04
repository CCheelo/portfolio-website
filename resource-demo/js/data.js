/* ═══════════════════════════════════════════════════════════════
   Resource Analytics demo — single data source (window.RA_DATA).
   Everything is generated from a fixed seed for a fictional
   "Demo Bank": plates, branches, staff and figures are invented.
   The analytics mirror the real app's rules:
     · growth = average of the first 3 months vs the last 3
     · paper is judged against all business events, fuel against loans
     · km/L = card litres ÷ tracker km, only in months with both
   ═══════════════════════════════════════════════════════════════ */
(function () {
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; }; }
  var r = rng(20260904);
  function between(a, b) { return a + (b - a) * r(); }
  function round(n, d) { var p = Math.pow(10, d || 0); return Math.round(n * p) / p; }

  var MONTHS = ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];
  var LABELS = ['Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26', 'Sep 26'];

  /* ERB pump prices (ZMW/L) — illustrative */
  var ERB = {
    petrol: [27.10, 27.88, 27.35, 26.90, 26.40, 25.95, 25.60, 25.29],
    diesel: [26.20, 26.75, 26.10, 25.80, 25.40, 24.95, 24.50, 26.86]
  };

  var branches = ['Head Office', 'Cairo Road', 'Chilenje', 'Matero', 'Kalingalinga', 'Chelston', 'Kitwe', 'Ndola', 'Chipata', 'Solwezi', 'Premium Centre'];

  /* Business events per branch per month: accounts opened + loans registered */
  var business = {};
  branches.forEach(function (b, i) {
    var base = i === 0 ? 260 : between(70, 190);
    business[b] = MONTHS.map(function (_, m) {
      var g = 1 + m * between(0.008, 0.02);
      var accounts = Math.round(base * g * between(.9, 1.1));
      var loans = Math.round(base * .42 * g * between(.88, 1.12));
      return { accounts: accounts, loans: loans };
    });
  });

  /* Paper: pages per event near a benchmark of 50, with two outliers */
  var paper = {};
  branches.forEach(function (b) {
    var ratio = b === 'Kitwe' ? 63 : b === 'Premium Centre' ? 51 : between(46, 50.5);
    var drift = b === 'Premium Centre' ? 0.03 : b === 'Chipata' ? 0.018 : between(-0.003, 0.01);
    paper[b] = MONTHS.map(function (_, m) {
      var ev = business[b][m].accounts + business[b][m].loans;
      var pages = Math.round(ev * ratio * (1 + drift * m) * between(.95, 1.05));
      return {
        pages: pages,
        colour: b === 'Head Office' ? Math.round(pages * .028) : 0,
        noLogin: Math.round(pages * (b === 'Kitwe' ? .347 : .02))
      };
    });
  });

  /* Fleet: cars, motorbikes; one thirsty car, one tracker gap */
  var vehicles = [
    { plate: 'DMB 1001', type: 'Car', branch: 'Head Office', fuel: 'petrol', kml: 8.2, tank: 55 },
    { plate: 'DMB 1002', type: 'Car', branch: 'Cairo Road', fuel: 'diesel', kml: 7.9, tank: 60 },
    { plate: 'DMB 1003', type: 'Car', branch: 'Matero', fuel: 'diesel', kml: 8.4, tank: 60 },
    { plate: 'DMB 1004', type: 'Car', branch: 'Kitwe', fuel: 'petrol', kml: 6.4, tank: 55 },
    { plate: 'DMB 1005', type: 'Car', branch: 'Ndola', fuel: 'diesel', kml: 7.6, tank: 60 },
    { plate: 'DMB 1006', type: 'Car', branch: 'Chipata', fuel: 'petrol', kml: 7.4, tank: 55 },
    { plate: 'DMB 1007', type: 'Car', branch: 'Head Office', fuel: 'petrol', kml: 5.1, tank: 70 },
    { plate: 'DMB 1008', type: 'Car', branch: 'Solwezi', fuel: 'petrol', kml: 7.0, tank: 55 },
    { plate: 'DMB 2472', type: 'Car', branch: 'Chilenje', fuel: 'diesel', kml: 8.8, tank: 60 },
    { plate: 'DMB 2672', type: 'Car', branch: 'Kalingalinga', fuel: 'diesel', kml: null, tank: 60, noTracker: true, suggest: 'DMB 2472' },
    { plate: 'DMB 3300', type: 'Car', branch: 'Chelston', fuel: 'petrol', kml: 7.8, tank: 55 },
    { plate: 'MBK 0101', type: 'Motorbike', branch: 'Matero', fuel: 'petrol', kml: 28.5, tank: 14 },
    { plate: 'MBK 0102', type: 'Motorbike', branch: 'Chilenje', fuel: 'petrol', kml: 30.2, tank: 14 }
  ];
  vehicles.forEach(function (v) {
    var kmBase = v.type === 'Motorbike' ? between(900, 1300) : between(1600, 2600);
    v.months = MONTHS.map(function (_, m) {
      var km = Math.round(kmBase * between(.82, 1.15) * (1 + m * .006));
      var kml = v.kml ? v.kml * between(.93, 1.07) : 8;
      var litres = round(km / kml, 1);
      var price = ERB[v.fuel][m] - (v.fuel === 'petrol' ? 0.21 : 0.09);
      return { km: v.noTracker ? null : km, litres: litres, spend: round(litres * price, 2), fills: Math.round(litres / (v.tank * .7)) + 1 };
    });
    var km = 0, l = 0;
    v.months.forEach(function (x) { if (x.km) { km += x.km; l += x.litres; } });
    v.totalKm = km; v.totalLitres = round(v.months.reduce(function (s, x) { return s + x.litres; }, 0), 1);
    v.totalSpend = round(v.months.reduce(function (s, x) { return s + x.spend; }, 0), 2);
    v.kmPerL = km ? round(km / l, 1) : null;
  });

  var generators = MONTHS.map(function () { return { litres: Math.round(between(360, 520)), spend: 0 }; });
  generators.forEach(function (g, m) { g.spend = round(g.litres * ERB.diesel[m], 2); });

  /* Fuel checks — a flag is a question to ask, not proof of misuse */
  var checks = [
    { sev: 'Serious', plate: 'DMB 1007', check: 'Low km/L month', fills: 14, litres: 612.4, amount: 15741, saw: 'August ran at 4.3 km/L against this car\'s usual 5.1, and the fleet median of 7.8.' },
    { sev: 'Serious', plate: 'DMB 1004', check: "Didn't move", fills: 1, litres: 48.3, amount: 1266, saw: 'The tracker shows 0 km on 14 Jul, while the car moved on the days either side.' },
    { sev: 'Serious', plate: 'DMB 1008', check: 'Driving at fill', fills: 1, litres: 41.0, amount: 1052, saw: 'The fill at 10:42 on 3 Sep falls in the middle of a tracked trip (10:15–11:20).' },
    { sev: 'Serious', plate: 'DMB 1002', check: 'Several fills', fills: 3, litres: 104.6, amount: 2798, saw: 'Three fills on 22 May — 38 L, 35 L and 31 L — with 96 km driven that day.' },
    { sev: 'Serious', plate: 'DMB 1006', check: 'Bigger than tank', fills: 1, litres: 68.0, amount: 1786, saw: 'A 68 L fill into a 55 L tank.' },
    { sev: 'Serious', plate: 'DMB 3300', check: 'Tracker silent', fills: 2, litres: 77.5, amount: 2040, saw: '0 km for the whole week around two fills — the tracker was offline, or fuel was bought for an idle car.' },
    { sev: 'Informational', plate: 'DMB 2672', check: 'Not in tracker', fills: 31, litres: 1109.4, amount: 29437, saw: 'Card plate with no tracker. One character off a tracked plate: did you mean DMB 2472?' },
    { sev: 'Informational', plate: 'Branch cards', check: 'Outside the fleet', fills: 22, litres: 3490, amount: 82700, saw: 'Diesel for generators and branch cards, kept out of vehicle km/L.' }
  ];

  var settings = { costBW: 0.35, costColour: 1.50, paperBenchmark: 50, petrolCO2: 2.34, dieselCO2: 2.66, pageCO2: 0.0046 };

  var budgets = {
    fuel: [95000, 95000, 95000, 95000, 95000, 95000, 95000, 95000, 95000, 95000, 95000, 95000],
    paper: [27000, 27000, 27000, 27000, 27000, 27000, 27000, 27000, 27000, 27000, 27000, 27000]
  };

  /* Safety: over-speed events and after-hours trips per vehicle, from tracker trips */
  vehicles.forEach(function (v) {
    var trips = Math.round(v.totalKm / (v.type === 'Motorbike' ? 18 : 42));
    v.trips = trips;
    v.overspeed = v.plate === 'DMB 1007' ? 61 : v.plate === 'DMB 1004' ? 44 : Math.round(trips * between(0.02, 0.09));
    v.topSpeed = v.type === 'Motorbike' ? Math.round(between(88, 104)) : v.plate === 'DMB 1007' ? 126 : Math.round(between(98, 121));
    v.afterHours = v.plate === 'DMB 3300' ? 14 : Math.round(trips * between(0, 0.04));
    v.status = 'Active';
  });
  vehicles.push({ plate: 'DMB 1949', type: 'Car', branch: 'Ndola', fuel: 'diesel', kml: 7.2, tank: 60, status: 'Sold', months: MONTHS.map(function () { return { km: 0, litres: 0, spend: 0, fills: 0 }; }), totalKm: 0, totalLitres: 0, totalSpend: 0, kmPerL: null, trips: 0, overspeed: 0, topSpeed: 0, afterHours: 0 });

  /* Heaviest printer users — pseudonymised, as the real app does after a demo */
  var users = [];
  branches.forEach(function (b, i) {
    var total = paper[b].reduce(function (s, m) { return s + m.pages; }, 0), share = b === 'Kitwe' ? .3 : .22;
    for (var k = 0; k < 3; k++) users.push({ user: 'User ' + String(i * 3 + k + 1).padStart(3, '0'), branch: b, pages: Math.round(total * share * [1, .55, .35][k] * between(.85, 1.1)) });
  });
  users.sort(function (a, b) { return b.pages - a.pages; });

  var imports = [
    { at: '2026-10-04 08:12', source: 'Fuel card — transaction report', file: 'card-transactions-sep.csv', rows: 712, note: '4 reversal rows removed with their sales' },
    { at: '2026-10-04 08:14', source: 'Tracker — utilisation', file: 'utilisation-sep.xlsx', rows: 13, note: '' },
    { at: '2026-10-04 08:15', source: 'Tracker — trip sheet', file: 'tripsheet-sep.csv', rows: 2210, note: '' },
    { at: '2026-10-04 08:17', source: 'Printer log — staff usage', file: 'print-usage-sep.xlsx', rows: 186, note: '' },
    { at: '2026-10-03 16:40', source: 'Business figures', file: 'entered in the app', rows: 11, note: 'September, all branches' }
  ];

  /* ───────── Persistence: register edits, settings and imports, per browser ───────── */
  var KEY = 'ra-demo-v1', saved = null;
  try { saved = JSON.parse(window.localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
  if (saved) {
    Object.assign(settings, saved.settings || {});
    (saved.vehicles || []).forEach(function (sv) {
      var v = vehicles.filter(function (x) { return x.plate === sv.plate; })[0];
      if (v) { v.type = sv.type; v.branch = sv.branch; v.tank = sv.tank; v.status = sv.status; }
    });
    if (saved.imports) imports = saved.imports;
  }

  window.RA_DATA = {
    months: MONTHS, labels: LABELS, branches: branches, business: business, paper: paper,
    vehicles: vehicles, generators: generators, checks: checks, erb: ERB, settings: settings, budgets: budgets,
    users: users, imports: imports,
    save: function () {
      var D = window.RA_DATA;
      try { window.localStorage.setItem(KEY, JSON.stringify({ settings: D.settings, imports: D.imports, vehicles: D.vehicles.map(function (v) { return { plate: v.plate, type: v.type, branch: v.branch, tank: v.tank, status: v.status }; }) })); } catch (e) {}
    },
    reset: function () { try { window.localStorage.removeItem(KEY); } catch (e) {} },
    /* Vehicles that count: sold ones are kept for the record but left out of every total */
    active: function () { return window.RA_DATA.vehicles.filter(function (v) { return v.status !== 'Sold'; }); }
  };
})();
