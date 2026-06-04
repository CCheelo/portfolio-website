/* ═══════════════════════════════════════════════════════════════
   EMH on LUSE — interactive demo · single data source.
   window.EMH_DATA holds the REAL figures from Choolwe Cheelo's
   final-year research (UNZA, Nov 2025). Edit THIS FILE ONLY to
   change data — every page reads from it.

   Sources (verified against `pdftotext -layout reports/emh-research-report.pdf`):
   · Descriptive stats  → Table A3.1
   · Ljung–Box ACF + p  → Table A3.3
   · Variance Ratio + Z → Table A3.4
   The registry is the 19 tickers that carry test results (A3.3/A3.4).
   AECI has descriptive stats but no test rows → omitted.
   ZMRE has test rows but no descriptive row → desc = null.
   ═══════════════════════════════════════════════════════════════ */
window.EMH_DATA = (function () {

  /* ── Study meta ── */
  var meta = {
    title:       'A Quantitative Assessment of Market Efficiency on LUSE',
    subtitle:    'Evidence from Econometric and Statistical Testing',
    author:      'Choolwe Cheelo',
    computerNo:  '2021541843',
    programme:   'BSc Actuarial Science · University of Zambia',
    supervisor:  'Dr T. Chowa',
    submitted:   'November 2025 · Lusaka',
    dataRange:   'Daily closing prices · Jan 2022 – Oct 2025',
    tools:       'R (primary) · Stata · 5% significance level',
    returnsDef:  'Log returns:  rₜ = ln(Pₜ / Pₜ₋₁)',
    sigLevel:    0.05,
    tradingDays: 950,          // ≈ weekday sessions over the window
    verdict:     'Partial weak-form inefficiency — "a market in transition"',
  };

  /* ── Market context (§2.2 — verified verbatim in the PDF) ── */
  var market = {
    indexFrom: 17000, indexTo: 25000, indexMonths: 10,   // All-Share Index surge
    tradesFrom: 5000, tradesFromYear: 2020,
    tradesTo: 31800,  tradesToYear: 2024,                // annual trade count growth
    listedCompanies: 20,
    tradingHours: '09:00–14:00',
    tradingSchedule: 'Weekdays only',
  };

  /* ── The three tests (methodology page) ── */
  var tests = [
    {
      key: 'runs', name: 'Runs Test', short: 'Runs',
      citation: 'Bradley (1968)',
      tagline: 'Are the +/− signs in a random order?',
      plain: 'A non-parametric test that counts "runs" — unbroken streaks of consecutive ' +
             'positive or negative returns — and compares the total against what a purely ' +
             'random series would produce. Too few or too many runs signals non-randomness.',
      formula: 'Z = (R − E[R]) / √Var(R),   E[R] = 2n₁n₂/(n₁+n₂) + 1',
      h0: 'H₀: the sequence of return signs is random.',
      note: 'In this study the Runs statistic returned NaN for the sampled stocks (degenerate ' +
            'sign distributions on thinly-traded series), so the verdict leans on the ACF and VR tests.',
    },
    {
      key: 'acf', name: 'Autocorrelation — Ljung–Box', short: 'Ljung–Box',
      citation: 'Ljung & Box (1978)',
      tagline: 'Does today’s return depend on yesterday’s?',
      plain: 'A joint test of whether autocorrelation exists across several lags at once. ' +
             'Significant autocorrelation means past returns carry information about future ' +
             'returns — a direct contradiction of the random walk.',
      formula: 'rₜ = μ + φ₁rₜ₋₁ + … + φₚrₜ₋ₚ + εₜ   ·   Q = n(n+2)Σ ρ²ₖ/(n−k)',
      h0: 'H₀: all autocorrelations φ = 0 (no serial dependence).',
      note: 'Significance band ≈ ±1.96/√n. A lag-1 ACF outside the band rejects the null.',
    },
    {
      key: 'vr', name: 'Variance Ratio', short: 'Variance Ratio',
      citation: 'Lo & MacKinlay (1988)',
      tagline: 'Does variance scale linearly with the horizon?',
      plain: 'Under a random walk the variance of k-period returns is exactly k times the ' +
             'one-period variance, so VR(k) = 1. Implemented manually in R for k = 2.',
      formula: 'VR(k) = Var(k-period return) / [ k · Var(1-period return) ]',
      h0: 'H₀: VR = 1.   VR > 1 ⇒ mean reversion · VR < 1 ⇒ momentum / serial dependence.',
      note: '|Z| > 1.96 rejects the null at 5%. Every sampled stock has VR ≪ 1, indicating momentum.',
    },
  ];

  /* ── Companies (registry = 19 tickers with test results) ──
     desc  : { mean, sd, skew, kurtosis }  (Table A3.1; null where the PDF has no row)
     ljungBox : { lag1Acf, p }             (Table A3.3)
     vr    : { vr, z }                      (Table A3.4)  */
  var companies = [
    { ticker: 'ATEL', name: 'Airtel Networks Zambia',            sector: 'Telecom',
      desc: { mean: 0.01036,   sd: 0.047209, skew: 5.850364,  kurtosis: 41.57714 },
      ljungBox: { lag1Acf: 0.1619,  p: 0.1470 }, vr: { vr: 0.2817, z: -6.3927 } },
    { ticker: 'BATA', name: 'Bata Shoe Company',                 sector: 'Consumer / Footwear',
      desc: { mean: 0.004647,  sd: 0.03114,  skew: 3.494445,  kurtosis: 31.83892 },
      ljungBox: { lag1Acf: 0.1931,  p: 0.0411 }, vr: { vr: 0.2459, z: -6.7114 } },
    { ticker: 'BATZ', name: 'British American Tobacco Zambia',   sector: 'Consumer Goods',
      desc: { mean: 0.011966,  sd: 0.041266, skew: 3.550226,  kurtosis: 15.70994 },
      ljungBox: { lag1Acf: 0.2266,  p: 0.0033 }, vr: { vr: 0.3533, z: -5.7554 } },
    { ticker: 'CECZ', name: 'Copperbelt Energy Corporation',     sector: 'Energy',
      desc: { mean: 0.01089,   sd: 0.040067, skew: 3.355849,  kurtosis: 17.80632 },
      ljungBox: { lag1Acf: 0.1830,  p: 0.2319 }, vr: { vr: 0.3041, z: -6.1932 } },
    { ticker: 'FQMZ', name: 'First Quantum Minerals',            sector: 'Mining',
      desc: { mean: 0.092695,  sd: 0.206401, skew: 2.224019,  kurtosis: 6.578549 },
      ljungBox: { lag1Acf: 0.2993,  p: 0.8853 }, vr: { vr: 0.2379, z: -1.8034 } },
    { ticker: 'INVE', name: 'Investrust Bank',                   sector: 'Banking',
      note: 'Defaulted / delisted 2023',
      desc: { mean: 0.004293,  sd: 0.027914, skew: 6.709766,  kurtosis: 47.90347 },
      ljungBox: { lag1Acf: -0.0241, p: 0.6646 }, vr: { vr: 0.1846, z: -5.6256 } },
    { ticker: 'MAFS', name: 'Madison Financial Services',        sector: 'Insurance & Finance',
      desc: { mean: -0.0016,   sd: 0.020298, skew: -13.6533,  kurtosis: 190.2098 },
      ljungBox: { lag1Acf: -0.0055, p: 1.0000 }, vr: { vr: 0.1977, z: -7.1397 } },
    { ticker: 'NATB', name: 'National Breweries',                sector: 'Consumer Staples',
      desc: { mean: -0.00566,  sd: 0.047684, skew: -9.80732,  kurtosis: 107.3301 },
      ljungBox: { lag1Acf: -0.0093, p: 0.0144 }, vr: { vr: 0.1393, z: -7.6598 } },
    { ticker: 'PMDZ', name: 'Pamodzi Hotels Plc',                sector: 'Hospitality',
      desc: { mean: 0.00984,   sd: 0.127253, skew: 13.08462,  kurtosis: 179.9174 },
      ljungBox: { lag1Acf: -0.0066, p: 1.0000 }, vr: { vr: 0.1944, z: -7.1691 } },
    { ticker: 'PUMA', name: 'Puma Energy Zambia',                sector: 'Energy',
      desc: { mean: 0.006451,  sd: 0.057325, skew: 0.681353,  kurtosis: 22.79378 },
      ljungBox: { lag1Acf: -0.1188, p: 0.2060 }, vr: { vr: 0.1383, z: -7.6683 } },
    { ticker: 'REIZ', name: 'Real Estate Investments Zambia',    sector: 'Real Estate',
      desc: { mean: 0.003807,  sd: 0.096655, skew: -6.66561,  kurtosis: 79.08212 },
      ljungBox: { lag1Acf: -0.0543, p: 0.9813 }, vr: { vr: 0.1825, z: -7.2752 } },
    { ticker: 'SCBL', name: 'Standard Chartered Bank Zambia',    sector: 'Banking',
      desc: { mean: 0.003886,  sd: 0.064026, skew: 0.611187,  kurtosis: 12.19177 },
      ljungBox: { lag1Acf: -0.1883, p: 0.0037 }, vr: { vr: 0.1911, z: -7.1991 } },
    { ticker: 'SHOP', name: 'Shoprite Holdings',                 sector: 'Retail',
      desc: { mean: 0.008581,  sd: 0.047021, skew: 5.855064,  kurtosis: 46.38376 },
      ljungBox: { lag1Acf: 0.1499,  p: 0.0001 }, vr: { vr: 0.2686, z: -6.5089 } },
    { ticker: 'ZABR', name: 'Zambia Breweries',                  sector: 'Consumer Staples',
      desc: { mean: 0.000111,  sd: 0.022417, skew: 0.039979,  kurtosis: 32.54153 },
      ljungBox: { lag1Acf: -0.1785, p: 0.0859 }, vr: { vr: 0.1062, z: -7.9543 } },
    { ticker: 'ZCCM', name: 'ZCCM Investments Holdings',         sector: 'Mining Investment',
      desc: { mean: 0.007326,  sd: 0.036132, skew: 2.579754,  kurtosis: 18.53469 },
      ljungBox: { lag1Acf: 0.0224,  p: 0.0401 }, vr: { vr: 0.2064, z: -7.0626 } },
    { ticker: 'ZFCO', name: 'Zambia Forestry & Forest Industries Corp', sector: 'Forestry',
      desc: { mean: 0.002882,  sd: 0.020175, skew: 7.647227,  kurtosis: 74.48414 },
      ljungBox: { lag1Acf: -0.0544, p: 0.9746 }, vr: { vr: 0.1751, z: -7.3408 } },
    { ticker: 'ZMBF', name: 'Zambeef Products',                  sector: 'Agribusiness',
      desc: { mean: 0.001637,  sd: 0.04602,  skew: 1.298736,  kurtosis: 23.19853 },
      ljungBox: { lag1Acf: 0.2420,  p: 0.0341 }, vr: { vr: 0.2928, z: -6.2939 } },
    { ticker: 'ZMFA', name: 'Zambia Metal Fabricators',          sector: 'Manufacturing',
      desc: { mean: 0.013259,  sd: 0.051228, skew: 4.675294,  kurtosis: 27.39571 },
      ljungBox: { lag1Acf: 0.5850,  p: 0.0000 }, vr: { vr: 0.5603, z: -3.9135 } },
    { ticker: 'ZMRE', name: 'Zambia Reinsurance Plc',            sector: 'Insurance',
      desc: null,   /* no descriptive-stats row in Table A3.1 */
      ljungBox: { lag1Acf: -0.3390, p: 0.0015 }, vr: { vr: 0.0800, z: -8.1873 } },
  ];

  /* ── Derived per-stock verdict (§2.7 — computed, reproducible) ──
     Rejects the random walk if Ljung–Box p < 0.05 OR |VR Z| > 1.96. */
  var SIG = meta.sigLevel, Z_CRIT = 1.96;
  function rejectsACF(c) { return c.ljungBox && c.ljungBox.p < SIG; }
  function rejectsVR(c)  { return c.vr && Math.abs(c.vr.z) > Z_CRIT; }
  function rejectsRandomWalk(c) { return rejectsACF(c) || rejectsVR(c); }
  function computeVerdict(c) { return rejectsRandomWalk(c) ? 'inefficient' : 'efficient'; }

  companies.forEach(function (c) {
    c.rejectsACF = rejectsACF(c);
    c.rejectsVR  = rejectsVR(c);
    c.rejects    = rejectsRandomWalk(c);
    c.verdict    = computeVerdict(c);     // 'inefficient' | 'efficient'
  });

  /* ── Aggregate summary (drives dashboard headline numbers) ── */
  function summary() {
    var n = companies.length;
    var acf = companies.filter(rejectsACF).length;
    var vr  = companies.filter(rejectsVR).length;
    var ineff = companies.filter(function (c) { return c.verdict === 'inefficient'; }).length;
    return {
      total: n,
      acfReject: acf,            acfPct: Math.round(acf / n * 100),
      vrReject: vr,              vrPct:  Math.round(vr / n * 100),
      runsReject: 0,             runsPct: 0,          // Runs statistic was NaN across the sample
      inefficient: ineff,        efficient: n - ineff,
      inefficientPct: Math.round(ineff / n * 100),
    };
  }

  /* ── Findings & recommendations (§2.8 — methodology closing section) ── */
  var findings = {
    conclusion:
      'The collective evidence from the Runs, Autocorrelation (Ljung–Box) and Variance ' +
      'Ratio tests gives a partial rejection of weak-form efficiency. Short-term dependence ' +
      'clearly exists — significant lag-1/2 autocorrelation and variance ratios far below ' +
      'unity — but it weakens at longer horizons, so the inefficiency is mild and transient. ' +
      'LUSE is best described as maturing, not failing.',
    context:
      'This is consistent with findings on other African and frontier markets ' +
      '(Mlambo & Biekpe, 2007; Appiah-Kusi & Menyah, 2003): thin trading and slow information ' +
      'diffusion create exploitable but shrinking short-horizon patterns.',
    recommendations: [
      { group: 'Investors & Asset Managers',
        text: 'Short-term technical / momentum strategies may yield transient gains, but should ' +
              'be combined with fundamentals and diversification — these opportunities shrink ' +
              'as the market matures.' },
      { group: 'Government',
        text: 'Strengthen regulation and disclosure enforcement, promote financial literacy, and ' +
              'encourage more listings (privatization / PPPs) to deepen liquidity.' },
      { group: 'LUSE',
        text: 'Modernize trading systems, provide real-time market data, and support market-making ' +
              'to reduce thinness and improve price discovery.' },
      { group: 'Institutional Investors (NAPSA, PIA, pensions, insurers)',
        text: 'Raise domestic equity allocation, engage in active governance, and pursue ' +
              'research-based strategies rather than passive thin-market exposure.' },
    ],
  };

  /* ── Honesty note (baked into the UI) ── */
  var honesty =
    'Real estimates (mean, SD, skewness, kurtosis, ACF, VR, Z, p) are shown as-is from the report. ' +
    'Any drawn path — price walks, full ACF lag profiles, return histograms, VR-vs-k curves — ' +
    'is simulated from each stock’s real estimated parameters with a seeded RNG, and labelled ' +
    '“simulated from estimated parameters.” Nothing illustrative is presented as raw data.';

  /* ── Helpers ── */
  function getCompany(ticker) {
    if (!ticker) return null;
    var t = String(ticker).toUpperCase();
    return companies.find(function (c) { return c.ticker === t; }) || null;
  }
  function sectors() {
    var seen = {};
    companies.forEach(function (c) { seen[c.sector] = true; });
    return Object.keys(seen).sort();
  }
  function fmt(v, dp) {
    if (v === null || v === undefined || isNaN(v)) return '—';
    return Number(v).toFixed(dp === undefined ? 4 : dp);
  }

  return {
    meta: meta, market: market, tests: tests, companies: companies,
    findings: findings, honesty: honesty,
    getCompany: getCompany, sectors: sectors, summary: summary, fmt: fmt,
    rejectsACF: rejectsACF, rejectsVR: rejectsVR, rejectsRandomWalk: rejectsRandomWalk,
  };
})();
