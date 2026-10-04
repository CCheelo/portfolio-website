/* ═══════════════════════════════════════════════════════════════
   UNISDA demo — single data source (window.UNISDA_DATA).
   Every person, figure and activity here is invented. The shape
   mirrors the real app's model: Theme → Objective → KPI → Main
   activity → Sub-activity (dated by quarter, budgeted, reported).
   ═══════════════════════════════════════════════════════════════ */
(function () {
  var YEAR = 2026;
  var CURRENT_Q = 4;          // Q3 is closed; Q4 is under way

  var themes = [
    { id: 'sg', name: 'Spiritual Growth' },
    { id: 'mi', name: 'Mission' },
    { id: 'le', name: 'Leadership' },
    { id: 'in', name: 'Infrastructure' }
  ];

  var objectives = [
    { id: 'o1', theme: 'sg', name: 'To disciple individuals and families into Spirit-filled lives', kpi: 'Weekly small-group attendance up 20%' },
    { id: 'o2', theme: 'sg', name: 'Faithfulness in stewardship', kpi: 'Members returning tithe and offering up 15%' },
    { id: 'o3', theme: 'mi', name: 'Membership growth', kpi: '150 baptisms annually' },
    { id: 'o4', theme: 'mi', name: 'Community impact', kpi: 'Four community outreach programmes a year' },
    { id: 'o5', theme: 'le', name: 'Improve member ownership, funding and project execution', kpi: 'Improved execution of projects through strong leadership' },
    { id: 'o6', theme: 'le', name: 'Transparency and accountability in church operations', kpi: 'Every department reports every quarter' },
    { id: 'o7', theme: 'in', name: 'Safe, accessible and well-equipped facilities', kpi: 'Maintenance plan 90% delivered' }
  ];

  var departments = [
    { id: 'yth', name: 'Youth Ministries',     leader: 'Mutinta Banda',   elder: 'Elder Phiri' },
    { id: 'mus', name: 'Music',                leader: 'Chanda Mulenga',  elder: 'Elder Zulu' },
    { id: 'hea', name: 'Health Ministries',    leader: 'Dr. Lweendo Hamoonga', elder: 'Elder Tembo' },
    { id: 'stw', name: 'Stewardship',          leader: 'Natasha Kaunda',  elder: 'Elder Phiri' },
    { id: 'com', name: 'Communication',        leader: 'Bwalya Chileshe', elder: 'Elder Mwale' },
    { id: 'chd', name: "Children's Ministries", leader: 'Grace Lungu',    elder: 'Elder Tembo' },
    { id: 'wom', name: "Women's Ministries",   leader: 'Agnes Sakala',    elder: 'Elder Zulu' },
    { id: 'men', name: "Men's Ministries",     leader: 'Joseph Nkonde',   elder: 'Elder Mwale' },
    { id: 'pmi', name: 'Personal Ministries',  leader: 'Ruth Mumba',      elder: 'Elder Phiri' },
    { id: 'ssc', name: 'Sabbath School',       leader: 'Peter Siame',     elder: 'Elder Zulu' },
    { id: 'dea', name: 'Deacons & Deaconesses', leader: 'Moses Chinyama', elder: 'Elder Tembo' },
    { id: 'fac', name: 'Facilities & Development', leader: 'Kelvin Ngoma', elder: 'Elder Mwale' }
  ];

  /* [dept, objective, main activity, sub-activity, quarter, budget, spent, achievement, movedFrom, tag]
     achievement: 4 = 100%, 3 = 50–99%, 2 = 1–49%, 1 = 0%, null = not reported yet */
  var A = [
    ['yth','o3','Public evangelism','Campus outreach weekend',1,20500,20705,4],
    ['yth','o1','Youth retention','Youth week of prayer',3,13000,10270,3],
    ['yth','o5','Project discipline','Leadership mentoring evening',2,12345,11000,4],
    ['yth','o2','Stewardship education programme','Stewardship revival weekend',1,43500,11310,2,null,'Camp Meeting'],
    ['yth','o6','Transparency in reporting','Quarterly reporting workshops',1,17000,14790,4],
    ['yth','o1','Media discipleship','Livestream equipment upgrade',2,14500,13195,4],
    ['yth','o4','Community service','Hospital visitation & clean-up',4,6500,0,null],
    ['yth','o3','Pathfinder investiture','Pathfinder investiture service',4,9800,0,null],

    ['mus','o1','Worship ministry','Choir uniforms',1,28000,27150,4],
    ['mus','o1','Worship ministry','Sacred music concert',3,18500,16900,4,2],
    ['mus','o5','Skills development','Keyboard & vocal training',2,7500,5200,3],
    ['mus','o4','Community concerts','Christmas carols in the community',4,9000,0,null],

    ['hea','o4','Health expo','Community health expo',2,24000,22850,4],
    ['hea','o4','Wellness programme','Fitness & nutrition series',3,8500,3600,2],
    ['mus','o5','Skills development','Music theory classes',3,4200,0,1],
    ['hea','o1','Family life','Mental health awareness week',3,6000,6000,4],
    ['hea','o7','First aid','First-aid kits for every hall',1,4800,4720,4],

    ['stw','o2','Stewardship education programme','Tithe & offering seminars',1,9000,8650,4],
    ['stw','o2','Stewardship education programme','Financial literacy for families',3,11000,0,null],
    ['stw','o6','Budget round','Departmental budget clinics',4,3500,0,null],

    ['com','o6','Church communications','Weekly bulletin & newsletter',1,7200,7200,4],
    ['com','o1','Media discipleship','Website & social media refresh',2,15000,9800,3],
    ['com','o1','Media discipleship','Sermon archive digitisation',3,6400,0,null],

    ['chd','o1','Children\'s Sabbath','Vacation Bible School',3,21000,19850,4],
    ['chd','o3','Children\'s evangelism','Children\'s evangelistic week',2,8800,8100,4],
    ['chd','o7','Learning spaces','Children\'s room furniture',4,16000,0,null],

    ['wom','o4','Outreach','Women\'s prison ministry',2,7800,6950,4],
    ['wom','o1','Retreats','Women\'s spiritual retreat',3,25500,24100,4,4],
    ['wom','o4','Outreach','Widows & orphans support',4,12000,3500,null],

    ['men','o1','Men\'s fellowship','Men\'s breakfast & Bible study',1,6000,5400,4],
    ['men','o5','Mentorship','Young men mentorship camp',3,19000,8200,2],

    ['pmi','o3','Bible studies','Bible worker training',1,5500,5500,4],
    ['pmi','o3','Evangelism','Public evangelistic series',2,48000,47100,4],
    ['pmi','o4','Literature','Literature distribution drive',3,9200,6100,3],

    ['ssc','o1','Sabbath School','Quarterly lesson guides',1,14400,14400,4],
    ['ssc','o1','Sabbath School','Teachers\' training day',3,5200,0,1],

    ['dea','o7','Facilities care','Communion service supplies',1,3800,3650,4],
    ['dea','o7','Facilities care','Usher & deacon training',2,2500,2500,4],

    ['fac','o7','Sanctuary upgrade','Sound system replacement',2,85000,82400,4],
    ['fac','o7','Sanctuary upgrade','Roof leak repairs',3,46000,31800,3],
    ['fac','o7','Accessibility','Wheelchair ramp at the east entrance',4,22000,0,null]
  ];

  var activities = A.map(function (r, i) {
    return {
      id: i + 1, dept: r[0], objective: r[1], main: r[2], name: r[3],
      quarter: r[4], budget: r[5], spent: r[6], band: r[7] === undefined ? null : r[7],
      movedFrom: r[8] || null, tag: r[9] || null
    };
  });

  /* Payment requests — the paper form's four-stage signing chain */
  var STAGES = ['Department leader', 'Elder in charge', 'Stewardship & Finance', 'Treasury'];

  var requests = [
    { id: 'PR-2026-118', dept: 'yth', by: 'Mutinta Banda', raised: '2026-09-22', neededBy: '2026-10-11', stage: 2,
      lines: [ { act: 'Hospital visitation & clean-up', amount: 4200, planned: 6500, remaining: 6500 },
               { act: 'Pathfinder investiture service', amount: 7400, planned: 9800, remaining: 9800 } ] },
    { id: 'PR-2026-121', dept: 'mus', by: 'Chanda Mulenga', raised: '2026-09-25', neededBy: '2026-12-12', stage: 2,
      lines: [ { act: 'Christmas carols in the community', amount: 9600, planned: 9000, remaining: 9000 } ] },
    { id: 'PR-2026-124', dept: 'chd', by: 'Grace Lungu', raised: '2026-09-28', neededBy: '2026-11-01', stage: 2,
      lines: [ { act: "Children's room furniture", amount: 15800, planned: 16000, remaining: 16000 } ] },
    { id: 'PR-2026-126', dept: 'fac', by: 'Kelvin Ngoma', raised: '2026-09-29', neededBy: '2026-10-20', stage: 2,
      lines: [ { act: 'Wheelchair ramp at the east entrance', amount: 12500, planned: 22000, remaining: 22000 },
               { act: 'Roof leak repairs (final phase)', amount: 14200, planned: 46000, remaining: 14200 } ] },
    { id: 'PR-2026-127', dept: 'wom', by: 'Agnes Sakala', raised: '2026-09-30', neededBy: '2026-10-05', stage: 2, trust: true,
      lines: [ { act: 'Widows & orphans support', amount: 3500, planned: 12000, remaining: 8500 } ] },
    { id: 'PR-2026-129', dept: 'stw', by: 'Natasha Kaunda', raised: '2026-10-02', neededBy: '2026-11-15', stage: 0,
      lines: [ { act: 'Departmental budget clinics', amount: 3200, planned: 3500, remaining: 3500 } ] },
    { id: 'PR-2026-130', dept: 'hea', by: 'Dr. Lweendo Hamoonga', raised: '2026-10-03', neededBy: '2026-10-30', stage: 1,
      lines: [ { act: 'Fitness & nutrition series (Q4 sessions)', amount: 4100, planned: 8500, remaining: 4900 } ] }
  ];

  var disbursed = [
    { id: 'PR-2026-097', dept: 'yth', act: 'Youth week of prayer', amount: 10270, paid: '2026-07-18', receipt: true },
    { id: 'PR-2026-101', dept: 'fac', act: 'Roof leak repairs (phase 1)', amount: 31800, paid: '2026-08-04', receipt: true },
    { id: 'PR-2026-104', dept: 'men', act: 'Young men mentorship camp', amount: 8200, paid: '2026-08-21', receipt: false },
    { id: 'PR-2026-108', dept: 'pmi', act: 'Literature distribution drive', amount: 6100, paid: '2026-09-02', receipt: false },
    { id: 'PR-2026-112', dept: 'hea', act: 'Fitness & nutrition series', amount: 3600, paid: '2026-09-09', receipt: true }
  ];

  var comingUp = [
    { date: '2026-10-05', title: 'Widows & orphans support — distribution', dept: 'wom' },
    { date: '2026-10-11', title: 'Hospital visitation & clean-up', dept: 'yth' },
    { date: '2026-10-13', title: 'Stewardship & Finance — monthly sitting', dept: null },
    { date: '2026-10-20', title: 'Wheelchair ramp — works begin', dept: 'fac' },
    { date: '2026-10-31', title: 'Q3 reports due to SPEMC', dept: null },
    { date: '2026-11-08', title: 'Pathfinder investiture service', dept: 'yth' },
    { date: '2026-11-15', title: 'Departmental budget clinics', dept: 'stw' },
    { date: '2026-12-12', title: 'Christmas carols in the community', dept: 'mus' }
  ];

  /* Who the visitor can "view as" — access is the union of offices */
  var personas = [
    { id: 'leader', name: 'Mutinta Banda', initials: 'MB', office: 'Leader · Youth Ministries', dept: 'yth', finance: false, board: true },
    { id: 'spemc',  name: 'Daniel Kapembwa', initials: 'DK', office: 'SPEMC (runs the system)', dept: null, finance: false, board: true, admin: true },
    { id: 'treasury', name: 'Esther Mwansa', initials: 'EM', office: 'Treasury · chairs the sitting', dept: null, finance: true, board: true }
  ];

  var BANDS = {
    4: { label: '100%',   status: 'Completed',    cls: 'done' },
    3: { label: '50 – 99%', status: 'Progressing', cls: 'prog' },
    2: { label: '1 – 49%',  status: 'Early stage', cls: 'early' },
    1: { label: '0%',     status: 'Not started',  cls: 'not' }
  };

  /* Last year's grant and how much of it was used — feeds next year's ceiling */
  var budgets = departments.map(function (d, i) {
    var grant = [62000, 41000, 38000, 26000, 30000, 33000, 36000, 22000, 54000, 17000, 9000, 140000][i];
    var used = [0.97, 0.88, 0.92, 0.79, 0.85, 0.95, 0.9, 0.7, 0.98, 0.83, 0.96, 0.91][i];
    /* this year's approved budget: what was planned plus about 10% headroom */
    var planned = activities.filter(function (a) { return a.dept === d.id; }).reduce(function (s, a) { return s + a.budget; }, 0);
    return { dept: d.id, lastGrant: grant, used: used, current: Math.ceil(planned * 1.1 / 1000) * 1000, submitted: null, approved: null, comment: '' };
  });
  budgets[1].submitted = 46500; budgets[3].submitted = 24000; budgets[3].approved = 23500; budgets[8].submitted = 61000;

  /* ───────── Persistence: the demo remembers what visitors change, per browser ───────── */
  var KEY = 'unisda-demo-v1';
  var saved = null;
  try { saved = JSON.parse(window.localStorage.getItem(KEY) || 'null'); } catch (e) { saved = null; }
  if (saved) {
    activities = saved.activities || activities;
    requests = saved.requests || requests;
    disbursed = saved.disbursed || disbursed;
    budgets = saved.budgets || budgets;
  }
  var decisions = (saved && saved.decisions) || {};

  window.UNISDA_DATA = {
    year: YEAR, currentQuarter: CURRENT_Q, budgets: budgets, decisions: decisions,
    save: function () {
      var D = window.UNISDA_DATA;
      try { window.localStorage.setItem(KEY, JSON.stringify({ activities: D.activities, requests: D.requests, disbursed: D.disbursed, budgets: D.budgets, decisions: D.decisions })); } catch (e) { /* private mode: changes last for this page only */ }
    },
    reset: function () { try { window.localStorage.removeItem(KEY); } catch (e) {} },
    themes: themes, objectives: objectives, departments: departments,
    activities: activities, requests: requests, disbursed: disbursed,
    comingUp: comingUp, personas: personas, stages: STAGES, bands: BANDS,

    dept: function (id) { return departments.filter(function (d) { return d.id === id; })[0]; },
    objective: function (id) { return objectives.filter(function (o) { return o.id === id; })[0]; },
    theme: function (id) { return themes.filter(function (t) { return t.id === id; })[0]; },
    fmt: function (n) { return Number(n).toLocaleString('en-ZM', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
    fmt0: function (n) { return Number(n).toLocaleString('en-ZM', { maximumFractionDigits: 0 }); }
  };
})();
