# EMH Interactive Demo Sub-App — Build Spec (`emh-demo/`)

> **Portable handoff doc.** Self-contained: all report data is baked in below so you can build this
> from scratch without re-opening the PDF. To continue at home: have me copy this file into the repo
> as `emh-demo-SPEC.md` (so it commits + syncs), then say "build it" / "start phase 1".

---

## 1. Context

Choolwe's final-year actuarial research — *"A Quantitative Assessment of Market Efficiency on
LUSE: Evidence from Econometric and Statistical Testing"* (University of Zambia, Nov 2025) — tested
**weak-form efficiency** on the Lusaka Securities Exchange using the **Runs**, **Ljung–Box (ACF)**,
and **Variance Ratio** tests on ~20 listed stocks (daily closing prices, Jan 2022–Oct 2025, run in R
at 5% significance). Today it appears in the portfolio only as a static page
([project-emh.html](project-emh.html)) plus the 33-page PDF in `reports/`.

The PRC project has a polished interactive companion at `prc-demo/`. **Goal:** give EMH the same
treatment — a **self-contained interactive mini-site at `emh-demo/`** that lets a visitor *explore* the
market context, per-stock test results, the three methods, and the "partial inefficiency" verdict,
driven by the **real figures from the report**.

**Decisions locked with owner:**
- **Charts:** Chart.js via CDN (same CDN precedent as Bootstrap in `prc-demo`).
- **Scope:** Focused — 4 nav destinations / 5 HTML files (per-stock profile is a detail page, not a
  nav item — exactly like `prc-demo`'s `player.html`).

**Architecture rule:** `emh-demo/` is a **separate sub-app**. It does NOT use `css/main.css` or
`js/main.js`. It mirrors `prc-demo/`'s architecture: own design system (`css/emh.css`), single data
source (`js/data.js` → `window.EMH_DATA`), and `js/app.js` that injects shared nav/footer + runs
animations + exposes helpers.

---

## 2. The real data (source of truth for `js/data.js`)

### 2.1 Study meta
| Field | Value |
|---|---|
| Title | A Quantitative Assessment of Market Efficiency on LUSE |
| Author | Choolwe Cheelo (Computer No. 2021541843) |
| Programme | BSc Actuarial Science, University of Zambia |
| Supervisor | Dr T. Chowa |
| Submitted | November 2025, Lusaka |
| Data | Daily closing prices, Jan 2022 – Oct 2025 |
| Tools | R (primary), Stata; 5% significance level |
| Returns | Log returns: `r_t = ln(P_t / P_{t-1})` |
| **Verdict** | **Partial weak-form inefficiency — "a market in transition"** |

### 2.2 Market context (for hero count-ups + dashboard market chart)
- LUSE All-Share Index: **≈ 17,000 → 25,000 pts in ~10 months**.
- Trading volume: **< 5,000 trades (2020) → 31,800+ trades (2024)**.
- **20** listed companies; trading **09:00–14:00**, weekdays only.

### 2.3 Ljung–Box test — lag-1 ACF + p-value (REAL, clean from Table A3.3)
p < 0.05 ⇒ significant autocorrelation ⇒ rejects random walk.

| Ticker | Lag1 ACF | p-value |
|---|---|---|
| ATEL | 0.1619 | 0.1470 |
| BATA | 0.1931 | 0.0411 |
| BATZ | 0.2266 | 0.0033 |
| CECZ | 0.1830 | 0.2319 |
| FQMZ | 0.2993 | 0.8853 |
| INVE | −0.0241 | 0.6646 |
| MAFS | −0.0055 | 1.0000 |
| NATB | −0.0093 | 0.0144 |
| PMDZ | −0.0066 | 1.0000 |
| PUMA | −0.1188 | 0.2060 |
| REIZ | −0.0543 | 0.9813 |
| SCBL | −0.1883 | 0.0037 |
| SHOP | 0.1499 | 0.0001 |
| ZABR | −0.1785 | 0.0859 |
| ZCCM | 0.0224 | 0.0401 |
| ZFCO | −0.0544 | 0.9746 |
| ZMBF | 0.2420 | 0.0341 |
| ZMFA | 0.5850 | 0.0000 |
| ZMRE | −0.3390 | 0.0015 |

### 2.4 Variance Ratio test — VR + Z (REAL, from Table A3.4)
Random walk ⇒ VR = 1. All VR ≪ 1 with large negative Z ⇒ strong rejection (momentum/serial dep).
|Z| > 1.96 ⇒ significant.

| Ticker | VR | Z |
|---|---|---|
| ATEL | 0.2817 | −6.39 |
| BATA | 0.2459 | −6.71 |
| BATZ | 0.3533 | −5.76 |
| CECZ | 0.3041 | −6.19 |
| FQMZ | 0.2379 | −1.80 |
| INVE | 0.1846 | −5.63 |
| MAFS | 0.1977 | −7.14 |
| NATB | 0.1393 | −7.66 |
| PMDZ | 0.1944 | −7.17 |
| PUMA | 0.1383 | −7.67 |
| REIZ | 0.1825 | −7.28 |
| SCBL | 0.1911 | −7.20 |
| SHOP | 0.2686 | −6.51 |
| ZABR | 0.1062 | −7.95 |
| ZCCM | 0.2064 | −7.06 |
| ZFCO | 0.1751 | −7.34 |
| ZMBF | 0.2928 | −6.29 |
| ZMFA | 0.5603 | −3.91 |
| ZMRE | 0.0800 | −8.19 |

### 2.5 Descriptive stats — mean / SD / skewness / kurtosis (REAL, Table A3.1)
⚠ The PDF wrapped some cells; values below are best-effort reconciled. **Re-verify against
`pdftotext -layout reports/emh-research-report.pdf` during build** before committing.

| Ticker | Mean | SD | Skew | Kurtosis |
|---|---|---|---|---|
| AECI | 0.007107 | 0.039714 | 3.9338 | 21.994 |
| ATEL | 0.01036 | 0.047209 | 5.8504 | 41.577 |
| BATA | 0.004647 | 0.03114 | 3.4944 | 31.839 |
| BATZ | 0.011966 | 0.041266 | 3.5502 | 15.710 |
| CECZ | 0.01089 | 0.040067 | 3.3558 | 17.806 |
| FQMZ | 0.092695 | 0.206401 | 2.2240 | 6.5785 |
| INVE | 0.004293 | 0.027914 | 6.7098 | 47.903 |
| MAFS | −0.0016 | 0.020298 | −13.653 | 190.21 |
| NATB | −0.00566 | 0.047684 | −9.8073 | 107.33 |
| PMDZ | 0.00984 | 0.127253 | 13.085 | 179.92 |
| PUMA | 0.006451 | 0.057325 | 0.6814 | 22.794 |
| REIZ | 0.003807 | 0.096655 | −6.6656 | 79.082 |
| SCBL | 0.003886 | 0.064026 | 0.6112 | 12.192 |
| SHOP | 0.008581 | 0.047021 | 5.8551 | 46.384 |
| ZABR | 0.000111 | 0.022417 | 0.0400 | 32.542 |
| ZCCM | 0.007326 | 0.036132 | 2.5798 | 18.535 |
| ZFCO | 0.002882 | 0.020175 | 7.6472 | 74.484 |
| ZMBF | 0.001637 | 0.04602 | 1.2987 | 23.199 |
| ZMFA | 0.013259 | 0.051228 | 4.6753 | 27.396 |

Takeaway for UI copy: returns are **non-normal — heavily skewed and leptokurtic** (Jarque–Bera
rejected normality for all stocks), typical of thin frontier markets.

### 2.6 Companies + sectors (Table A1.1) — for registry + filters
ZANACO (Banking) · Copperbelt Energy CEC (Energy) · ZAFFICO/ZFCO (Forestry) · Madison
Financial MAFS (Insurance & Finance) · BAT Zambia BATZ (Consumer Goods) · PUMA Energy
(Energy) · National Breweries NATB (Consumer Staples) · Lafarge Zambia (Construction Materials) ·
Standard Chartered SCBL (Banking) · Zambeef ZMBF (Agribusiness) · Zambia Sugar
(Manufacturing) · First Quantum FQMZ (Mining) · AECI Mining Explosives (Mining/Manufacturing) ·
REIZ (Real Estate) · Pamodzi Hotels PMDZ (Hospitality) · Airtel ATEL (Telecom) · ZCCM-IH
(Mining Investment) · Investrust INVE (Banking — defaulted/delisted 2023) · Shoprite SHOP
(Retail) · Bata BATA (Consumer/Footwear) · Zambia Breweries ZABR (Consumer Staples) · Zambia
Metal Fabricators ZMFA (Manufacturing) · Zambia Reinsurance ZMRE (Insurance).
> Use the tickers that have test results (§2.3/2.4) as the canonical registry; sectors above. A few
> names in A1.1 (ZANACO, Lafarge, Zambia Sugar) lack test rows — omit or mark "not tested".

### 2.7 Derived per-stock verdict (computed in `data.js`, not stored)
Rule: a stock **rejects random walk** if `ljungBox.p < 0.05` **OR** `|VR.z| > 1.96`.
- `inefficient` → rejects (this is most stocks — VR Z is hugely significant nearly everywhere).
- `efficient` → fails to reject on both.
- `inconclusive` → Runs test NaN / borderline only.

This makes the dashboard "% rejecting random walk" counts honest and reproducible.

### 2.8 Findings & recommendations (for methodology.html closing section)
**Conclusion:** Collective evidence (Runs + ACF + VR) gives a **partial rejection of weak-form
EMH**. Short-term dependence exists (significant lag-1/2 ACF, VR ≪ 1) but weakens at longer
horizons → inefficiency is **mild and transient**; LUSE is **maturing, not failing**. Consistent with
other African/frontier markets (Mlambo & Biekpe 2007; Appiah-Kusi & Menyah 2003).

**Recommendations (group by stakeholder):**
- *Investors / asset managers:* short-term technical/momentum strategies may yield transient gains,
  but combine with fundamentals + diversification; opportunities shrink as market matures.
- *Government:* strengthen regulation/disclosure enforcement; promote financial literacy; encourage
  more listings (privatization/PPPs) to deepen liquidity.
- *LUSE:* modernize trading systems, real-time data, market-making to cut thinness.
- *Institutional investors (NAPSA, PIA, pensions, insurers):* raise domestic equity allocation; active
  governance engagement; research-based strategies.

### 2.9 The three tests (for methodology page — formula blocks)
1. **Runs Test** (Bradley 1968) — non-parametric; counts runs of consecutive +/− returns vs what a
   random series would produce. Excess/too-few runs ⇒ non-random.
2. **Autocorrelation / Ljung–Box** (Ljung & Box 1978) — joint test of autocorrelation across lags.
   `r_t = μ + φ₁r_{t-1} + … + φ_p r_{t-p} + ε_t`; H₀: all φ = 0. Q-statistic. 95% band ≈ ±1.96/√n.
3. **Variance Ratio** (Lo & MacKinlay 1988) — VR(k) = Var(k-period return) / [k·Var(1-period)].
   H₀: VR = 1 (random walk). VR > 1 ⇒ mean reversion; VR < 1 ⇒ momentum. Implemented
   manually in R.

### 2.10 Honesty note (bake into UI)
Real **estimates** (mean, SD, skew, kurtosis, ACF, VR, Z, p) are shown as-is. Any drawn **path**
(price walks, full ACF lag profiles, return histograms, VR-vs-k curves) is **simulated from each
stock's real estimated parameters** with a seeded RNG and **labelled "simulated from estimated
parameters."** Nothing illustrative is presented as raw data.

---

## 3. Files to create (all under `portfolio-website/emh-demo/`)

### `emh-demo/css/emh.css`
Whole design system + animations. **Theme:** dark analytical "market terminal" echoing
[assets/images/project-emh.svg](assets/images/project-emh.svg): bg `#0f172a`, panel `#1a2540`,
accent orange `#c2410c`, text slate/cream, green `#16a34a` / red `#dc2626` for efficient/inefficient.
**Fonts:** Inter (text) + a monospace (IBM Plex Mono or JetBrains Mono via Google Fonts) for all
figures + tickers. Include: `.reveal`/`.is-visible` scroll-reveal, `.fade-in-up`, count-up stat cards,
hover-lift cards, status/sector badges, registry table styles, chart-panel cards, methodology formula
blocks. Responsive: stack ≤768px.

### `emh-demo/js/data.js`
`window.EMH_DATA = { meta, market, tests[3], companies[], findings }`. `companies[]` carries the real
figures from §2.3–2.6 + a computed `verdict` (§2.7). Pattern mirrors `prc-demo/js/data.js`. **Edit
this file only** to change data.

### `emh-demo/js/app.js`
Mirror `prc-demo/js/app.js`: `NAV` array injects navbar+footer into
`#navbarContainer`/`#footerContainer`; active link via `<body data-page="…">`; scroll-reveal +
count-up + chart reveal-on-scroll; `window.EMH` helpers: `statusBadge`, `sectorBadge`,
`tickerAvatar`, `getQueryParam`, `animateCount`, **seeded RNG** `seededReturns(mean, sd, n, seed)`,
and Chart.js factories `priceWalkChart`, `acfChart`, `vrCurveChart`, `histogramChart`,
`testSummaryBars`, `vrScatter`. Set Chart.js dark-theme defaults once here.

### Pages (each: `css/emh.css` + Chart.js CDN + `js/data.js` + `js/app.js`)
1. **`index.html`** (`data-page="home"`) — hero question *"Does LUSE follow a random walk?"*;
   animated count-ups (20 stocks · ~950 days · 3 tests · 17k→25k index); hero chart = animated
   random walk vs real-parameter simulated path; partial-inefficiency teaser; CTAs.
2. **`dashboard.html`** (`data-page="dashboard"`) — "PARTIAL INEFFICIENCY" banner; stat cards (%
   rejecting per test, computed); bar chart rejections per test; doughnut efficient vs inefficient;
   market-context dual chart (index + trades growth); scatter VR vs |Z| coloured by verdict.
3. **`stocks.html`** (`data-page="stocks"`) — registry table (ticker, name, sector, mean, SD, skew,
   kurtosis, LB p, VR, Z, status badge) + live search + sector/status filters + sortable columns
   (reuse `prc-demo/players.html` pattern). Rows → profile.
4. **`stock.html`** (`data-page="stocks"`, detail) — reads `?ticker=`; header (name/sector/verdict);
   descriptive-stats panel; charts: simulated price/return series, ACF bar + ±1.96/√n band (real lag-1
   anchor), VR-vs-k curve (real k=2 anchor), return histogram (real skew/kurtosis); per-test verdict
   rows; back link.
5. **`methodology.html`** (`data-page="methodology"`) — 3 tests (formula + plain English + citation)
   each with an interactive mini-viz (re-rollable random-walk sim, ACF explainer, VR-vs-k explainer);
   then Findings & Recommendations (§2.8).

---

## 4. Files to modify
- **[project-emh.html](project-emh.html)** — add **"Interactive Demo"** button to
  `.project-detail__buttons` → `emh-demo/index.html` (mirror "Live Demo" on
  [project-prc.html](project-prc.html)). Keep PDF/GitHub/Summary buttons.
- **[projects.html](projects.html)** *(optional)* — add "Live Demo" affordance to EMH card. Defer.
- **[CLAUDE.md](CLAUDE.md)** — add an `emh-demo/` architecture paragraph next to the `prc-demo/`
  one; move EMH to "Completed Items."

---

## 5. Reuse (read these first — don't reinvent)
- Nav/footer injection, count-up, scroll-reveal, search/filter/sort table, `?id=` detail page, badge
  helpers: working precedents in [prc-demo/js/app.js](prc-demo/js/app.js),
  [prc-demo/js/data.js](prc-demo/js/data.js), `prc-demo/players.html`, `prc-demo/player.html`.
- Color/type cues: [assets/images/project-emh.svg](assets/images/project-emh.svg).

---

## 6. Verification
1. `cd portfolio-website; python -m http.server 8000` → open `/emh-demo/index.html`.
2. All 5 pages: nav/footer inject, active link highlights, count-ups + scroll-reveals fire, every chart
   renders (no console errors), animations replay.
3. `stocks.html`: search, each sector + status filter, every column sort; row → `stock.html?ticker=…`
   loads correct profile; its charts reflect that stock's real stats.
4. Spot-check on-screen VR / Z / LB p vs §2.3–2.4.
5. New "Interactive Demo" button on `project-emh.html` opens the sub-app.
6. ≤768px mobile: tables/cards/charts stack, nav collapses.
7. No regression to main portfolio (separate CSS/JS — `index.html` still loads clean).

---

## 7. How to continue at home
1. Get this spec into the repo so it syncs: have me run a copy into `emh-demo-SPEC.md`, **or** copy
   the contents of this file (`~/.claude/plans/read-claude-md-i-twinkling-duckling.md`) into a new file
   `portfolio-website/emh-demo-SPEC.md` and commit it.
2. At home, open the repo, then either re-enter plan mode and point me at `emh-demo-SPEC.md`, or
   just say **"build the EMH demo per emh-demo-SPEC.md, start with `data.js` and `emh.css`."**
3. Suggested build order: `data.js` → `emh.css` → `app.js` → `index.html` → `dashboard.html` →
   `stocks.html` → `stock.html` → `methodology.html` → wire button in `project-emh.html` → verify.
