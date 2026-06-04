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
- **Copper Forecasting project**: `project-copper.html` exists but has placeholder content — pending locating the R code and dataset files.
- **Project images**: `assets/images/project-*.svg` are placeholder graphics — owner to replace with final images.

## Completed Items

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
