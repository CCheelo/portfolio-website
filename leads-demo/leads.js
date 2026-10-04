/* Leads form demo. Seed leads are invented; anything typed lives in memory
   only and disappears on reload. Mirrors the real form: validation, a
   honeypot, UTM tags carried from the link into every saved lead. */
(function () {
  var POSTS = [
    { id: 'motorbike-post', net: 'Facebook', color: '#1877f2', bg: '#e8f0fe', emoji: '🏍️', text: 'Ride to work on your own bike — from K850 a month.', source: 'facebook', campaign: 'asset-finance-launch', headline: 'Your own motorbike, from K850 a month', sub: 'Tell us what you need and a finance officer will call you back.' },
    { id: 'tractor-reel', net: 'Instagram', color: '#c13584', bg: '#fdeaf3', emoji: '🚜', text: 'Harvest season is coming. Finance the tractor now.', source: 'instagram', campaign: 'asset-finance-launch', headline: 'Farm machinery, financed before harvest', sub: 'Flexible repayments that follow your harvest.' },
    { id: 'status-vehicle', net: 'WhatsApp', color: '#128c4b', bg: '#e6f6ec', emoji: '🚙', text: 'Upgrade the family car this month — quick approvals.', source: 'whatsapp', campaign: 'asset-finance-launch', headline: 'Upgrade the family car', sub: 'Quick approvals and a call back within a day.' },
    { id: 'sme-equipment', net: 'LinkedIn', color: '#0a66c2', bg: '#e8f1fb', emoji: '🏭', text: 'Grow your business: finance the equipment, keep your cash.', source: 'linkedin', campaign: 'sme-equipment-q4', headline: 'Equipment finance for growing businesses', sub: 'Keep your working capital for running the business.' }
  ];

  /* Invented leads so the report has something in it */
  var FIRST = ['Mwila', 'Chanda', 'Bupe', 'Kondwani', 'Natasha', 'Joseph', 'Thandiwe', 'Mapalo', 'Lweendo', 'Agnes', 'Peter', 'Ruth'];
  var LAST = ['Banda', 'Phiri', 'Zulu', 'Mulenga', 'Tembo', 'Sakala', 'Lungu', 'Mumba', 'Ngoma', 'Chileshe'];
  var TOWNS = ['Lusaka', 'Kitwe', 'Ndola', 'Chipata', 'Solwezi', 'Livingstone', 'Kabwe'];
  var PRODUCT_FOR = { 'motorbike-post': 'Motorbike', 'tractor-reel': 'Farm machinery', 'status-vehicle': 'Vehicle', 'sme-equipment': 'Business equipment' };
  var AMOUNTS = ['Under K20,000', 'K20,000 – K75,000', 'K75,000 – K200,000', 'Over K200,000'];
  var seed = 7; function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function pick(a) { return a[Math.floor(rnd() * a.length)]; }
  var WEIGHT = [9, 4, 6, 3];
  var leads = [];
  POSTS.forEach(function (p, i) {
    for (var k = 0; k < WEIGHT[i]; k++) {
      var day = 1 + Math.floor(rnd() * 3), h = 8 + Math.floor(rnd() * 12), m = Math.floor(rnd() * 60);
      leads.push({ time: '2026-10-0' + day + ' ' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0'),
        name: pick(FIRST) + ' ' + pick(LAST), phone: '09' + pick(['5', '6', '7']) + pick(['5', '6', '7']) + ' ' + String(Math.floor(rnd() * 900 + 100)) + ' ' + String(Math.floor(rnd() * 900 + 100)),
        product: PRODUCT_FOR[p.id], amount: pick(AMOUNTS), town: pick(TOWNS), source: p.source, campaign: p.campaign, content: p.id });
    }
  });
  leads.sort(function (a, b) { return a.time < b.time ? 1 : -1; });

  var current = POSTS[0], fresh = -1;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function renderPosts() {
    document.getElementById('posts').innerHTML = POSTS.map(function (p) {
      return '<button class="post' + (p === current ? ' on' : '') + '" data-id="' + p.id + '" aria-pressed="' + (p === current) + '"><span class="post__img" style="background:' + p.bg + '">' + p.emoji + '</span>' +
        '<span><span class="post__net" style="color:' + p.color + '">' + p.net + '</span><br><span class="post__text">' + p.text + '</span></span></button>';
    }).join('');
    document.getElementById('url').innerHTML = 'https://finance.example/apply?utm_source=<b>' + current.source + '</b>&amp;utm_campaign=<b>' + current.campaign + '</b>&amp;utm_content=<b>' + current.id + '</b>';
    document.getElementById('hero').innerHTML = '<h2>' + current.headline + '</h2><p>' + current.sub + '</p>';
    var sel = document.querySelector('select[name=product]');
    if (!sel.value) sel.value = PRODUCT_FOR[current.id];
  }

  function renderReport() {
    var counts = {}; POSTS.forEach(function (p) { counts[p.id] = 0; });
    leads.forEach(function (l) { counts[l.content] = (counts[l.content] || 0) + 1; });
    var max = Math.max.apply(null, POSTS.map(function (p) { return counts[p.id]; }));
    document.getElementById('bars').innerHTML = POSTS.map(function (p) {
      return '<div class="bar"><span>' + p.emoji + ' ' + p.net + '</span><span class="bar__track"><span class="bar__fill" style="width:' + (counts[p.id] / max * 100) + '%;background:' + p.color + '"></span></span><b>' + counts[p.id] + '</b></div>';
    }).join('');
    document.getElementById('leadCount').textContent = leads.length + ' leads this week';
    var cols = ['time', 'name', 'phone', 'product', 'amount', 'town', 'source', 'campaign', 'content'];
    document.getElementById('table').innerHTML = '<thead><tr>' + cols.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
      leads.map(function (l, i) { return '<tr' + (i === fresh ? ' class="new"' : '') + '>' + cols.map(function (c) { return '<td>' + esc(l[c]) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
  }

  document.getElementById('posts').addEventListener('click', function (e) {
    var b = e.target.closest('.post'); if (!b) return;
    current = POSTS.filter(function (p) { return p.id === b.getAttribute('data-id'); })[0];
    document.querySelector('select[name=product]').value = '';
    renderPosts();
  });

  var form = document.getElementById('form'), err = document.getElementById('error');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements, problems = [];
    form.querySelectorAll('.invalid').forEach(function (x) { x.classList.remove('invalid'); });
    if (f.name.value.trim().length < 3) { problems.push('your name'); f.name.classList.add('invalid'); }
    var phone = f.phone.value.replace(/\D/g, '');
    if (!/^(0|260)?9[5-7]\d{7}$/.test(phone)) { problems.push('a Zambian mobile number'); f.phone.classList.add('invalid'); }
    if (!f.product.value) { problems.push('what to finance'); f.product.classList.add('invalid'); }
    if (!f.amount.value) { problems.push('an amount'); f.amount.classList.add('invalid'); }
    if (!f.consent.checked) problems.push('your consent');
    if (problems.length) { err.textContent = 'Please add ' + problems.join(', ') + '.'; return; }
    err.textContent = '';
    if (f.website.value) { done(); return; }      // honeypot filled: a bot — pretend it worked, save nothing
    var now = new Date();
    leads.unshift({ time: now.toISOString().slice(0, 10) + ' ' + now.toTimeString().slice(0, 5), name: f.name.value.trim(), phone: f.phone.value.trim(),
      product: f.product.value, amount: f.amount.value, town: f.town.value.trim() || '—', source: current.source, campaign: current.campaign, content: current.id });
    fresh = 0; renderReport(); done();
  });
  function done() { form.hidden = true; document.getElementById('thanks').hidden = false; document.getElementById('hero').hidden = true; }
  document.getElementById('again').addEventListener('click', function () {
    form.reset(); form.hidden = false; document.getElementById('thanks').hidden = true; document.getElementById('hero').hidden = false; renderPosts();
  });

  document.getElementById('download').addEventListener('click', function () {
    var cols = ['time', 'name', 'phone', 'product', 'amount', 'town', 'source', 'campaign', 'content'];
    var csv = cols.join(',') + '\n' + leads.map(function (l) { return cols.map(function (c) { return '"' + String(l[c]).replace(/"/g, '""') + '"'; }).join(','); }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'leads-demo.csv'; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  renderPosts(); renderReport();
})();
