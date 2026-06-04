# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local Development

```bash
# From inside portfolio-website/
python -m http.server 8000
# Then open http://localhost:8000
```

Alternatively: VS Code Live Server extension → right-click `index.html` → "Open with Live Server".

There is no build step, no package manager, no transpilation. Changes to HTML/CSS/JS are immediately visible on refresh.

## Deployment

Pushes to `main` auto-deploy via Vercel's GitHub integration. No manual deploy command needed.
- Live URL: `https://www.choolwecheelo.com`
- Domain purchased at Cloudflare Registrar; DNS points to Vercel (`CNAME www → cname.vercel-dns.com`, `A @ → 76.76.21.21`)
- Cloudflare proxy must stay **DNS only** (gray cloud) — Vercel handles SSL and CDN.

## Architecture

**All styling lives in `css/main.css`** — no other CSS files. It is structured in labelled sections (design tokens → reset → components → pages → responsive). Edit one file only.

**All JavaScript lives in `js/main.js`** — four self-contained IIFEs: `timelineProgress` (resume scroll animation), `bookRotator` (home page — cycles books on a fade interval; clicking the title opens a `<dialog>` modal with the full reading list), `navbarToggle` (mobile menu), and `contactForm` (async Formspree submission with inline thank-you state). The script tag is `defer` and runs on every page, but each IIFE guards with an `if (!el) return` so they're safe on pages that don't have the relevant elements.

**Navigation and footer are copy-pasted into every HTML file** — there is no templating or includes. When updating nav links or footer content, edit all 11 files.

