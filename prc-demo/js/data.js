window.PRC_DATA = (function () {

  /* ── Academies ──
     `rep` is the registered academy representative (the project team),
     `short` + `color` drive the generated crest logos. */
  const academies = [
    { id: 1, name: 'Victoria Falls FC',     location: 'Victoria Falls', rep: 'Blessings Chinyama', short: 'VFF', color: '#0e7490', est: 2010 },
    { id: 2, name: 'Zambezi Lions Academy', location: 'Lusaka',         rep: 'Emmanuel Mungungu',  short: 'ZLA', color: '#b45309', est: 2008 },
    { id: 3, name: 'Riverside United',      location: 'Livingstone',    rep: 'Chibesa Mubanga',    short: 'RU',  color: '#15803d', est: 2015 },
    { id: 4, name: 'Luapula Stars',         location: 'Mansa',          rep: 'Henry Viuyi',        short: 'LS',  color: '#6d28d9', est: 2012 },
    { id: 5, name: 'Copperbelt Elite FC',   location: 'Kitwe',          rep: 'Daniel Sinyinza',    short: 'CEF', color: '#b91c1c', est: 2005 },
    { id: 6, name: 'Southern Cross Academy',location: 'Choma',          rep: 'Elizaberth Mwaba',   short: 'SCA', color: '#1e3a8a', est: 2018 },
    { id: 7, name: 'Kafue River Youth FC',  location: 'Kafue',          rep: 'Mirriam Nauluta',    short: 'KRY', color: '#0891b2', est: 2014 },
    { id: 8, name: 'North Star Elite',      location: 'Ndola',          rep: 'Choolwe Cheelo',     short: 'NSE', color: '#1b3a2d', est: 2009 },
  ];

  /* ── Players ── */
  const players = [
    /* ── Victoria Falls FC ── */
    { id: 1,  prcId: 'ZF-2024-8849-MT', firstName: 'Marcus',     lastName: 'Thorne',    dob: '2011-05-14', gender: 'Male',   division: 'U-14', academyId: 1, position: 'Attacking Midfield',  status: 'Active',   nationality: 'Zambian',     seasonRating: 8.4, appearances: 22, goals: 9,  assists: 7,  tackles: 34, registeredDate: '2024-01-10' },
    { id: 2,  prcId: 'ZF-2024-3221-CM', firstName: 'Chanda',     lastName: 'Mwansa',    dob: '2013-03-22', gender: 'Male',   division: 'U-12', academyId: 1, position: 'Central Midfield',    status: 'Active',   nationality: 'Zambian',     seasonRating: 7.2, appearances: 16, goals: 3,  assists: 8,  tackles: 44, registeredDate: '2024-01-10' },
    { id: 3,  prcId: 'ZF-2024-5567-EB', firstName: 'Emmanuel',   lastName: 'Banda',     dob: '2009-07-11', gender: 'Male',   division: 'U-16', academyId: 1, position: 'Goalkeeper',          status: 'Pending',  nationality: 'Zambian',     seasonRating: null,appearances: 0,  goals: 0,  assists: 0,  tackles: 0,  registeredDate: '2024-02-01' },
    { id: 34, prcId: 'ZF-2026-1109-BC', firstName: 'Blessings',  lastName: 'Chinyama',  dob: '2009-09-20', gender: 'Male',   division: 'U-14', academyId: 1, position: 'Right Back',          status: 'Active',   nationality: 'Zambian',     seasonRating: 7.5, appearances: 16, goals: 0,  assists: 4,  tackles: 52, registeredDate: '2026-02-08' },
    { id: 35, prcId: 'ZF-2026-1101-JI', firstName: 'Joanna',     lastName: 'Imasiku',   dob: '2008-03-11', gender: 'Female', division: 'U-16', academyId: 1, position: 'Left Wing',           status: 'Active',   nationality: 'Zambian',     seasonRating: 7.9, appearances: 17, goals: 7,  assists: 6,  tackles: 18, registeredDate: '2026-02-08' },

    /* ── Zambezi Lions Academy ── */
    { id: 4,  prcId: 'ZF-2024-7234-LH', firstName: 'Leo',        lastName: 'Hernandez', dob: '2013-02-20', gender: 'Male',   division: 'U-12', academyId: 2, position: 'Central Midfield',    status: 'Pending',  nationality: 'Zimbabwean',  seasonRating: 7.1, appearances: 18, goals: 4,  assists: 9,  tackles: 51, registeredDate: '2024-01-15' },
    { id: 5,  prcId: 'ZF-2024-4481-NL', firstName: 'Natasha',    lastName: 'Lungu',     dob: '2010-09-15', gender: 'Female', division: 'U-14', academyId: 2, position: 'Left Wing',           status: 'Active',   nationality: 'Zambian',     seasonRating: 7.9, appearances: 19, goals: 6,  assists: 5,  tackles: 22, registeredDate: '2024-01-15' },
    { id: 6,  prcId: 'ZF-2024-2093-PZ', firstName: 'Peter',      lastName: 'Zulu',      dob: '2015-01-08', gender: 'Male',   division: 'U-10', academyId: 2, position: 'Centre Back',         status: 'Active',   nationality: 'Zambian',     seasonRating: null,appearances: 8,  goals: 0,  assists: 1,  tackles: 24, registeredDate: '2024-01-15' },
    { id: 36, prcId: 'ZF-2026-1102-EM', firstName: 'Emmanuel',   lastName: 'Mungungu',  dob: '2008-07-24', gender: 'Male',   division: 'U-16', academyId: 2, position: 'Central Midfield',    status: 'Active',   nationality: 'Zambian',     seasonRating: 7.7, appearances: 22, goals: 4,  assists: 9,  tackles: 48, registeredDate: '2026-02-08' },
    { id: 37, prcId: 'ZF-2026-1110-RC', firstName: 'Ronald',     lastName: 'Chibale',   dob: '2007-12-09', gender: 'Male',   division: 'U-18', academyId: 2, position: 'Centre Forward',      status: 'Active',   nationality: 'Zambian',     seasonRating: 8.0, appearances: 24, goals: 15, assists: 3,  tackles: 15, registeredDate: '2026-02-08' },

    /* ── Riverside United ── */
    { id: 7,  prcId: 'ZF-2024-6601-SO', firstName: 'Samuel',     lastName: 'Okoro',     dob: '2011-08-09', gender: 'Male',   division: 'U-14', academyId: 3, position: 'Centre Back',         status: 'Active',   nationality: 'Zambian',     seasonRating: 7.8, appearances: 20, goals: 2,  assists: 3,  tackles: 67, registeredDate: '2024-01-20' },
    { id: 8,  prcId: 'ZF-2024-1178-JP', firstName: 'Joshua',     lastName: 'Phiri',     dob: '2009-11-23', gender: 'Male',   division: 'U-16', academyId: 3, position: 'Right Back',          status: 'Active',   nationality: 'Zambian',     seasonRating: 7.5, appearances: 21, goals: 1,  assists: 4,  tackles: 72, registeredDate: '2024-01-20' },
    { id: 9,  prcId: 'ZF-2024-9043-GT', firstName: 'Grace',      lastName: 'Tembo',     dob: '2012-06-14', gender: 'Female', division: 'U-12', academyId: 3, position: 'Goalkeeper',          status: 'Pending',  nationality: 'Zambian',     seasonRating: null,appearances: 4,  goals: 0,  assists: 0,  tackles: 0,  registeredDate: '2024-01-20' },
    { id: 38, prcId: 'ZF-2026-1103-CM', firstName: 'Chibesa',    lastName: 'Mubanga',   dob: '2008-01-30', gender: 'Male',   division: 'U-16', academyId: 3, position: 'Centre Back',         status: 'Active',   nationality: 'Zambian',     seasonRating: 7.4, appearances: 20, goals: 1,  assists: 2,  tackles: 58, registeredDate: '2026-02-08' },
    { id: 39, prcId: 'ZF-2026-1111-EC', firstName: 'Enos',       lastName: 'Chileshe',  dob: '2008-06-17', gender: 'Male',   division: 'U-16', academyId: 3, position: 'Centre Back',         status: 'Active',   nationality: 'Zambian',     seasonRating: 7.3, appearances: 19, goals: 2,  assists: 1,  tackles: 55, registeredDate: '2026-02-08' },

    /* ── Luapula Stars ── */
    { id: 10, prcId: 'ZF-2024-7756-DM', firstName: 'Daniel',     lastName: 'Mulenga',   dob: '2017-04-30', gender: 'Male',   division: 'U-8',  academyId: 4, position: 'Centre Forward',      status: 'Active',   nationality: 'Zambian',     seasonRating: null,appearances: 6,  goals: 2,  assists: 0,  tackles: 5,  registeredDate: '2024-02-01' },
    { id: 11, prcId: 'ZF-2024-3312-FK', firstName: 'Faith',      lastName: 'Kapulu',    dob: '2015-08-19', gender: 'Female', division: 'U-10', academyId: 4, position: 'Right Midfield',      status: 'Active',   nationality: 'Zambian',     seasonRating: null,appearances: 9,  goals: 1,  assists: 3,  tackles: 12, registeredDate: '2024-02-01' },
    { id: 12, prcId: 'ZF-2024-8801-SC', firstName: 'Simon',      lastName: 'Chanda',    dob: '2012-12-05', gender: 'Male',   division: 'U-12', academyId: 4, position: 'Defensive Midfield',  status: 'Active',   nationality: 'Zambian',     seasonRating: 7.3, appearances: 15, goals: 1,  assists: 6,  tackles: 55, registeredDate: '2024-02-01' },
    { id: 40, prcId: 'ZF-2026-1104-HV', firstName: 'Henry',      lastName: 'Viuyi',     dob: '2007-11-06', gender: 'Male',   division: 'U-18', academyId: 4, position: 'Centre Forward',      status: 'Active',   nationality: 'Zambian',     seasonRating: 8.2, appearances: 23, goals: 18, assists: 4,  tackles: 14, registeredDate: '2026-02-08' },
    { id: 41, prcId: 'ZF-2026-1112-BM', firstName: 'Boyd',       lastName: 'Malambo',   dob: '2009-10-03', gender: 'Male',   division: 'U-14', academyId: 4, position: 'Right Wing',          status: 'Active',   nationality: 'Zambian',     seasonRating: 7.6, appearances: 20, goals: 8,  assists: 7,  tackles: 20, registeredDate: '2026-02-08' },

    /* ── Copperbelt Elite FC ── */
    { id: 13, prcId: 'ZF-2024-5523-VM', firstName: 'Victoria',   lastName: 'Mwamba',    dob: '2010-03-17', gender: 'Female', division: 'U-14', academyId: 5, position: 'Centre Forward',      status: 'Active',   nationality: 'Zambian',     seasonRating: 8.1, appearances: 20, goals: 12, assists: 4,  tackles: 15, registeredDate: '2024-01-25' },
    { id: 14, prcId: 'ZF-2024-6634-JM', firstName: 'James',      lastName: 'Mutale',    dob: '2008-07-25', gender: 'Male',   division: 'U-16', academyId: 5, position: 'Right Wing',          status: 'Pending',  nationality: 'Zambian',     seasonRating: null,appearances: 5,  goals: 1,  assists: 2,  tackles: 8,  registeredDate: '2024-01-25' },
    { id: 15, prcId: 'ZF-2024-2287-AN', firstName: 'Alice',      lastName: 'Nkonde',    dob: '2007-02-13', gender: 'Female', division: 'U-18', academyId: 5, position: 'Left Back',           status: 'Active',   nationality: 'Zambian',     seasonRating: 7.6, appearances: 22, goals: 0,  assists: 7,  tackles: 58, registeredDate: '2024-01-25' },
    { id: 42, prcId: 'ZF-2026-1105-SM', firstName: 'Sarudzai',   lastName: 'Masiliso',  dob: '2008-05-19', gender: 'Female', division: 'U-16', academyId: 5, position: 'Goalkeeper',          status: 'Active',   nationality: 'Zambian',     seasonRating: 7.8, appearances: 19, goals: 0,  assists: 0,  tackles: 0,  registeredDate: '2026-02-08' },
    { id: 43, prcId: 'ZF-2026-1113-DS', firstName: 'Daniel',     lastName: 'Sinyinza',  dob: '2009-04-21', gender: 'Male',   division: 'U-16', academyId: 5, position: 'Defensive Midfield',  status: 'Active',   nationality: 'Zambian',     seasonRating: 7.2, appearances: 18, goals: 1,  assists: 4,  tackles: 46, registeredDate: '2026-02-08' },

    /* ── Southern Cross Academy ── */
    { id: 16, prcId: 'ZF-2024-9910-MS', firstName: 'Michael',    lastName: 'Siame',     dob: '2014-10-01', gender: 'Male',   division: 'U-10', academyId: 6, position: 'Centre Back',         status: 'Active',   nationality: 'Zambian',     seasonRating: null,appearances: 7,  goals: 0,  assists: 1,  tackles: 18, registeredDate: '2024-02-05' },
    { id: 17, prcId: 'ZF-2024-4455-LP', firstName: 'Linda',      lastName: 'Phiri',     dob: '2012-04-28', gender: 'Female', division: 'U-12', academyId: 6, position: 'Attacking Midfield',  status: 'Active',   nationality: 'Zambian',     seasonRating: 7.0, appearances: 14, goals: 5,  assists: 3,  tackles: 21, registeredDate: '2024-02-05' },
    { id: 44, prcId: 'ZF-2026-1106-EW', firstName: 'Elizaberth', lastName: 'Mwaba',     dob: '2008-09-14', gender: 'Female', division: 'U-16', academyId: 6, position: 'Right Wing',          status: 'Active',   nationality: 'Zambian',     seasonRating: 7.5, appearances: 15, goals: 6,  assists: 5,  tackles: 16, registeredDate: '2026-02-08' },
    { id: 45, prcId: 'ZF-2026-1114-BW', firstName: 'Boldwin',    lastName: 'Mweemba',   dob: '2008-08-13', gender: 'Male',   division: 'U-16', academyId: 6, position: 'Left Back',           status: 'Active',   nationality: 'Zambian',     seasonRating: 7.4, appearances: 17, goals: 2,  assists: 5,  tackles: 50, registeredDate: '2026-02-08' },

    /* ── Kafue River Youth FC ── */
    { id: 18, prcId: 'ZF-2024-7723-CB', firstName: 'Charles',    lastName: 'Bwalya',    dob: '2016-11-15', gender: 'Male',   division: 'U-8',  academyId: 7, position: 'Goalkeeper',          status: 'Active',   nationality: 'Zambian',     seasonRating: null,appearances: 5,  goals: 0,  assists: 0,  tackles: 0,  registeredDate: '2024-02-10' },
    { id: 19, prcId: 'ZF-2024-1199-PM', firstName: 'Patricia',   lastName: 'Mbewe',     dob: '2015-03-07', gender: 'Female', division: 'U-10', academyId: 7, position: 'Left Midfield',       status: 'Pending',  nationality: 'Zambian',     seasonRating: null,appearances: 2,  goals: 0,  assists: 0,  tackles: 5,  registeredDate: '2024-02-10' },
    { id: 20, prcId: 'ZF-2024-3344-DN', firstName: 'David',      lastName: 'Nyambe',    dob: '2011-09-18', gender: 'Male',   division: 'U-14', academyId: 7, position: 'Centre Back',         status: 'Active',   nationality: 'Zambian',     seasonRating: 7.4, appearances: 18, goals: 3,  assists: 2,  tackles: 61, registeredDate: '2024-02-10' },
    { id: 46, prcId: 'ZF-2026-1107-MN', firstName: 'Mirriam',    lastName: 'Nauluta',   dob: '2009-04-02', gender: 'Female', division: 'U-14', academyId: 7, position: 'Attacking Midfield',  status: 'Active',   nationality: 'Zambian',     seasonRating: 7.6, appearances: 21, goals: 9,  assists: 11, tackles: 22, registeredDate: '2026-02-08' },

    /* ── North Star Elite ── */
    { id: 21, prcId: 'ZF-2024-8856-RC', firstName: 'Robert',     lastName: 'Chileshe',  dob: '2010-12-02', gender: 'Male',   division: 'U-14', academyId: 8, position: 'Central Midfield',    status: 'Active',   nationality: 'Zambian',     seasonRating: 8.0, appearances: 21, goals: 5,  assists: 10, tackles: 48, registeredDate: '2024-01-05' },
    { id: 22, prcId: 'ZF-2024-2231-EM', firstName: 'Esther',     lastName: 'Mutumba',   dob: '2009-05-20', gender: 'Female', division: 'U-16', academyId: 8, position: 'Right Wing',          status: 'Pending',  nationality: 'Zambian',     seasonRating: null,appearances: 3,  goals: 0,  assists: 1,  tackles: 7,  registeredDate: '2024-01-05' },
    { id: 23, prcId: 'ZF-2024-5512-IM', firstName: 'Isaac',      lastName: 'Moyo',      dob: '2012-08-31', gender: 'Male',   division: 'U-12', academyId: 8, position: 'Centre Forward',      status: 'Active',   nationality: 'Zambian',     seasonRating: 7.7, appearances: 17, goals: 8,  assists: 2,  tackles: 19, registeredDate: '2024-01-05' },
    { id: 24, prcId: 'ZF-2024-6678-AZ', firstName: 'Agnes',      lastName: 'Zimba',     dob: '2007-11-09', gender: 'Female', division: 'U-18', academyId: 8, position: 'Left Back',           status: 'Rejected', nationality: 'Zambian',     seasonRating: null,appearances: 0,  goals: 0,  assists: 0,  tackles: 0,  registeredDate: '2024-01-05' },
    { id: 25, prcId: 'ZF-2024-4490-KB', firstName: 'Kevin',      lastName: 'Banda',     dob: '2011-02-14', gender: 'Male',   division: 'U-14', academyId: 8, position: 'Defensive Midfield',  status: 'Pending',  nationality: 'Zambian',     seasonRating: null,appearances: 4,  goals: 0,  assists: 1,  tackles: 12, registeredDate: '2024-01-05' },
    { id: 47, prcId: 'ZF-2026-1108-KB', firstName: 'Kondwani',   lastName: 'Banda',     dob: '2008-08-28', gender: 'Male',   division: 'U-16', academyId: 8, position: 'Defensive Midfield',  status: 'Active',   nationality: 'Zambian',     seasonRating: 7.3, appearances: 18, goals: 1,  assists: 3,  tackles: 49, registeredDate: '2026-02-08' },
    { id: 48, prcId: 'ZF-2026-0001-CC', firstName: 'Choolwe',    lastName: 'Cheelo',    dob: '2005-06-04', gender: 'Male',   division: 'U-18', academyId: 8, position: 'Central Midfield',    status: 'Active',   nationality: 'Zambian',     seasonRating: 9.1, appearances: 26, goals: 10, assists: 14, tackles: 38, registeredDate: '2026-01-01', role: 'Admin' },
  ];

  /* ── Live Match ── */
  const liveMatch = {
    teamA: 'North Star Elite',
    teamB: 'Copperbelt Elite FC',
    scoreA: 2,
    scoreB: 1,
    matchType: 'League Match',
    updatedAt: '15:58',
    scorers: [
      { name: 'R. Chileshe', team: 'A', minute: 17 },
      { name: 'I. Moyo',     team: 'A', minute: 58 },
      { name: 'V. Mwamba',   team: 'B', minute: 34 },
    ],
  };

  /* ── Past Games ── */
  const games = [
    { id: 1, fixture: 'Victoria Falls FC vs Zambezi Lions Academy', date: '2024-10-05', score: '2–1', matchType: 'League Match', scorers: ['Marcus Thorne 23\'', 'Chanda Mwansa 67\'', 'Leo Hernandez 44\''] },
    { id: 2, fixture: 'Victoria Falls FC vs Riverside United',       date: '2024-09-28', score: '0–1', matchType: 'League Match', scorers: ['Samuel Okoro 71\''] },
    { id: 3, fixture: 'Victoria Falls FC vs Luapula Stars',          date: '2024-09-14', score: '3–3', matchType: 'Friendly',     scorers: ['Marcus Thorne 12\', 80\'', 'Chanda Mwansa 38\'', 'Daniel Mulenga 25\', 88\'', 'Simon Chanda 55\''] },
    { id: 4, fixture: 'Zambezi Lions Academy vs North Star Elite',   date: '2024-10-12', score: '1–0', matchType: 'Qualifier',    scorers: ['Natasha Lungu 62\''] },
    { id: 5, fixture: 'Riverside United vs Copperbelt Elite FC',     date: '2024-10-08', score: '2–2', matchType: 'League Match', scorers: ['Samuel Okoro 19\'', 'Joshua Phiri 73\'', 'Victoria Mwamba 45\', 81\''] },
    { id: 6, fixture: 'North Star Elite vs Kafue River Youth FC',    date: '2024-10-01', score: '4–1', matchType: 'League Match', scorers: ['Robert Chileshe 15\', 58\'', 'Isaac Moyo 33\', 76\'', 'David Nyambe 49\''] },
    { id: 7, fixture: 'Copperbelt Elite FC vs Southern Cross Academy', date: '2024-09-21', score: '3–0', matchType: 'Tournament', scorers: ['Victoria Mwamba 14\', 79\'', 'Alice Nkonde 41\''] },
    { id: 8, fixture: 'Luapula Stars vs Kafue River Youth FC',       date: '2024-09-15', score: '1–2', matchType: 'Friendly',     scorers: ['Simon Chanda 36\'', 'David Nyambe 22\', 84\''] },
  ];

  /* ── Live activity feed (dashboard) ── */
  const feed = [
    { icon: '✓', tone: 'feed-success', title: 'Choolwe Cheelo approved',            detail: 'by Admin John · 2m ago' },
    { icon: '✎', tone: 'feed-warning', title: 'North Star Elite profile updated',   detail: 'Sarah Munthali · 14m ago' },
    { icon: '＋', tone: 'feed-muted',   title: 'New registration: Henry Viuyi',      detail: 'Pending review · 45m ago' },
    { icon: '✓', tone: 'feed-success', title: 'Mirriam Nauluta approved',           detail: 'by Admin Grace · 1h ago' },
    { icon: '⚑', tone: 'feed-muted',   title: 'Match logged: North Star 2–1 Copperbelt', detail: 'League · 1h ago' },
  ];

  /* ── Critical dates ── */
  const criticalDates = [
    { month: 'May', day: '31', title: 'Registration Window Closes', sub: 'Season 2025/26 intake' },
    { month: 'Jun', day: '12', title: 'U-14 Regional Finals',        sub: 'Squad lists due' },
    { month: 'Jul', day: '05', title: 'Coaching Certification',      sub: 'Annual renewal deadline' },
  ];

  /* ── Division mix (league-wide) ── */
  const divisionMix = [
    { division: 'U-14', pct: 42 },
    { division: 'U-12', pct: 35 },
    { division: 'U-16', pct: 28 },
    { division: 'U-10', pct: 23 },
    { division: 'U-18', pct: 18 },
  ];

  /* ── Archive / Historical Hub ── */
  const archive = {
    established: 2012,
    graduates: 142,
    championships: 28,
    yearsActive: 14,
    /* The headline legend — rendered as the featured GOAT card. */
    legend: {
      name: 'Choolwe Cheelo',
      position: 'Central Midfield',
      status: 'Retired · 2012–2024',
      academy: 'North Star Elite',
      photo: '../assets/images/profile.jpg',
      blurb: 'Widely regarded as the greatest to ever grace the Zambezi Futures league. A generational midfielder who defined an era at North Star Elite — equal parts visionary playmaker and relentless competitor. Retired at the peak of the game with more silverware than any player in league history.',
      stats: { appearances: 312, goals: 148, assists: 176, trophies: 12 },
      awards: [
        'League MVP × 4', 'Player of the Season × 5', 'Golden Boot × 2',
        'Captain of the Decade', 'Most Assists (all-time)', 'Hall of Fame Inductee 2024',
      ],
    },
    hallOfFame: [
      { name: 'Ronald Chibale',   position: 'Centre Forward',     academy: 'Zambezi Lions Academy', award: 'Player of the Season', stats: { appearances: 148, goals: 96, assists: 31, trophies: 5 }, awards: ['Player of the Season', 'Golden Boot 2024', 'Top Scorer × 3'] },
      { name: 'Joanna Imasiku',   position: 'Left Wing',          academy: 'Victoria Falls FC',     award: 'Forward of the Year',  stats: { appearances: 132, goals: 71, assists: 58, trophies: 4 }, awards: ['Forward of the Year', 'Golden Boot U-16', "Fans' Player × 2"] },
      { name: 'Sarudzai Masiliso',position: 'Goalkeeper',         academy: 'Copperbelt Elite FC',   award: 'Golden Glove',         stats: { appearances: 140, goals: 0, assists: 2, trophies: 4, cleanSheets: 71 }, awards: ['Golden Glove × 2', 'Most Clean Sheets', 'Save of the Season'] },
      { name: 'Boyd Malambo',     position: 'Right Wing',         academy: 'Luapula Stars',         award: 'Most Improved Player', stats: { appearances: 118, goals: 52, assists: 47, trophies: 3 }, awards: ['Most Improved Player', 'Goal of the Season 2023'] },
      { name: 'Kondwani Banda',   position: 'Defensive Midfield', academy: 'North Star Elite',      award: 'Midfield Maestro',     stats: { appearances: 160, goals: 18, assists: 39, trophies: 6 }, awards: ['Midfield Maestro', 'Most Tackles × 3', 'Leadership Award'] },
      { name: 'Enos Chileshe',    position: 'Centre Back',        academy: 'Riverside United',      award: 'Defender of the Year', stats: { appearances: 155, goals: 9, assists: 12, trophies: 4 }, awards: ['Defender of the Year × 2', 'Wall of Steel Award'] },
      { name: 'Boldwin Mweemba',  position: 'Left Back',          academy: 'Southern Cross Academy',award: 'Fair Play Award',      stats: { appearances: 144, goals: 11, assists: 33, trophies: 3 }, awards: ['Fair Play Award', 'Club Captain × 4'] },
    ],
    tournaments: [
      { season: '2024/25', name: 'Zambezi Continental Cup',  winner: 'North Star Elite',    runnerUp: 'Copperbelt Elite FC',    topScorer: 'Henry Viuyi (18)' },
      { season: '2023/24', name: 'Youth Pro Shield',          winner: 'Copperbelt Elite FC', runnerUp: 'Victoria Falls FC',       topScorer: 'Victoria Mwamba (12)' },
      { season: '2022/23', name: 'Riverside Invitational',    winner: 'Zambezi Lions Academy', runnerUp: 'Riverside United',      topScorer: 'Ronald Chibale (15)' },
    ],
  };

  /* ── Helpers ── */
  function getAcademy(id)  { return academies.find(function (a) { return a.id === id; }); }
  function getPlayer(id)   { return players.find(function (p) { return p.id === Number(id); }); }
  function fullName(p)     { return p.firstName + ' ' + p.lastName; }

  function age(dob) {
    var today = new Date(), birth = new Date(dob);
    var a = today.getFullYear() - birth.getFullYear();
    var m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
    return a;
  }

  function formatDate(s) {
    var d = new Date(s);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  /* Summary stats (mirrors real system) */
  const stats = { totalPlayers: 5402, activeAcademies: 52, activeTeams: 200 };

  return { academies, players, liveMatch, games, stats, feed, criticalDates, divisionMix, archive, getAcademy, getPlayer, fullName, age, formatDate };
})();
