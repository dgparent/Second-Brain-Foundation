# Auto Route Plan

## Purpose
Automatically generate optimal multi-modal transport routes

## Inputs
- Origin location
- Destination location
- Service type (FCL, LCL, air, etc.)
- Requested delivery date
- Special requirements (temperature, hazmat, etc.)

## Logic
1. Analyze origin-destination pair
2. Identify available modes (road, sea, air, rail)
3. Determine optimal mode mix
4. Create transport legs in sequence
5. Assign estimated transit times
6. Set planned departure/arrival times
7. Suggest carriers for each leg
8. Calculate estimated cost

## Mode Selection Rules
- Distance-based (< 500km = road only)
- International = road + sea/air
- Urgent = prioritize air
- Heavy/bulk = prefer sea
- Landlocked = road + rail options

## Output
- Sequence of `transport_leg` entities
- Estimated timeline
- Recommended carriers
- Cost estimate

## Future Enhancements
- Real-time carrier capacity check
- Machine learning route optimization
- Historical performance analysis
- Carbon footprint calculation