**`prc-demo/` is a self-contained "Zambezi Futures" mini-app** — a faithful, animated reproduction of the real PRC System (repo: `astrosanderson/prc-system`, live at `prc-system-44g8.vercel.app`) running on dummy data. It is a separate sub-app and does NOT use `css/main.css` or `js/main.js`. Structure:
- `prc-demo/css/zf.css` — the demo's entire design system + animations. Palette mirrors the real app: dark green `#1b3a2d`, mid green `#2d6a4f`, gold `#c9a84c`, cream bg `#f5f3ee`. Fonts: Manrope (body) + Montserrat (display). Has scroll-reveal (`.reveal` / `.is-visible`), `.fade-in-up`, hover-lift, live pulse, hero glow.
- `prc-demo/js/data.js` — single data source as `window.PRC_DATA`: 8 academies, ~33 players (the real 25 from the repo's `mockData.ts` PLUS the 15-person dev team distributed across academies), live match, past games, feed, critical dates, division mix, archive (hall of fame + tournament records). Players use real-format PRC IDs (`ZF-YYYY-NNNN-XX`) and divisions U-8…U-18. Choolwe Cheelo is id 48 with `role:'Admin'`.
- `prc-demo/js/app.js` — **injects the shared navbar + footer** into `#navbarContainer` / `#footerContainer` on every page (mirrors the real app's `app.js`), runs scroll-reveal/count-up/mix-bar animations, and exposes helpers on `window.PRC` (`statusBadge`, `divisionBadge`, `initialsAvatar`, `academyLogo`, `getQueryParam`, `animateCount`). The active nav link is driven by `<body data-page="…">`. **To change navigation, edit the `NAV` array in app.js only** — every page picks it up. `academyLogo(academy)` generates a unique themed SVG crest per academy (waterfall, lion, bridge, star, gear, southern-cross, fish, compass) via `crestMotif()` keyed on `academy.id` — no image files. The 15-person dev team appears as the 8 academy `rep`s and the 7 Hall-of-Fame entries; Choolwe Cheelo is also the featured "GOAT" legend in `archive.legend` (uses the portfolio's `../assets/images/profile.jpg`), and every Hall-of-Fame card opens a career-dossier modal.
- Pages (all load `css/zf.css` + `js/data.js` + `js/app.js`): `index.html` (public homepage — hero, animated stat count-up, live match, academy carousel), `dashboard.html` (admin dashboard — stat cards, recent enrollments, division mix bars, critical dates, live feed), `players.html` (registry table, live search + academy/division/status filters), `player.html` (profile — reads `?id=N`, PRC ID card, season rating, position-aware stats, match history), `database.html` (academy cards with search/sort), `archives.html` (Historical Hub — graduates/championships stats, hall of fame, tournament records, recent results), `register.html` (3-step form with validation + success state, no real POST).

Bootstrap 5.3.3 via CDN is used for grid/utilities only; all bespoke styling is in `zf.css`. To add/edit players or academies, edit `prc-demo/js/data.js` only — all pages read from it.

**`emh-demo/` is a self-contained "LUSE Efficiency Lab" mini-app** — an interactive companion to the EMH research project (`reports/emh-research-report.pdf`), driven by the **real figures** from that report. Like `prc-demo/` it is a separate sub-app and does NOT use `css/main.css` or `js/main.js`. Decisions: charts via **Chart.js 4.4.1 CDN**; 4 nav destinations / 5 HTML files (per-stock profile is a detail page, not a nav item — like `prc-demo`'s `player.html`). Structure:
- `emh-demo/css/emh.css` — the demo's entire design system + animations. Dark "market terminal" palette echoing `assets/images/project-emh.svg`: bg `#0f172a`, panel `#1a2540`, accent orange `#c2410c` (`--accent-rgb: 194, 65, 12`), green `#16a34a` (efficient) / red `#dc2626` (inefficient), gold `#d4a24c`. Fonts: **Inter** (text) + **JetBrains Mono** (all figures/tickers). Has `.reveal`/`.is-visible` scroll-reveal, `.fade-in-up`, count-up stat cards, hover-lift, status/sector badges, registry table styles, chart-panel cards, methodology formula blocks. Responsive: stacks ≤768px.
- `emh-demo/js/data.js` — single data source as `window.EMH_DATA = { meta, market, tests[3], companies[], findings, honesty, + helpers }`. `companies[]` is the **19 LUSE tickers that carry test results** (ATEL…ZMRE), each with real `desc` (mean/SD/skew/kurtosis from Table A3.1; `null` for ZMRE which has no descriptive row), `ljungBox {lag1Acf, p}` (Table A3.3), `vr {vr, z}` (Table A3.4), and a **computed** `verdict` (§ rule: rejects random walk if Ljung–Box p < 0.05 **OR** |VR Z| > 1.96 → `inefficient`, else `efficient`). AECI has descriptive stats but no test rows, so it is omitted from the registry. **Edit this file only** to change data; all figures were verified against `pdftotext -layout reports/emh-research-report.pdf`.
- `emh-demo/js/app.js` — **injects the shared navbar + footer** into `#navbarContainer`/`#footerContainer`, runs scroll-reveal + count-up, and exposes helpers on `window.EMH`: `statusBadge`, `sectorBadge`, `tickerAvatar`, `getQueryParam`, `animateCount`, `whenVisible` (defers chart creation until on-screen), a **seeded RNG** (`makeRng`, `seedFromString`, `seededReturns`, `ar1Returns`), and Chart.js factories `priceWalkChart`, `acfChart`, `vrCurveChart`, `histogramChart`, `testSummaryBars`, `verdictDoughnut`, `vrScatter`, `marketGrowthChart`, `tradeGrowthChart`. Chart.js dark-theme defaults are set once here. Active nav link is driven by `<body data-page="…">`; **to change navigation, edit the `NAV` array in app.js only**. **Honesty rule (baked into the UI):** real point estimates are shown as-is; any drawn path (price walks, full ACF lag profiles, VR-vs-k curves, return histograms) is simulated from a stock's real estimated parameters with the seeded RNG and labelled "simulated from estimated parameters" (`.sim-tag`).
- Pages (all load `css/emh.css` + Chart.js CDN + `js/data.js` + `js/app.js`): `index.html` (`data-page="home"` — hero "Does LUSE follow a random walk?", count-ups, random-walk vs estimated-path hero chart, partial-inefficiency teaser), `dashboard.html` (`dashboard` — PARTIAL INEFFICIENCY banner, computed stat cards, per-test rejection bars, efficient/inefficient doughnut, VR-vs-|Z| scatter, market-context index + trade growth charts), `stocks.html` (`stocks` — registry table with live search + sector/verdict filters + sortable columns), `stock.html` (`stocks`, detail — reads `?ticker=`, KPI tiles, descriptive-stats panel, simulated price path, ACF bar + band, VR-vs-k curve, return histogram, per-test verdict rows), `methodology.html` (`methodology` — the 3 tests with formula + plain English + citation + an interactive mini-viz each, then findings & recommendations). Linked from the "Interactive Demo" button on `project-emh.html`.

## Design System

All colours, spacing, and shadows are CSS custom properties defined in `:root` at the top of `main.css`:

| Token | Value | Used for |
|---|---|---|
| `--color-accent` | `#c2410c` | All orange highlights |
| `--color-accent-rgb` | `194, 65, 12` | `rgba()` usage — change both together |
| `--color-bg-alt` | `#fafafa` | `.section--alt` backgrounds |
| `--section-py` | `4rem` | Vertical section padding |
| `--max-width` | `1100px` | `.container` max-width |
| `--max-width-narrow` | `720px` | `.container--narrow` (project detail prose) |

To change the accent colour, update `--color-accent` **and** `--color-accent-rgb` together.

## Key CSS Patterns

**`.numbered-list`** — used on both `index.html` (hobbies) and `skills.html` (areas of focus). 3-column grid: `80px number | 1fr content | 72px icon`. Icons are grayscale/faded by default, full colour on hover.

**`.tl` (resume timeline)** — progressive-fill scroll animation. Structure requires: `#mainTimeline` wrapper → `#tlFill` child of `.tl__track` → `[data-tl-entry]` articles. The JS fill is driven by `getBoundingClientRect()` + `requestAnimationFrame`. Nodes use `.is-in-view` class added by `IntersectionObserver`.

**`.section--alt`** — alternate background (`--color-bg-alt`). Pages alternate section backgrounds for visual rhythm; check surrounding sections when adding a new one.

**`.grid--2` / `.grid--3` / `.grid--4`** — simple CSS grid helpers. All collapse to 1 column at ≤768px via the responsive block.

**`.navbar__toggle`** — mobile hamburger button (pill-shaped, border, "Menu"/"Close" label). Hidden at >768px via `display: none`. At ≤768px the navbar uses `flex-wrap` so the link list wraps below the brand/toggle row. Toggle state is driven by `navbarToggle` IIFE in `main.js` which adds/removes `.is-open`, updates `aria-expanded`, and updates `aria-label` ("Open menu" / "Close menu") on both states.

**`.book-rotator__text`** — styled as a `<button>` (resets all button chrome) so it is keyboard-focusable and triggers the book list modal on click. The `fading` class drives the cross-fade transition.

**`.book-list-modal`** — native `<dialog>` element. Opened via `modal.showModal()`, closed via `modal.close()` or clicking the backdrop. Dismiss on backdrop click is wired manually (`e.target === modal`). Keyboard `Escape` closes natively.

**Mobile breakpoints** — `css/main.css` has two responsive blocks at the bottom:
- `≤768px` — navbar collapses, timeline uses 2-column grid (`24px node | 1fr content`), cert grid is 2-per-row at compact sizing, floating hero icons reduced to 4 corner icons at 30px.
- `≤480px` — section padding tightens, hero CTA buttons stack full-width.

## Icons

All SVG icons are stored locally in `assets/icons/` — there is no icon CDN dependency. If adding a new icon, download the SVG directly (e.g., from Iconify's CDN via PowerShell `Invoke-WebRequest`) rather than using a `<link>` to an external CDN.

Current icons: `powerbi`, `excel`, `r`, `mysql`, `python`, `github`, `tableau`, `claude` (tech — hero floating icons), `basketball`, `chess`, `book`, `music`, `gamepad` (hobby icons), `favicon.svg` (orange "CC" mark linked in all 11 HTML files).

## Pending Items (not yet done)

- **Testimonials**: `testimonials.html` is a placeholder — content to be added by the owner.
- **Project images**: `assets/images/project-*.svg` are placeholder graphics — owner to replace with final images.

## Completed Items

- **Copper Forecasting project**: Recreated in R (original R code was lost). Data is `Copper/Daily copper with dates.xlsx` — 6,298 daily copper prices (USD/tonne, Dec 2000–May 2025, LME-style). Analysis: clean (fix 36 `19xx`→`20xx` year typos, dedup) → log-returns → ADF/KPSS → ACF/PACF + BIC grid select **AR(2)** (matches the owner's original finding) → diagnostics → out-of-sample backtest (AR(2) does **not** beat a random walk) → **ARMA(2,0)-GARCH(1,1)-t** improvement (captures volatility clustering + fat tails; BIC 24,742→21,872). Deliverables: a ~10-page academic report (knitr `.Rnw` → PDF, with embedded R output) at `reports/copper-forecasting-report.pdf`, linked from `project-copper.html`'s "Full Report" button; the project page summary was rewritten with the AR(2)/GARCH story. Code + data + README + figures pushed to **public repo `github.com/CCheelo/copper-forecasting`** (linked from the page's "GitHub Code" button), which is the canonical home for the working files (raw data `Daily copper with dates.xlsx`, `copper_analysis.R`, `copper_report.Rnw`). The local working copy was at a sibling folder `../copper-forecasting/`; the temporary `Copper/` dev folder in this repo was deleted after the build (nothing copper-related remains in the website tree except the report PDF). Built with R 4.5.1 + `tinytex`; PDF compile needs the TL2025 historic tlmgr repo (`https://ftp.math.utah.edu/pub/tex/historic/systems/texlive/2025/tlnet-final`) because local TeX Live is a release behind CTAN. `gh` CLI's network fails in this sandbox — push via REST API + tokenized git URL instead.
- **EMH demo**: Interactive "LUSE Efficiency Lab" at `emh-demo/` — a self-contained companion to the EMH research project, driven by the report's real figures (verified against `pdftotext`). Home (random-walk hero), dashboard (computed rejection rates, VR/|Z| scatter, market growth), sortable/filterable stock registry, per-stock profiles with simulated charts anchored on real estimates, and a methodology page with interactive mini-vizes + findings. Uses Chart.js 4.4.1 via CDN. Linked from the "Interactive Demo" button on `project-emh.html`. See the `emh-demo/` architecture paragraph above.
- **PRC System demo**: Interactive "Zambezi Futures" demo at `prc-demo/` reproducing the real PRC System on dummy data — public homepage, admin dashboard, player registry, player profiles, academy database, historical archive, and registration form, with scroll/count-up animations. Includes the full dev team among the players. Linked from the "Live Demo" button on `project-prc.html`.
- **Vercel deployment**: Configured and live via GitHub auto-deploy. Pushes to `main` deploy automatically.
- **Custom domain**: `www.choolwecheelo.com` live via Cloudflare DNS → Vercel.
- **Formspree contact form**: Configured with form ID `xykvkoqe`. Submits async, hides form on success, shows inline thank-you message. Honeypot spam protection included.
- **PDF reports**: All 4 reports present in `reports/` — `choolwe-cheelo-cv.pdf`, `emh-research-report.pdf`, `climate-change-summary.pdf`, `admissions-bias-exec-summary.pdf`.
- **Favicon**: `assets/icons/favicon.svg` (orange "CC" mark) linked in all 11 HTML files.
- **Book list modal**: Clicking the rotating book title on the home page opens a native `<dialog>` listing all 8 books. Closes on backdrop click or `Escape`.
- **Accessibility fixes**: `#contactSuccess` has `tabindex="-1"`, `role="status"`, and `aria-live="polite"` so keyboard/screen-reader users receive focus and announcement after form submit. Hamburger `aria-label` updates correctly between "Open menu" and "Close menu".
- **bookRotator fix**: Rotation now shows `books[0]` ("Scythe") first instead of skipping it.

## Project Detail Pages

Each `project-*.html` follows the same structure: `.project-detail__hero` section (title, meta, description, 3 buttons) → `.section#summary` (content, Power BI iframe if applicable, back link). Power BI dashboards embed via `<iframe src="https://app.fabric.microsoft.com/view?r=...">`.
