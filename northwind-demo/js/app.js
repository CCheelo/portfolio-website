/* NorthWind Outfitters dashboard — slicers, KPIs, charts, the XLOOKUP-style
   lookup panel and the February cleaning steps, all from window.NW_DATA. */
(function () {
  var D = window.NW_DATA;
  var PRODUCTS = {}; D.products.forEach(function (p) { PRODUCTS[p.pid] = p; });
  var REPS = ['Alex Smith', 'John King', 'Maria Lopez', 'Sarah Chen', 'Tom Rivera'];
  var REGIONS = ['North', 'East', 'South', 'West'];
  var CUSTOMERS = ['Trail Hut', 'Ridge Gear', 'Peak Outfitters', 'Outdoor World', 'LakeSide Sports', 'City Sports', 'Adventure Hub', 'Mountain Edge', 'Alpine Gear'];
  var GREEN = '#1f5f45', ORANGE = '#e07a2e', SLATE = '#6a8caf', SAGE = '#a3b18a', INK = '#17251f';

  function fmt(n, d) { return Number(n).toLocaleString('en', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 }); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* Edit distance — used to snap misspelt names onto the known lists */
  function lev(a, b) {
    a = a.toLowerCase(); b = b.toLowerCase();
    var d = []; for (var i = 0; i <= a.length; i++) d[i] = [i];
    for (var j = 0; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function snap(value, list) {
    var best = null, bd = 99;
    list.forEach(function (x) { var k = lev(value, x); if (k < bd) { bd = k; best = x; } });
    return bd <= 2 ? best : value;
  }

  /* ───────── The cleaning rules (applied to February as it arrived) ───────── */
  var RULES = [
    { id: 'pid', title: 'Product IDs in one format', note: '“Prd-004” → “PRD-004”, so they match the product dimension.' },
    { id: 'dim', title: 'Names and categories from the product dimension', note: 'Fixes casing and fills a blank product name and a blank category.' },
    { id: 'rep', title: 'Salesperson typos', note: '“Jonh King” → “John King”.' },
    { id: 'cust', title: 'Customer typos', note: '“Trail Hutt”, “Ridge Gears”, “Outdoor Wirld” snapped to known customers.' },
    { id: 'date', title: 'Dates outside February', note: '2025-05-02 is a day/month swap; 2004-02-14 a year typo.' },
    { id: 'dup', title: 'Duplicate order ID', note: 'Two different orders share ID 2005 — the second is renumbered 2005-B.' },
    { id: 'blank', title: 'Missing customer', note: 'Order 2009 has no customer — flagged “Unknown, follow up”, not guessed.' },
    { id: 'unknown', title: 'Product not in the dimension', note: 'PRD-011 (Arcticpro Sleeping Bag) has no cost on file — kept, margin excluded, flagged.' }
  ];

  function cleanFeb(raw) {
    var seen = {};
    return raw.map(function (r) {
      var o = Object.assign({}, r), fixes = {};
      var pid = r.pid.toUpperCase(); if (pid !== r.pid) fixes.pid = 1; o.pid = pid;
      var p = PRODUCTS[pid];
      if (p) { if (o.product !== p.name) fixes.product = 1; if (o.category !== p.category) fixes.category = 1; o.product = p.name; o.category = p.category; }
      else { o.product = o.product.replace(/\b\w/g, function (c) { return c.toUpperCase(); }); fixes.pid = fixes.pid || 1; o.unknown = true; }
      var rep = snap(r.rep, REPS); if (rep !== r.rep) fixes.rep = 1; o.rep = rep;
      if (!r.customer) { o.customer = 'Unknown — follow up'; fixes.customer = 1; }
      else { var c = snap(r.customer, CUSTOMERS); if (c !== r.customer) fixes.customer = 1; o.customer = c; }
      var dt = r.date;
      if (dt.slice(0, 4) !== '2025') { dt = '2025' + dt.slice(4); fixes.date = 1; }
      if (dt.slice(5, 7) !== '02') { dt = dt.slice(0, 5) + dt.slice(8, 10) + '-' + dt.slice(5, 7); fixes.date = 1; }
      o.date = dt;
      if (seen[o.id]) { o.id = o.id + '-B'; fixes.id = 1; }
      seen[o.id] = 1;
      o.fixes = fixes;
      return o;
    });
  }
  /* Which raw cells are wrong, for the "before" view */
  function rawFlags(raw) {
    var count = {}; raw.forEach(function (r) { count[r.id] = (count[r.id] || 0) + 1; });
    return raw.map(function (r) {
      var p = PRODUCTS[r.pid.toUpperCase()], f = {};
      if (r.pid !== r.pid.toUpperCase() || !p) f.pid = 1;
      if (!r.product || (p && r.product !== p.name)) f.product = 1;
      if (!r.category || (p && r.category !== p.category)) f.category = 1;
      if (REPS.indexOf(r.rep) === -1) f.rep = 1;
      if (!r.customer || CUSTOMERS.indexOf(r.customer) === -1) f.customer = 1;
      if (r.date.slice(0, 7) !== '2025-02') f.date = 1;
      if (count[r.id] > 1) f.id = 1;
      return f;
    });
  }

  /* All orders for the dashboard: January as-is, February cleaned */
  var JAN = D.orders.filter(function (o) { return o.date < '2025-02'; }).map(function (o) {
    var p = PRODUCTS[o.pid]; return Object.assign({}, o, { product: p.name, category: p.category, fixes: {} });
  });
  var FEB = cleanFeb(D.rawFeb);
  var ALL = JAN.concat(FEB);
  ALL.forEach(function (o) { var p = PRODUCTS[o.pid]; o.cost = p ? p.cost * o.qty : null; o.month = o.date.slice(5, 7) === '01' ? 'Jan' : 'Feb'; });

  /* ───────── Slicers ───────── */
  var F = { month: [], region: [], category: [] };
  var CATS = ['Camping', 'Apparel', 'Footwear', 'Water Sports', 'Accessories'];
  function chips(el, key, values) {
    el.innerHTML = values.map(function (v) { return '<button class="chip' + (F[key].indexOf(v) > -1 ? ' on' : '') + '" data-k="' + key + '" data-v="' + v + '" aria-pressed="' + (F[key].indexOf(v) > -1) + '">' + v + '</button>'; }).join('');
  }
  function filtered() {
    return ALL.filter(function (o) {
      return (!F.month.length || F.month.indexOf(o.month) > -1) && (!F.region.length || F.region.indexOf(o.region) > -1) && (!F.category.length || F.category.indexOf(o.category) > -1);
    });
  }

  var charts = {};
  function chart(id, cfg) { if (charts[id]) charts[id].destroy(); charts[id] = new Chart(document.getElementById(id), cfg); }
  function sumBy(rows, key) { var m = {}; rows.forEach(function (o) { m[o[key]] = (m[o[key]] || 0) + o.total; }); return m; }

  function renderDashboard() {
    chips(document.getElementById('sMonth'), 'month', ['Jan', 'Feb']);
    chips(document.getElementById('sRegion'), 'region', REGIONS);
    chips(document.getElementById('sCategory'), 'category', CATS);
    var rows = filtered();
    var sales = rows.reduce(function (s, o) { return s + o.total; }, 0);
    var known = rows.filter(function (o) { return o.cost != null; });
    var margin = known.reduce(function (s, o) { return s + o.total - o.cost; }, 0) / (known.reduce(function (s, o) { return s + o.total; }, 0) || 1);

    /* Targets exist for January only, by region */
    var janRows = rows.filter(function (o) { return o.month === 'Jan'; });
    var regionsInScope = F.region.length ? F.region : REGIONS;
    var hasJan = !F.month.length || F.month.indexOf('Jan') > -1;
    var target = hasJan && !F.category.length ? regionsInScope.reduce(function (s, r) { return s + D.targets[r]; }, 0) : null;
    var janSales = janRows.reduce(function (s, o) { return s + o.total; }, 0);
    var vs = target ? (janSales - target) / target : null;

    document.getElementById('kpis').innerHTML =
      kpi('Total sales', fmt(sales), rows.length + ' orders') +
      kpi('Average order', fmt(rows.length ? sales / rows.length : 0, 2), 'per order') +
      kpi('January vs target', vs == null ? '—' : '<span class="' + (vs < 0 ? 'neg' : 'pos') + '">' + (vs < 0 ? '−' : '+') + fmt(Math.abs(vs) * 100, 1) + '%</span>',
        target ? fmt(janSales) + ' of ' + fmt(target, 1) : 'targets are set by region, for January') +
      kpi('Gross margin', fmt(margin * 100, 1) + '%', 'standard cost from the product dimension') +
      kpi('Units', fmt(rows.reduce(function (s, o) { return s + o.qty; }, 0)), CATS.filter(function (c) { return rows.some(function (o) { return o.category === c; }); }).length + ' categories');
    function kpi(l, v, n) { return '<div class="kpi"><div class="kpi__label">' + l + '</div><div class="kpi__value">' + v + '</div><div class="kpi__note">' + n + '</div></div>'; }

    var byRegion = sumBy(janRows, 'region');
    document.getElementById('targetNote').textContent = hasJan ? 'January — the month targets were set for' : 'Targets exist for January only';
    chart('cRegion', { type: 'bar', data: { labels: regionsInScope, datasets: [
      { label: 'Actual (Jan)', data: regionsInScope.map(function (r) { return byRegion[r] || 0; }), backgroundColor: GREEN, borderRadius: 6 },
      { label: 'Target', data: regionsInScope.map(function (r) { return D.targets[r]; }), backgroundColor: 'rgba(224,122,46,.25)', borderColor: ORANGE, borderWidth: 2, borderRadius: 6 }
    ] }, options: { maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true } } } });

    var byCat = sumBy(rows, 'category'), cats = CATS.filter(function (c) { return byCat[c]; });
    chart('cCategory', { type: 'doughnut', data: { labels: cats, datasets: [{ data: cats.map(function (c) { return byCat[c]; }), backgroundColor: [GREEN, ORANGE, SLATE, SAGE, INK], borderWidth: 2 }] },
      options: { maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'right' } } } });

    var prodRows = {}; rows.forEach(function (o) {
      var k = o.product; prodRows[k] = prodRows[k] || { sales: 0, margin: 0 }; prodRows[k].sales += o.total; if (o.cost != null) prodRows[k].margin += o.total - o.cost;
    });
    var prods = Object.keys(prodRows).sort(function (a, b) { return prodRows[b].sales - prodRows[a].sales; });
    chart('cProduct', { type: 'bar', data: { labels: prods, datasets: [
      { label: 'Sales', data: prods.map(function (p) { return prodRows[p].sales; }), backgroundColor: GREEN, borderRadius: 4 },
      { label: 'Gross margin', data: prods.map(function (p) { return prodRows[p].margin; }), backgroundColor: ORANGE, borderRadius: 4 }
    ] }, options: { indexAxis: 'y', maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } } });

    var byDay = {}; rows.forEach(function (o) { byDay[o.date] = (byDay[o.date] || 0) + o.total; });
    var days = Object.keys(byDay).sort(), cum = 0;
    chart('cDaily', { type: 'line', data: { labels: days.map(function (d) { return d.slice(5); }), datasets: [
      { label: 'Cumulative sales', data: days.map(function (d) { cum += byDay[d]; return cum; }), borderColor: GREEN, backgroundColor: 'rgba(31,95,69,.12)', fill: true, tension: .3, pointRadius: 2 }
    ] }, options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } } });

    var byRep = sumBy(rows, 'rep'), reps = REPS.slice().sort(function (a, b) { return (byRep[b] || 0) - (byRep[a] || 0); }), max = byRep[reps[0]] || 1;
    document.getElementById('reps').innerHTML = reps.map(function (r, i) {
      return '<button class="rep" data-rep="' + r + '"><i class="rep__bar" style="width:' + ((byRep[r] || 0) / max * 100) + '%"></i><span>' + (i + 1) + '</span><span>' + r + '</span><b>' + fmt(byRep[r] || 0) + '</b></button>';
    }).join('');

    var top = prods[0], under = REGIONS.filter(function (r) { return (byRegion[r] || 0) < D.targets[r]; });
    document.getElementById('insight').innerHTML = rows.length
      ? '<b>Reading it:</b> ' + (top ? top + ' is the biggest seller in this view. ' : '') +
        (hasJan ? 'In January ' + (under.length ? under.join(', ') + (under.length > 1 ? ' were' : ' was') + ' below target, ' : 'every region hit target, ') + 'and only the East beat its number — the company finished ' + fmt(Math.abs((9822 - 10505.8) / 10505.8) * 100, 1) + '% under its January target. ' : '') +
        'The kayak sells rarely but carries the biggest margin per order.'
      : 'No orders match these filters.';
  }

  document.querySelector('.slicers').addEventListener('click', function (e) {
    var b = e.target.closest('.chip');
    if (b) { var k = b.getAttribute('data-k'), v = b.getAttribute('data-v'), i = F[k].indexOf(v); if (i > -1) F[k].splice(i, 1); else F[k].push(v); renderDashboard(); }
    if (e.target.id === 'clearSlicers') { F = { month: [], region: [], category: [] }; renderDashboard(); }
  });
  document.getElementById('reps').addEventListener('click', function (e) {
    var b = e.target.closest('.rep'); if (!b) return;
    document.getElementById('lRep').value = b.getAttribute('data-rep'); show('lookup'); renderLookup();
  });

  /* ───────── Lookup panel (XLOOKUP with wildcards) ───────── */
  function wildcard(pattern) {
    var re = '^' + pattern.trim().toUpperCase().replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
    return new RegExp(re);
  }
  function renderLookup() {
    var rep = document.getElementById('lRep').value, pat = document.getElementById('lPid').value || '*';
    var re = wildcard(pat), match = D.products.filter(function (p) { return re.test(p.pid); })[0];
    var mine = ALL.filter(function (o) { return o.rep === rep; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var total = mine.reduce(function (s, o) { return s + o.total; }, 0);
    var last = match ? mine.filter(function (o) { return o.pid === match.pid; }).pop() : null;
    document.getElementById('lResults').innerHTML =
      r('Total sales by ' + rep.split(' ')[0], fmt(total)) + r('Orders', mine.length) +
      r('Product', match ? match.pid + ' · ' + match.name : '#N/A') + r('Category', match ? match.category : '#N/A') +
      r('Standard price', match ? fmt(match.price) : '#N/A') + r('Last ' + rep.split(' ')[0] + ' order of it', last ? last.date : 'none');
    function r(l, v) { return '<div class="result"><span>' + l + '</span><b>' + esc(String(v)) + '</b></div>'; }
    document.getElementById('lFormula').textContent =
      '=SUMIFS(SalesAll[Total sales], SalesAll[Salesperson], "' + rep + '")\n' +
      '=XLOOKUP("' + pat + '", Products[ProductID], Products[Category], "#N/A", 2)   ← match mode 2 = wildcards\n' +
      '=MAXIFS(SalesAll[OrderDate], SalesAll[Salesperson], "' + rep + '", SalesAll[ProductID], "' + pat + '")';
    document.getElementById('lRepTitle').textContent = rep + ' — ' + mine.length + ' orders';
    document.getElementById('lOrders').innerHTML = '<thead><tr><th>Date</th><th>Customer</th><th>Product</th><th>Region</th><th class="r">Qty</th><th class="r">Total</th></tr></thead><tbody>' +
      mine.map(function (o) { return '<tr' + (match && o.pid === match.pid ? ' style="background:var(--orange-soft)"' : '') + '><td>' + o.date + '</td><td>' + esc(o.customer) + '</td><td>' + o.product + '</td><td>' + o.region + '</td><td class="r">' + o.qty + '</td><td class="r">' + fmt(o.total) + '</td></tr>'; }).join('') + '</tbody>';
  }
  document.getElementById('lRep').innerHTML = REPS.map(function (r) { return '<option' + (r === 'John King' ? ' selected' : '') + '>' + r + '</option>'; }).join('');
  document.getElementById('lRep').addEventListener('change', renderLookup);
  document.getElementById('lPid').addEventListener('input', renderLookup);

  /* ───────── Data cleaning ───────── */
  var cleaned = false;
  function renderQuality() {
    var flags = rawFlags(D.rawFeb);
    document.getElementById('checks').innerHTML = RULES.map(function (r) {
      return '<div class="check' + (cleaned ? ' done' : '') + '"><span class="check__icon">' + (cleaned ? '✓' : '!') + '</span><span><b>' + r.title + '</b><small>' + r.note + '</small></span></div>';
    }).join('');
    var rows = cleaned ? FEB : D.rawFeb, cols = ['id', 'date', 'region', 'rep', 'customer', 'pid', 'product', 'category', 'qty', 'price', 'total'];
    var heads = ['Order', 'Date', 'Region', 'Salesperson', 'Customer', 'Product ID', 'Product', 'Category', 'Qty', 'Price', 'Total'];
    document.getElementById('rawTable').innerHTML = '<thead><tr>' + heads.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (o, i) {
        var f = cleaned ? o.fixes : flags[i];
        return '<tr' + (!cleaned && f.id ? ' class="dup"' : '') + '>' + cols.map(function (c) {
          var bad = f[c] || (c === 'pid' && cleaned && o.unknown);
          var v = o[c] === '' ? '(blank)' : o[c];
          return '<td class="' + (bad ? (cleaned ? 'fixed' : 'bad') : '') + (['qty', 'price', 'total'].indexOf(c) > -1 ? ' r' : '') + '">' + esc(String(v)) + '</td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody>';
    document.getElementById('runClean').hidden = cleaned;
    document.getElementById('resetClean').hidden = !cleaned;
  }
  document.getElementById('runClean').addEventListener('click', function () { cleaned = true; renderQuality(); });
  document.getElementById('resetClean').addEventListener('click', function () { cleaned = false; renderQuality(); });

  /* ───────── Orders ───────── */
  function renderOrders() {
    var q = document.getElementById('oSearch').value.toLowerCase();
    var rows = ALL.filter(function (o) { return !q || (o.customer + ' ' + o.product + ' ' + o.rep + ' ' + o.region + ' ' + o.id).toLowerCase().indexOf(q) > -1; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    document.getElementById('ordersCount').textContent = rows.length + ' of ' + ALL.length + ' orders · February shown after cleaning';
    document.getElementById('oTable').innerHTML = '<thead><tr><th>Order</th><th>Date</th><th>Region</th><th>Salesperson</th><th>Customer</th><th>Product</th><th>Category</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead><tbody>' +
      rows.map(function (o) {
        var off = PRODUCTS[o.pid] && o.price !== PRODUCTS[o.pid].price;
        return '<tr><td>' + o.id + '</td><td>' + o.date + '</td><td>' + o.region + '</td><td>' + o.rep + '</td><td>' + esc(o.customer) + '</td><td>' + o.product + '</td><td>' + o.category + '</td><td class="r">' + o.qty + '</td>' +
          '<td class="r"' + (off ? ' title="Sold off the standard price of ' + PRODUCTS[o.pid].price + '" style="color:var(--orange);font-weight:700"' : '') + '>' + o.price + '</td><td class="r">' + fmt(o.total) + '</td></tr>';
      }).join('') + '</tbody>';
  }
  document.getElementById('oSearch').addEventListener('input', renderOrders);

  /* ───────── Tabs ───────── */
  var RENDER = { dashboard: renderDashboard, lookup: renderLookup, quality: renderQuality, orders: renderOrders };
  function show(v) {
    document.querySelectorAll('.tabs button').forEach(function (b) { var on = b.getAttribute('data-view') === v; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
    document.querySelectorAll('.view').forEach(function (s) { s.hidden = s.id !== 'view-' + v; });
    RENDER[v]();
  }
  document.querySelector('.tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) show(b.getAttribute('data-view')); });

  Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
  Chart.defaults.color = '#4b5d55';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) Chart.defaults.animation = false;
  show('dashboard');
})();
