"""
Test script for SBF VA API endpoints.

Run this to verify the API is working:
    python test_va_api.py
"""

import requests
import json
from datetime import datetime, timedelta

# API Configuration
BASE_URL = "http://localhost:8000/api/v1"
API_KEY = "test-api-key-12345"  # Replace with actual API key
HEADERS = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}


def print_response(name: str, response):
    """Pretty print API response"""
    print(f"\n{'='*60}")
    print(f"TEST: {name}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        data = response.json()
        print(f"Response:\n{json.dumps(data, indent=2)}")
    except:
        print(f"Response: {response.text}")
    print()


def test_health_check():
    """Test basic health endpoint"""
    response = requests.get(f"{BASE_URL.replace('/api/v1', '')}/healthz")
    print_response("Health Check", response)
    return response.status_code == 200


def test_create_client():
    """Test creating a VA client"""
    client = {
        "type": "va.client",
        "client_uid": "va-client-acme-corp",
        "name": "Acme Corporation",
        "email": "contact@acme.com",
        "company": "Acme Corp",
        "status": "active",
        "va_assigned": "sarah@va.com"
    }
    
    response = requests.post(
        f"{BASE_URL}/entities",
        headers=HEADERS,
        json=client
    )
    print_response("Create Client", response)
    return response.status_code == 200 and response.json().get("success")


def test_create_task():
    """Test creating a VA task"""
    task = {
        "type": "va.task",
        "client_uid": "va-client-acme-corp",
        "title": "Follow up on Q4 goals discussion",
        "description": "Schedule meeting to discuss quarterly objectives and key results",
        "priority": "high",
        "status": "pending",
        "due_date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
        "tags": ["follow-up", "Q4", "planning"],
        "assigned_to": "sarah@va.com"
    }
    
    response = requests.post(
        f"{BASE_URL}/entities",
        headers=HEADERS,
        json=task
    )
    print_response("Create Task", response)
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            return data["data"]["uid"]
    return None


def test_create_meeting():
    """Test creating a meeting"""
    meeting = {
        "type": "va.meeting",
        "client_uid": "va-client-acme-corp",
        "title": "Q4 Planning Session",
        "scheduled_time": (datetime.utcnow() + timedelta(days=7, hours=2)).isoformat(),
        "duration_minutes": 60,
        "platform": "zoom",
        "meeting_link": "https://zoom.us/j/123456789",
        "attendees": ["contact@acme.com", "sarah@va.com"],
        "agenda": "1. Review Q3 results\n2. Set Q4 OKRs\n3. Discuss resource allocation",
        "status": "scheduled"
    }
    
    response = requests.post(
        f"{BASE_URL}/entities",
        headers=HEADERS,
        json=meeting
    )
    print_response("Create Meeting", response)
    return response.status_code == 200 and response.json().get("success")


def test_query_entities():
    """Test querying entities"""
    # Query all tasks
    response = requests.get(
        f"{BASE_URL}/entities",
        headers=HEADERS,
        params={"type": "va.task"}
    )
    print_response("Query Tasks", response)
    
    # Query by client
    response = requests.get(
        f"{BASE_URL}/entities",
        headers=HEADERS,
        params={"client_uid": "va-client-acme-corp"}
    )
    print_response("Query by Client", response)
    
    return response.status_code == 200


def test_get_entity(uid: str):
    """Test getting a specific entity"""
    response = requests.get(
        f"{BASE_URL}/entities/{uid}",
        headers=HEADERS
    )
    print_response(f"Get Entity {uid}", response)
    return response.status_code == 200


def test_update_entity(uid: str):
    """Test updating an entity"""
    updates = {
        "status": "in_progress",
        "tags": ["follow-up", "Q4", "planning", "started"]
    }
    
    response = requests.patch(
        f"{BASE_URL}/entities/{uid}",
        headers=HEADERS,
        json=updates
    )
    print_response(f"Update Entity {uid}", response)
    return response.status_code == 200


def test_register_webhook():
    """Test webhook registration"""
    webhook = {
        "url": "https://webhook.site/your-unique-url",
        "events": ["entity.created", "entity.updated"],
        "filters": {
            "entity_type": "va.task",
            "client_uid": "va-client-acme-corp"
        }
    }
    
    response = requests.post(
        f"{BASE_URL}/webhooks",
        headers=HEADERS,
        json=webhook
    )
    print_response("Register Webhook", response)
    return response.status_code == 200


def test_get_statistics():
    """Test statistics endpoint"""
    response = requests.get(
        f"{BASE_URL}/stats",
        headers=HEADERS
    )
    print_response("Get Statistics", response)
    
    # Get stats for specific client
    response = requests.get(
        f"{BASE_URL}/stats",
        headers=HEADERS,
        params={"client_uid": "va-client-acme-corp"}
    )
    print_response("Get Client Statistics", response)
    
    return response.status_code == 200


def run_all_tests():
    """Run all API tests"""
    print("\n" + "="*60)
    print("SBF VA API - Integration Tests")
    print("="*60)
    print(f"\nAPI Base URL: {BASE_URL}")
    print(f"API Key: {API_KEY[:20]}...")
    
    # Run tests
    results = {}
    
    results["health"] = test_health_check()
    results["create_client"] = test_create_client()
    
    task_uid = test_create_task()
    results["create_task"] = task_uid is not None
    
    results["create_meeting"] = test_create_meeting()
    results["query_entities"] = test_query_entities()
    
    if task_uid:
        results["get_entity"] = test_get_entity(task_uid)
        results["update_entity"] = test_update_entity(task_uid)
    
    results["register_webhook"] = test_register_webhook()
    results["statistics"] = test_get_statistics()
    
    # Summary
    print("\n" + "="*60)
    print("TEST SUMMARY")
    print("="*60)
    
    passed = sum(results.values())
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}  {test_name}")
    
    print(f"\nResults: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! API is working correctly.")
    else:
        print(f"\n⚠️  {total - passed} test(s) failed.")
    
    return passed == total


if __name__ == "__main__":
    try:
        success = run_all_tests()
        exit(0 if success else 1)
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to API")
        print("Make sure the server is running:")
        print("  cd aei-core")
        print("  python main.py")
        exit(1)
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        exit(1)
