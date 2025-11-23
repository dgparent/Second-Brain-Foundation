# Budgeting & Cashflow Management Use Case

## Overview
This use case defines a robust framework for tracking personal income, expenses, budgets, cash flow cycles, bill schedules, subscriptions, and financial behaviors. It integrates bank exports, aggregation tools, and manual entries into a unified, queryable markdown-based system.

---

## User Goals
- Track all income and spending in a clear, consistent structure.
- Manage budgets at monthly, weekly, or category-based levels.
- Identify spending patterns, overspending triggers, and savings opportunities.
- Connect transactions to goals, projects, life events, and financial obligations.
- Maintain audit-ready financial history.

---

## Problems & Pain Points
- Banking apps lack long-term analysis tools.
- Budget apps often lock data inside cloud silos.
- Users struggle to connect spending to context (projects, habits, goals).
- Subscription renewals and bill cycles are frequently forgotten.
- CSV exports from banks are inconsistent and unstructured.

---

## Data Requirements
- **Transactions:** date, merchant, category, amount, account.
- **Accounts:** checking, savings, credit card, loan.
- **Budget categories:** groceries, rent, utilities, dining, etc.
- **Bills:** due dates, auto-pay, confirmation numbers.
- **Relationships:** linked goals, projects, financial events.

---

## Entity Model
### Entity: `finance.transaction`
### Entity: `finance.account`
### Entity: `finance.budget_category`
### Entity: `finance.bill`

Key relationships:
- `belongs_to`: account
- `categorized_as`: budget category
- `linked_to`: goals or life events
- `recurs_on`: schedule for bills

---

## YAML Example — Transaction
```yaml
---
uid: txn-2025-11-10-starbucks
type: finance.transaction
date: 2025-11-10
amount: -7.85
currency: CAD
merchant: "Starbucks"
category_uid: cat-coffee
account_uid: acct-scotiabank-chequing
notes: "Quick latte before meeting"
linked_projects:
  - project-obsidian-research-2025
sensitivity: confidential
source_system:
  imported_from: "scotiabank-csv"
---
```

---

## YAML Example — Budget Category
```yaml
---
uid: cat-coffee
type: finance.budget_category
name: "Coffee"
monthly_limit: 120
notes: "Includes cafes, beans, equipment under $50"
sensitivity: normal
---
```

---

## YAML Example — Bill / Recurring Expense
```yaml
---
uid: bill-phone-rogers
type: finance.bill
name: "Rogers Mobile Plan"
amount: 85.00
currency: CAD
due_day: 12
auto_pay: true
account_uid: acct-visa-rbc
notes: "Check for promo renewal in March"
---
```

---

## Integration Architecture
### Bank CSV Exports
- Parse into `finance.transaction` entities.
- Normalize merchant names and categories.

### Aggregators (Plaid, Flinks, Tink)
- Support secure token-based API retrieval.
- Daily or manual sync.

### Credit Card Providers
- PDF/CSV parsers for statements.

### Subscriptions
- Manual entries or integrations with email receipt parsers.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| YNAB | Best-in-class budgeting | Cloud-dependent | SBF with markdown+local control |
| Monarch | Modern UX | Subscription cost | SBF custom dashboards |
| Mint (legacy) | Aggregation | Shutting down / unreliable | Stable local alternative |

---

## SBF Implementation Notes
- CLI: `sbf import finance csv`, `sbf new finance.transaction`.
- AEI can auto-categorize transactions using embeddings.
- Dashboards: monthly spend, burn rate, category drift.
- Cross-domain: link spending to life events, health costs, hobby projects.
- Future: anomaly detection for fraud or unusual spikes.

