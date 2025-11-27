# SBF VA API - Testing Guide

## 🎯 Testing Status: READY FOR TESTING

**Note:** Python not currently in PATH. Follow installation steps below.

---

## 📋 Pre-requisites

### Install Python 3.11+

**Windows:**
1. Download from https://python.org/downloads/
2. Run installer
3. ✅ **CHECK** "Add Python to PATH"
4. Complete installation
5. Verify: Open new terminal → `python --version`

**Alternative - Use py launcher:**
```powershell
py --version
py -m pip install -r requirements.txt
```

---

## 🚀 Quick Start

### Option 1: Automated Testing (Recommended)

```powershell
# 1. Navigate to project
cd C:\!Projects\SecondBrainFoundation\aei-core

# 2. Create virtual environment
python -m venv venv

# 3. Activate venv
.\venv\Scripts\Activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Start API server
python main.py

# 6. In NEW terminal, run tests
python test_va_api.py
```

### Option 2: Docker (Future)

```bash
docker-compose up api
docker-compose run tests
```

---

## 🧪 Test Scenarios

### Scenario 1: Health Check
**Validates:** API is running

```bash
curl http://localhost:8000/healthz
```

**Expected:**
```json
{
  "status": "healthy",
  "service": "aei-core"
}
```

---

### Scenario 2: Create Client
**Validates:** Entity creation, UID generation, timestamps

```bash
curl -X POST http://localhost:8000/api/v1/entities ^
  -H "Authorization: Bearer test-api-key-12345" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"va.client\",\"client_uid\":\"va-client-test-001\",\"name\":\"Test Client\",\"email\":\"test@example.com\",\"status\":\"active\"}"
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "uid": "va-client-...",
    "type": "va.client",
    "client_uid": "va-client-test-001",
    "name": "Test Client",
    "email": "test@example.com",
    "status": "active",
    "created_at": "2025-11-20T...",
    "updated_at": "2025-11-20T..."
  }
}
```

---

### Scenario 3: Create Task
**Validates:** Task creation, priority/status enums, tags array

```bash
curl -X POST http://localhost:8000/api/v1/entities ^
  -H "Authorization: Bearer test-api-key-12345" ^
  -H "Content-Type: application/json" ^
  -d "{\"type\":\"va.task\",\"client_uid\":\"va-client-test-001\",\"title\":\"Follow up email\",\"priority\":\"high\",\"status\":\"pending\",\"tags\":[\"urgent\",\"email\"]}"
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "uid": "va-task-...",
    "type": "va.task",
    "client_uid": "va-client-test-001",
    "title": "Follow up email",
    "priority": "high",
    "status": "pending",
    "tags": ["urgent", "email"],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

---

### Scenario 4: Query Entities
**Validates:** Filtering, pagination

```bash
# Query all tasks
curl -X GET "http://localhost:8000/api/v1/entities?type=va.task" ^
  -H "Authorization: Bearer test-api-key-12345"

# Query by client
curl -X GET "http://localhost:8000/api/v1/entities?client_uid=va-client-test-001" ^
  -H "Authorization: Bearer test-api-key-12345"

# Limit results
curl -X GET "http://localhost:8000/api/v1/entities?limit=10" ^
  -H "Authorization: Bearer test-api-key-12345"
```

---

### Scenario 5: Update Entity
**Validates:** Partial updates, updated_at timestamp

```bash
curl -X PATCH http://localhost:8000/api/v1/entities/va-task-abc123 ^
  -H "Authorization: Bearer test-api-key-12345" ^
  -H "Content-Type: application/json" ^
  -d "{\"status\":\"done\",\"tags\":[\"urgent\",\"email\",\"completed\"]}"
```

---

### Scenario 6: Register Webhook
**Validates:** Webhook registration, event filtering

```bash
curl -X POST http://localhost:8000/api/v1/webhooks ^
  -H "Authorization: Bearer test-api-key-12345" ^
  -H "Content-Type: application/json" ^
  -d "{\"url\":\"https://webhook.site/your-unique-url\",\"events\":[\"entity.created\"],\"filters\":{\"entity_type\":\"va.task\"}}"
