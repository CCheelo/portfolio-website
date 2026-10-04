/* ═══════════════════════════════════════════════════════════════
   Freya demo — a web reproduction of the SwiftUI app's main
   screens, for a made-up couple (Alex & Sam). In the real app both
   phones sync live through Supabase Realtime; here Sam's side is
   pre-written so the blind reveals still work on one device.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var screen = document.getElementById('scroll');

  /* ───────── State & gamification ───────── */
  var S = { xp: 340, level: 4, streak: 12, qotd: null, sent: 0, wyrIndex: 0, wyrMatches: 0, wyrPlayed: 0, wheelSpun: false, rated: 0 };
  var LEVEL_XP = 400;
  function gain(n, why) {
    S.xp += n;
    if (S.xp >= LEVEL_XP) { S.xp -= LEVEL_XP; S.level++; toast('Level up! You\'re now level ' + S.level + ' 🎉'); }
    else toast(why + ' · +' + n + ' XP');
    var bar = document.getElementById('xpbar'); if (bar) bar.style.width = (S.xp / LEVEL_XP * 100) + '%';
  }

  var TOGETHER_SINCE = new Date('2025-02-14');
  var QUESTIONS = [
    { q: 'What\'s a small thing I do that always makes your day?', theirs: 'When you send me a voice note instead of a text. Every single time.' },
    { q: 'If we could live anywhere for a year, where would it be?', theirs: 'Cape Town. Mountains, the sea, and you finally learning to surf.' },
    { q: 'What\'s your earliest happy memory?', theirs: 'Eating mangoes on my grandmother\'s veranda during a thunderstorm.' }
  ];
  var WYR = [
    ['Have breakfast in bed every morning', 'Go on a spontaneous road trip every weekend', 'B'],
    ['Watch the sunset from a mountain top together', 'Dance in the kitchen to an old playlist', 'A'],
    ['Only ever cook at home', 'Only ever eat out', 'A'],
    ['Plan every trip down to the hour', 'Book the flight and figure out the rest', 'B'],
    ['Know what your partner is thinking', 'Know what your partner is going to say next', 'A']
  ];
  var WHEEL = [
    { t: 'Date Night', e: '🍷', a: 'Plan a surprise date night this week — dinner at home and a film you keep putting off.' },
    { t: 'Kind Words', e: '💬', a: 'For the next 24 hours, only kind and affirming words. Notice how it shifts the energy.' },
    { t: 'New Recipe', e: '🍳', a: 'Pick a dish neither of you has cooked and make it together tonight.' },
    { t: 'Walk & Talk', e: '🌅', a: 'A 30-minute walk, phones in pockets, and one question each from the question packs.' },
    { t: 'Throwback', e: '📼', a: 'Recreate the first photo you ever took together.' },
    { t: 'Plan a Trip', e: '🗺️', a: 'Spend 20 minutes planning a weekend away — even if it\'s just to the next town.' }
  ];
  var DATES = [
    { name: 'Sunset picnic at the lake', emoji: '🧺', cat: 'Sweet', cost: 'K' },
    { name: 'Pottery class', emoji: '🏺', cat: 'Adventurous', cost: 'KK' },
    { name: 'Cook a three-course dinner', emoji: '🍝', cat: 'Romantic', cost: 'K' },
    { name: 'Stargazing drive', emoji: '🌌', cat: 'Romantic', cost: 'K' },
    { name: 'Karaoke night', emoji: '🎤', cat: 'Adventurous', cost: 'KK' }
  ];
  var IDEAS = [
    { name: 'Bookshop date — pick a book for each other', emoji: '📚', cat: 'Sweet', cost: 'K' },
    { name: 'Sunrise hike', emoji: '🥾', cat: 'Adventurous', cost: 'K' },
    { name: 'Board-game café', emoji: '🎲', cat: 'Sweet', cost: 'KK' },
    { name: 'Museum + ice cream', emoji: '🍦', cat: 'Sweet', cost: 'K' },
    { name: 'Paint-and-sip evening', emoji: '🎨', cat: 'Romantic', cost: 'KK' },
    { name: 'Day trip to the falls', emoji: '🌊', cat: 'Adventurous', cost: 'KKK' }
  ];
  var DONE = [
    { name: 'Rooftop dinner', emoji: '🌃', me: 5, them: 5 },
    { name: 'Go-karting', emoji: '🏎️', me: 4, them: 5 },
    { name: 'Farmers\' market morning', emoji: '🥭', me: 4, them: 4 }
  ];
  var MEMORIES = [
    { e: '☕', c: 'First coffee date', d: 'Feb 2025', bg: '#ffe3d3', r: '-3deg' },
    { e: '🎡', c: 'Fair, way too many rides', d: 'Apr 2025', bg: '#f3e8ff', r: '2deg' },
    { e: '🌧️', c: 'Caught in the rain', d: 'Jul 2025', bg: '#dbeafe', r: '-1.5deg' },
    { e: '🎂', c: 'Sam\'s birthday surprise', d: 'Oct 2025', bg: '#ffe4ec', r: '2.5deg' },
    { e: '🏖️', c: 'Our first trip', d: 'Jan 2026', bg: '#fef3c7', r: '-2deg' },
    { e: '🏆', c: '1 year! 💜', d: 'Feb 2026', bg: '#dcfce7', r: '1.5deg' }
  ];

  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2300);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function days() { return Math.floor((new Date() - TOGETHER_SINCE) / 864e5); }

  /* ───────── Home ───────── */
  function home() {
    var h = new Date().getHours(), greet = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    var q = QUESTIONS[new Date().getDate() % QUESTIONS.length];
    screen.innerHTML = '<div class="view"><div class="hello"><div><div class="sub">' + greet + '</div><h1>Alex 💜</h1></div><button class="avatar" data-go="profile" aria-label="Your profile">A</button></div>' +
      '<div class="card partner"><div class="avatar" style="width:46px;height:46px;background:linear-gradient(135deg,var(--violet),var(--pink))">S</div>' +
      '<div style="flex:1"><b>Sam</b><div class="sub"><span class="dot"></span>Online · “at the library till 6”</div></div><span style="font-size:1.4rem">💭</span></div>' +
      '<div class="row2"><div class="tile t-red"><small>Together</small><b>' + days() + '</b><small>days</small></div>' +
      '<div class="tile t-sun"><small>Daily streak</small><b>🔥 ' + S.streak + '</b><small>keep it going</small></div></div>' +
      '<div class="card qotd" style="margin-top:.85rem"><div class="label">Question of the day</div><p class="q">' + q.q + '</p><div id="qbox"></div></div>' +
      '<button class="btn btn--soft" data-go="chat" style="margin-top:.85rem">💬 Message Sam</button>' +
      '<div style="margin:1rem 0 .55rem;font-weight:900">Send Sam something</div>' +
      '<div class="sends">' + [['🤗', 'Hug'], ['⭐', 'High five'], ['☕', 'Coffee?']].map(function (s) { return '<button class="send" data-send="' + s[1] + '"><span>' + s[0] + '</span>' + s[1] + '</button>'; }).join('') + '</div>' +
      '<div class="card" style="margin-top:.85rem"><div style="display:flex;justify-content:space-between;font-weight:900"><span>Level ' + S.level + '</span><span class="sub">' + S.xp + ' / ' + LEVEL_XP + ' XP</span></div><div class="xp"><i id="xpbar" style="width:' + (S.xp / LEVEL_XP * 100) + '%"></i></div></div></div>';

    var box = document.getElementById('qbox');
    function drawQ() {
      if (!S.qotd) {
        box.innerHTML = '<p class="sub" style="margin-bottom:.5rem">Sam has answered. Answer yours to unlock theirs — blind reveal, no peeking.</p>' +
          '<div class="bubble them"><b>Sam</b><span class="blur">' + esc(q.theirs) + '</span></div>' +
          '<input class="input mt" id="qin" placeholder="Your answer…" aria-label="Your answer"><button class="btn btn--pink mt" id="qgo">Reveal both</button>';
        document.getElementById('qgo').onclick = function () {
          var v = document.getElementById('qin').value.trim(); if (!v) { toast('Write something first ✍️'); return; }
          S.qotd = v; drawQ(); gain(15, 'Question answered');
        };
      } else {
        box.innerHTML = '<div class="answers2"><div class="bubble me"><b>You</b>' + esc(S.qotd) + '</div><div class="bubble them"><b>Sam</b>' + esc(q.theirs) + '</div></div>';
      }
    }
    drawQ();
    screen.querySelectorAll('[data-send]').forEach(function (b) {
      b.onclick = function () { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); S.sent++; gain(5, b.getAttribute('data-send') + ' sent to Sam'); };
    });
  }

  /* ───────── Games ───────── */
  function games() {
    screen.innerHTML = '<div class="view"><h1 style="margin:.4rem 0 .2rem">Games</h1><p class="sub" style="margin-bottom:1rem">Play together — on one phone or two.</p>' +
      '<div class="games"><button class="gtile g1" data-g="wyr"><span>🤔</span><b>Would You Rather</b></button>' +
      '<button class="gtile g2" data-g="wheel"><span>🎡</span><b>Lucky Wheel</b></button>' +
      '<button class="gtile g3" data-g="trivia"><span>🧠</span><b>Trivia: About Us</b></button>' +
      '<button class="gtile g4" data-g="challenge"><span>🏅</span><b>Weekly Challenge</b></button></div>' +
      '<div class="card" style="margin-top:1rem"><b>This week\'s challenge</b><p class="sub" style="margin-top:.2rem">Cook something new together — one recipe neither of you has tried.</p><div class="xp"><i style="width:50%"></i></div><p class="sub" style="font-size:.75rem;margin-top:.3rem">1 of 2 done · +50 XP when finished</p></div></div>';
    screen.querySelectorAll('[data-g]').forEach(function (b) {
      b.onclick = function () {
        var g = b.getAttribute('data-g');
        if (g === 'wyr') wyr(); else if (g === 'wheel') wheel(); else if (g === 'trivia') trivia(); else challenge();
      };
    });
  }
  function wyr() {
    var i = S.wyrIndex % WYR.length, item = WYR[i];
    screen.innerHTML = '<div class="view"><button class="sub" data-back="games">← Games</button><h1 style="margin:.4rem 0 0">Would You Rather</h1>' +
      '<p class="sub">Pick one — then see what Sam picked.</p><div class="wyr"><button data-o="A">' + item[0] + '</button><div class="or">OR</div><button data-o="B">' + item[1] + '</button></div>' +
      '<div id="res" aria-live="polite" style="text-align:center;font-weight:800;min-height:1.4em"></div>' +
      '<p class="sub" style="text-align:center;margin-top:.4rem">Matched ' + S.wyrMatches + ' of ' + S.wyrPlayed + '</p></div>';
    screen.querySelector('[data-back]').onclick = games;
    screen.querySelectorAll('[data-o]').forEach(function (b) {
      b.onclick = function () {
        var o = b.getAttribute('data-o'), match = o === item[2];
        screen.querySelectorAll('[data-o]').forEach(function (x) { x.disabled = true; if (x.getAttribute('data-o') === item[2]) x.classList.add('theirs'); });
        b.classList.add('picked'); S.wyrPlayed++; if (match) S.wyrMatches++;
        document.getElementById('res').innerHTML = (match ? '💞 Same answer!' : '🙈 Sam picked the other one') + '<br><button class="btn btn--soft mt" id="nx" style="width:auto;padding:.55rem 1.1rem">Next →</button>';
        document.getElementById('nx').onclick = function () { S.wyrIndex++; wyr(); };
        gain(match ? 10 : 5, match ? 'It\'s a match' : 'Played');
      };
    });
  }
  function wheel() {
    var colors = ['#ff6b9d', '#ffb347', '#a855f7', '#6bcb77', '#ff6b6b', '#ffd93d'];
    var seg = 360 / WHEEL.length;
    var grad = WHEEL.map(function (_, i) { return colors[i] + ' ' + (i * seg) + 'deg ' + ((i + 1) * seg) + 'deg'; }).join(',');
    screen.innerHTML = '<div class="view" style="text-align:center"><button class="sub" data-back="games" style="display:block">← Games</button><h1 style="margin:.4rem 0 0">Lucky Wheel</h1><p class="sub">Spin for something to do together.</p>' +
      '<div class="wheel-wrap"><div class="pointer">▼</div><div class="wheel" id="wheel" style="background:conic-gradient(' + grad + ')">' +
      WHEEL.map(function (w, i) { var a = i * seg + seg / 2; return '<span style="position:absolute;left:50%;top:50%;transform:rotate(' + a + 'deg) translateY(-92px) rotate(' + (-a) + 'deg);translate:-50% -50%;font-size:1.5rem">' + w.e + '</span>'; }).join('') +
      '</div></div><button class="btn btn--violet" id="spin">Spin 🎡</button><div class="card mt" id="out" style="text-align:left" hidden></div></div>';
    screen.querySelector('[data-back]').onclick = games;
    var rot = 0;
    document.getElementById('spin').onclick = function () {
      var pick = Math.floor(Math.random() * WHEEL.length);
      /* conic-gradient starts at the top and runs clockwise, so turning the wheel by
         −(segment centre) puts that segment under the pointer; add four full turns for show */
      rot = rot - (rot % 360) + 1440 + (360 - (pick * seg + seg / 2));
      var w = document.getElementById('wheel'); w.style.transform = 'rotate(' + rot + 'deg)';
      this.disabled = true; var btn = this;
      setTimeout(function () {
        var o = document.getElementById('out'); o.hidden = false;
        o.innerHTML = '<div class="label">' + WHEEL[pick].e + ' ' + WHEEL[pick].t + '</div><p style="margin-top:.3rem;font-weight:700">' + WHEEL[pick].a + '</p>';
        btn.disabled = false; btn.textContent = 'Spin again 🎡'; if (!S.wheelSpun) gain(10, 'First spin'); S.wheelSpun = true;
      }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 3300);
    };
  }

  /* ───── Trivia: About Us — guess what Sam answered about you two ───── */
  var TRIVIA = [
    { q: 'What was the first film we watched together?', a: ['Black Panther', 'The Notebook', 'Inception', 'Coco'], r: 3 },
    { q: 'Where did we go on our first date?', a: ['A coffee shop', 'The cinema', 'A braai', 'The mall'], r: 0 },
    { q: 'What is Sam\'s comfort food?', a: ['Chips and chicken', 'Ice cream', 'Nshima and beans', 'Pancakes'], r: 2 },
    { q: 'Which of us is always late?', a: ['You', 'Sam', 'Both of us', 'Neither — we\'re perfect'], r: 0 },
    { q: 'Sam\'s dream holiday?', a: ['Zanzibar', 'Paris', 'Cape Town', 'Tokyo'], r: 3 }
  ];
  function trivia() {
    var i = 0, right = 0;
    (function q() {
      if (i >= TRIVIA.length) {
        screen.innerHTML = '<div class="view" style="text-align:center"><button class="sub" data-back="games" style="display:block">← Games</button><div style="font-size:3rem;margin:1rem 0">' + (right >= 4 ? '🏆' : right >= 2 ? '💞' : '🙈') + '</div><h1>' + right + ' / ' + TRIVIA.length + '</h1><p class="sub" style="margin:.4rem 0 1rem">' + (right >= 4 ? 'You really know each other.' : right >= 2 ? 'Not bad — date night homework assigned.' : 'Time for a long talk over coffee.') + '</p><button class="btn btn--pink" id="again">Play again</button></div>';
        screen.querySelector('[data-back]').onclick = games; document.getElementById('again').onclick = trivia;
        gain(right * 5 + 5, 'Trivia finished'); return;
      }
      var t = TRIVIA[i];
      screen.innerHTML = '<div class="view"><button class="sub" data-back="games">← Games</button><div class="label" style="margin-top:.6rem">Question ' + (i + 1) + ' of ' + TRIVIA.length + ' · ' + right + ' right</div><h1 style="font-size:1.3rem;margin:.3rem 0 .8rem">' + t.q + '</h1>' +
        '<div class="wyr">' + t.a.map(function (a, k) { return '<button data-k="' + k + '">' + a + '</button>'; }).join('') + '</div><div id="res" style="text-align:center;font-weight:800;min-height:1.4em" aria-live="polite"></div></div>';
      screen.querySelector('[data-back]').onclick = games;
      screen.querySelectorAll('[data-k]').forEach(function (b) {
        b.onclick = function () {
          var k = +b.getAttribute('data-k'), ok = k === t.r; if (ok) right++;
          screen.querySelectorAll('[data-k]').forEach(function (x) { x.disabled = true; if (+x.getAttribute('data-k') === t.r) x.classList.add('theirs'); });
          b.classList.add('picked');
          document.getElementById('res').innerHTML = (ok ? '💞 That\'s what Sam said!' : '🙈 Sam said “' + t.a[t.r] + '”') + '<br><button class="btn btn--soft mt" id="nx" style="width:auto;padding:.55rem 1.1rem">Next →</button>';
          document.getElementById('nx').onclick = function () { i++; q(); };
        };
      });
    })();
  }

  /* ───── Weekly challenge ───── */
  var CHALLENGE = { title: 'Cook something new together', steps: [['Pick a recipe neither of you has made', true], ['Buy the ingredients together', false], ['Cook it — no phones in the kitchen', false], ['Rate it and add a photo to Memories', false]] };
  function challenge() {
    var done = CHALLENGE.steps.filter(function (x) { return x[1]; }).length;
    screen.innerHTML = '<div class="view"><button class="sub" data-back="games">← Games</button><h1 style="margin:.4rem 0 .1rem">Weekly challenge</h1><p class="sub">Resets every Monday · +50 XP when you both finish</p>' +
      '<div class="card" style="margin-top:.9rem"><b>' + CHALLENGE.title + '</b><div class="xp"><i style="width:' + (done / CHALLENGE.steps.length * 100) + '%"></i></div><p class="sub" style="font-size:.75rem;margin-top:.3rem">' + done + ' of ' + CHALLENGE.steps.length + ' done</p></div>' +
      CHALLENGE.steps.map(function (st, k) { return '<label class="date" style="margin-top:.55rem;cursor:pointer"><input type="checkbox" data-st="' + k + '"' + (st[1] ? ' checked' : '') + ' style="width:20px;height:20px;accent-color:var(--romantic)"><span class="date__body"><span class="date__name"' + (st[1] ? ' style="text-decoration:line-through;color:var(--sub)"' : '') + '>' + st[0] + '</span></span></label>'; }).join('') + '</div>';
    screen.querySelector('[data-back]').onclick = games;
    screen.querySelectorAll('[data-st]').forEach(function (c) {
      c.onchange = function () {
        CHALLENGE.steps[+c.getAttribute('data-st')][1] = c.checked;
        var all = CHALLENGE.steps.every(function (x) { return x[1]; });
        if (all) gain(50, 'Challenge complete 🏅'); challenge();
      };
    });
  }

  /* ───── Chat with Sam (pre-written replies, nothing leaves the page) ───── */
  var CHAT = [{ me: false, t: 'Library is SO quiet today 😴' }, { me: false, t: 'Dinner tonight? Your turn to choose 😏' }];
  var REPLIES = ['Haha okay okay 😂', 'Deal. But I\'m picking dessert 🍰', 'Miss you 💜', 'On my way in 20!', 'You always say that 🙄😂', 'Sounds perfect.'];
  function chat() {
    screen.innerHTML = '<div class="view" style="display:flex;flex-direction:column;min-height:100%"><button class="sub" data-back="home" style="align-self:flex-start">← Home</button>' +
      '<div class="partner" style="margin:.6rem 0"><div class="avatar" style="width:40px;height:40px;background:linear-gradient(135deg,var(--violet),var(--pink))">S</div><div><b>Sam</b><div class="sub"><span class="dot"></span>Online</div></div></div>' +
      '<div id="msgs" style="display:grid;gap:.45rem;flex:1;align-content:start"></div>' +
      '<form id="cf" style="display:flex;gap:.4rem;margin-top:.8rem"><input class="input" id="ci" placeholder="Message Sam…" aria-label="Message Sam" autocomplete="off"><button class="btn btn--pink" style="width:auto">Send</button></form></div>';
    screen.querySelector('[data-back]').onclick = function () { go('home'); };
    function draw() {
      document.getElementById('msgs').innerHTML = CHAT.map(function (m) { return '<div class="bubble ' + (m.me ? 'me' : 'them') + '" style="max-width:80%;justify-self:' + (m.me ? 'end' : 'start') + '">' + esc(m.t) + '</div>'; }).join('');
      screen.scrollTop = screen.scrollHeight;
    }
    document.getElementById('cf').onsubmit = function (e) {
      e.preventDefault(); var v = document.getElementById('ci').value.trim(); if (!v) return;
      CHAT.push({ me: true, t: v }); document.getElementById('ci').value = ''; draw();
      setTimeout(function () { CHAT.push({ me: false, t: REPLIES[Math.floor(Math.random() * REPLIES.length)] }); if (document.getElementById('msgs')) draw(); }, 900);
    };
    draw();
  }

  /* ───────── Dates ───────── */
  function dates() {
    var avg = function (d) { return (d.me + d.them) / 2; };
    var board = DONE.slice().sort(function (a, b) { return avg(b) - avg(a); });
    screen.innerHTML = '<div class="view"><h1 style="margin:.4rem 0 .2rem">Dates</h1><p class="sub">Your shared Top 5 — drag to reorder.</p>' +
      '<div id="top5" style="margin-top:.9rem"></div>' +
      '<div class="row2"><button class="btn btn--violet" id="surprise">🎲 Surprise me</button><button class="btn btn--soft" id="complete">✓ Mark #1 done</button></div>' +
      '<div style="margin:1.2rem 0 .5rem;font-weight:900">Best dates so far</div>' +
      board.map(function (d, i) { return '<div class="date"><span class="rank">' + (i + 1) + '</span><span class="date__emoji">' + d.emoji + '</span><div class="date__body"><div class="date__name">' + d.name + '</div><div class="date__meta">You ' + '★'.repeat(d.me) + ' · Sam ' + '★'.repeat(d.them) + '</div></div><b>' + avg(d).toFixed(1) + '</b></div>'; }).join('') + '</div>';
    drawTop();
    document.getElementById('surprise').onclick = function () {
      var idea = IDEAS[Math.floor(Math.random() * IDEAS.length)];
      if (DATES.some(function (d) { return d.name === idea.name; })) { toast(idea.emoji + ' ' + idea.name + ' — already on your list!'); return; }
      DATES.splice(4, 1, idea); drawTop(); toast(idea.emoji + ' Added: ' + idea.name);
    };
    document.getElementById('complete').onclick = rate;
  }
  function drawTop() {
    var box = document.getElementById('top5');
    box.innerHTML = DATES.map(function (d, i) {
      return '<div class="date" draggable="true" data-i="' + i + '"><span class="handle" aria-hidden="true">⋮⋮</span><span class="rank">' + (i + 1) + '</span><span class="date__emoji">' + d.emoji + '</span>' +
        '<div class="date__body"><div class="date__name">' + d.name + '</div><div class="date__meta">' + d.cat + ' · ' + d.cost + '</div></div>' +
        '<div class="mv"><button data-up="' + i + '" aria-label="Move ' + d.name + ' up">▲</button><button data-down="' + i + '" aria-label="Move ' + d.name + ' down">▼</button></div></div>';
    }).join('');
    var from = null;
    box.querySelectorAll('.date').forEach(function (el) {
      el.addEventListener('dragstart', function () { from = +el.getAttribute('data-i'); el.classList.add('dragging'); });
      el.addEventListener('dragend', function () { el.classList.remove('dragging'); });
      el.addEventListener('dragover', function (e) { e.preventDefault(); el.classList.add('over'); });
      el.addEventListener('dragleave', function () { el.classList.remove('over'); });
      el.addEventListener('drop', function (e) { e.preventDefault(); move(from, +el.getAttribute('data-i')); });
    });
    box.onclick = function (e) {
      var u = e.target.closest('[data-up]'), d = e.target.closest('[data-down]');
      if (u) move(+u.getAttribute('data-up'), +u.getAttribute('data-up') - 1);
      if (d) move(+d.getAttribute('data-down'), +d.getAttribute('data-down') + 1);
    };
  }
  function move(a, b) {
    if (a == null || b < 0 || b >= DATES.length || a === b) { drawTop(); return; }
    var x = DATES.splice(a, 1)[0]; DATES.splice(b, 0, x); drawTop();
  }
  function rate() {
    var d = DATES[0], step = 1, stars = 0, note = '';
    function draw() {
      screen.innerHTML = '<div class="view" style="text-align:center"><div class="steps"><i class="on"></i><i class="' + (step > 1 ? 'on' : '') + '"></i><i class="' + (step > 2 ? 'on' : '') + '"></i></div>' +
        '<div style="font-size:3rem">' + d.emoji + '</div><h1 style="font-size:1.35rem">' + d.name + '</h1>' +
        (step === 1 ? '<p class="sub">Step 1 · How was it?</p><div class="stars">' + [1, 2, 3, 4, 5].map(function (n) { return '<button data-s="' + n + '" class="' + (n <= stars ? 'on' : '') + '" aria-label="' + n + ' stars">⭐</button>'; }).join('') + '</div><button class="btn btn--pink" id="nx"' + (stars ? '' : ' disabled style="opacity:.5"') + '>Next</button>'
        : step === 2 ? '<p class="sub">Step 2 · A note for later</p><textarea class="input mt" id="note" rows="4" placeholder="Best moment…">' + esc(note) + '</textarea><button class="btn btn--pink mt" id="nx">Next</button>'
        : '<p class="sub">Step 3 · Sam rated it too</p><div class="card mt" style="text-align:left"><div class="bubble me"><b>You</b>' + '★'.repeat(stars) + (note ? ' — ' + esc(note) : '') + '</div><div class="bubble them mt"><b>Sam</b>★★★★★ — best night in ages</div></div><button class="btn btn--pink mt" id="nx">Add to the leaderboard</button>') + '</div>';
      screen.querySelectorAll('[data-s]').forEach(function (b) { b.onclick = function () { stars = +b.getAttribute('data-s'); draw(); }; });
      var nx = document.getElementById('nx');
      nx.onclick = function () {
        if (step === 1 && !stars) return;
        if (step === 2) note = document.getElementById('note').value;
        if (step < 3) { step++; draw(); return; }
        DONE.push({ name: d.name, emoji: d.emoji, me: stars, them: 5 });
        DATES.shift(); DATES.push(IDEAS[Math.floor(Math.random() * IDEAS.length)]);
        S.rated++; gain(25, 'Date completed'); dates();
      };
    }
    draw();
  }

  /* ───────── Memories ───────── */
  function memories(mode) {
    mode = mode || 'album';
    screen.innerHTML = '<div class="view"><h1 style="margin:.4rem 0 .2rem">Memories</h1><p class="sub">A shared album — both of you can add to it.</p>' +
      '<div class="seg"><button data-m="album" class="' + (mode === 'album' ? 'active' : '') + '">Scrapbook</button><button data-m="timeline" class="' + (mode === 'timeline' ? 'active' : '') + '">Timeline</button></div>' +
      (mode === 'album'
        ? '<div class="polaroids">' + MEMORIES.map(function (m) { return '<figure class="polaroid" style="--r:' + m.r + '"><div class="ph" style="background:' + m.bg + (m.img ? ' url(' + m.img + ') center/cover' : '') + '">' + (m.img ? '' : m.e) + '</div><p>' + esc(m.c) + '</p></figure>'; }).join('') + '</div>'
        : '<div class="timeline">' + MEMORIES.slice().reverse().map(function (m) { return '<div class="tl"><b>' + m.e + ' ' + m.c + '</b><span class="sub">' + m.d + '</span></div>'; }).join('') + '</div>') +
      '<button class="btn btn--soft" style="margin-top:1.1rem" id="add">＋ Add a memory</button><input type="file" id="memFile" accept="image/*" hidden>' +
      '<p class="sub" style="font-size:.72rem;text-align:center;margin-top:.4rem">Your photo stays on your device — nothing is uploaded in the demo.</p>' +
      '<p class="sub" style="font-size:.75rem;text-align:center;margin-top:.6rem">Milestones link themselves — the 1-year photo was tagged automatically.</p></div>';
    screen.querySelectorAll('[data-m]').forEach(function (b) { b.onclick = function () { memories(b.getAttribute('data-m')); }; });
    document.getElementById('add').onclick = function () { document.getElementById('memFile').click(); };
    document.getElementById('memFile').onchange = function () {
      var f = this.files[0]; if (!f) return;
      var cap = window.prompt('Caption for this memory?', 'A good day') || 'A good day';
      MEMORIES.push({ img: URL.createObjectURL(f), c: cap, d: 'Today', bg: '#fff', r: (Math.random() * 5 - 2.5).toFixed(1) + 'deg', e: '📸' });
      gain(10, 'Memory added'); memories(mode);
    };
  }

  /* ───────── Profile ───────── */
  function profile() {
    var badges = [['🔥', 'Week streak', true], ['💬', 'First answer', !!S.qotd || true], ['🎡', 'Spun the wheel', S.wheelSpun], ['🍝', 'Date night', true], ['💞', '5 matches', S.wyrMatches >= 5], ['🏆', '1 year', true]];
    screen.innerHTML = '<div class="view" style="text-align:center"><div class="avatar" style="width:84px;height:84px;font-size:2.2rem;margin:.8rem auto">A</div><h1>Alex & Sam</h1><p class="sub">Couple code <b>K7F-29Q</b> · together ' + days() + ' days</p>' +
      '<div class="card" style="margin-top:1rem;text-align:left"><div style="display:flex;justify-content:space-between;font-weight:900"><span>Level ' + S.level + '</span><span class="sub">' + S.xp + ' / ' + LEVEL_XP + ' XP</span></div><div class="xp"><i id="xpbar" style="width:' + (S.xp / LEVEL_XP * 100) + '%"></i></div></div>' +
      '<div class="row2"><div class="tile t-red"><small>Dates done</small><b>' + DONE.length + '</b></div><div class="tile t-sun"><small>Streak</small><b>🔥 ' + S.streak + '</b></div></div>' +
      '<div style="margin:1.1rem 0 .55rem;font-weight:900;text-align:left">Badges</div><div class="badges">' +
      badges.map(function (b) { return '<div class="badge' + (b[2] ? '' : ' locked') + '"><span>' + b[0] + '</span>' + b[1] + '</div>'; }).join('') + '</div></div>';
  }

  /* ───────── Tabs ───────── */
  var VIEWS = { home: home, games: games, dates: dates, memories: memories, profile: profile, chat: chat };
  function go(name) {
    document.querySelectorAll('.tabbar button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-tab') === name); b.setAttribute('aria-current', b.getAttribute('data-tab') === name ? 'page' : 'false'); });
    screen.scrollTop = 0; VIEWS[name]();
  }
  document.querySelector('.tabbar').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) go(b.getAttribute('data-tab')); });
  screen.addEventListener('click', function (e) { var g = e.target.closest('[data-go]'); if (g) go(g.getAttribute('data-go')); });

  var clock = document.getElementById('clock');
  function t() { clock.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); }
  t(); setInterval(t, 30000);
  go('home');
})();
