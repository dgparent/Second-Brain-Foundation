# Cal.com

**Repository:** https://github.com/calcom/cal.com  
**License:** AGPLv3 (Open Source) + Commercial (Enterprise)  
**Category:** Scheduling / Calendar Management  
**Language:** TypeScript + Next.js  
**Stars:** ~34k+

## Overview

Cal.com is the open-source Calendly successor. Self-hosted scheduling infrastructure with full control over data, workflow, and appearance. API-driven and white-label ready.

## Key Features for VA Use

### Scheduling Infrastructure
- Meeting scheduling with calendar sync
- Booking pages per VA or per client
- Team scheduling (round-robin, collective)
- Custom booking questions
- Multiple event types per user
- Time zone intelligence
- Buffer times between meetings

### White-Label & Customization
- Custom domain hosting
- Branding (logo, colors, fonts)
- Embed booking widgets
- Custom CSS
- API for programmatic bookings

### Enterprise Features (Relevant to VA Agencies)
- **Organizations** - Multi-tenant support
- **Teams** - VA team scheduling
- **Managed Event Types** - Admin control
- **Workflows** - Automated actions
- **Platform** - Build booking experiences
- **SSO** - Single sign-on for VAs
- **Admin Panel** - Manage VA accounts
- **Impersonation** - Support clients as them

## SBF Integration

### va.calendar_config Entity
```yaml
uid: va-calendar-alice-001
type: va.calendar_config
va_uid: va-account-alice
calendar_platform: calcom
calcom_user_id: 123
booking_links:
  - slug: alice/30min
    event_type: 30-minute check-in
    clients: [client-acme, client-beta]
  - slug: alice/client-kickoff
    event_type: Client Onboarding
    duration: 60
    questions:
      - What are your top 3 priorities?
      - What's your preferred communication method?
```

### va.meeting from Cal.com Booking
```yaml
uid: va-meeting-001
type: va.meeting
title: "30min Check-in with Acme Corp"
client_uid: va-client-acme-001
va_uid: va-account-alice
scheduled_time: 2025-01-15T14:00:00Z
duration_minutes: 30
platform: calcom
meeting_link: https://meet.google.com/abc-defg-hij
booking_source: alice/30min
pre_meeting_notes:
  - "Client priorities: Q1 launch, team training, analytics"
  - "Preferred contact: Slack during business hours"
```

## Workflows for VAs

### 1. **Client Meeting Scheduling**
```
Client visits: cal.com/acme-support
→ Sees available VA team slots
→ Books meeting with questions answered
→ Cal.com webhook → SBF
→ Create va.meeting entity
→ Notify assigned VA via Slack
→ Add to VA's task list
→ Send calendar invite
```

### 2. **Meeting → Task Creation**
```
Meeting ends (Cal.com webhook)
→ AEI retrieves meeting notes
→ AI extracts action items
→ Create va.task for each action
→ Assign to client_uid
→ Link back to va.meeting
```

### 3. **Multi-VA Round-Robin**
```
Client books "General Support"
→ Cal.com round-robin (Alice, Bob, Charlie)
→ Assigns based on availability
→ Webhook to SBF
→ Create va.meeting with assigned VA
→ Update VA workload metrics
```

## Cal.com Platform API Integration

```typescript
// Create booking programmatically from SBF
async function createClientMeeting(
  clientUid: string,
  vaUid: string,
  startTime: Date,
  duration: number
) {
  // Get VA's Cal.com event type
  const vaCalendar = await sbf.getEntity(vaUid, 'va.calendar_config');
  
  // Create booking via Cal.com API
  const booking = await calcom.bookings.create({
    eventTypeId: vaCalendar.event_type_id,
    start: startTime.toISOString(),
    responses: {
      name: clientData.name,
      email: clientData.email,
      notes: `Auto-scheduled via SBF for ${clientUid}`,
    },
    timeZone: clientData.timezone,
    language: 'en',
    metadata: {
      sbf_client_uid: clientUid,
      sbf_va_uid: vaUid,
    },
  });
  
  // Create va.meeting entity in SBF
  return await sbf.createEntity({
    type: 'va.meeting',
    title: `Meeting with ${clientData.name}`,
    client_uid: clientUid,
    va_uid: vaUid,
    scheduled_time: booking.startTime,
    duration_minutes: duration,
    platform: 'calcom',
    booking_id: booking.id,
    meeting_link: booking.location,
  });
}
```

