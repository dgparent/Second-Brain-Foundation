# Portfolio Tracking & Net Worth Use Case

## Overview
This use case provides a unified, vendor-neutral system for tracking investment portfolios, net worth, holdings, valuations, asset allocation, performance, and financial strategy. It consolidates multiple brokers, banks, crypto wallets, and alternative assets into a single, graph-based knowledge model.

---

## User Goals
- Track total net worth across all accounts and asset classes.
- Maintain accurate investment holdings with cost basis and acquisition lots.
- Monitor performance over time (gains, losses, yield, IRR).
- Consolidate brokerage accounts, crypto wallets, real estate valuations, and business assets.
- Link investment decisions to research notes, articles, and personal theses.

---

## Problems & Pain Points
- Brokers provide fragmented, inconsistent export formats.
- Portfolio tools often hide calculation details.
- No cross-domain linking between investments and research sources.
- Hard to track alternative assets (private equity, collectibles, businesses).
- No system provides a complete lifelong investment history.

---

## Data Requirements
- **Assets:** symbol, type, classification, currency.
- **Holdings:** quantity, cost basis, acquisition date(s).
- **Valuations:** daily or intraday pricing from APIs.
- **Accounts:** brokerage, crypto exchange, cold storage, cash accounts.
- **Relationships:** research notes, life goals, dividends.

---

## Entity Model
### Entity: `finance.asset`
### Entity: `finance.account`
### Entity: `finance.valuation`
### Entity: `finance.portfolio_snapshot`

Key relationships:
- `held_in`: account → asset mapping
- `supported_by`: research
- `generates`: dividend or interest events
- `contributes_to`: net worth snapshots

---

## YAML Example — Asset
```yaml
---
uid: asset-aapl
type: finance.asset
name: "Apple Inc."
symbol: "AAPL"
asset_class: equity
subtype: large_cap
currency: USD
tags:
  - technology
holdings:
  - account_uid: acct-ibkr-margin
    quantity: 120
    cost_basis: 132.50
    acquisition_lots:
      - date: 2025-02-01
        quantity: 70
        price: 129.00
      - date: 2025-04-20
        quantity: 50
        price: 137.20
valuation_source:
  provider: alpha_vantage
  symbol: AAPL
  last_sync: 2025-11-10T10:00:00-05:00
linked_research:
  - research_uid: thesis-aapl-2025
sensitivity: confidential
---
```

---

## YAML Example — Portfolio Snapshot
```yaml
---
uid: portfolio-2025-11-10
type: finance.portfolio_snapshot
date: 2025-11-10
accounts:
  - acct-ibkr-margin
  - acct-rbc-direct
  - acct-binance-crypto
net_worth:
  total: 842355
  currency: CAD
  breakdown:
    equities: 540000
    crypto: 120000
    real_estate: 150000
    cash: 32000
sensitivity: confidential
---
```

---

## Integration Architecture
### Market Data APIs
- **Alpha Vantage, Finnhub, IEX Cloud** provide quotes, fundamentals.
- Queries run hourly/daily via CLI or AEI.

### Brokerage CSV Exports
- IBKR, Questrade, Fidelity, Vanguard, RBC, TD, Binance, Coinbase.
- Standardized parser maps holdings → assets.

### Real Estate
- Manual valuation with periodic update schedules.

### Crypto
- Public wallet balance queries via blockchain explorers.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Sharesight | Strong performance metrics | Paid tiers | SBF open data + graph linkage |
| Personal Capital/Empower | Aggregation | US-only focus | Global + local-first alternative |
| Kubera | Multi-asset UX | Subscription | SBF transparency + YAML portability |

---

## SBF Implementation Notes
- CLI: `sbf new finance.asset`, `sbf import finance.marketdata`.
- AEI suggests rebalancing, risk scoring, links to news.
- Dashboard: allocation donut, gains/losses over time.
- Supports holdings in stocks, crypto, real estate, commodities, collectibles, businesses.

