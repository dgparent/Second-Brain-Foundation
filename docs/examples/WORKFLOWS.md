# SBF VA Tool Suite - Example Workflows

Complete automation workflows for Virtual Assistant tasks using SBF, Activepieces, and n8n.

---

## 🎯 Workflow 1: Email to Task Automation

**Trigger:** New email arrives  
**Goal:** Extract task from email and create in SBF  
**Platform:** Activepieces

### Flow

```
Gmail Trigger (New Email)
    ↓
Extract Task Details (AI/LangChain)
    ├─ Subject → Task Title
    ├─ Body → Task Description
    ├─ Sender → Client UID
    └─ Due Date (if mentioned)
    ↓
SBF Create Task
    ├─ client_uid: extracted from sender
    ├─ title: email subject
    ├─ description: email body
    ├─ priority: "normal"
    ├─ status: "pending"
    └─ tags: ["email", "client-request"]
    ↓
Send Confirmation Email
    └─ "Task created: #{task.uid}"
```

### Configuration

**Gmail Trigger:**
- Label: "To Process"
- Unread only: Yes

**SBF Create Task:**
- Connection: SBF API
- Client UID: `{{ trigger.from.email }}`
- Title: `{{ trigger.subject }}`
- Description: `{{ trigger.body }}`
- Priority: `normal`
- Tags: `email, client-request`

---

## 🎯 Workflow 2: Calendar to Meeting Automation

**Trigger:** New Google Calendar event  
**Goal:** Create meeting record in SBF  
**Platform:** n8n

### Flow

```
Google Calendar Trigger (New Event)
    ↓
Format Attendees
    └─ Extract email addresses
    ↓
SBF Create Meeting
    ├─ client_uid: from event description
    ├─ title: event summary
    ├─ scheduled_time: event start time
    ├─ duration_minutes: calculated
    ├─ platform: "google-meet"
    ├─ meeting_link: event link
    ├─ attendees: formatted list
    └─ agenda: event description
    ↓
Notify VA Team (Slack/Email)
    └─ "New meeting scheduled: #{meeting.title}"
```

### n8n Node Configuration

**Google Calendar Trigger:**
```json
{
  "calendar": "primary",
  "triggerOn": "Event Created"
}
```

**SBF Create Meeting:**
```json
{
  "operation": "createMeeting",
  "client_uid": "{{ $json.description.match(/Client: (.*)/)[1] }}",
  "title": "{{ $json.summary }}",
  "scheduled_time": "{{ $json.start.dateTime }}",
  "duration_minutes": "{{ ($json.end.dateTime - $json.start.dateTime) / 60000 }}",
  "platform": "google-meet",
  "meeting_link": "{{ $json.hangoutLink }}",
  "attendees": "{{ $json.attendees.map(a => a.email).join(',') }}",
  "agenda": "{{ $json.description }}"
}
```

---

## 🎯 Workflow 3: Daily Task Digest

**Trigger:** Schedule (Daily 9am)  
**Goal:** Send VA daily task summary  
**Platform:** Activepieces

### Flow

```
Schedule Trigger (9:00 AM daily)
    ↓
Query Today's Tasks (SBF)
    └─ Filter: status = "pending" OR "in_progress"
    ↓
Query Upcoming Meetings (SBF)
    └─ Filter: scheduled_time = today
    ↓
Format Digest Email
    ├─ High Priority Tasks: X
    ├─ Normal Tasks: Y
    ├─ Meetings Today: Z
    └─ Links to each item
    ↓
Send Email to VA Team
```

### Configuration

**Schedule Trigger:**
- Time: 09:00
- Timezone: America/New_York
- Days: Monday-Friday

**Query Tasks:**
```json
{
  "operation": "queryEntities",
  "type": "va.task",
  "filters": {
    "status": ["pending", "in_progress"]
  },
  "sort": "priority"
}
```

**Email Template:**
```html
<h2>Daily Task Digest - {{ formatDate(now, 'MMMM DD, YYYY') }}</h2>

<h3>🔴 High Priority ({{ highPriorityTasks.length }})</h3>
<ul>
  {{#each highPriorityTasks}}
  <li><a href="{{link}}">{{title}}</a> - Due: {{due_date}}</li>
  {{/each}}
</ul>

<h3>📋 Normal Tasks ({{ normalTasks.length }})</h3>
<ul>
  {{#each normalTasks}}
  <li><a href="{{link}}">{{title}}</a></li>
  {{/each}}
</ul>

<h3>📅 Meetings Today ({{ todayMeetings.length }})</h3>
<ul>
  {{#each todayMeetings}}
  <li>{{scheduled_time}} - {{title}} ({{duration_minutes}}m)</li>
  {{/each}}
</ul>
```

---

