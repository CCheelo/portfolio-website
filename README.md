# Choolwe Cheelo — Portfolio Website

Personal portfolio site showcasing data analytics, statistical research, and development work.

**Live site:** [www.choolwecheelo.com](https://www.choolwecheelo.com)

---

## Tech Stack

| Layer | Detail |
|---|---|
| Markup / Styling / Logic | Static HTML, `css/main.css`, `js/main.js` — no framework, no build step |
| Hosting | Vercel (free tier) — auto-deploys on push to `main` |
| Domain | Cloudflare Registrar → DNS only (gray cloud) → Vercel handles SSL & CDN |
| Contact form | Formspree (`xykvkoqe`) — async POST, honeypot spam protection |
| Dashboards | Power BI embedded via `<iframe>` (app.fabric.microsoft.com) |

---

## Local Development

```bash
# From inside portfolio-website/
python -m http.server 8000
# Open http://localhost:8000
```

Or: VS Code Live Server → right-click `index.html` → "Open with Live Server".

No build step, no package manager, no transpilation. Changes are live on refresh.

---

## File Structure

```
portfolio-website/
├── index.html                  # Home (hero, hobbies, book rotator)
├── resume.html                 # Experience, education, timeline
├── skills.html                 # Skills & certifications
├── projects.html               # Projects gallery
├── contact.html                # Contact form (Formspree)
├── testimonials.html           # Placeholder — no content yet
│
├── project-emh.html            # EMH Testing — Lusaka Securities Exchange
├── project-copper.html         # Copper Price Forecasting
├── project-climate.html        # Climate Change Impact Analysis
├── project-admissions.html     # Admissions Bias Audit
├── project-prc.html            # PRC System — Player Registry Centre
│
├── prc-demo/                   # Self-contained "Zambezi Futures" demo (see below)
│   ├── index.html              #   Public homepage (hero, live match, academies)
│   ├── dashboard.html          #   Admin dashboard
│   ├── players.html            #   Player registry (search/filter)
│   ├── player.html             #   Player profile (?id=N)
│   ├── database.html           #   Academy database
│   ├── archives.html           #   Historical Hub (Hall of Fame + GOAT legend)
│   ├── register.html           #   3-step registration form
│   ├── css/zf.css              #   Demo design system + animations
│   └── js/{data,app}.js        #   Dummy data + shared chrome/animations
│
├── css/main.css                # All styles — single file, labelled sections
├── js/main.js                  # All JS — four self-contained IIFEs (see below)
│
├── assets/
│   ├── icons/                  # Local SVG/PNG icons — no external CDN
│   │   └── favicon.svg         # Orange "CC" favicon used by all pages
│   ├── images/                 # Profile photo + project card images (SVG placeholders)
│   └── certificates/           # PDF and JPG certificates
│
└── reports/                    # PDF reports linked from project pages
    ├── choolwe-cheelo-cv.pdf
    ├── emh-research-report.pdf
    ├── climate-change-summary.pdf
    ├── admissions-bias-exec-summary.pdf
    └── copper-forecasting-report.pdf
```

---

## JavaScript Architecture

`js/main.js` contains four self-contained IIFEs, each guarded with `if (!el) return` so they are safe on pages that don't have the relevant element:

| IIFE | Purpose |
|---|---|
| `timelineProgress` | Resume scroll animation — progressive fill via `requestAnimationFrame` + `IntersectionObserver` |
| `bookRotator` | Home page reading-hobby rotator — cycles 8 books every 4.5 s with a fade transition. Clicking the title opens a `<dialog>` modal with the full list. Respects `prefers-reduced-motion`. |
| `navbarToggle` | Mobile hamburger — toggles `.is-open`, `aria-expanded`, and `aria-label` in sync |
| `contactForm` | Async Formspree submit — hides form, reveals `#contactSuccess`, moves focus to confirmation |

---

## CSS Architecture

All styles live in `css/main.css`, structured in labelled sections:

```
design tokens → reset → components → pages → responsive
```

**Design tokens (`:root`):**

| Token | Value | Used for |
|---|---|---|
| `--color-accent` | `#c2410c` | All orange highlights |
| `--color-accent-rgb` | `194, 65, 12` | `rgba()` usage — change both together |
| `--color-bg-alt` | `#fafafa` | `.section--alt` backgrounds |
| `--section-py` | `4rem` | Vertical section padding |
| `--max-width` | `1100px` | `.container` max-width |
| `--max-width-narrow` | `720px` | `.container--narrow` (project detail prose) |

**Key patterns:** `.numbered-list`, `.tl` (timeline), `.section--alt`, `.grid--2/3/4`, `.navbar__toggle`, `.book-list-modal` (dialog).

---

## Nav & Footer

Navigation and footer are **copy-pasted into all 11 HTML files** — no templating. When updating a nav link or footer item, edit all 11 files.

> Note: this applies to the **main portfolio pages only**. The `prc-demo/` sub-app is independent and injects its own navbar/footer via `prc-demo/js/app.js`.

---

## PRC System Demo (`prc-demo/`)

An interactive demo of the **Zambezi Futures** Player Registry Centre — a faithful reproduction of the real system ([repo](https://github.com/astrosanderson/prc-system)) running on anonymized dummy data. Linked from the **Live Demo** button on `project-prc.html`.

It is a **separate self-contained sub-app** — it does **not** use `css/main.css` or `js/main.js`:

- **`prc-demo/css/zf.css`** — the demo's entire design system + animations. Palette mirrors the real app: dark green `#1b3a2d`, gold `#c9a84c`, cream `#f5f3ee`; fonts Manrope (body) + Montserrat (display). Includes scroll-reveal, count-up, hover-lift, live pulse, hero glow (all respect `prefers-reduced-motion`).
- **`prc-demo/js/data.js`** — single data source (`window.PRC_DATA`): 8 academies, players (the real mock roster + the project team), live match, past games, feed, division mix, and archive. Real-format PRC IDs (`ZF-YYYY-NNNN-XX`), divisions U-8…U-18.
- **`prc-demo/js/app.js`** — injects the shared navbar + footer on every page, runs the animations, and generates each academy's unique themed SVG **crest** (`academyLogo`). **To change the nav, edit the `NAV` array here only.**
- **Pages** all load `css/zf.css` + `js/data.js` + `js/app.js`; the active nav link is driven by `<body data-page="…">`.

The 15-person development team is featured as the 8 academy reps and 7 Hall-of-Fame legends; Choolwe Cheelo is the headline "GOAT" legend in the Historical Hub (clickable career dossier, uses the portfolio profile photo). **To edit players/academies, change `prc-demo/js/data.js` only** — every page reads from it.

---

## Deployment

Pushes to `main` auto-deploy via Vercel's GitHub integration. No manual command needed.

- DNS: `CNAME www → cname.vercel-dns.com`, `A @ → 76.76.21.21`
- Cloudflare proxy must stay **DNS only** (gray cloud) — Vercel handles SSL

---

## Pending Items

| Item | Notes |
|---|---|
| **Testimonials** | `testimonials.html` is a placeholder — content to be added by owner |
| **Project images** | `assets/images/project-*.svg` are placeholder graphics — owner to replace with final images |

---

## License

Copyright 2026 Choolwe Cheelo. All rights reserved.
