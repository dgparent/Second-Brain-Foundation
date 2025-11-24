# Carrier Sync

## Purpose
Synchronize tracking data from carrier APIs automatically

## Supported Integrations
- Ocean carriers (Maersk, MSC, etc.)
- Air cargo (via IATA ONE Record)
- Trucking companies
- Rail operators
- Courier services

## Process
1. Poll carrier APIs at intervals
2. Match tracking numbers to consignments
3. Parse event data
4. Create `transport_event` entities
5. Update `transport_leg` status
6. Update `consignment` status
7. Trigger customer notifications

## Event Mapping
- Carrier "picked up" → `pickup` event
- Carrier "departed" → `departure` event
- Carrier "arrived" → `arrival` event
- Carrier "delivered" → `delivery` event
- Carrier "delayed" → `exception` event

## Error Handling
- Retry on API failures
- Log sync errors
- Alert on missing updates
- Manual override capability

## Configuration
- Polling frequency (default: 1 hour)
- Carrier credentials storage
- Event type mappings
- Customer notification rules

## Benefits
- Real-time tracking visibility
- Reduced manual data entry
- Proactive exception management
- Improved customer communication
