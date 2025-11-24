# Damage Item Entity

## Overview
Represents a specific item or area of damage found during inspection

## Schema
```yaml
uid: dmg-2025-03-11-01
type: damage_item
inspection_uid: insp-2025-03-10-01
category: water_damage
area: kitchen
severity: medium
estimated_cost: 850.00
notes: "Cabinet base swollen; flooring warped."
```

## Severity Levels
- `minor` - Cosmetic or small
- `medium` - Moderate damage
- `major` - Significant damage

## Relationships
- Belongs to: `field_inspection`
- Referenced by: `estimation_record`

## Used By
- Damage cataloging
- Cost estimation
- Repair scoping
