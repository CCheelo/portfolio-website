# Choolwe Cheelo — Portfolio Website

Personal portfolio site showcasing data analytics, statistical research, and development work.

**Live site:** [www.choolwecheelo.com](https://www.choolwecheelo.com)

## Tech Stack

- Static HTML, CSS, JavaScript (no framework)
- Hosted on Vercel (free tier)
- Domain via Cloudflare Registrar
- Contact form via Formspree
- Power BI dashboards embedded via iframe

## Local Development

The simplest way to preview locally:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

Or use the **Live Server** VS Code extension and right-click `index.html` → "Open with Live Server".

## Structure

```
portfolio-website/
├── index.html              # Home
├── resume.html             # Resume / experience / education
├── skills.html             # Skills & certifications
├── testimonials.html       # Testimonials (placeholder)
├── projects.html           # Projects gallery
├── contact.html            # Contact form
│
├── project-emh.html        # EMH Testing detail
├── project-copper.html     # Copper Forecasting detail
├── project-climate.html    # Climate Change detail
├── project-admissions.html # Admissions Bias detail
├── project-prc.html        # PRC System detail
│
├── css/main.css            # Global styles
├── js/                     # JavaScript (if needed)
├── assets/                 # Images & certificates
└── reports/                # PDF reports
```

## Deployment

Pushes to `main` auto-deploy via Vercel's GitHub integration.

## License

Copyright 2026 Choolwe Cheelo. All rights reserved.
