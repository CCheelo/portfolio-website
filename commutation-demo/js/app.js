/* ═══════════════════════════════════════════════════════════════
   Commutation demo — a hash-routed, single-device reproduction of
   the real-time party app. The crew, answers and schedule are all
   invented. In the real app every phone is synced through Supabase
   Realtime and survey answers sit behind row-level security; here
   it all lives in memory so you can play alone.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  /* ───────── Data ───────── */
  var CREW = [
    { id: 'you', name: 'You', icon: '👑', color: 'var(--gold)', answered: 0 },
    { id: 'mwila', name: 'Mwila', icon: '🔥', color: 'var(--hot)', answered: 41 },
    { id: 'thandi', name: 'Thandi', icon: '✨', color: 'var(--violet)', answered: 18 },
    { id: 'kondwani', name: 'Kondwani', icon: '🦋', color: 'var(--teal)', answered: 12 },
    { id: 'bupe', name: 'Bupe', icon: '🌙', color: 'var(--paper-2)', answered: 0 },
    { id: 'nalu', name: 'Nalu', icon: '⚡', color: 'var(--teal)', answered: 7 }
  ];

  var SURVEY = [
    { id: 'confess', q: 'Confess something harmless you have never told this group.', hint: 'It turns into a round of “Who Wrote It?”' },
    { id: 'lie', q: 'The most convincing lie you have ever told a teacher.', hint: 'Nobody sees this before Saturday. Not even the host.' },
    { id: 'skill', q: 'A completely useless skill you are weirdly proud of.', hint: 'Skip anything — nothing is compulsory.' },
    { id: 'song', q: 'The song you would choose as your entrance music.', hint: 'Feeds “Name That Tune”.' }
  ];

  /* Dummy confessions — the Vault runs on the crew's own answers */
  var CONFESSIONS = [
    { by: 'mwila', text: 'I have been pronouncing "quinoa" wrong on purpose for three years because one of you laughed the first time.' },
    { by: 'thandi', text: 'I once cried at a phone advert. In public. On a bus.' },
    { by: 'kondwani', text: 'I still have the library book I borrowed in Grade 9. I think about it weekly.' },
    { by: 'nalu', text: 'I fake-laugh at exactly one person in this group. I will not say who.' },
    { by: 'bupe', text: 'I learned to whistle properly last year and have not stopped since.' },
    { by: 'mwila', text: 'I have a secret second playlist that is only gospel remixes of 2000s R&B.' }
  ];

  var SPY_LOCATIONS = [
    { location: 'A wedding reception', roles: ['The groom\'s uncle', 'Photographer', 'Caterer', 'Best man', 'DJ', 'Flower girl'] },
    { location: 'A long-haul flight', roles: ['Pilot', 'Nervous flyer', 'Flight attendant', 'Middle-seat passenger', 'Air marshal', 'Sleeping tourist'] },
    { location: 'A barber shop', roles: ['The barber', 'Regular customer', 'Apprentice', 'Someone watching football', 'Kid getting a first cut', 'Person waiting three hours'] },
    { location: 'A university exam hall', roles: ['Invigilator', 'Student who studied', 'Student who didn\'t', 'Early finisher', 'Late arrival', 'Person with a calculator problem'] },
    { location: 'A football stadium', roles: ['Goalkeeper', 'Referee', 'Fan with a drum', 'Snack seller', 'Coach', 'Commentator'] }
  ];

  var HALLS = {
    vault: { title: 'The Vault', icon: '🔒', art: 'img/hall-vault.webp', blurb: 'Sealed until the day. Runs on your own answers.',
      games: [
        { id: 'whowrote', name: 'Who Wrote It?', desc: 'A real confession. Guess who wrote it — before they crack.', time: '~12m', icon: '🔏', c: 'c-red', play: true },
        { id: 'knowme', name: 'Know Me Best', desc: 'One hot seat, one question. Guess what they answered.', time: '~10m', icon: '🎯', c: 'c-gold', play: true },
        { id: 'paranoia', name: 'Paranoia', desc: 'One phone gets the question. Only a coin decides if you hear it.', time: '~5m', icon: '🪙', c: 'c-violet', play: true },
        { id: 'deep', name: 'The Deep End', desc: 'A real question, read aloud. React same, or lose a point.', time: '~10m', icon: '🌊', c: 'c-teal', play: true }
      ] },
    huddle: { title: 'The Huddle', icon: '🫂', art: 'img/hall-huddle.webp', blurb: 'Everyone on the sofa, phones as buzzers.',
      games: [
        { id: 'tune', name: 'Name That Tune', desc: 'Emoji clues for the crew\'s entrance songs. Fastest right answer wins.', time: '~10m', icon: '🎵', c: 'c-hot', play: true },
        { id: 'clap', name: 'Clap Circle', desc: 'Pass the rhythm. Miss it and you are out.', time: '~5m', icon: '👏', c: 'c-gold', play: true },
        { id: 'hotseat', name: 'Hot Seat', desc: 'Sixty seconds of questions. No passes.', time: '~10m', icon: '🔥', c: 'c-red', play: true }
      ] },
    arena: { title: 'The Arena', icon: '📺', art: 'img/hall-arena.webp', blurb: 'Big screen, phones as controllers.',
      games: [
        { id: 'spyfall', name: 'Spyfall', desc: 'Everyone knows the place — except the spy.', time: '~8m', icon: '🕵️', c: 'c-violet', play: true },
        { id: 'drawful', name: 'Drawful', desc: 'Draw the prompt. Everyone else invents a fake title.', time: '~15m', icon: '🎨', c: 'c-teal', play: true },
        { id: 'quiz', name: 'Quick-fire Quiz', desc: 'Buzz first, answer right, steal points.', time: '~10m', icon: '⚡', c: 'c-gold', play: true }
      ] }
  };

  /* ───────── State ───────── */
  var S = { answers: {}, unlocked: false, scores: {} };
  CREW.forEach(function (c) { S.scores[c.id] = 0; });
  S.scores.mwila = 6; S.scores.thandi = 4; S.scores.kondwani = 3; S.scores.nalu = 2;

  var screen = document.getElementById('scroll');
  var tabbar = document.getElementById('tabbar');

  function crew(id) { return CREW.filter(function (c) { return c.id === id; })[0]; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function toast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._t); t._t = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* Game day = next Saturday, 13:00 local time */
  function gameDay() {
    var d = new Date(); d.setHours(13, 0, 0, 0);
    var add = (6 - d.getDay() + 7) % 7; if (add === 0 && new Date() > d) add = 7;
    d.setDate(d.getDate() + add); return d;
  }

  /* ───────── Views ───────── */
  var timer;
  function hub() {
    var answered = Object.keys(S.answers).filter(function (k) { return S.answers[k].trim(); }).length;
    crew('you').answered = answered;
    var started = CREW.filter(function (c) { return c.answered > 0; }).length;
    var day = gameDay();
    var html = '<div class="view"><div class="top"><span class="brand">COMMUTATION</span><span class="chip">👑 You · host</span></div>' +
      '<img class="art" src="img/hub-hero.webp" alt="A roulette wheel in flames with playing cards flying off it" style="aspect-ratio:16/10">' +
      '<div class="when">' + day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · 1:00 – 8:00 PM</div>' +
      (S.unlocked ? '<div style="text-align:center;margin:.6rem 0"><span class="live">IT\'S GAME DAY</span></div>'
                  : '<div class="count" id="count" aria-live="off"></div>') +
      '<p class="tagline">Six people. One Saturday. No mercy.</p>' +
      '<a href="#play/vault" class="card halls" style="margin-top:1.2rem;text-decoration:none;display:flex"><div><div style="font-size:.9rem">🔒 🫂 📺</div><h3>The Vault · The Huddle · The Arena</h3>' +
      '<div class="muted">' + (S.unlocked ? 'Unlocked — tap to play' : 'Unlocks automatically at 1:00 · the demo lets you peek') + '</div></div><span style="font-size:1.4rem">→</span></a>' +
      '<div class="card answers" style="margin-top:.8rem"><div><div class="eyebrow hot" style="margin:0 0 .4rem">' + (answered ? 'Keep going' : 'Start here') + '</div>' +
      '<h2 style="font-size:1.45rem">Your answers</h2><p class="muted" style="margin-top:.4rem">Everything you write becomes a game on Saturday. Nothing is compulsory — skip anything you want. Nobody sees your answers before the day. Not even the host.</p>' +
      '<div class="progress"><i style="width:' + (answered / SURVEY.length * 100) + '%"></i></div><div class="muted" style="font-size:.75rem">' + answered + ' of ' + SURVEY.length + ' answered · closes Friday night</div></div>' +
      '<a class="btn btn--hot" href="#survey" style="text-decoration:none">' + (answered ? 'Carry on →' : 'Start →') + '</a></div>' +
      '<div class="eyebrow">The crew · ' + started + '/6 started</div>' +
      CREW.map(function (c) {
        return '<div class="card crew"><span class="crew__icon">' + c.icon + '</span><span class="crew__name">' + c.name + '</span>' +
          '<span class="crew__n" style="color:' + (c.answered ? c.color : 'var(--paper)') + '">' + (c.answered ? c.answered + ' in' : 'nothing yet') + '</span></div>';
      }).join('') +
      '<div class="rls">🔐 The hub shows each person\'s answer <b>count</b> so people can chase each other — never the content. In the real app that is enforced by Postgres row-level security, not by convention.</div>' +
      '<div class="eyebrow">Roughly</div><div class="sched">' +
      [['1:00', 'Arrive, eat, talk nonsense'], ['2:00', 'Games begin — warm-up rounds'], ['3:30', 'Big screen, phones as controllers'], ['5:00', 'Food, and something involving standing up'], ['6:00', 'Lights down. It gets worse.'], ['7:30', 'Awards + damage assessment'], ['8:00', 'Out']]
        .map(function (s) { return '<b>' + s[0] + '</b><span>' + s[1] + '</span>'; }).join('') + '</div>' +
      '<div class="eyebrow">Bring</div><p class="muted">· Your phone, fully charged<br>· A power bank if you have one<br>· Something to share</p>' +
      '<div class="card dashed" style="margin-top:1.4rem;text-align:center"><button class="btn btn--ghost" id="skip">' + (S.unlocked ? '↺ Back to before Saturday' : '⏩ Skip to Saturday (demo)') + '</button></div></div>';
    screen.innerHTML = html;
    tabbar.hidden = true;
    document.getElementById('skip').onclick = function () { S.unlocked = !S.unlocked; route(); toast(S.unlocked ? 'Unlocked — the halls are open.' : 'Back to the countdown.'); };
    tick();
  }
  function tick() {
    clearInterval(timer);
    var el = document.getElementById('count'); if (!el) return;
    function draw() {
      var ms = Math.max(0, gameDay() - new Date()), s = Math.floor(ms / 1000);
      var parts = [[Math.floor(s / 86400), 'DAYS'], [Math.floor(s / 3600) % 24, 'HRS'], [Math.floor(s / 60) % 60, 'MIN'], [s % 60, 'SEC']];
      el.innerHTML = parts.map(function (p) { return '<div>' + String(p[0]).padStart(2, '0') + '<small>' + p[1] + '</small></div>'; }).join('');
    }
    draw(); timer = setInterval(draw, 1000);
  }

  var qi = 0;
  function survey() {
    clearInterval(timer); tabbar.hidden = true;
    var q = SURVEY[qi];
    screen.innerHTML = '<div class="view"><div class="top"><a class="back" href="#hub">← Hub</a><span class="brand">' + (qi + 1) + ' / ' + SURVEY.length + '</span></div>' +
      '<div class="progress"><i style="width:' + ((qi) / SURVEY.length * 100) + '%"></i></div>' +
      '<div class="q-num" style="margin-top:1.4rem">QUESTION ' + (qi + 1) + '</div><h2 class="q">' + q.q + '</h2>' +
      '<textarea id="ans" placeholder="Type here…" aria-label="Your answer">' + esc(S.answers[q.id] || '') + '</textarea>' +
      '<p class="muted" style="margin:.6rem 0 1.2rem">' + q.hint + '</p>' +
      '<button class="btn btn--hot" id="next">' + (qi === SURVEY.length - 1 ? 'Save and finish' : 'Save · next →') + '</button>' +
      '<button class="btn btn--ghost" id="skipq">Skip this one</button>' +
      '<div class="rls">Only you can read this. Answers are released by the game engine, inside a live round, on the day.</div></div>';
    function go(save) {
      if (save) S.answers[q.id] = document.getElementById('ans').value;
      if (qi < SURVEY.length - 1) { qi++; survey(); } else { qi = 0; location.hash = '#hub'; toast('Saved. Your confession is now in the Vault deck.'); }
    }
    document.getElementById('next').onclick = function () { go(true); };
    document.getElementById('skipq').onclick = function () { go(false); };
  }

  function play(hallId) {
    clearInterval(timer);
    if (hallId === 'board') return board();
    var h = HALLS[hallId] || HALLS.vault;
    tabbar.hidden = false; setTab(hallId);
    screen.innerHTML = '<div class="view"><div class="top"><a class="back" href="#hub">← Hub</a><span class="brand">' + (S.unlocked ? 'YOU\'RE HOSTING' : 'PREVIEW') + '</span></div>' +
      '<img class="art" src="' + h.art + '" alt="' + h.title + ' key art">' +
      '<h2 style="margin-top:1rem;font-size:1.3rem">' + h.icon + ' ' + h.title + '</h2><p class="muted">' + h.blurb + '</p>' +
      h.games.map(function (g) {
        return '<button class="game ' + g.c + (g.play ? ' game--play' : '') + '" data-g="' + g.id + '"><span class="game__icon">' + (S.unlocked || g.play ? g.icon : '🔒') + '</span>' +
          '<span class="game__body"><span class="game__name">' + g.name + '</span><br><span class="game__desc">' + g.desc + '</span></span>' +
          '<span class="game__time">' + (g.play ? 'Play' : g.time) + '</span></button>';
      }).join('') +
      '<p class="muted" style="margin-top:1rem;text-align:center;font-size:.78rem">Every game here plays on one device, with the rest of the crew simulated. The real app syncs six phones and a TV.</p></div>';
    screen.querySelectorAll('[data-g]').forEach(function (b) {
      b.onclick = function () {
        var id = b.getAttribute('data-g');
        location.hash = '#game/' + id;
      };
    });
  }

  function setTab(id) {
    tabbar.querySelectorAll('button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-hall') === id); });
  }

  /* ───── Who Wrote It? ───── */
  function whoWrote() {
    clearInterval(timer); tabbar.hidden = true;
    var deck = CONFESSIONS.slice();
    if (S.answers.confess && S.answers.confess.trim()) deck.splice(2, 0, { by: 'you', text: S.answers.confess.trim() });
    var round = 0, pts = 0;
    function show() {
      if (round >= deck.length) return finish();
      var c = deck[round];
      screen.innerHTML = '<div class="view"><div class="top"><a class="back" href="#play/vault">← Vault</a><span class="brand">WHO WROTE IT?</span></div>' +
        '<div class="score"><span>Round ' + (round + 1) + ' of ' + deck.length + '</span><span>' + pts + ' pts</span></div>' +
        '<div class="confession">' + esc(c.text) + '</div>' +
        '<div class="picks">' + CREW.map(function (p) { return '<button class="pick" data-p="' + p.id + '">' + p.icon + ' ' + p.name + '</button>'; }).join('') + '</div>' +
        '<div class="reveal-line" id="rl" aria-live="polite"></div><button class="btn btn--gold" id="nx" hidden>Next confession →</button></div>';
      screen.querySelectorAll('.pick').forEach(function (b) {
        b.onclick = function () {
          var right = b.getAttribute('data-p') === c.by;
          if (right) { pts += 2; S.scores.you += 2; }
          screen.querySelectorAll('.pick').forEach(function (x) { x.disabled = true; if (x.getAttribute('data-p') === c.by) x.classList.add('right'); });
          if (!right) b.classList.add('wrong');
          document.getElementById('rl').innerHTML = right ? '✓ Got it. +2' : 'It was <span style="color:var(--gold)">' + crew(c.by).name + '</span>' + (c.by === 'you' ? ' — that\'s you, so nobody else could know.' : '.');
          var nx = document.getElementById('nx'); nx.hidden = false; nx.onclick = function () { round++; show(); };
        };
      });
    }
    function finish() {
      screen.innerHTML = '<div class="view" style="text-align:center"><div class="top"><a class="back" href="#play/vault">← Vault</a><span class="brand">ROUND OVER</span></div>' +
        '<img class="art" src="img/awards-hero.webp" alt="A trophy bursting with confetti" style="aspect-ratio:1/1;margin:1rem 0">' +
        '<h2 style="font-size:2rem">' + pts + ' points</h2><p class="muted" style="margin:.5rem 0 1.4rem">Added to the Board.</p>' +
        '<a class="btn btn--hot" href="#board" style="text-decoration:none">See the Board</a><a class="btn btn--ghost" href="#play/vault" style="text-decoration:none">Back to the Vault</a></div>';
    }
    show();
  }

  /* ───── Spyfall — pass the phone ───── */
  function spyfall() {
    clearInterval(timer); tabbar.hidden = true;
    var place = SPY_LOCATIONS[Math.floor(Math.random() * SPY_LOCATIONS.length)];
    var spy = Math.floor(Math.random() * CREW.length);
    var roles = place.roles.slice().sort(function () { return Math.random() - .5; });
    var i = 0, shown = false;
    function card() {
      if (i >= CREW.length) return round();
      var p = CREW[i];
      screen.innerHTML = '<div class="view"><div class="top"><a class="back" href="#play/arena">← Arena</a><span class="brand">SPYFALL</span></div>' +
        '<div class="score"><span>Pass the phone</span><span>' + (i + 1) + ' / ' + CREW.length + '</span></div>' +
        '<h2 style="font-size:1.4rem">' + p.icon + ' ' + p.name + ', your card</h2><p class="muted">Make sure nobody else is looking, then tap it.</p>' +
        '<div class="spy-card" id="sc" role="button" tabindex="0" aria-label="Reveal your card"><div><div style="font-size:2.4rem">🂠</div><div class="muted" style="margin-top:.5rem">Tap to reveal</div></div></div>' +
        '<button class="btn btn--gold" id="nx" hidden>Hide it · pass to ' + (CREW[i + 1] ? CREW[i + 1].name : 'start the round') + ' →</button></div>';
      var sc = document.getElementById('sc');
      function reveal() {
        if (shown) return; shown = true;
        if (i === spy) { sc.classList.add('spy'); sc.innerHTML = '<div><div style="font-size:2.4rem">🕵️</div><h2>You\'re the spy</h2><p class="muted" style="margin-top:.6rem">Work out where everyone is, without them noticing you don\'t know.</p></div>'; }
        else { sc.classList.add('shown'); sc.innerHTML = '<div><div class="muted" style="letter-spacing:.2em;font-weight:800;font-size:.7rem">LOCATION</div><h2>' + place.location + '</h2><div class="muted" style="margin-top:.8rem;letter-spacing:.2em;font-weight:800;font-size:.7rem">YOU ARE</div><h3 style="font-size:1.1rem;margin-top:.2rem">' + roles[i] + '</h3></div>'; }
        document.getElementById('nx').hidden = false;
      }
      sc.onclick = reveal; sc.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); reveal(); } };
      document.getElementById('nx').onclick = function () { i++; shown = false; card(); };
    }
    function round() {
      var left = 300;
      screen.innerHTML = '<div class="view" style="text-align:center"><div class="top"><a class="back" href="#play/arena">← Arena</a><span class="brand">SPYFALL</span></div>' +
        '<p class="muted" style="margin-top:1rem">Take turns asking one person one question. Catch the spy before the clock runs out.</p>' +
        '<div class="timer" id="tm">5:00</div><button class="btn btn--hot" id="rv">Reveal the spy</button><div class="reveal-line" id="rl" aria-live="polite"></div></div>';
      clearInterval(timer);
      timer = setInterval(function () {
        left--; var el = document.getElementById('tm'); if (!el) return clearInterval(timer);
        el.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
        if (left <= 0) { clearInterval(timer); el.textContent = 'Time!'; }
      }, 1000);
      document.getElementById('rv').onclick = function () {
        clearInterval(timer);
        document.getElementById('rl').innerHTML = 'The spy was <span style="color:var(--hot)">' + CREW[spy].icon + ' ' + CREW[spy].name + '</span> — the place was <span style="color:var(--gold)">' + place.location + '</span>.';
        this.textContent = 'Play again';
        this.className = 'btn btn--gold';
        this.onclick = spyfall;
      };
    }
    card();
  }

  function board() {
    clearInterval(timer); tabbar.hidden = false; setTab('board');
    var rows = CREW.slice().sort(function (a, b) { return S.scores[b.id] - S.scores[a.id]; });
    screen.innerHTML = '<div class="view"><div class="top"><a class="back" href="#hub">← Hub</a><span class="brand">THE BOARD</span></div>' +
      '<img class="art" src="img/awards-hero.webp" alt="A trophy bursting with confetti">' +
      '<h2 style="margin:1rem 0 .3rem;font-size:1.3rem">🏆 Standings</h2><p class="muted" style="margin-bottom:.9rem">Points from every game, live on every phone and the TV.</p>' +
      rows.map(function (c, i) { return '<div class="board-row"><b>' + (i + 1) + '</b><span>' + c.icon + ' ' + c.name + '</span><span class="pts">' + S.scores[c.id] + '</span></div>'; }).join('') +
      '<a class="btn btn--gold" href="#awards" style="text-decoration:none;margin-top:1rem">🏆 Run the awards</a>' +
      '<p class="muted" style="margin-top:.8rem;font-size:.78rem">At 7:30 the awards hand out titles from the day\'s games and votes.</p></div>';
  }

  function awards() {
    clearInterval(timer); tabbar.hidden = true;
    var rows = CREW.slice().sort(function (a, b) { return S.scores[b.id] - S.scores[a.id]; });
    var TITLES = ['Champion of the Day', 'Most Dangerous in the Vault', 'Fastest Thumbs in the Arena', 'Best Liar at Spyfall', 'Most Likely to Start a Debate', 'Showed Up, Sang Loud'];
    var i = 0;
    screen.innerHTML = '<div class="view" style="text-align:center"><div class="top"><a class="back" href="#board">← Board</a><span class="brand">THE AWARDS</span></div>' +
      '<img class="art" src="img/awards-hero.webp" alt="A trophy bursting with confetti" style="aspect-ratio:1/1;margin:.8rem 0">' +
      '<div id="aw"></div><button class="btn btn--gold" id="nextAw">Open the first envelope</button></div>';
    document.getElementById('nextAw').onclick = function () {
      if (i >= rows.length) { location.hash = '#hub'; return; }
      var c = rows[i];
      document.getElementById('aw').insertAdjacentHTML('beforeend', '<div class="card view" style="margin-bottom:.6rem;text-align:left"><div class="eyebrow hot" style="margin:0 0 .3rem">' + TITLES[i] + '</div><h3>' + c.icon + ' ' + c.name + ' <span class="muted" style="font-size:.85rem">· ' + S.scores[c.id] + ' pts</span></h3></div>');
      i++; this.textContent = i >= rows.length ? 'Back to the hub' : 'Next envelope';
    };
  }

  /* Shared with js/games.js, which holds the rest of the games */
  window.CM = {
    CREW: CREW, S: S, screen: screen, toast: toast, crew: crew, esc: esc,
    award: function (id, pts) { S.scores[id] = (S.scores[id] || 0) + pts; },
    finish: function (title, pts, back) {
      screen.innerHTML = '<div class="view" style="text-align:center"><div class="top"><a class="back" href="#play/' + back + '">← Back</a><span class="brand">' + title.toUpperCase() + '</span></div>' +
        '<img class="art" src="img/awards-hero.webp" alt="" style="aspect-ratio:1/1;margin:1rem 0">' +
        '<h2 style="font-size:2rem">' + pts + ' points</h2><p class="muted" style="margin:.5rem 0 1.4rem">Added to the Board.</p>' +
        '<a class="btn btn--hot" href="#board" style="text-decoration:none">See the Board</a><a class="btn btn--ghost" href="#play/' + back + '" style="text-decoration:none">Pick another game</a></div>';
    }
  };

  /* ───────── Router ───────── */
  function route() {
    var h = location.hash.replace('#', '') || 'hub';
    var parts = h.split('/');
    screen.scrollTop = 0;
    if (parts[0] === 'survey') return survey();
    if (parts[0] === 'play') return play(parts[1] || 'vault');
    if (parts[0] === 'board') return board();
    if (parts[0] === 'game' && parts[1] === 'whowrote') return whoWrote();
    if (parts[0] === 'game' && parts[1] === 'spyfall') return spyfall();
    if (parts[0] === 'game' && window.CM_GAMES && window.CM_GAMES[parts[1]]) { clearInterval(timer); tabbar.hidden = true; return window.CM_GAMES[parts[1]](); }
    if (parts[0] === 'awards') return awards();
    return hub();
  }
  tabbar.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var hall = b.getAttribute('data-hall');
    location.hash = hall === 'board' ? '#board' : '#play/' + hall;
  });
  window.addEventListener('hashchange', route);
  route();
})();
