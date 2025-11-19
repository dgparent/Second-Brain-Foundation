# Travel Planning & Trip Management Use Case

## Overview
This use case defines a complete framework for planning, organizing, and tracking travel—flights, itineraries, lodging, budgets, packing lists, documents, maps, and post-trip reflections. It integrates logistics with personal goals, hobbies, budgeting, health, and even research workflows.

---

## User Goals
- Organize all travel information in one structured system.
- Track logistics: flights, hotels, transportation, visas.
- Build smart packing lists based on destination, weather, activities.
- Manage travel budgets and categorize expenses.
- Link travel to hobbies (coffee tours, food, hiking), research, or personal goals.
- Maintain trip histories with photos, notes, and insights.

---

## Problems & Pain Points
- Travel information scattered across emails, apps, PDFs, and screenshots.
- No unified, markdown-based travel planning system.
- Users frequently forget packing essentials or logistics.
- Hard to track travel spending and integrate into budgeting.
- Post-trip insights often lost or not recorded.

---

## Data Requirements
- **Logistics:** flights, hotels, trains, car rentals, check-in/check-out times.
- **Documents:** passports, visas, tickets, insurance.
- **Packing lists:** category-based items.
- **Activities:** itineraries, reservations, tours.
- **Budget:** planned vs actual expenses.
- **Relationships:** health (jet lag), finance, hobbies (food, coffee tours), research.

---

## Entity Model
### Entity: `travel.trip`
### Entity: `travel.logistic`
### Entity: `travel.packing_item`
### Entity: `travel.expense`

Key relationships:
- `includes`: logistics, packing lists, activities
- `linked_to`: goals, hobbies, research topics, health logs
- `costs_tracked_in`: finance domain

---

## YAML Example — Trip
```yaml
---
uid: trip-davao-2026
type: travel.trip
title: "Mindanao Farm Project & Coffee Sourcing Trip"
destination: "Davao, Philippines"
start_date: 2026-02-10
end_date: 2026-03-05
purpose:
  - "Visit farm property options"
  - "Coffee sourcing & post-harvest R&D"
  - "Meet suppliers in Bukidnon & Gensan"
related_goals:
  - goal-davao-homestead-2027
linked_projects:
  - hobbyproj-vacuum-ir-roaster
notes: "Check solar suppliers & container logistics."
sensitivity: normal
---
```

---

## YAML Example — Flight Log
```yaml
---
uid: triplog-davao-2026-flight1
type: travel.logistic
trip_uid: trip-davao-2026
logistic_type: flight
carrier: "Philippine Airlines"
flight_number: "PR119"
departure:
  airport: "YVR"
  datetime: "2026-02-10T23:30"
arrival:
  airport: "MNL"
  datetime: "2026-02-12T04:45"
ticket_number: "7842349982239"
notes: "Check baggage allowance for equipment."
sensitivity: confidential
---
```

---

## YAML Example — Packing List Item
```yaml
---
uid: packitem-microinverter-2026
type: travel.packing_item
trip_uid: trip-davao-2026
category: equipment
item: "Microinverter test kit"
quantity: 1
required_for:
  - hobbyproj-solar-offgrid-tests
notes: "Bring multimeter + adapter."
---
```

---

## YAML Example — Travel Expense
```yaml
---
uid: travelexpense-2026-coffeefarm
type: travel.expense
trip_uid: trip-davao-2026
amount: 3200
currency: CAD
category: flights
linked_finance_transaction: txn-2026-01-14-pr119
notes: "Round-trip flight cost."
sensitivity: confidential
---
```

---

## Integration Architecture
### Email Parsing
- Extract flight/hotel confirmations from email.

### Calendar Sync
- Add key travel dates to personal calendars.

### Maps & Location
- Store coordinates for accommodations, farms, roasters.

### Budget Integration
- Link travel expenses to finance domain.

### Health Integration
- Jet lag logs, symptoms, vaccinations, travel medicine.

### AI/AEI Enhancements
- Generate packing list automatically based on weather + activities.
- Build itinerary from saved content sources.
- Summarize post-trip reflections into permanent notes.

---

## Competitive Landscape
| Tool | Strengths | Weaknesses | Opportunity |
|------|-----------|------------|-------------|
| TripIt | Automated itinerary | Cloud-only | SBF local-first & cross-domain |
| Notion templates | Flexible | Manual | SBF automation + structured YAML |
| Google Trips (legacy) | Good aggregation | Discontinued | SBF fill the gap |

---

## SBF Implementation Notes
- CLI: `sbf new travel.trip`, `sbf new travel.logistic`.
- AEI: generate itinerary, packing list, budget forecast.
- Dashboard: timeline, map view, logistics board.
- Cross-domain links: finance, health, hobby projects, research, journaling.

