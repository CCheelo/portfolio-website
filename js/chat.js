/* ═══════════════════════════════════════════════════════════════
   "Chat with me" — a scripted bot that answers as Choolwe.
   Same design as the deterministic bank chatbot he built: no LLM,
   no server, nothing stored. Personal data is masked before
   anything else touches a message.
   How a message is answered:
     1. "tell me more" style follow-ups continue the last topic
     2. a project name (+ optional facet: why/how/tech/results/…)
        answers from that project; a facet on its own reuses the
        project from the conversation ("what tech did you use?")
     3. otherwise the closest topic by character-trigram similarity
        plus keyword hits, above a confidence threshold
     4. below the threshold it says so and offers buttons
   The knowledge lives in js/chat-kb.js.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (document.getElementById('ccChat')) return;

  /* Paths work from the site root and from one folder down */
  var base = (document.currentScript && document.currentScript.src || '').replace(/js\/chat\.js.*$/, '');
  window.__CC_BASE = base;

  var KB = null;
  function loadKB(cb) {
    if (KB) return cb();
    function load(src, done, fail) {
      var s = document.createElement('script');
      s.src = base + src; s.onload = done; s.onerror = fail;
      document.head.appendChild(s);
    }
    /* The phrase bank is optional: without it the bot still works from chat-kb.js alone */
    load('js/chat-kb.js', function () {
      var finish = function () { KB = window.CC_KB; prepare(); cb(); };
      load('js/chat-phrases.js', finish, finish);
    }, function () { cb(new Error('kb')); });
  }

  /* ───────── Text helpers ───────── */
  function norm(s) { return s.toLowerCase().replace(/['’]/g, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function grams(s) { var g = {}, p = ' ' + s + ' '; for (var i = 0; i < p.length - 2; i++) { var k = p.substr(i, 3); g[k] = (g[k] || 0) + 1; } return g; }
  function cosine(a, b) {
    var dot = 0, na = 0, nb = 0, k;
    for (k in a) { na += a[k] * a[k]; if (b[k]) dot += a[k] * b[k]; }
    for (k in b) nb += b[k] * b[k];
    return na && nb ? dot / Math.sqrt(na * nb) : 0;
  }
  function has(n, phrase) { return (' ' + n + ' ').indexOf(' ' + phrase + ' ') > -1; }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function prepare() {
    var bank = window.CC_PHRASES || {};
    KB.TOPICS.forEach(function (t) {
      t._g = t.phrases.map(function (p) { return grams(norm(p)); });
      t._b = (bank[t.id] || []).map(grams);          /* extra phrasings from open datasets */
    });
    KB.PROJECTS.forEach(function (p) { p._a = p.aliases.map(norm); });
    KB._more = KB.MORE.map(norm);
    KB._facets = {};
    Object.keys(KB.FACETS).forEach(function (f) { KB._facets[f] = KB.FACETS[f].map(norm); });
  }

  /* ───────── Guards: mask personal data first, cap the length ───────── */
  var MAX_LEN = 300;
  function guard(text) {
    var masked = false, t = text.slice(0, MAX_LEN);
    t = t.replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, function () { masked = true; return '[email]'; });
    t = t.replace(/\+?\d[\d\s-]{7,}\d/g, function () { masked = true; return '[number]'; });
    return { text: t, masked: masked };
  }

  /* ───────── Conversation memory ───────── */
  var ctx = { topic: null, more: 0, project: null, facetsSeen: [], used: {}, ask: null, name: null, last: null };

  /* Words that can follow "I'm…" without being a name */
  var NOT_NAMES = ['a', 'an', 'the', 'just', 'here', 'fine', 'good', 'great', 'ok', 'okay', 'well', 'bored', 'tired', 'sad', 'happy', 'hungry', 'hiring', 'looking', 'not', 'so', 'very', 'really', 'from', 'in', 'at', 'on', 'interested', 'curious', 'student', 'recruiter', 'back', 'sorry', 'busy', 'alright', 'doing', 'testing', 'new', 'trying', 'going', 'working', 'also', 'still', 'too', 'lonely', 'stressed', 'angry', 'sleepy', 'cool', 'nice', 'lost', 'confused', 'browsing', 'excited', 'impressed'];
  function title(w) { return w.charAt(0).toUpperCase() + w.slice(1); }
  function nameFrom(n, asked) {
    var m = n.match(/\b(?:my name is|my names|call me|name is)\s+([a-z][a-z-]{1,20})/) ||
      (asked && n.match(/^(?:(?:im|i am|its|it is|this is)\s+)?([a-z][a-z-]{1,20})$/)) ||
      n.match(/^(?:hi |hey |hello )?(?:im|i am)\s+([a-z][a-z-]{1,20})$/);
    if (!m || NOT_NAMES.indexOf(m[1]) > -1) return null;
    return title(m[1]);
  }
  function pick(id, list) {
    if (list.length === 1) return list[0];
    var used = ctx.used[id] || [], fresh = list.filter(function (_, i) { return used.indexOf(i) === -1; });
    if (!fresh.length) { used = []; fresh = list; }
    var choice = fresh[Math.floor(Math.random() * fresh.length)];
    used.push(list.indexOf(choice)); ctx.used[id] = used;
    return choice;
  }

  var FACET_ORDER = ['how', 'tech', 'result', 'role', 'why', 'status', 'demo', 'when'];
  var FACET_CHIP = { why: 'Why did you build it?', how: 'How does it work?', tech: 'What tech?', result: 'Results?', role: 'What was your role?', status: 'Is it live?', demo: 'Can I try it?', when: 'When was this?' };
  var START_CHIPS = ['What do you do?', 'Show me your projects', 'How can I contact you?', 'Are you a bot?'];

  function projectChips(p) {
    return FACET_ORDER.filter(function (f) { return p[f] && ctx.facetsSeen.indexOf(f) === -1; }).slice(0, 3).map(function (f) { return FACET_CHIP[f]; });
  }
  function projectAnswer(p, facet) {
    ctx.project = p; ctx.topic = null;
    if (!facet) { ctx.facetsSeen = ['what']; return { html: p.what, chips: projectChips(p).concat(['Can I try it?']).filter(function (c, i, a) { return a.indexOf(c) === i; }).slice(0, 4) }; }
    if (ctx.facetsSeen.indexOf(facet) === -1) ctx.facetsSeen.push(facet);
    var text = p[facet] || ('I haven\'t written that down for ' + p.name + ' — the <a href="' + base + p.page + '">project page</a> has the full story.');
    var page = facet === 'demo' ? '' : ' <a href="' + base + p.page + '">Project page →</a>';
    return { html: text + page, chips: projectChips(p) };
  }

  function findProject(n) {
    var best = null, len = 0;
    KB.PROJECTS.forEach(function (p) { p._a.forEach(function (al) { if (al && has(n, al) && al.length > len) { best = p; len = al.length; } }); });
    return best;
  }
  function findFacet(n) {
    var best = null, len = 0;
    Object.keys(KB._facets).forEach(function (f) { KB._facets[f].forEach(function (k) { if (k && has(n, k) && k.length > len) { best = f; len = k.length; } }); });
    return best;
  }
  function matchTopic(n) {
    var g = grams(n), words = n.split(' '), best = null, score = 0;
    KB.TOPICS.forEach(function (t) {
      var sim = Math.max.apply(null, t._g.map(function (pg) { return cosine(g, pg); }));
      for (var i = 0; i < t._b.length; i++) { var c = cosine(g, t._b[i]) * 0.97; if (c > sim) sim = c; }
      var hits = words.filter(function (w) { return t.keys.indexOf(w) !== -1; }).length;
      var sc = sim * 0.75 + Math.min(hits, 2) * 0.22;
      if (sc > score) { score = sc; best = t; }
    });
    return { topic: best, score: score };
  }
  function isMore(n) {
    if (KB._more.indexOf(n) > -1) return true;
    var g = grams(n);
    return n.split(' ').length <= 5 && KB._more.some(function (m) { return cosine(g, grams(m)) > .8; });
  }

  var THRESHOLD = 0.42;
  var AND_YOU = ['and you', 'you', 'what about you', 'how about you', 'hbu', 'and yourself', 'and u', 'wbu', 'you too'];

  /* Answers that depend on the conversation */
  function special(t) {
    var nm = ctx.name;
    switch (t.id) {
      case 'username': if (nm) return { html: 'You\'re ' + nm + ' 😄' }; return { html: 'You haven\'t told me yet! What\'s your name?', ask: 'name' };
      case 'knowme': if (nm) return { html: 'You\'re ' + nm + '! I don\'t remember past chats though — nothing gets stored 🔒' }; return { html: 'Not yet — I don\'t keep anything between chats. What\'s your name?', ask: 'name' };
      case 'repeat': return ctx.last ? { html: ctx.last.html, chips: ctx.last.chips } : { html: 'We\'re only just getting started 😄', chips: START_CHIPS };
      case 'yes': return { html: 'Haha okay 😄 What would you like to know?', chips: START_CHIPS };
      case 'no': return { html: 'No worries 🙂 Anything else I can help with?', chips: START_CHIPS };
      case 'maybe': return { html: 'Fair 😄 Take your time. I\'m here.', chips: START_CHIPS };
    }
    return null;
  }

  /* A reply to a question the bot just asked */
  function replyToAsk(n) {
    var ask = ctx.ask; ctx.ask = null;
    if (ask === 'name') {
      var nm = nameFrom(n, true);
      if (nm) { ctx.name = nm; return { html: 'Nice to meet you, ' + nm + ' 😊 What brings you here — hiring, working together, or just having a look around?', chips: ['Hiring', 'Working together', 'Just looking around'], ask: 'purpose' }; }
      return null;
    }
    var spec = KB.ASKS[ask];
    if (!spec || n.split(' ').length > 8) return null;
    var words = n.split(' ');
    for (var i = 0; i < spec.replies.length; i++) {
      if (spec.replies[i].words.some(function (w) { return words.indexOf(w) > -1; })) return { html: spec.replies[i].text, chips: spec.replies[i].chips };
    }
    return null;
  }

  function answer(raw) {
    var r = respondTo(raw);
    if (r.ask) ctx.ask = r.ask;
    ctx.last = r;
    return r;
  }

  function respondTo(raw) {
    var n = norm(raw);
    if (!n) return { html: 'Say something and I\'ll do my best 🙂', chips: START_CHIPS };

    /* 0 · conversation: names, replies to the bot's own questions, "and you?" */
    var given = nameFrom(n, false);
    if (given) { ctx.name = given; return { html: 'Nice to meet you, ' + given + ' 😊 What brings you here — hiring, working together, or just having a look around?', chips: ['Hiring', 'Working together', 'Just looking around'], ask: 'purpose' }; }
    if (ctx.ask) { var back = replyToAsk(n); if (back) return back; }
    /* "another one" — a fresh variant of the last joke, fun fact or suggestion */
    if (['another', 'another one', 'one more', 'again', 'another please', 'next', 'more please'].indexOf(n) > -1 && ctx.topic && ctx.topic.answers.length > 1) {
      return { html: pick(ctx.topic.id, ctx.topic.answers), chips: ctx.topic.chips };
    }
    if (AND_YOU.indexOf(n) > -1) return { html: 'I\'m doing well, thanks for asking 😊 Busy at the bank, building things on the side. What can I tell you about?', chips: START_CHIPS };

    /* 1 · follow-ups */
    if (isMore(n)) {
      if (ctx.topic && ctx.topic.more && ctx.more < ctx.topic.more.length) {
        return { html: ctx.topic.more[ctx.more++], chips: ctx.topic.chips };
      }
      if (ctx.project) {
        var next = FACET_ORDER.filter(function (f) { return ctx.project[f] && ctx.facetsSeen.indexOf(f) === -1; })[0];
        if (next) return projectAnswer(ctx.project, next);
        return { html: 'That\'s the whole story on ' + ctx.project.name + ' 🙂 Want another project?', chips: ['Show me your projects', 'Something fun'] };
      }
      if (ctx.topic) return { html: 'That\'s about all I\'ve got on that one. Ask me something else?', chips: START_CHIPS };
      return { html: 'More about what? Pick a thread:', chips: START_CHIPS };
    }

    /* 2 · projects, with or without a facet */
    var proj = findProject(n), facet = findFacet(n), m = matchTopic(n);
    if (proj) return projectAnswer(proj, facet);
    var weak = m.score < 0.55 || (m.topic && ['ack', 'capabilities'].indexOf(m.topic.id) > -1);
    if (facet && ctx.project && weak) return projectAnswer(ctx.project, facet);

    /* 3 · topics */
    if (m.topic && m.score >= THRESHOLD) {
      var t = m.topic;
      var sp = special(t);
      if (sp) return { html: sp.html, chips: sp.chips || [], ask: sp.ask };
      if (['ack', 'thanks', 'yes', 'no', 'maybe'].indexOf(t.id) === -1) { ctx.topic = t; ctx.more = 0; ctx.project = null; ctx.facetsSeen = []; }
      var html = pick(t.id, t.answers);
      if (t.id === 'greet' && ctx.name) html = html.replace(/^(Hey|Hi|Hello)!?/, '$1 ' + ctx.name + '!');
      return { html: html, chips: t.chips, ask: t.ask };
    }

    /* 4 · not sure */
    return {
      html: 'Hmm, I\'m not sure I got that' + (m.topic && m.score > 0.25 ? ' — were you asking about <b>' + m.topic.phrases[0] + '</b>?' : '.') + ' I only answer what I actually know. Try one of these, or email the real me at <a href="mailto:choolwecheelo22@gmail.com">choolwecheelo22@gmail.com</a>.',
      chips: m.topic && m.score > 0.25 ? [m.topic.phrases[0].replace(/^./, function (c) { return c.toUpperCase(); })].concat(START_CHIPS.slice(0, 2)) : START_CHIPS
    };
  }

  /* ───────── UI ───────── */
  var root = document.createElement('div');
  root.id = 'ccChat';
  root.innerHTML =
    '<button class="cc-launch" id="ccLaunch" aria-expanded="false" aria-controls="ccPanel"><span class="cc-launch__dot" aria-hidden="true"></span><span>Chat with me</span></button>' +
    '<section class="cc-panel" id="ccPanel" role="dialog" aria-modal="false" aria-labelledby="ccTitle" hidden>' +
      '<header class="cc-head"><div><div class="cc-title" id="ccTitle">Chat with Choolwe</div><div class="cc-sub">A bot that answers as me · no AI · nothing stored</div></div>' +
      '<div class="cc-actions"><button class="cc-reset" id="ccReset" aria-label="Start a new conversation" title="Start a new conversation">↺</button>' +
      '<button class="cc-close" id="ccClose" aria-label="Close chat">×</button></div></header>' +
      '<div class="cc-log" id="ccLog" role="log" aria-live="polite"></div>' +
      '<form class="cc-form" id="ccForm" autocomplete="off"><label class="cc-sr" for="ccInput">Your message</label>' +
      '<input id="ccInput" class="cc-input" maxlength="' + MAX_LEN + '" placeholder="Ask me anything about my work…">' +
      '<button class="cc-send" aria-label="Send">➤</button></form>' +
    '</section>';
  document.body.appendChild(root);

  var panel = document.getElementById('ccPanel'), launch = document.getElementById('ccLaunch');
  var log = document.getElementById('ccLog'), input = document.getElementById('ccInput');
  var started = false;

  function add(who, html, chips) {
    var m = document.createElement('div');
    m.className = 'cc-msg cc-msg--' + who;
    m.innerHTML = '<div class="cc-bubble">' + html + '</div>';
    if (chips && chips.length) {
      var c = document.createElement('div'); c.className = 'cc-chips';
      chips.forEach(function (t) { var b = document.createElement('button'); b.type = 'button'; b.className = 'cc-chip'; b.textContent = t; c.appendChild(b); });
      m.appendChild(c);
    }
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
  }
  function typing(ms, cb) {
    var t = document.createElement('div'); t.className = 'cc-msg cc-msg--bot'; t.innerHTML = '<div class="cc-bubble cc-typing" aria-label="Typing"><i></i><i></i><i></i></div>';
    log.appendChild(t); log.scrollTop = log.scrollHeight;
    setTimeout(function () { t.remove(); cb(); }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms);
  }

  function respond(raw) {
    var g = guard(raw);
    add('me', esc(g.text));
    log.querySelectorAll('.cc-chips').forEach(function (c) { c.remove(); });
    loadKB(function (err) {
      if (err) { add('bot', 'Sorry — I couldn\'t load what I know. Email me at <a href="mailto:choolwecheelo22@gmail.com">choolwecheelo22@gmail.com</a>.'); return; }
      var r = answer(g.text);
      var delay = Math.min(1400, 350 + r.html.replace(/<[^>]+>/g, '').length * 4);
      typing(delay, function () {
        if (g.masked) add('bot', '🔒 I masked what looked like an email or phone number — I don\'t keep anything you type.');
        add('bot', r.html, r.chips);
      });
    });
  }

  function open() {
    panel.hidden = false; launch.setAttribute('aria-expanded', 'true'); root.classList.add('is-open');
    if (!started) { started = true; welcome(); loadKB(function () {}); }
    setTimeout(function () { input.focus(); }, 50);
  }
  function welcome() {
    var h = new Date().getHours();
    add('bot', (h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening') + '! 👋 I\'m a bot that answers as Choolwe — ask me about my work, my projects, or anything on this site. Follow-ups like “tell me more” work too.', START_CHIPS);
  }
  /* Start over: clear the log and forget everything from this conversation, the visitor's name included */
  function reset() {
    log.innerHTML = '';
    ctx = { topic: null, more: 0, project: null, facetsSeen: [], used: {}, ask: null, name: null, last: null };
    welcome();
    input.value = ''; input.focus();
  }
  document.getElementById('ccReset').addEventListener('click', reset);
  function close() { panel.hidden = true; launch.setAttribute('aria-expanded', 'false'); root.classList.remove('is-open'); launch.focus(); }

  launch.addEventListener('click', function () { panel.hidden ? open() : close(); });
  document.getElementById('ccClose').addEventListener('click', close);
  panel.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  log.addEventListener('click', function (e) { var c = e.target.closest('.cc-chip'); if (c) respond(c.textContent); });
  document.getElementById('ccForm').addEventListener('submit', function (e) {
    e.preventDefault(); var v = input.value.trim(); if (!v) return; input.value = ''; respond(v);
  });
  /* Any element with data-open-chat opens the panel (used on the chatbot project page) */
  document.addEventListener('click', function (e) { if (e.target.closest('[data-open-chat]')) { e.preventDefault(); open(); } });
})();
