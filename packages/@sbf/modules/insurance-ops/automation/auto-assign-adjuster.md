# Auto-Assign Adjuster

## Purpose
Automatically assign the optimal adjuster to new claims

## Assignment Criteria
1. **Workload** - Current open claims count
2. **Expertise** - Match claim type to adjuster specialty
3. **Location** - Geographic proximity to loss location
4. **Availability** - Schedule and capacity
5. **Performance** - Historical metrics

## Assignment Algorithm
```
1. Filter adjusters by:
   - Claim type expertise
   - Geographic region
   - Availability status

2. Score each adjuster:
   - Workload score (lower is better)
   - Distance score (closer is better)
   - Performance score (higher is better)

3. Select highest combined score

4. Assign and notify adjuster
```

## Specialization Mapping
- Property claims → Property adjusters
- Auto claims → Auto specialists
- Liability → Liability experts
- Catastrophic → Senior adjusters

## Overrides
- Manual assignment allowed
- Priority claims → specific senior adjusters
- VIP policyholders → preferred adjusters
- Complex cases → team leads

## Notifications
- Adjuster receives claim assignment
- Manager notified if high severity
- Claimant receives adjuster contact info

## Metrics Tracked
- Assignment time
- Workload distribution
- Assignment accuracy
- Override frequency