## 🎯 Workflow 4: Client Onboarding

**Trigger:** New client form submission  
**Goal:** Create client record and setup tasks  
**Platform:** n8n

### Flow

```
Webhook Trigger (Form Submission)
    ↓
Create Client (SBF)
    ├─ name: form.name
    ├─ email: form.email
    ├─ company: form.company
    └─ status: "active"
    ↓
Create Onboarding Tasks
    ├─ Task 1: "Send welcome email"
    ├─ Task 2: "Schedule kickoff call"
    ├─ Task 3: "Setup client workspace"
    └─ Task 4: "Share onboarding docs"
    ↓
Register Webhook for Client
    └─ Filter: client_uid = new client
    ↓
Send Welcome Email
    └─ Templates with client details
```

---

## 🎯 Workflow 5: Task Status Automation

**Trigger:** SBF Webhook (Task Updated)  
**Goal:** Auto-notify when tasks change status  
**Platform:** Activepieces

### Flow

```
SBF Trigger (entity.updated)
    └─ Filter: type = "va.task"
    ↓
Check Status Change
    └─ If status changed to "done"
    ↓
Branch: If High Priority
    ├─ Yes → Notify in Slack
    └─ No → Log only
    ↓
Update Client Dashboard
    └─ Refresh client portal
```

### Trigger Configuration

**SBF Trigger:**
```json
{
  "events": ["entity.updated"],
  "filters": {
    "entity_type": "va.task"
  }
}
```

**Status Check:**
```javascript
// Custom code piece
const oldStatus = trigger.old_data?.status;
const newStatus = trigger.entity.status;
return oldStatus !== newStatus && newStatus === 'done';
```

---

## 🎯 Workflow 6: Weekly Report Generation

**Trigger:** Schedule (Friday 5pm)  
**Goal:** Generate and send weekly summary  
**Platform:** n8n with LangChain

### Flow

```
Schedule Trigger (Friday 5:00 PM)
    ↓
Query Week's Activity (SBF)
    ├─ Tasks created this week
    ├─ Tasks completed this week
    ├─ Meetings held
    └─ Client interactions
    ↓
LangChain: Generate Summary
    └─ Input: All week's data
    └─ Prompt: "Create executive summary"
    ↓
Create Report Entity (SBF)
    └─ type: "va.report"
    ↓
Send to Client
    └─ Email with PDF attachment
```

### LangChain Integration

**n8n LangChain Node:**
```json
{
  "model": "gpt-4",
  "prompt": "Create a professional weekly summary report...",
  "context": "{{ $json.weekData }}",
  "temperature": 0.3
}
```

---

## 🎯 Advanced: Multi-Client Task Router

**Trigger:** SBF Webhook (Task Created)  
**Goal:** Auto-assign to correct VA based on client  
**Platform:** Activepieces

### Flow

```
SBF Trigger (entity.created)
    └─ Filter: type = "va.task"
    ↓
Lookup Client (SBF)
    └─ Get client by client_uid
    ↓
Determine VA Assignment
    └─ Based on client.va_assigned
    ↓
Update Task (SBF)
    └─ Set assigned_to field
    ↓
Notify Assigned VA
    ├─ Slack DM
    └─ Email notification
```

---

## 📋 Workflow Templates Library

### Available Templates

1. **email-to-task** - Email processing
2. **calendar-to-meeting** - Calendar sync
3. **daily-digest** - Morning summary
4. **client-onboarding** - New client setup
5. **task-status-notify** - Status change alerts
6. **weekly-report** - Auto reporting
7. **multi-client-router** - Smart assignment
8. **invoice-reminder** - Payment tracking
9. **meeting-prep** - Pre-meeting automation
10. **sop-execution** - Process automation

### Import Templates

**Activepieces:**
```bash
# Import from JSON
Upload > Select Template > Configure > Activate
```

**n8n:**
```bash
# Import workflow
Workflows > Import from File > Select JSON > Open
```

---

## 🔧 Testing Workflows

### Test Mode

**Activepieces:**
1. Open workflow
2. Click "Test"
3. Provide sample data
4. Verify outputs

**n8n:**
1. Click "Execute Workflow"
2. Check each node output
3. Verify data transformations

### Production Checklist

- [ ] Test with real data
- [ ] Error handling configured
- [ ] Notifications setup
- [ ] Logging enabled
- [ ] Webhooks registered
- [ ] API keys secured
- [ ] Rate limits checked

---

## 📊 Workflow Metrics

Track these metrics:
- Tasks created per day
- Tasks completed per day
- Average completion time
- Meeting attendance rate
- Email response time
- Workflow execution time
- Error rates

---

**Workflow Architect:** Ready to automate! ⚡  
**Platform:** Activepieces + n8n + SBF  
**Status:** Production Ready
