# Fintech project — Mobile Money & Fintech Adoption

Everything for the **Mobile Money & Fintech Adoption** Power BI dashboard project:
the build guide and all the raw data.

## Contents

```
fintech/
├── mobile-money-build-guide.pdf      ← open this: full step-by-step build guide
├── mobile-money-build-guide.html     ← editable source of the guide (re-export to PDF if you tweak it)
└── data/
    ├── global-findex/                ← PRIMARY dataset (downloaded, ready to use)
    │   ├── GlobalFindexDatabase2025.xlsx     (country-level, ~300 indicators, 141 economies)
    │   ├── GlobalFindexDatabase2025.csv       (same data, CSV)
    │   └── GlobalFindex2025-glossary.xlsx     (indicator definitions)
    ├── gsma/                         ← needs manual download (see DOWNLOAD-INSTRUCTIONS.txt)
    └── bank-of-zambia/               ← needs manual download (see DOWNLOAD-INSTRUCTIONS.txt)
```

## Data status

| Source | Status | Notes |
|---|---|---|
| **World Bank Global Findex 2025** | ✅ Downloaded | Your backbone dataset — start here. Answers 3 of the 4 key questions on its own. |
| **GSMA Mobile Money Metrics** | ⚠️ Manual | Dashboard is JavaScript-rendered and blocks automated download — export the CSV from a browser. |
| **Bank of Zambia NPS reports** | ⚠️ Manual | Site serves a bot-protection page to scripts — download the PDFs from a browser. |

> **Note:** `fintech/data/` is git-ignored (the Findex files alone are ~45 MB), so the
> datasets live **locally only** and are not committed. After a fresh clone the `data/`
> folder will be empty — re-download from the links in **`mobile-money-build-guide.pdf`**
> (§1 "The data"). The `gsma/` and `bank-of-zambia/` subfolders also each hold a local
> `DOWNLOAD-INSTRUCTIONS.txt` with exact steps for those two browser-only sources.

## Where to start

1. Open **`mobile-money-build-guide.pdf`**.
2. The Findex file in `data/global-findex/` is already here — load it straight into Power BI
   (the guide's "Get data" step).
3. Grab the GSMA + Bank of Zambia files later if/when you build the v2 time-series and Zambia pages.

The matching project page on the site is `../project-fintech.html` (with a Power BI embed
placeholder ready for the published report URL).
