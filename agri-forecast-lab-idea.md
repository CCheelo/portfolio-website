# Parked Idea — Agri Price-Forecast Lab (Zambia)

> **Status:** Parked runner-up (June 2026). Chosen build instead: **Kwacha Books** (SME mobile-money
> bookkeeping SaaS). This is the *prettier showpiece* but the *harder near-term sale* — revisit when a
> B2B anchor customer or donor pilot appears.

---

## The pitch

A crop **price intelligence + forecasting** SaaS for Zambian commodities (maize, soya, groundnuts).
It plays **directly to the time-series / forecasting edge** already proven in the copper-forecasting
project — and **price *forecasting* is genuine white space** in Zambia. Every existing service only
shows **current** prices:

- **[ZNFU 4455](http://www.farmprices.co.zm)** — Zambia National Farmers Union; weekly commodity +
  input prices via SMS short-code `4455` and a website, since 2007.
- **Lima Links** (`*789#`) — free USSD service showing live market prices for field crops & vegetables.
- **[AgriPredict](https://www.agripredict.com/)** — Zambian startup; predicts pests/disease/drought
  (`*404#` + app, ~50k farmers) — but **not price**.

So nobody is doing **forward-looking price + volatility outlooks**. That's the gap, and it's exactly
the kind of modelling the copper/EMH work already demonstrates.

## The catch — who actually pays

**Farmers won't pay.** Every farmer-facing price service is **free / donor-funded** (ZNFU 4455, Lima
Links, WFP Maano), which anchors farmer willingness-to-pay at **zero**. The real buyers are
**B2B / institutional**:

1. **Banks, MFIs & agri-insurers** doing **agricultural lending** — price/volatility forecasts feed
   credit-risk models, warehouse-receipt valuation, and index/insurance products. (AgriPredict reports
   exactly this kind of NGO/MFI interest in its data.)
2. **ZAMACE traders, cooperatives & commercial farmers** — they already trade on price and warehouse
   receipts; **[ZAMACE](https://zamacexchange.com/)** is a natural data/distribution partner.
3. **Donors / NGOs** — as anchor pilot customers / pilot funders (precedent: AgriPredict × World Vision;
   Musika / FtMA market-systems work). Caveat: donor revenue is **project-cyclical**.

→ This means **slow, relationship-driven B2B sales**. The hard part is not the product — it's the
distribution and landing the first institutional customer.

## Data reality (what you can actually ingest)

- **Ingestible base layer exists:**
  - **WFP VAM / HDX "Zambia – Food Prices"** — CSV/API, refreshed ~monthly, covers maize/rice/beans/etc.
    across multiple markets back to 2003. (`data.humdata.org/dataset/wfp-food-prices-for-zambia`)
  - **FEWS NET** — Data Explorer with download/API, plus regional price bulletins (coarser granularity).
    (`fews.net`)
- **Freshest local sources are NOT machine-readable:** ZNFU 4455 (SMS/web), Ministry of Agriculture
  market bulletins (PDF), Food Reserve Agency prices (manual). These carry weekly–monthly lag and would
  need **scraping + parsing pipelines**, and **forecast freshness is capped by these inputs**.

## Why park it (not build now)

It's the better **demo** but the worse **near-term sale**: there is no self-serve paying customer, and
revenue depends on landing a bank / co-op / donor relationship. Two ways to revisit:

- **If a B2B anchor or donor pilot appears** → build the paid institutional product.
- **As a pure portfolio showpiece** → build a **free farmer-facing forecast** (Chart.js price + forecast
  cones, in the same honest "simulated from estimated parameters" style as the copper/EMH demos) that
  doubles as a **lead funnel** into a future paid B2B layer.

## Monetization path (when revived)

Paid **API / data feed** + **dashboard subscriptions** + **bespoke forecast reports** sold to
banks/MFIs/insurers and ZAMACE members; **donors as early funders**; a **farmer-facing free tier**
(USSD/SMS) only as a credibility + data-collection funnel feeding the paid B2B layer.

## Tech notes (if/when built)

- Could start as a **static Chart.js demo** in the portfolio (like `copper-demo/` / `emh-demo/`) seeded
  from real WFP/FEWS NET figures with simulated forecast paths — cheapest way to get the showpiece up.
- A real product would add: an ingestion pipeline (WFP/FEWS NET pulls + ZNFU/MoA scrapers), a
  forecasting service (ARIMA/GARCH-style — reuse the copper methodology), and a B2B dashboard + API.

## Sources

- WFP HDX — `data.humdata.org/dataset/wfp-food-prices-for-zambia`
- FEWS NET — `fews.net`
- ZNFU 4455 — `farmprices.co.zm`
- AgriPredict — `agripredict.com` (+ its documented NGO/MFI buyer interest)
- ZAMACE — `zamacexchange.com` (B2B channel / data partner)
- Lima Links, WFP Maano — free farmer-facing incumbents (zero-price anchor)