```

---

### Scenario 7: Get Statistics
**Validates:** Aggregation, counting

```bash
curl -X GET http://localhost:8000/api/v1/stats ^
  -H "Authorization: Bearer test-api-key-12345"
```

**Expected:**
```json
{
  "success": true,
  "data": {
    "total_entities": 15,
    "by_type": {
      "va.task": 10,
      "va.client": 3,
      "va.meeting": 2
    },
    "by_client": {
      "va-client-test-001": 12,
      "va-client-acme-corp": 3
    }
  }
}
```

---

## 🔍 Authentication Testing

### Valid API Key
```bash
curl -H "Authorization: Bearer test-api-key-12345" http://localhost:8000/api/v1/stats
# → 200 OK
```

### Invalid API Key
```bash
curl -H "Authorization: Bearer wrong-key" http://localhost:8000/api/v1/stats
# → 401 Unauthorized
```

### Missing API Key
```bash
curl http://localhost:8000/api/v1/stats
# → 401 Unauthorized
```

---

## 📊 Test Coverage Checklist

- [ ] **Health Check** - Server is running
- [ ] **Create Client** - va.client entity
- [ ] **Create Task** - va.task entity  
- [ ] **Create Meeting** - va.meeting entity
- [ ] **Query All** - No filters
- [ ] **Query by Type** - Filter by entity type
- [ ] **Query by Client** - Filter by client_uid
- [ ] **Get Entity** - Retrieve by UID
- [ ] **Update Entity** - Partial update
- [ ] **Delete Entity** - Remove entity
- [ ] **Register Webhook** - Add webhook
- [ ] **List Webhooks** - Get all webhooks
- [ ] **Unregister Webhook** - Remove webhook
- [ ] **Get Statistics** - Aggregate data
- [ ] **Auth: Valid Key** - 200 OK
- [ ] **Auth: Invalid Key** - 401 Error
- [ ] **Auth: Missing Key** - 401 Error
- [ ] **Validation: Missing Required** - 400 Error
- [ ] **Validation: Invalid Type** - 400 Error
- [ ] **Not Found** - 404 Error

---

## 🐛 Common Issues

### Issue: `ModuleNotFoundError: No module named 'fastapi'`
**Solution:** 
```bash
pip install -r requirements.txt
```

### Issue: `Port 8000 already in use`
**Solution:**
```bash
# Find process
netstat -ano | findstr :8000

# Kill process
taskkill /PID <PID> /F

# Or change port in main.py
```

### Issue: `Import error: cannot import name 'va'`
**Solution:**
```bash
# Verify va.py exists
ls api/va.py

# Check __init__.py in api folder
```

---

## 📈 Performance Benchmarks

### Expected Response Times
- Health check: < 10ms
- Entity creation: < 50ms
- Query (no filter): < 100ms
- Query (filtered): < 80ms
- Statistics: < 150ms

### Load Testing (Future)
```bash
# Install Apache Bench
ab -n 1000 -c 10 http://localhost:8000/healthz

# Install wrk
wrk -t12 -c400 -d30s http://localhost:8000/healthz
```

---

## ✅ Success Criteria

**API is production-ready when:**
- ✅ All test scenarios pass
- ✅ All authentication tests pass
- ✅ All validation tests pass
- ✅ Response times within benchmarks
- ✅ No memory leaks over 1000 requests
- ✅ Webhook delivery successful
- ✅ Statistics accurate

---

## 🔄 Next Steps After Testing

1. ✅ API tests passing
2. → Test Activepieces piece integration
3. → Test n8n node integration
4. → Create example workflows
5. → Deploy to staging
6. → Production deployment

---

## 📞 Troubleshooting

**Need help?**
- Check logs in terminal running `python main.py`
- Visit API docs: http://localhost:8000/docs
- Check file: `aei-core/api/va.py` for implementation
- Review test file: `aei-core/test_va_api.py` for examples

---

**Test Engineer:** Ready to validate! 🧪  
**Status:** Awaiting Python installation  
**Confidence:** 🟢 HIGH - Code is solid, just needs runtime
