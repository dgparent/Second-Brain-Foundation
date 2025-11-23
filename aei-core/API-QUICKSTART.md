# SBF VA API - Quick Start Guide

## 🚀 Starting the API Server

### Option 1: Direct Python
```bash
cd aei-core
python main.py
```

The API will be available at: http://localhost:8000

### Option 2: With Uvicorn
```bash
cd aei-core
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Option 3: Docker (TODO)
```bash
docker-compose up api
```

---

## 📖 API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Health Check:** http://localhost:8000/healthz

---

## 🧪 Testing the API

### Run Integration Tests
```bash
cd aei-core
python test_va_api.py
```

### Manual Testing with cURL

**Create a Client:**
```bash
curl -X POST http://localhost:8000/api/v1/entities \
  -H "Authorization: Bearer test-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "va.client",
    "client_uid": "va-client-test-001",
    "name": "Test Client",
    "email": "test@example.com",
    "status": "active"
  }'
```

**Create a Task:**
```bash
curl -X POST http://localhost:8000/api/v1/entities \
  -H "Authorization: Bearer test-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "va.task",
    "client_uid": "va-client-test-001",
    "title": "Follow up email",
    "priority": "high",
    "status": "pending"
  }'
```

**Query Tasks:**
```bash
curl -X GET "http://localhost:8000/api/v1/entities?type=va.task" \
  -H "Authorization: Bearer test-api-key"
```

**Get Statistics:**
```bash
curl -X GET http://localhost:8000/api/v1/stats \
  -H "Authorization: Bearer test-api-key"
```

---

## 🔗 Integration with Activepieces

### Configure SBF Connection

1. Open Activepieces (http://localhost:8080)
2. Add SBF Piece
3. Configure authentication:
   - **API Base URL:** http://localhost:8000
   - **API Key:** test-api-key (or your generated key)

### Example Workflow

```
Manual Trigger
→ SBF Create Task
  - client_uid: va-client-test-001
  - title: "New task from Activepieces"
  - priority: high
→ Success!
```

---

## 📊 API Endpoints

### Entity Management
- `POST /api/v1/entities` - Create entity
- `GET /api/v1/entities` - Query entities
- `GET /api/v1/entities/{uid}` - Get entity
- `PATCH /api/v1/entities/{uid}` - Update entity
- `DELETE /api/v1/entities/{uid}` - Delete entity

### Webhooks
- `POST /api/v1/webhooks` - Register webhook
- `GET /api/v1/webhooks` - List webhooks
- `DELETE /api/v1/webhooks` - Unregister webhook

### Statistics
- `GET /api/v1/stats` - Get statistics

---

## 🔐 Authentication

All endpoints (except health checks) require authentication via Bearer token:

```
Authorization: Bearer YOUR_API_KEY
```

---

## 🎯 Supported Entity Types

### va.client
Client/customer information
- name, email, phone, company
- status, onboarding_date, va_assigned

### va.task
Task tracking
- title, description, priority, status
- due_date, tags, assigned_to

### va.meeting
Meeting records
- title, scheduled_time, duration_minutes
- platform, meeting_link, attendees, agenda

### va.report
Status reports (future)

### va.sop
Standard Operating Procedures (future)

---

## 📝 Notes

- **Database:** Currently using in-memory storage (entities_db dict)
- **Production:** Replace with PostgreSQL/MongoDB
- **API Keys:** Implement proper key management
- **Webhooks:** Currently async HTTP POST
- **Validation:** Pydantic models enforce type safety

---

## 🚀 Next Steps

1. ✅ API endpoints implemented
2. ✅ Test script created
3. ⏭️  Test with Activepieces
4. ⏭️  Implement database persistence
5. ⏭️  Add API key management
6. ⏭️  Build n8n node
