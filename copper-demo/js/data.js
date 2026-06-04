/* ═══════════════════════════════════════════════════════════════
   Copper · Forecast Lab — single data source (window.COPPER_DATA).
   Every figure below is taken verbatim from the project report
   (reports/copper-forecasting-report.pdf), verified with
   `pdftotext -layout`. Edit THIS FILE ONLY to change data — all
   pages read from it.

   HONESTY: these are the real point estimates. Any DRAWN path in the
   demo (price series, return paths, conditional-volatility curve,
   backtest, histograms) is SIMULATED from these estimates with the
   seeded RNG in app.js and labelled "simulated from estimated
   parameters". See COPPER_DATA.honesty.
   ═══════════════════════════════════════════════════════════════ */
window.COPPER_DATA = (function () {

  var meta = {
    title: 'Forecasting Daily Copper Prices',
    subtitle: 'Box–Jenkins ARMA and an ARMA–GARCH extension',
    author: 'Choolwe Cheelo',
    programme: 'BSc Actuarial Science · University of Zambia',
    tool: 'R (forecast · rugarch · tseries)',
    nObs: 6298,
    dataRange: 'Daily · Dec 2000 – May 2025',
    unit: 'US$ / tonne',
    returnsDef: 'Log returns:  rₜ = ln(Pₜ / Pₜ₋₁)',
    sigLevel: 0.05,
    yearsSpan: 25,
    verdict: 'Direction unforecastable · risk persistent & modellable',
  };

  /* Price-series landmarks (for the simulated hero path; endpoints/peak are real). */
  var series = {
    startYear: 2000, endYear: 2025,
    startPrice: 1800, peakPrice: 10800,
    landmarks: [
      { year: 2008, label: '2008 crisis crash' },
      { year: 2011, label: '2011 super-cycle peak' },
      { year: 2020, label: '2020 COVID shock' },
      { year: 2022, label: '2022 spike & pull-back' },
    ],
  };

  /* ── Stationarity (ADF / KPSS) — § 3.2 / Appendix A.1 ── */
  var stationarity = {
    level: {
      adf:  { stat: -2.48, lag: 18, p: 0.38, rejects: false },   // unit root NOT rejected
      kpss: { p: 0.01, rejects: true },                          // stationarity rejected
      stationary: false,
    },
    returns: {
      adf:  { stat: -16.8, lag: 18, p: 0.01, rejects: true },    // unit root rejected
      kpss: { stat: 0.148, p: 0.10, rejects: false },            // stationarity NOT rejected
      stationary: true,
    },
  };

  /* ── BIC grid search over ARMA(p,q) — § 3.3 (top 8 by BIC) ── */
  var bicGrid = [
    { p: 2, q: 0, aic: 24715, bic: 24742, selected: true },
    { p: 0, q: 2, aic: 24717, bic: 24744 },
    { p: 0, q: 3, aic: 24717, bic: 24751 },
    { p: 1, q: 2, aic: 24717, bic: 24751 },
    { p: 2, q: 1, aic: 24717, bic: 24751 },
    { p: 3, q: 0, aic: 24717, bic: 24751 },
    { p: 0, q: 4, aic: 24718, bic: 24759 },
    { p: 4, q: 0, aic: 24719, bic: 24760 },
  ];

  /* ── Selected mean model: ARMA(2,0) coefficients — § 3.4 ── */
  var ar2 = {
    label: 'ARMA(2,0)',
    coef: [
      { name: 'ar1',       est: -0.0806, se: 0.0126, z: -6.42, p: 1.3e-10, sig: true },
      { name: 'ar2',       est: -0.0847, se: 0.0126, z: -6.74, p: 1.5e-11, sig: true },
      { name: 'intercept', est:  0.0263, se: 0.0186, z:  1.41, p: 0.16,    sig: false },
    ],
  };

  /* ── ARMA(2,0) residual diagnostics — § 3.5 ── */
  var diagnostics = {
    lbResid:   { lag: 20, x2: 26.1, df: 18, p: 0.097, label: 'Ljung–Box (residuals)',           clean: true },
    lbSqResid: { lag: 20, x2: 1222, df: 20, p: 2e-16, pText: '< 2e-16', label: 'Ljung–Box (squared resid.)', clean: false },
    archLm:    { lag: 12, x2: 1534, df: 12, p: 2e-16, pText: '< 2e-16', label: 'ARCH-LM',          clean: false },
  };

  /* ── Out-of-sample backtest (final 252 trading days) — Table 1 ── */
  var backtest = {
    holdout: 252,
    arma: { rmse: 118.33, mae: 86.17 },
    rw:   { rmse: 117.68, mae: 84.87 },
    directionPct: 49.2,   // AR(2) calls next-day direction right only 49.2% of the time
    beatsRandomWalk: false,
  };

  /* ── ARMA(2,0)-GARCH(1,1)-t coefficients — § 4.2 ── */
  var garch = {
    label: 'ARMA(2,0)-GARCH(1,1)-t',
    coef: [
      { name: 'mu',     est:  0.023655, se: 0.013756, t:  1.72,  p: 0.0855 },
      { name: 'ar1',    est: -0.061497, se: 0.012515, t: -4.91,  p: 1e-6 },
      { name: 'ar2',    est: -0.001257, se: 0.012415, t: -0.10,  p: 0.9194 },
      { name: 'omega',  est:  0.079965, se: 0.017305, t:  4.62,  p: 4e-6 },
      { name: 'alpha1', est:  0.105385, se: 0.013485, t:  7.81,  p: 0 },
      { name: 'beta1',  est:  0.868396, se: 0.016901, t: 51.38,  p: 0 },
      { name: 'shape',  est:  4.575965, se: 0.284070, t: 16.11,  p: 0 },
    ],
    omega: 0.079965,
    alpha1: 0.105385,
    beta1: 0.868396,
    persistence: 0.9738,   // alpha1 + beta1
    shape: 4.58,           // Student-t degrees of freedom (heavy tails)
  };

  /* ── Model comparison — Table 2 ── */
  var modelCompare = [
    { name: 'ARMA(2,0)',              k: 4, logLik: -12354, aic: 24715, bic: 24742, archLmP: 2.2e-321, archLmText: '2.2e-321', clean: false },
    { name: 'ARMA(2,0)-GARCH(1,1)-t', k: 7, logLik: -10906, aic: 21825, bic: 21872, archLmP: 1,         archLmText: '1',        clean: true },
  ];
  var bicDrop = 24742 - 21872;   // 2,870

  /* ── GARCH standardised-residual diagnostics — Appendix A.3 ── */
  var garchDiag = {
    lbStd:   { lag: 20, x2: 24.4, df: 20, p: 0.22, label: 'Ljung–Box (std. resid.)',      clean: true },
    lbSqStd: { lag: 20, x2: 1.43, df: 20, p: 1.00, label: 'Ljung–Box (sq. std. resid.)',  clean: true },
    archLm:  { lag: 12, x2: 1.21, df: 12, p: 1.00, label: 'ARCH-LM',                       clean: true },
  };

  /* ── Findings ── */
  var findings = {
    conclusion:
      'Copper’s price level behaves like a near-random walk: the ARMA(2,0) mean model is ' +
      'statistically significant in sample, yet out of sample it does not beat a naive ' +
      'random-walk forecast (RMSE 118.33 vs 117.68) and calls the next day’s direction ' +
      'correctly only 49.2% of the time — no better than a coin toss. The price level is ' +
      'essentially unforecastable, consistent with weak-form efficiency.',
    twist:
      'The variance, by contrast, is strongly and persistently predictable. The AR(2) ' +
      'residuals fail decisively on volatility clustering and heavy tails, so the model is ' +
      'extended to ARMA(2,0)-GARCH(1,1) with Student-t innovations. This slashes the BIC ' +
      'from 24,742 to 21,872, eliminates the ARCH from the standardised residuals, and ' +
      'recovers the stylised facts of commodity returns: volatility persistence of 0.974 ' +
      'and tails near 4.6 degrees of freedom.',
    whyMatters:
      'For a copper-dependent economy, knowing that the price level follows a near-random ' +
      'walk while its volatility is persistent has real implications: forecasting effort is ' +
      'better spent on risk and scenario analysis than on chasing point forecasts, and the ' +
      'persistence of volatility shocks strengthens the case for fiscal stabilisation buffers.',
    recommendations: [
      { group: 'Forecasters & Analysts', text: 'Don’t chase point forecasts of the level — for one-step-ahead direction, a random walk is the benchmark to beat, and it’s hard to beat. Model the variance instead.' },
      { group: 'Risk & Treasury', text: 'Use the GARCH conditional volatility for honest, time-varying forecast intervals and accurate value-at-risk — risk that the constant-variance ARMA understates in turbulent periods.' },
      { group: 'Policymakers', text: 'Volatility persistence of 0.974 means price shocks are protracted, not transient — a quantitative case for copper-revenue stabilisation buffers and scenario planning.' },
      { group: 'Researchers', text: 'Extend with regime-switching or GARCH-in-mean, and test multivariate links to the kwacha and the fiscal balance, where copper volatility transmits.' },
    ],
  };

  var honesty =
    'Real point estimates — ARMA & GARCH coefficients, RMSE/MAE, BIC, volatility persistence ' +
    'and the Student-t degrees of freedom — are shown exactly as reported in the study. Any ' +
    'drawn path (the 2000–2025 price series, simulated return paths, the conditional-volatility ' +
    'curve, the backtest window and the histograms) is simulated from those real estimated ' +
    'parameters with a deterministic seeded RNG and labelled accordingly.';

  function fmt(v, dp) {
    if (v == null || isNaN(v)) return '—';
    return Number(v).toFixed(dp == null ? 2 : dp);
  }
  /* compact p-value formatting */
  function fmtP(p, text) {
    if (text) return text;
    if (p == null) return '—';
    if (p < 1e-4) return p.toExponential(1).replace('e', 'e');
    return p.toFixed(p < 0.01 ? 4 : 3);
  }

  return {
    meta: meta,
    series: series,
    stationarity: stationarity,
    bicGrid: bicGrid,
    ar2: ar2,
    diagnostics: diagnostics,
    backtest: backtest,
    garch: garch,
    modelCompare: modelCompare,
    bicDrop: bicDrop,
    garchDiag: garchDiag,
    findings: findings,
    honesty: honesty,
    fmt: fmt,
    fmtP: fmtP,
  };
})();
