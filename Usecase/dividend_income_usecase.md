# Dividend & Passive Income Tracking Use Case

## Overview
This use case provides a structured framework for tracking dividend payouts, interest income, staking rewards, rental income, royalty flows, and all recurring/passive income sources. It centralizes cashflow events across multiple asset classes while linking them to holdings, accounts, and tax years.

---

## User Goals
- Track all dividend/interest/staking payouts across brokers and wallets.
- Forecast upcoming income based on ex-dividend dates and asset holdings.
- Monitor yield (current, forward, yield-on-cost).
- Understand income contributions by sector, account, or asset class.
- Maintain accurate tax records for annual reporting.

---

## Problems & Pain Points
- Brokers provide inconsistent dividend history formats.
- No unified view of passive income across stocks, ETFs, crypto, real estate.
- Yield calculations differ between platforms.
- Hard to track withholding tax, foreign tax credits, and yearly totals.
- No lightweight personal system ties payouts to research, portfolio strategy, or goals.

---

## Data Requirements
- **Income events:** payout amount, date, currency.
- **Security metadata:** asset UID, account, withholding tax.
- **Valuation context:** market price at payout time for yield metrics.
- **Tax data:** jurisdiction, classification (eligible, ordinary, foreign).
- **Relationships:** assets, accounts, tax year, investment theses.

---

## Entity Model
### Entity: `finance.income_event`
### Entity: `finance.asset`
### Entity: `finance.account`
### Entity: `finance.tax_year`

Key relationships:
- `paid_by`: asset
- `received_in`: account
- `taxable_in`: tax year
- `linked_to`: portfolio snapshots

---

## YAML Example — Dividend Event
```yaml
---
uid: income-aapl-2025q1-dividend
type: finance.income_event
title: "AAPL Quarterly Dividend"
date: 2025-02-15
asset_uid: asset-aapl
account_uid: acct-ibkr-margin
amount: 28.80
currency: USD
shares_owned: 120
per_share: 0.24
withholding_tax:
  amount: 4.32
  rate: 0.15
tax_year_uid: tax-2025
notes: "Dividend reinvested manually"
sensitivity: confidential
---
```

---

## YAML Example — Staking Income (Crypto)
```yaml
---
uid: income-eth-staking-2025-03-01
type: finance.income_event
title: "ETH Staking Reward"
date: 2025-03-01
asset_uid: asset-eth
account_uid: acct-ledger-coldstorage
amount: 0.0124
currency: ETH
usd_equivalent_at_time: 36.80
notes: "Validator node reward"
tax_year_uid: tax-2025
sensitivity: confidential
---
```

---

## Integration Architecture
### Brokerage Exports
- CSV parsing for dividend/interest reports from RBC, Questrade, IBKR, TD, Vanguard.

### Market Data (Alpha Vantage, Finnhub)
- Fetch ex-dividend calendars.
- Compute forward yield and historic yield-on-cost.

### Crypto / Staking
- API queries or manual entry for staking rewards.

### Rental / Business Income
- Manual recordings using generic income event templates.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Sharesight | Excellent dividend and performance metrics | Subscription cost | SBF transparency + YAML export |
| Broker portals | Accurate raw data | No cross-account aggregation | SBF unifies accounts |
| Crypto staking dashboards | High detail for specific chains | Fragmented per-chain | SBF multi-asset passive income model |

---

## SBF Implementation Notes
- CLI: `sbf new finance.income_event`.
- AEI: generate passive income summaries and projections.
- Dashboards: month-by-month payouts, rolling 12-month income, sector vs income maps.
- Cross-domain: link income to goals, travel budget, health costs, and portfolio strategy.

