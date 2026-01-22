import requests
import sys
import os

# Add test_helpers to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_helpers import get_auth_headers, BASE_URL

HEADERS = get_auth_headers()
TIMEOUT = 30


def testservicescrudoperations():
    service_data_create = {
        "name": "Test Towing Service",
        "description": "Reliable towing support for your vehicle",
        "type": "towing",
        "price": 150.0,
        "available": True,
        "estimated_time_minutes": 30
    }
    # Create a new service (POST)
    response_create = requests.post(
        f"{BASE_URL}/api/services",
        json=service_data_create,
        headers=HEADERS,
        timeout=TIMEOUT,
    )
    assert response_create.status_code == 201, f"Create failed: {response_create.text}"
    created_service = response_create.json()
    service_id = created_service.get("id")
    assert service_id, "Created service response missing 'id'"

    try:
        # Read the created service (GET)
        response_get = requests.get(
            f"{BASE_URL}/api/services/{service_id}",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert response_get.status_code == 200, f"Get failed: {response_get.text}"
        service = response_get.json()
        assert service.get("name") == service_data_create["name"], "Service name mismatch on GET"
        assert service.get("description") == service_data_create["description"], "Service description mismatch on GET"
        assert service.get("type") == service_data_create["type"], "Service type mismatch on GET"
        assert service.get("price") == service_data_create["price"], "Service price mismatch on GET"
        assert service.get("available") == service_data_create["available"], "Service availability mismatch on GET"
        assert service.get("estimated_time_minutes") == service_data_create["estimated_time_minutes"], "Service estimated_time_minutes mismatch on GET"

        # Update the service (PUT)
        updated_data = {
            "name": "Updated Towing Service",
            "description": "Updated reliable towing support",
            "type": "towing",
            "price": 175.5,
            "available": False,
            "estimated_time_minutes": 25
        }
        response_update = requests.put(
            f"{BASE_URL}/api/services/{service_id}",
            json=updated_data,
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert response_update.status_code == 200, f"Update failed: {response_update.text}"
        updated_service = response_update.json()
        for key in updated_data:
            assert updated_service.get(key) == updated_data[key], f"Service {key} not updated correctly"

        # Public list/view of services (GET /api/services)
        response_list = requests.get(
            f"{BASE_URL}/api/services",
            timeout=TIMEOUT,
        )
        assert response_list.status_code == 200, f"List services failed: {response_list.text}"
        services_list = response_list.json()
        assert isinstance(services_list, list), "Services list response is not a list"
        assert any(s.get("id") == service_id for s in services_list), "Created service not found in public services list"

    finally:
        # Delete the created service (DELETE)
        response_delete = requests.delete(
            f"{BASE_URL}/api/services/{service_id}",
            headers=HEADERS,
            timeout=TIMEOUT,
        )
        assert response_delete.status_code in [200, 204], f"Delete failed: {response_delete.text}"


testservicescrudoperations()