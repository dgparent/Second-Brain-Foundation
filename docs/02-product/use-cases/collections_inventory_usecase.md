# Collections & Inventory Management Use Case

## Overview
This use case defines a structured method for cataloging personal collections and inventories—books, tools, wines, coffee beans, equipment, games, electronics, ingredients, and other personal assets. It supports valuation, categorization, usage tracking, and relationship mapping to hobbies, projects, and financial domains.

---

## User Goals
- Maintain organized catalogs of personal belongings or collections.
- Track acquisition history, cost basis, condition, and usage.
- Connect items to hobby projects, sessions, recipes, or experiments.
- Track per-item performance, consumable quantity, expiration, or wear.
- Provide searchable inventory for decision-making and replacements.

---

## Problems & Pain Points
- Users forget what they own or where items are stored.
- No unified system for multi-category collections.
- Hard to track depreciation, expiration dates, or usage cycles.
- No linkage between inventory items and projects or financial cost tracking.
- Existing cataloging apps are niche and siloed (e.g., Goodreads for books, Ravelry for yarn, Vivino for wine).

---

## Data Requirements
- **Item metadata:** name, category, brand, model, purchase info.
- **Attributes:** quantity, size, condition, wear level, expiration.
- **Usage logs:** sessions, experiments, practice logs.
- **Relationships:** projects, recipes, financial accounts, goals.
- **Valuation:** estimated value, market price trends.

---

## Entity Model
### Entity: `hobby.item`
### Entity: `hobby.item_usage`
### Entity: `hobby.collection`

Key relationships:
- `belongs_to`: collection category
- `used_in`: projects, sessions, recipes
- `purchased_from`: vendor or link
- `tracked_in`: financial accounts (cost basis)

---

## YAML Example — Item
```yaml
---
uid: item-borosilicate-vessel-30cm
type: hobby.item
title: "30cm Borosilicate Vacuum Vessel"
category: equipment
subcategory: coffee_engineering
brand: "Scientific Glassworks"
model: "BG-30-VAC"
purchase_date: 2025-09-20
purchase_price: 89.99
currency: CAD
condition: "excellent"
location: "Home Lab Shelf 2"
notes: "For vacuum+IR roasting experiments"
linked_projects:
  - hobbyproj-vacuum-ir-roaster
---
```

---

## YAML Example — Book Entry (Collection)
```yaml
---
uid: item-book-mastery-greene
type: hobby.item
title: "Mastery"
category: book
author: "Robert Greene"
purchase_date: 2023-02-14
format: paperback
rating: 8
linked_projects:
  - learning-skilltree-mastery
notes: "Revisited chapter 3 for creativity section"
---
```

---

## YAML Example — Item Usage Log
```yaml
---
uid: usage-espresso-2025-11-11
type: hobby.item_usage
item_uid: item-pietro-grinder
date: 2025-11-11
duration_minutes: 10
activity: "Dialing in Ethiopia natural beans"
notes: "Grind setting 3.2 worked best"
---
```

---

## Integration Architecture
### Barcode / QR Scanning
- Mobile workflow to quickly add items to inventory.

### E-commerce Sites
- Optional ingestion of order history from Amazon, Lazada, Shopee, eBay.

### Specialized Platforms
- Goodreads, Ravelry, Vivino, Discogs → import via API or CSV.

### Spreadsheets
- CSV import for bulk inventory.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| Goodreads | Book metadata | Books only | SBF cross-category collections |
| Vivino | Wine tracking | Wine only | Unified tasting + inventory |
| Sortly | Inventory app | Paid, no PKM link | SBF graph integration |

---

## SBF Implementation Notes
- CLI: `sbf new hobby.item`, `sbf new hobby.item_usage`.
- AEI: detect duplicates, suggest replacements, track wear.
- Dashboards: category summaries, value estimates, usage frequency.
- Cross-domain connections: finance (spending), hobby projects, nutrition (ingredients).

