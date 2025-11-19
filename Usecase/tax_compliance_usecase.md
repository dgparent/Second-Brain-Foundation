# Tax Compliance & Financial Documentation Use Case

## Overview
This use case provides a unified, personal tax management system for tracking tax years, income sources, deductible expenses, contributions, capital gains/losses, foreign asset declarations, receipts, and cross-border obligations. It creates a structured, export-ready record that simplifies yearly filing and long-term compliance.

---

## User Goals
- Track all tax-relevant financial data throughout the year.
- Maintain complete documentation for receipts, contributions, and deductions.
- Calculate capital gains/losses and maintain cost basis history.
- Manage multi-jurisdiction tax obligations (e.g., foreign property, crypto, investments).
- Prepare accurate reports for accountants or filing software.

---

## Problems & Pain Points
- Tax documents scattered across email, portals, PDFs, and paper.
- Users often lose receipts required for claims.
- Capital gains tracking is difficult across multiple brokerages.
- Foreign income and assets require detailed logs not provided by most tools.
- Tax preparation becomes a stressful, manual process each year.

---

## Data Requirements
- **Tax years:** jurisdiction, start/end dates.
- **Income events:** employment, dividends, interest, staking, rental.
- **Deductions:** expenses, contribution receipts, categories.
- **Capital gains:** buy/sell events, fees, cost basis.
- **Documents:** receipts, T-slips, 1099s, NR4s, crypto reports.
- **Relationships:** assets, accounts, transactions, goals.

---

## Entity Model
### Entity: `finance.tax_year`
### Entity: `finance.tax_document`
### Entity: `finance.capital_gain`
### Entity: `finance.deduction`

Key relationships:
- `applies_to`: income events, deductions
- `supports`: filing process
- `linked_to`: accounts, assets

---

## YAML Example — Tax Year
```yaml
---
uid: tax-2025
type: finance.tax_year
jurisdiction: "Canada"
start_date: 2025-01-01
end_date: 2025-12-31
notes: "Track foreign property over $100K for T1135."
---
```

---

## YAML Example — Tax Document (Receipt)
```yaml
---
uid: taxdoc-2025-charity-redcross
type: finance.tax_document
date: 2025-03-15
title: "Red Cross Donation Receipt"
amount: 250.00
currency: CAD
tax_year_uid: tax-2025
document_path: "/documents/tax/2025/redcross-receipt.pdf"
category: donation
tags:
  - deductible
sensitivity: confidential
---
```

---

## YAML Example — Capital Gain
```yaml
---
uid: capgain-aapl-2025-04-14
type: finance.capital_gain
asset_uid: asset-aapl
account_uid: acct-ibkr-margin
buy_date: 2024-01-10
sell_date: 2025-04-14
quantity: 40
buy_price: 129.40
sell_price: 158.10
fees: 3.20
capital_gain: 1136.00
tax_year_uid: tax-2025
notes: "Triggered to rebalance portfolio"
sensitivity: confidential
---
```

---

## Integration Architecture
### Broker Exports
- CSV parsing for trade logs, tax reports, T5008, 1099s.
- Automatic cost basis reconstruction.

### Crypto Tax Tools
- Import from Koinly, CoinTracking, or CSV export.
- Map staking/mining income → income events.

### Document Management
- PDF ingestion for receipts, slips, donation records.
- OCR optional for extracting metadata.

### Multi-Jurisdiction Logic
- Support for: Canada (T-slips, T1135), US (1099s), Philippines (BIR forms), EU formats.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| TurboTax | Easy filing | No year-round tracking | SBF year-long tracking |
| Koinly | Excellent crypto tax handling | Crypto-only | Unified asset + income system |
| Wealthsimple Tax | Simple UI | Limited advanced cases | SBF = documentation + cross-asset context |

---

## SBF Implementation Notes
- CLI: `sbf new finance.tax_document`, `sbf import finance.broker`.
- AEI: detect missing receipts, generate filing checklists.
- Dashboards: tax year summary, capital gains map, foreign asset declarations.
- Cross-domain linking: travel, business expenses, home office, health expenses.

