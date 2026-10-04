/* ═══════════════════════════════════════════════════════════════
   Commutation demo — the rest of the games. Each one plays on a
   single device with the other five players simulated. Shared
   state (crew, scores, the screen) comes from window.CM, which
   app.js defines; this file only registers window.CM_GAMES.
   All questions and clues are original to this demo.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var G = window.CM_GAMES = {};
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function top(back, title) { return '<div class="top"><a class="back" href="#play/' + back + '">← Back</a><span class="brand">' + title + '</span></div>'; }
  function others() { return window.CM.CREW.filter(function (c) { return c.id !== 'you'; }); }
  function scoreLine(round, total, pts) { return '<div class="score"><span>Round ' + round + ' of ' + total + '</span><span>' + pts + ' pts</span></div>'; }

  /* ───── Know Me Best (Vault) ───── */
  var KNOW = [
    { who: 'mwila', q: 'Mwila\'s go-to order at a braai?', a: ['Extra wors, no salad', 'Only the chicken wings', 'Whatever is closest', 'Nshima and relish, always'], right: 0 },
    { who: 'thandi', q: 'What would Thandi do with a free Saturday?', a: ['Sleep until noon', 'Hike somewhere new', 'Reorganise her room', 'Binge a whole series'], right: 3 },
    { who: 'kondwani', q: 'Kondwani\'s most-used emoji?', a: ['😂', '💀', '🙏🏾', '🔥'], right: 1 },
    { who: 'bupe', q: 'Bupe\'s dream job as a kid?', a: ['Pilot', 'Doctor', 'Footballer', 'News anchor'], right: 3 },
    { who: 'nalu', q: 'Nalu would never leave home without…', a: ['A charger', 'Lip balm', 'Headphones', 'Snacks'], right: 2 }
  ];
  G.knowme = function () {
    var CM = window.CM, r = 0, pts = 0;
    (function round() {
      if (r >= KNOW.length) { CM.award('you', pts); return CM.finish('Know Me Best', pts, 'vault'); }
      var k = KNOW[r], p = CM.crew(k.who);
      CM.screen.innerHTML = '<div class="view">' + top('vault', 'KNOW ME BEST') + scoreLine(r + 1, KNOW.length, pts) +
        '<div class="card" style="text-align:center;margin:.6rem 0 1rem"><div style="font-size:2.4rem">' + p.icon + '</div><div class="eyebrow hot" style="margin:.3rem 0">' + p.name + ' is in the hot seat</div><h2 class="q" style="margin:.2rem 0 0">' + k.q + '</h2></div>' +
        '<div class="picks" style="grid-template-columns:1fr">' + k.a.map(function (a, i) { return '<button class="pick" data-i="' + i + '">' + a + '</button>'; }).join('') + '</div>' +
        '<div class="reveal-line" id="rl" aria-live="polite"></div><button class="btn btn--gold" id="nx" hidden>Next →</button></div>';
      CM.screen.querySelectorAll('.pick').forEach(function (b) {
        b.onclick = function () {
          var i = +b.getAttribute('data-i'), ok = i === k.right;
          CM.screen.querySelectorAll('.pick').forEach(function (x) { x.disabled = true; if (+x.getAttribute('data-i') === k.right) x.classList.add('right'); });
          if (!ok) b.classList.add('wrong'); else { pts += 2; }
          CM.award(k.who, ok ? 1 : 0);
          document.getElementById('rl').textContent = ok ? 'You know ' + p.name + '. +2 (and +1 to them for being known)' : p.name + ' answered: “' + k.a[k.right] + '”';
          var nx = document.getElementById('nx'); nx.hidden = false; nx.onclick = function () { r++; round(); };
        };
      });
    })();
  };

  /* ───── Paranoia (Vault) ───── */
  var PARA = ['Who here would survive longest on a desert island?', 'Who is most likely to reply to a text three days late?', 'Who would win in an argument with a taxi driver?', 'Who is secretly the most competitive?'];
  G.paranoia = function () {
    var CM = window.CM, r = 0, revealed = 0;
    (function round() {
      if (r >= PARA.length) { CM.award('you', 3); return CM.finish('Paranoia', 3, 'vault'); }
      CM.screen.innerHTML = '<div class="view">' + top('vault', 'PARANOIA') + scoreLine(r + 1, PARA.length, revealed + ' revealed') +
        '<p class="muted" style="margin:.4rem 0">Only you can see this. Answer out loud with a name — then the coin decides if everyone hears the question.</p>' +
        '<div class="confession" style="background:linear-gradient(160deg,#1d1636,#13121a);border-color:#3b2c6b">' + PARA[r] + '</div>' +
        '<div class="picks">' + others().map(function (c) { return '<button class="pick" data-id="' + c.id + '">' + c.icon + ' ' + c.name + '</button>'; }).join('') + '</div>' +
        '<div id="coin" style="text-align:center;margin-top:1rem"></div></div>';
      CM.screen.querySelectorAll('.pick').forEach(function (b) {
        b.onclick = function () {
          var who = CM.crew(b.getAttribute('data-id'));
          CM.screen.querySelectorAll('.pick').forEach(function (x) { x.disabled = true; });
          b.classList.add('right');
          var coin = document.getElementById('coin'), heads = Math.random() < .5;
          coin.innerHTML = '<div style="font-size:3rem;' + (reduce ? '' : 'animation:spin .9s ease') + '">🪙</div><p class="muted">The coin is in the air…</p>';
          setTimeout(function () {
            if (heads) revealed++;
            CM.award(who.id, 1);
            coin.innerHTML = '<div style="font-size:3rem">' + (heads ? '👑' : '🤐') + '</div><p style="font-weight:800">' + (heads ? 'Heads — the question is read out. Everyone now knows you said ' + who.name + '.' : 'Tails — it stays secret. ' + who.name + ' will never know why.') + '</p>' +
              '<button class="btn btn--gold" id="nx" style="margin-top:.8rem">Next →</button>';
            document.getElementById('nx').onclick = function () { r++; round(); };
          }, reduce ? 0 : 950);
        };
      });
    })();
  };

  /* ───── The Deep End (Vault) ───── */
  var DEEP = ['Is it ever okay to read your partner\'s messages?', 'Would you take a job you hate for double the money?', 'Should you tell a friend their partner is cheating?', 'Is it fine to leave a group chat without saying anything?', 'Would you rather be respected or liked?'];
  G.deep = function () {
    var CM = window.CM, r = 0, pts = 0;
    (function round() {
      if (r >= DEEP.length) { CM.award('you', pts); return CM.finish('The Deep End', pts, 'vault'); }
      CM.screen.innerHTML = '<div class="view">' + top('vault', 'THE DEEP END') + scoreLine(r + 1, DEEP.length, pts) +
        '<p class="muted" style="margin:.4rem 0">Read it out. Everyone reacts at once — match the room to score.</p>' +
        '<div class="confession" style="background:linear-gradient(160deg,#102624,#13121a);border-color:#1f5550">' + DEEP[r] + '</div>' +
        '<div class="picks">' + [['yes', '👍 Yes'], ['no', '👎 No'], ['depends', '🤔 It depends'], ['pass', '🙈 Pass']].map(function (x) { return '<button class="pick" data-v="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
        '<div id="room" style="margin-top:1rem"></div></div>';
      CM.screen.querySelectorAll('.pick').forEach(function (b) {
        b.onclick = function () {
          var mine = b.getAttribute('data-v'), opts = ['yes', 'no', 'depends'];
          var votes = others().map(function (c) { return { c: c, v: Math.random() < .45 ? mine === 'pass' ? 'depends' : mine : opts[Math.floor(Math.random() * 3)] }; });
          var tally = {}; votes.forEach(function (x) { tally[x.v] = (tally[x.v] || 0) + 1; });
          var majority = Object.keys(tally).sort(function (a, b) { return tally[b] - tally[a]; })[0];
          var ok = mine === majority; if (ok) pts += 2; else if (mine !== 'pass') pts -= 1;
          CM.screen.querySelectorAll('.pick').forEach(function (x) { x.disabled = true; });
          b.classList.add(ok ? 'right' : 'wrong');
          document.getElementById('room').innerHTML = votes.map(function (x) { return '<div class="board-row"><span>' + x.c.icon + ' ' + x.c.name + '</span><span class="pts">' + { yes: '👍', no: '👎', depends: '🤔' }[x.v] + '</span></div>'; }).join('') +
            '<p class="reveal-line">' + (ok ? 'You matched the room. +2' : mine === 'pass' ? 'Passed — no points either way.' : 'The room went the other way. −1') + '</p><button class="btn btn--gold" id="nx">Next question →</button>';
          document.getElementById('nx').onclick = function () { r++; round(); };
        };
      });
    })();
  };

  /* ───── Name That Tune — emoji edition (Huddle). Titles only, no audio. ───── */
  var TUNES = [
    { e: '💜🌧️☔', a: ['Purple Rain', 'Singing in the Rain', 'Umbrella', 'November Rain'], r: 0 },
    { e: '👑🦁🌅', a: ['Circle of Life', 'Eye of the Tiger', 'King of the Road', 'Lion Heart'], r: 0 },
    { e: '🔥🏠💃', a: ['Burning Down the House', 'Disco Inferno', 'Girl on Fire', 'Light My Fire'], r: 1 },
    { e: '🌍🫶🏾🎶', a: ['We Are the World', 'Heal the World', 'One Love', 'What a Wonderful World'], r: 0 },
    { e: '💍🙌🏾👸🏾', a: ['Single Ladies', 'Crazy in Love', 'Halo', 'Diamonds'], r: 0 },
    { e: '🍋🥤👑', a: ['Lemonade', 'Sweet Dreams', 'Sugar', 'Juice'], r: 0 }
  ];
  G.tune = function () {
    var CM = window.CM, r = 0, pts = 0, t;
    (function round() {
      clearInterval(t);
      if (r >= TUNES.length) { CM.award('you', pts); return CM.finish('Name That Tune', pts, 'huddle'); }
      var q = TUNES[r], left = 10;
      CM.screen.innerHTML = '<div class="view">' + top('huddle', 'NAME THAT TUNE') + scoreLine(r + 1, TUNES.length, pts) +
        '<div class="timer" id="tm">10</div><div style="font-size:3.4rem;text-align:center;margin-bottom:1rem;letter-spacing:.3rem">' + q.e + '</div>' +
        '<div class="picks" style="grid-template-columns:1fr">' + shuffle(q.a.map(function (a, i) { return { a: a, i: i }; })).map(function (x) { return '<button class="pick" data-i="' + x.i + '">' + x.a + '</button>'; }).join('') + '</div>' +
        '<div class="reveal-line" id="rl" aria-live="polite"></div></div>';
      t = setInterval(function () { left--; var el = document.getElementById('tm'); if (!el) return clearInterval(t); el.textContent = left; if (left <= 0) answer(-1); }, 1000);
      function answer(i) {
        clearInterval(t);
        var ok = i === q.r, gain = ok ? Math.max(1, left) : 0; pts += gain;
        CM.screen.querySelectorAll('.pick').forEach(function (x) { x.disabled = true; if (+x.getAttribute('data-i') === q.r) x.classList.add('right'); else if (+x.getAttribute('data-i') === i) x.classList.add('wrong'); });
        document.getElementById('rl').innerHTML = (ok ? 'Got it with ' + left + 's left. +' + gain : i < 0 ? 'Time! It was “' + q.a[q.r] + '”.' : 'Nope — “' + q.a[q.r] + '”.') + '<br><button class="btn btn--gold" id="nx" style="margin-top:.6rem">Next song →</button>';
        document.getElementById('nx').onclick = function () { r++; round(); };
      }
      CM.screen.querySelectorAll('.pick').forEach(function (b) { b.onclick = function () { answer(+b.getAttribute('data-i')); }; });
    })();
  };

  /* ───── Clap Circle (Huddle): tap on the beat ───── */
  G.clap = function () {
    var CM = window.CM, beats = 14, i = 0, pts = 0, interval = 900, lastBeat = 0, hit = true, timer;
    CM.screen.innerHTML = '<div class="view" style="text-align:center">' + top('huddle', 'CLAP CIRCLE') +
      '<p class="muted" style="margin:.4rem 0 1rem">Clap (tap the circle or press space) when it lights up. It speeds up. Three misses and you\'re out.</p>' +
      '<button id="ring" aria-label="Clap" style="width:200px;height:200px;border-radius:50%;border:6px solid var(--line);margin:1rem auto;display:grid;place-items:center;font-size:3.2rem;transition:transform .08s,border-color .08s,background .08s">👏</button>' +
      '<div class="score" style="justify-content:center;gap:2rem"><span id="cs">0 pts</span><span id="cm">misses: 0</span></div><button class="btn btn--hot" id="go" style="margin-top:1rem">Start</button></div>';
    var ring = document.getElementById('ring'), misses = 0;
    function beat() {
      if (!hit) { misses++; document.getElementById('cm').textContent = 'misses: ' + misses; }
      if (misses >= 3 || i >= beats) return end();
      i++; hit = false; lastBeat = performance.now();
      ring.style.borderColor = 'var(--gold)'; ring.style.background = 'rgba(245,165,36,.18)'; ring.style.transform = 'scale(1.06)';
      setTimeout(function () { ring.style.borderColor = 'var(--line)'; ring.style.background = 'transparent'; ring.style.transform = 'scale(1)'; }, 180);
      interval = Math.max(480, interval - 30);
      timer = setTimeout(beat, interval);
    }
    function clap() {
      if (!lastBeat || hit) return;
      var off = performance.now() - lastBeat;
      if (off < 380) { hit = true; var g = off < 150 ? 3 : 1; pts += g; document.getElementById('cs').textContent = pts + ' pts'; ring.style.transform = 'scale(.92)'; }
    }
    function end() {
      clearTimeout(timer); document.removeEventListener('keydown', key);
      window.CM.award('you', pts); window.CM.finish('Clap Circle', pts, 'huddle');
    }
    function key(e) {
      if (!document.getElementById('ring')) { clearTimeout(timer); document.removeEventListener('keydown', key); return; }
      if (e.code === 'Space') { e.preventDefault(); clap(); }
    }
    ring.onclick = clap; document.addEventListener('keydown', key);
    document.getElementById('go').onclick = function () { this.remove(); hit = true; timer = setTimeout(beat, 600); };
  };

  /* ───── Hot Seat (Huddle): 60 seconds of questions ───── */
  var HOT = ['What\'s the last lie you told?', 'Who in this room would you call at 3am?', 'Worst haircut you\'ve ever had?', 'What\'s on your bucket list this year?', 'Most embarrassing song you know every word of?', 'Your most irrational fear?', 'Which app do you waste the most time on?', 'Best meal you\'ve ever had?', 'What would your dream job be with no money worries?', 'The most overrated thing everyone loves?', 'A skill you wish you had?', 'Last thing that made you laugh out loud?'];
  G.hotseat = function () {
    var CM = window.CM;
    CM.screen.innerHTML = '<div class="view">' + top('huddle', 'HOT SEAT') + '<p class="muted" style="margin:.4rem 0 1rem">Who sits in the hot seat? They get sixty seconds of questions from the room. Every answer scores; passing costs a point.</p>' +
      '<div class="picks">' + window.CM.CREW.map(function (c) { return '<button class="pick" data-id="' + c.id + '">' + c.icon + ' ' + c.name + '</button>'; }).join('') + '</div></div>';
    CM.screen.querySelectorAll('.pick').forEach(function (b) { b.onclick = function () { run(CM.crew(b.getAttribute('data-id'))); }; });
    function run(p) {
      var qs = shuffle(HOT), i = 0, score = 0, left = 60, t;
      CM.screen.innerHTML = '<div class="view" style="text-align:center">' + top('huddle', 'HOT SEAT') + '<div class="eyebrow hot">' + p.icon + ' ' + p.name + ' is in the hot seat</div>' +
        '<div class="timer" id="tm">60</div><div class="confession" id="hq" style="text-align:left">' + qs[0] + '</div>' +
        '<div class="picks"><button class="pick" id="ans">✅ Answered</button><button class="pick" id="pass">⏭ Pass (−1)</button></div><div class="score" style="justify-content:center;margin-top:1rem"><span id="hs">0 pts</span></div></div>';
      function next(d) { score += d; i++; document.getElementById('hs').textContent = score + ' pts'; document.getElementById('hq').textContent = qs[i % qs.length]; }
      document.getElementById('ans').onclick = function () { next(1); };
      document.getElementById('pass').onclick = function () { next(-1); };
      t = setInterval(function () {
        left--; var el = document.getElementById('tm'); if (!el) return clearInterval(t); el.textContent = left;
        if (left <= 0) { clearInterval(t); CM.award(p.id, Math.max(0, score)); CM.finish('Hot Seat', Math.max(0, score), 'huddle'); }
      }, reduce ? 250 : 1000);
    }
  };

  /* ───── Drawful (Arena): draw it, the crew invents fake titles and votes ───── */
  var PROMPTS = [
    { real: 'A goat at a wedding', fakes: ['A dog on holiday', 'My landlord', 'A sheep doing taxes'] },
    { real: 'A taxi stuck in the rain', fakes: ['A sad submarine', 'Monday morning', 'A bus with feelings'] },
    { real: 'Nshima that came to life', fakes: ['A cloud eating lunch', 'A snowman in Lusaka', 'Rice with ambitions'] }
  ];
  G.drawful = function () {
    var CM = window.CM, P = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    CM.screen.innerHTML = '<div class="view">' + top('arena', 'DRAWFUL') +
      '<div class="eyebrow hot" style="margin:.2rem 0 .3rem">Your secret prompt</div><h2 style="font-size:1.3rem;margin-bottom:.6rem">' + P.real + '</h2>' +
      '<canvas id="pad" width="360" height="300" style="width:100%;background:#f4efe6;border-radius:16px;touch-action:none;cursor:crosshair" aria-label="Drawing pad"></canvas>' +
      '<div class="picks" style="margin-top:.6rem"><button class="pick" id="clear">🧽 Clear</button><button class="pick" id="done">✅ Done drawing</button></div></div>';
    var cv = document.getElementById('pad'), ctx = cv.getContext('2d'), drawing = false, inked = false;
    ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.strokeStyle = '#08070c';
    function pos(e) { var r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height]; }
    cv.addEventListener('pointerdown', function (e) { drawing = true; var p = pos(e); ctx.beginPath(); ctx.moveTo(p[0], p[1]); cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pos(e); ctx.lineTo(p[0], p[1]); ctx.stroke(); inked = true; });
    cv.addEventListener('pointerup', function () { drawing = false; });
    document.getElementById('clear').onclick = function () { ctx.clearRect(0, 0, cv.width, cv.height); inked = false; };
    document.getElementById('done').onclick = function () {
      if (!inked) { CM.toast('Draw something first — even a stick figure counts.'); return; }
      var img = cv.toDataURL(), crew = others(), titles = shuffle([{ t: P.real, by: 'you' }].concat(P.fakes.map(function (f, i) { return { t: f, by: crew[i].id }; })));
      var pts = 0, html = '';
      crew.forEach(function (c) {
        var guess = Math.random() < .45 ? P.real : titles[Math.floor(Math.random() * titles.length)].t;
        var right = guess === P.real; if (right) { pts += 2; CM.award(c.id, 1); }
        else { var faker = titles.filter(function (x) { return x.t === guess; })[0]; if (faker && faker.by !== c.id && faker.by !== 'you') CM.award(faker.by, 1); }
        html += '<div class="board-row"><span>' + c.icon + ' ' + c.name + '</span><span class="pts" style="font-weight:600">“' + guess + '”' + (right ? ' ✅' : '') + '</span></div>';
      });
      CM.award('you', pts);
      CM.screen.innerHTML = '<div class="view">' + top('arena', 'DRAWFUL') + '<img src="' + img + '" alt="Your drawing" style="width:100%;border-radius:16px;background:#f4efe6">' +
        '<p class="muted" style="margin:.8rem 0 .4rem">On the TV, the crew\'s fake titles sat beside the real one:</p>' +
        '<div class="picks" style="grid-template-columns:1fr 1fr;margin-bottom:.8rem">' + titles.map(function (x) { return '<div class="pick' + (x.by === 'you' ? ' right' : '') + '" style="font-size:.85rem">' + x.t + '</div>'; }).join('') + '</div>' +
        '<div class="eyebrow">How they voted</div>' + html + '<p class="reveal-line">+' + pts + ' — two for every friend who spotted “' + P.real + '”</p><a class="btn btn--gold" href="#board" style="text-decoration:none">See the Board</a></div>';
    };
  };

  /* ───── Quick-fire Quiz (Arena): beat the crew to the buzzer ───── */
  var QUIZ = [
    { q: 'Victoria Falls sits on which river?', a: ['Zambezi', 'Kafue', 'Luangwa', 'Congo'], r: 0 },
    { q: 'What is Zambia\'s currency?', a: ['Kwacha', 'Rand', 'Shilling', 'Pula'], r: 0 },
    { q: 'How many sides does a hexagon have?', a: ['5', '6', '7', '8'], r: 1 },
    { q: 'Which planet is known as the Red Planet?', a: ['Venus', 'Jupiter', 'Mars', 'Mercury'], r: 2 },
    { q: 'Zambia won the Africa Cup of Nations in…', a: ['2008', '2010', '2012', '2015'], r: 2 },
    { q: 'What is the largest ocean?', a: ['Atlantic', 'Indian', 'Arctic', 'Pacific'], r: 3 },
    { q: 'Which metal does Zambia export most?', a: ['Gold', 'Copper', 'Silver', 'Zinc'], r: 1 },
    { q: 'How many minutes are in a day?', a: ['1,440', '1,240', '1,640', '1,040'], r: 0 }
  ];
  G.quiz = function () {
    var CM = window.CM, r = 0, pts = 0, t, start;
    (function round() {
      clearTimeout(t);
      if (r >= QUIZ.length) { CM.award('you', pts); return CM.finish('Quick-fire Quiz', pts, 'arena'); }
      var q = QUIZ[r], rival = others()[Math.floor(Math.random() * 5)], rivalMs = 1800 + Math.random() * 4500;
      CM.screen.innerHTML = '<div class="view">' + top('arena', 'QUICK-FIRE QUIZ') + scoreLine(r + 1, QUIZ.length, pts) +
        '<div class="confession" style="background:linear-gradient(160deg,#2a2112,#13121a);border-color:#5a4523">' + q.q + '</div>' +
        '<div class="picks">' + q.a.map(function (a, i) { return '<button class="pick" data-i="' + i + '">' + a + '</button>'; }).join('') + '</div>' +
        '<div class="reveal-line" id="rl" aria-live="polite">Buzzers live…</div></div>';
      start = performance.now();
      t = setTimeout(function () {
        CM.award(rival.id, 2); lock(-1);
        document.getElementById('rl').innerHTML = rival.icon + ' ' + rival.name + ' buzzed first and got it. +2 to them.<br><button class="btn btn--gold" id="nx" style="margin-top:.6rem">Next →</button>';
        document.getElementById('nx').onclick = function () { r++; round(); };
      }, rivalMs);
      function lock(i) { CM.screen.querySelectorAll('.pick').forEach(function (x) { x.disabled = true; if (+x.getAttribute('data-i') === q.r) x.classList.add('right'); else if (+x.getAttribute('data-i') === i) x.classList.add('wrong'); }); }
      CM.screen.querySelectorAll('.pick').forEach(function (b) {
        b.onclick = function () {
          clearTimeout(t); var i = +b.getAttribute('data-i'), ok = i === q.r, secs = ((performance.now() - start) / 1000).toFixed(1);
          if (ok) pts += 2; else { pts -= 1; CM.award(rival.id, 1); }
          lock(i);
          document.getElementById('rl').innerHTML = (ok ? 'First in ' + secs + 's — correct! +2' : 'Wrong — ' + rival.name + ' steals a point.') + '<br><button class="btn btn--gold" id="nx" style="margin-top:.6rem">Next →</button>';
          document.getElementById('nx').onclick = function () { r++; round(); };
        };
      });
    })();
  };
})();
