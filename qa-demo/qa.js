/* Account Opening QA — simulation. Eight invented packs, each built to show one
   kind of outcome. The pipeline and rule IDs mirror the design described on the
   project page; nothing here is the bank's code, forms or data. */
(function () {
  var DOCS = ['Application form', 'ID copy', 'Photograph', 'Proof of address', 'Signature card', 'KYC checklist'];
  var FIELDS = [['name', 'Full name'], ['id', 'ID number'], ['dob', 'Date of birth'], ['phone', 'Mobile'], ['address', 'Address'], ['work', 'Occupation']];

  function person(name, id, dob, phone, address, work) { return { name: name, id: id, dob: dob, phone: phone, address: address, work: work }; }
  /* hw: what the customer wrote; sheet: printed account-opening sheet; sys: keyed into the core system */
  function pack(o) {
    var base = o.base;
    o.hw = Object.assign({}, base, o.hw || {});
    o.sheet = Object.assign({}, base, o.sheet || {});
    o.sys = Object.assign({}, base, o.sys || {});
    o.conf = Object.assign({ name: .98, id: .97, dob: .96, phone: .95, address: .93, work: .94 }, o.conf || {});
    o.present = o.present || DOCS.slice();
    o.ticked = o.ticked || o.present.slice();
    o.sig = Object.assign({ applicant: true, officer: true }, o.sig || {});
    o.extra = o.extra || [];
    return o;
  }

  var PACKS = [
    pack({ cu: 'CU-10421', branch: 'Cairo Road', type: 'Current', base: person('Chanda Mulenga', '418230/11/1', '14/07/1991', '0977 418 230', 'Plot 12, Kabulonga Rd, Lusaka', 'Teacher'),
      extra: [{ kind: 'blank' }, { kind: 'rot', doc: 'ID copy' }], story: 'A clean pack: one blank back page set aside and one upside-down scan turned the right way.' }),
    pack({ cu: 'CU-10422', branch: 'Matero', type: 'Savings', base: person('Natasha Phiri', '552019/10/1', '03/12/1994', '0966 552 019', '45 Mumbwa Rd, Matero', 'Nurse'),
      hw: { dob: '12/03/1994' }, story: 'The customer wrote the day and month the other way round from what was keyed.' }),
    pack({ cu: 'CU-10423', branch: 'Chilenje', type: 'Current', base: person('Kondwani Zulu', '301178/16/1', '22/01/1988', '0955 301 178', '7 Burma Rd, Chilenje', 'Mechanic'),
      conf: { address: .41 }, faint: ['address'], story: 'The address is too faint to verify with confidence, so a person looks at just that field.' }),
    pack({ cu: 'CU-10424', branch: 'Kitwe', type: 'Current', base: person('Bupe Sakala', '660415/66/1', '09/05/1996', '0977 660 415', '18 Freedom Ave, Kitwe', 'Accountant'),
      present: ['Application form', 'ID copy', 'Photograph', 'Signature card', 'KYC checklist'], ticked: DOCS.slice(), story: 'Proof of address is missing — but the checklist says it is there.' }),
    pack({ cu: 'CU-10425', branch: 'Ndola', type: 'Savings', base: person('Joseph Tembo', '219988/63/1', '30/09/1979', '0966 219 988', '3 Broadway, Ndola', 'Trader'),
      sig: { applicant: false }, extra: [{ kind: 'blank' }], story: 'The applicant never signed the form.' }),
    pack({ cu: 'CU-10426', branch: 'Head Office', type: 'Term deposit', base: person('Agnes Lungu', '778102/11/1', '11/11/1985', '0977 778 102', '22 Leopards Hill Rd, Lusaka', 'Engineer'),
      extra: [{ kind: 'blank' }, { kind: 'blank' }], story: 'Clean, after two blank back pages are set aside.' }),
    pack({ cu: 'CU-10427', branch: 'Chipata', type: 'Current', base: person('Mapalo Ngoma', '234567/16/1', '05/04/1999', '0955 234 567', '9 Umodzi Hwy, Chipata', 'Farmer'),
      sheet: { id: '234567/10/1' }, extra: [{ kind: 'blur', doc: 'ID copy' }], story: 'The printed sheet has a different ID number from the system, and the ID copy is too blurred to read.' }),
    pack({ cu: 'CU-10428', branch: 'Solwezi', type: 'Savings', base: person('Peter Siame', '845530/71/1', '17/06/1990', '0977 845 530', '5 Kansanshi Rd, Solwezi', 'Miner'),
      corrupt: true, story: 'The merged PDF will not open — the file is damaged. It fails loudly instead of being guessed at.' })
  ];
  var ACCOUNTS_OPENED = PACKS.map(function (p) { return p.cu; }).concat(['CU-10429', 'CU-10430']);

  var STAGES = [
    ['Assemble', 'merge pages, set blanks aside'],
    ['Classify', 'page types, quality, rotation'],
    ['Align & read', 'templates, OCR, handwriting'],
    ['Signatures', 'slots and checklist ticks'],
    ['Cross-check', 'form · sheet · system'],
    ['Route', 'with evidence']
  ];

  var state = {};          // cu -> { route, findings }
  var current = PACKS[0], busy = false;

  function norm(v) { return String(v).toUpperCase().replace(/\s+/g, ' ').trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────── The checks ───────── */
  function evaluate(p) {
    var F = [];
    if (p.corrupt) return { route: 'ERROR', findings: [{ rule: 'SYS-01', sev: 'err', text: 'The pack file could not be opened.', ev: 'merged PDF · 0 pages readable' }] };
    DOCS.forEach(function (d, i) {
      if (p.present.indexOf(d) === -1) F.push({ rule: 'DOC-01', sev: 'exc', text: d + ' is missing from the pack.', ev: 'expected page type "' + d + '" · not found' });
    });
    p.extra.forEach(function (x) { if (x.kind === 'blur') F.push({ rule: 'DOC-02', sev: 'exc', text: x.doc + ' is too blurred to read.', ev: 'page ' + (DOCS.indexOf(x.doc) + 1) + ' · sharpness below threshold' }); });
    if (!p.sig.applicant) F.push({ rule: 'SIG-01', sev: 'exc', text: 'Applicant signature slot is empty.', ev: 'page 1 · box (412, 880, 640, 940) · no ink' });
    if (!p.sig.officer) F.push({ rule: 'SIG-01', sev: 'exc', text: 'Officer signature slot is empty.', ev: 'page 1 · officer box · no ink' });
    p.ticked.forEach(function (d) { if (p.present.indexOf(d) === -1) F.push({ rule: 'CHK-01', sev: 'exc', text: 'Checklist ticks "' + d + '", but it is not in the pack.', ev: 'page 6 · tick present · document absent' }); });
    FIELDS.forEach(function (f, i) {
      var k = f[0];
      if (p.conf[k] < .6) F.push({ rule: 'HW-01', sev: 'human', field: k, text: f[1] + ' can\'t be verified with confidence (' + Math.round(p.conf[k] * 100) + '%).', ev: 'page 1 · field ' + (i + 1) + ' · shown to the checker beside the keyed value' });
      else if (norm(p.hw[k]) !== norm(p.sys[k])) F.push({ rule: 'FLD-01', sev: 'exc', field: k, text: f[1] + ': form says "' + p.hw[k] + '", system has "' + p.sys[k] + '".', ev: 'page 1 · field ' + (i + 1) + ' · handwritten ≠ system' });
      if (norm(p.sheet[k]) !== norm(p.sys[k])) F.push({ rule: 'FLD-02', sev: 'exc', field: k, text: f[1] + ': printed sheet says "' + p.sheet[k] + '", system has "' + p.sys[k] + '".', ev: 'page 2 · printed sheet ≠ system' });
    });
    var route = F.some(function (f) { return f.sev === 'exc'; }) ? 'EXCEPTION' : F.length ? 'NEEDS_HUMAN' : 'CLEAN';
    return { route: route, findings: F };
  }

  /* ───────── Rendering ───────── */
  function renderQueue() {
    document.getElementById('queue').innerHTML = PACKS.map(function (p) {
      var s = state[p.cu] ? state[p.cu].route : 'QUEUED';
      return '<button class="pack' + (p === current ? ' on' : '') + '" data-cu="' + p.cu + '"><span class="pack__name">' + p.base.name + '</span><span class="tag tag--' + s + '">' + s.replace('_', ' ') + '</span>' +
        '<span class="pack__meta">' + p.cu + ' · ' + p.branch + ' · ' + p.type + '</span></button>';
    }).join('');
    var done = Object.keys(state).length;
    document.getElementById('queueCount').textContent = done + ' / ' + PACKS.length + ' checked';
    document.getElementById('missing').innerHTML = '<b>Accounts with no pack</b>Accounts opened in the system minus packs on file — no OCR needed:<br>' +
      ACCOUNTS_OPENED.filter(function (c) { return !PACKS.some(function (p) { return p.cu === c; }); }).map(function (c) { return '<code>' + c + '</code>'; }).join(' · ');
  }

  function renderPipeline(upTo, running) {
    document.getElementById('pipeline').innerHTML = STAGES.map(function (s, i) {
      var cls = i < upTo ? 'ok' : i === upTo && running ? 'run' : '';
      return '<div class="stage ' + cls + '"><b>' + (i < upTo ? '✓ ' : '') + s[0] + '</b>' + s[1] + '</div>';
    }).join('');
  }

  function renderPages(p, stage) {
    if (p.corrupt) { document.getElementById('pages').innerHTML = '<div class="thumb miss"><div class="thumb__img"></div>unreadable<small>pack.pdf</small></div>'; return; }
    var html = DOCS.map(function (d, i) {
      var miss = p.present.indexOf(d) === -1, blur = p.extra.some(function (x) { return x.kind === 'blur' && x.doc === d; }), rot = p.extra.some(function (x) { return x.kind === 'rot' && x.doc === d; });
      var cls = miss ? 'miss' : (blur && stage >= 2 ? 'blur' : '') + (rot && stage < 2 ? ' rot' : '');
      return '<div class="thumb ' + cls + (i === 0 ? ' on' : '') + '"><div class="thumb__img"></div>' + d + '<small>' + (miss ? 'missing' : rot && stage >= 2 ? 'rotated · fixed' : blur && stage >= 2 ? 'blurred' : 'p.' + (i + 1)) + '</small></div>';
    }).join('');
    p.extra.filter(function (x) { return x.kind === 'blank'; }).forEach(function () {
      html += '<div class="thumb blank"><div class="thumb__img"></div>Blank back page<small>' + (stage >= 1 ? 'set aside · logged' : 'unsorted') + '</small></div>';
    });
    document.getElementById('pages').innerHTML = html;
  }

  function renderSheet(p, stage, result) {
    var el = document.getElementById('sheet');
    if (p.corrupt) { el.innerHTML = '<div class="sheet__title">ACCOUNT APPLICATION <small>' + p.cu + '</small></div><p style="padding:3rem 0;text-align:center;color:#8a3a3a">This file can\'t be opened.<br><small>The pack is routed to ERROR and re-requested from the branch.</small></p>'; el.classList.remove('skewed'); return; }
    var byField = {}; (result ? result.findings : []).forEach(function (f, i) { if (f.field) byField[f.field] = byField[f.field] || f; });
    el.classList.toggle('skewed', stage < 2);
    el.innerHTML = '<div class="scan" id="scan"></div><div class="sheet__title">ACCOUNT APPLICATION — ' + p.type.toUpperCase() + '<small>' + p.cu + ' · ' + p.branch + '</small></div>' +
      FIELDS.map(function (f) {
        var k = f[0], box = '', ref = '';
        if (stage >= 3) box = ' box-ok';
        if (stage >= 5 && byField[k]) { box = byField[k].sev === 'human' ? ' box-human' : ' box-bad'; ref = '<span class="ref">' + byField[k].rule + '</span>'; }
        var faint = (p.faint || []).indexOf(k) > -1 ? ' faint' : '';
        return '<div class="field' + box + '">' + ref + '<span class="field__label">' + f[1] + '</span><span class="field__value' + faint + '">' + esc(p.hw[k]) + '</span></div>';
      }).join('') +
      '<div class="ticks">' + DOCS.map(function (d) { return '<span class="' + (p.ticked.indexOf(d) > -1 ? 't' : '') + '">' + d + '</span>'; }).join('') + '</div>' +
      '<div class="sigrow"><div class="sig">' + (p.sig.applicant ? '<span class="sig__ink">' + p.base.name.split(' ')[1] + '</span>' : '') + 'Applicant signature</div>' +
      '<div class="sig">' + (p.sig.officer ? '<span class="sig__ink">K. Mwale</span>' : '') + 'Account officer</div></div>';
    if (stage === 2 && !reduce) { var s = document.getElementById('scan'); s.classList.add('go'); }
  }

  function renderFindings(p, result) {
    var r = document.getElementById('route'), three = document.getElementById('three'), list = document.getElementById('findings');
    if (!result) {
      r.innerHTML = '<div class="route__label">Route</div><div class="route__value" style="color:var(--muted)">—</div><div class="route__why">' + esc(p.story) + '</div><button class="btn" id="runOne" style="margin-top:.8rem">▶ Check this pack</button>';
      three.innerHTML = ''; list.innerHTML = '';
      document.getElementById('runOne').onclick = function () { run(p, 520); };
      return;
    }
    var color = { CLEAN: 'var(--clean)', EXCEPTION: 'var(--exc)', NEEDS_HUMAN: 'var(--human)', ERROR: 'var(--err)' }[result.route];
    var why = { CLEAN: 'Nothing to look at — a light spot check only.', EXCEPTION: 'The checker gets an exception list with evidence, not a cold read of the whole pack.', NEEDS_HUMAN: 'Everything else verified; a person decides the one field the model wasn\'t sure of.', ERROR: 'Fails loudly. Nothing is guessed.' }[result.route];
    r.innerHTML = '<div class="route__label">Route</div><div class="route__value" style="color:' + color + '">' + result.route + '</div><div class="route__why">' + why + '</div>';
    if (!p.corrupt) {
      three.innerHTML = '<table><thead><tr><th>Field</th><th>Form</th><th>Sheet</th><th>System</th></tr></thead><tbody>' + FIELDS.map(function (f) {
        var k = f[0], a = norm(p.hw[k]) !== norm(p.sys[k]) && p.conf[k] >= .6, b = norm(p.sheet[k]) !== norm(p.sys[k]);
        return '<tr><td>' + f[1] + '</td><td class="' + (a ? 'x' : '') + '">' + (p.conf[k] < .6 ? '?' : esc(p.hw[k])) + '</td><td class="' + (b ? 'x' : '') + '">' + esc(p.sheet[k]) + '</td><td>' + esc(p.sys[k]) + '</td></tr>';
      }).join('') + '</tbody></table>';
    } else three.innerHTML = '';
    list.innerHTML = result.findings.length ? result.findings.map(function (f) {
      return '<div class="finding ' + (f.sev === 'human' ? 'human' : '') + '"><div class="finding__head"><b>' + (f.sev === 'human' ? 'Needs a person' : f.sev === 'err' ? 'Error' : 'Exception') + '</b><code>' + f.rule + ' · ruleset v3</code></div>' + esc(f.text) + '<small>' + esc(f.ev) + '</small></div>';
    }).join('') : '<div class="finding ok"><div class="finding__head"><b>No findings</b><code>ruleset v3</code></div>All documents present, all fields agree three ways, signatures in place.</div>';
  }

  function select(p) {
    current = p;
    var res = state[p.cu];
    renderQueue(); renderPipeline(res ? 6 : 0, false); renderPages(p, res ? 6 : 0); renderSheet(p, res ? 6 : 0, res); renderFindings(p, res);
  }

  function run(p, speed, done) {
    if (busy) return; busy = true;
    current = p; renderQueue();
    var result = evaluate(p), stage = 0;
    document.getElementById('runAll').disabled = true;
    renderFindings(p, null); document.getElementById('runOne') && (document.getElementById('runOne').disabled = true);
    (function step() {
      renderPipeline(stage, stage < 6); renderPages(p, stage); renderSheet(p, stage, stage >= 5 ? result : null);
      if (stage >= 6 || (p.corrupt && stage >= 1)) {
        state[p.cu] = result; renderPipeline(6, false); renderSheet(p, 6, result); renderFindings(p, result); renderQueue();
        busy = false; document.getElementById('runAll').disabled = false;
        if (done) done(); else if (Object.keys(state).length === PACKS.length) summary();
        return;
      }
      stage++; setTimeout(step, reduce ? 0 : speed);
    })();
  }

  function runAll() {
    var todo = PACKS.filter(function (p) { return !state[p.cu]; }), i = 0;
    (function next() { if (i >= todo.length) { summary(); return; } run(todo[i++], 140, next); })();
  }

  function summary() {
    var c = { CLEAN: 0, EXCEPTION: 0, NEEDS_HUMAN: 0, ERROR: 0 };
    PACKS.forEach(function (p) { c[state[p.cu].route]++; });
    /* Illustrative workload: reading a pack cold ≈ 30 min; reviewing an exception list ≈ 8; a field for a person ≈ 4; a clean spot check ≈ 2 */
    var cold = PACKS.length * 30, now = c.EXCEPTION * 8 + c.NEEDS_HUMAN * 4 + c.CLEAN * 2 + c.ERROR * 5;
    var s = document.getElementById('summary'); s.hidden = false;
    s.innerHTML = '<h2>Batch result</h2><div class="sumgrid">' +
      cell(c.CLEAN, 'CLEAN', 'var(--clean)') + cell(c.EXCEPTION, 'EXCEPTION', 'var(--exc)') + cell(c.NEEDS_HUMAN, 'NEEDS HUMAN', 'var(--human)') + cell(c.ERROR, 'ERROR', 'var(--err)') +
      cell(Math.round((1 - now / cold) * 100) + '%', 'less checker reading time*', 'var(--gold)') + '</div>' +
      '<p>* Illustrative only: a cold read of a pack is taken as 30 minutes, an exception list as 8, a single field for a person as 4 and a clean spot check as 2. In the real project the saving depends entirely on the false-positive rate — if the agent over-flags, the checker reads the whole pack anyway — which is why it is measured on frozen test sets and shadow-run before go-live.</p>';
    function cell(v, l, col) { return '<div class="sumcell"><b style="color:' + col + '">' + v + '</b><span>' + l + '</span></div>'; }
    s.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
  }

  document.getElementById('queue').addEventListener('click', function (e) {
    var b = e.target.closest('.pack'); if (!b || busy) return;
    select(PACKS.filter(function (p) { return p.cu === b.getAttribute('data-cu'); })[0]);
  });
  document.getElementById('runAll').addEventListener('click', function () { if (!busy) runAll(); });
  document.getElementById('reset').addEventListener('click', function () { if (busy) return; state = {}; document.getElementById('summary').hidden = true; select(PACKS[0]); });

  select(PACKS[0]);
})();