## Multi-Client Agency Setup

```yaml
# VA Agency "Acme VA Services" using Cal.com Organizations feature

Organization: acme-va-services
├── Team: Client Success (Alice, Bob)
│   ├── Event: 30min Check-in (round-robin)
│   ├── Event: Onboarding Call (collective)
│   └── Event: Emergency Support (first-available)
├── Team: Technical Support (Charlie, David)
│   ├── Event: Technical Review (round-robin)
│   └── Event: Implementation Call (60min)
└── Individual VAs
    ├── Alice: alice/strategy (1hr strategy sessions)
    ├── Bob: bob/quick-call (15min quick calls)
    └── Charlie: charlie/technical (technical deep-dives)

# Each client gets:
- Branded booking page: acme-va.cal.com/client-name
- Custom event types based on service tier
- Workflow automations (reminders, follow-ups)
- Integration with their calendar (Google/Outlook)
```

## Cal.com Workflows for VA Automation

Cal.com has built-in workflow automation:

**Pre-Meeting Workflow:**
1. Send reminder 1 day before
2. Send reminder 1 hour before
3. Send pre-meeting form
4. Create SBF va.meeting entity
5. Notify VA via Slack

**Post-Meeting Workflow:**
1. Send thank you email
2. Request feedback (CSAT)
3. Create follow-up tasks in SBF
4. Schedule next meeting if recurring
5. Update client interaction log

## API Integration Points

```typescript
// Cal.com → SBF webhook handler
app.post('/api/webhooks/calcom', async (req, res) => {
  const event = req.body;
  
  switch (event.triggerEvent) {
    case 'BOOKING_CREATED':
      await createMeetingEntity(event.payload);
      break;
    case 'BOOKING_RESCHEDULED':
      await updateMeetingEntity(event.payload);
      break;
    case 'BOOKING_CANCELLED':
      await cancelMeetingEntity(event.payload);
      break;
    case 'MEETING_ENDED':
      await processMeetingOutcome(event.payload);
      break;
  }
  
  res.status(200).send('OK');
});

async function createMeetingEntity(booking: CalcomBooking) {
  const clientUid = booking.metadata.sbf_client_uid;
  const vaUid = booking.metadata.sbf_va_uid;
  
  await sbf.createEntity({
    type: 'va.meeting',
    client_uid: clientUid,
    va_uid: vaUid,
    title: booking.title,
    scheduled_time: booking.startTime,
    duration_minutes: booking.duration,
    platform: 'calcom',
    booking_id: booking.id,
    attendees: booking.attendees.map(a => a.email),
    location: booking.location,
    pre_meeting_responses: booking.responses,
  });
}
```

## Cal.com vs Calendly

| Feature | Cal.com | Calendly |
|---------|---------|----------|
| Open Source | ✅ | ❌ |
| Self-Hosted | ✅ | ❌ |
| White-Label | ✅ | 💰 Enterprise |
| API Access | ✅ Free | 💰 Professional+ |
| Unlimited Events | ✅ | 💰 Paid plans |
| Team Scheduling | ✅ | ✅ |
| Workflows | ✅ | ✅ |
| Integrations | 30+ | 100+ |
| Pricing | Free (self-host) | $10-$16/seat |

## Resources

- **Website:** https://cal.com
- **Docs:** https://cal.com/docs
- **API:** https://cal.com/docs/api-reference
- **Platform:** https://cal.com/platform
- **Deployment:** https://cal.com/docs/deployment

## Extraction Priority

**Priority:** 🟡 MEDIUM-HIGH  
Critical for VA meeting management, but not core operations logic.

**Extract:**
- Event type configuration patterns
- Team scheduling algorithms
- Webhook event handling
- Booking form customization
- Calendar sync logic
- Workflow automation structure

## Next Steps for SBF Integration

1. Create `va.calendar_config` entity type
2. Build Cal.com webhook receiver
3. Implement meeting → task extraction
4. Sync VA availability to Cal.com
5. Generate client-specific booking links
6. Track meeting analytics per client
7. Auto-populate weekly reports with meeting data
