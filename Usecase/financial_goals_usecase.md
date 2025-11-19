# Financial Goals & Scenario Planning Use Case

## Overview
This use case provides a structured framework for managing financial goals, projecting future scenarios, and linking financial decisions to life outcomes. It connects budgets, investments, savings plans, and personal aspirations into a long-term strategic model.

---

## User Goals
- Define financial goals with time horizons and target amounts.
- Track progress toward saving or investment milestones.
- Model future scenarios (retirement, home purchase, travel year, sabbatical).
- Connect transactions, portfolio performance, and recurring contributions.
- Organize goals by domain: personal, family, career, lifestyle, education.

---

## Problems & Pain Points
- Most budgeting tools lack long-term financial strategy features.
- Investment tools do not support descriptive, narrative goals.
- Hard to visualize how daily spending aligns with long-term aspirations.
- Scenario planning requires switching between multiple apps.
- Goals are usually generic, not integrated with portfolio or cashflow data.

---

## Data Requirements
- **Goal metadata:** name, target amount, current progress, deadline.
- **Financial relationships:** linked assets, accounts, transactions.
- **Scenario variables:** inflation, expected return, contribution rate.
- **Tracking:** automated or manual progress updates.

---

## Entity Model
### Entity: `finance.goal`
### Entity: `finance.scenario`

Key relationships:
- `funded_by`: accounts, transactions, assets
- `linked_to`: projects, milestones
- `modeled_in`: scenario projections

---

## YAML Example — Financial Goal
```yaml
---
uid: goal-davao-homestead-2027
type: finance.goal
title: "Davao Homestead Build Fund"
description: "Capital required for materials, land preparation, solar infrastructure, and first-phase construction."
target_amount: 85000
currency: CAD
current_progress: 22000
deadline: 2027-12-31
linked_accounts:
  - acct-rbc-savings
goal_category: long_term_asset
contribution_plan:
  frequency: monthly
  amount: 1000
  auto_adjust_for_inflation: true
notes: "Phase 1 target is 60k; phase 2 adds 25k for expansion."
sensitivity: normal
---
```

---

## YAML Example — Scenario Model
```yaml
---
uid: scenario-homestead-growth
type: finance.scenario
title: "Homestead Funding Projection"
goal_uid: goal-davao-homestead-2027
assumptions:
  monthly_contribution: 1000
  expected_return_rate: 0.04
  inflation_rate: 0.025
  simulation_months: 24
projection:
  final_balance: 46520
  shortfall: 38480
notes: "A portfolio tilt toward ETFs may close the gap by 2027."
sensitivity: confidential
---
```

---

## Integration Architecture
### Budgeting Systems
- Pull available surplus from budget categories.
- Link discretionary spending reductions to goal acceleration.

### Portfolio Tracking
- Pull performance projections.
- Link goal funding to investment accounts.

### Scenario Planning Engine
- Simple compound growth with adjustable parameters.
- AEI can run multi-scenario comparison automatically.

### Banking Data
- Use transactions to increment progress (savings contributions).

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| YNAB | Behavior-based budgeting | Weak long-term planning | SBF adds strategic layer |
| Empower | Net-worth + retirement | US-focused, closed | SBF custom scenarios |
| Kubera | Net-worth + tracking | Lacks narrative goals | SBF = goals + story + data |

---

## SBF Implementation Notes
- CLI: `sbf new finance.goal`, `sbf new finance.scenario`.
- AEI: simulate projections, detect gaps, suggest strategy.
- Dashboard: progress bars, scenario charts, funding breakdown.
- Cross-domain: connect goals to travel plans, health costs, skill development.

