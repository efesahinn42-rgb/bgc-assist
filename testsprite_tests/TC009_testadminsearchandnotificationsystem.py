import requests
import sys
import os

# Add test_helpers to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_helpers import get_auth_headers, BASE_URL

HEADERS = get_auth_headers()

def testadminsearchandnotificationsystem():
    # Test global search endpoint with a sample query
    search_query = "service"
    search_url = f"{BASE_URL}/api/admin/search"
    search_params = {"q": search_query}

    try:
        search_response = requests.get(
            search_url, headers=HEADERS, params=search_params, timeout=30
        )
        assert search_response.status_code == 200, f"Search API failed with status code {search_response.status_code}"
        search_data = search_response.json()
        assert isinstance(search_data, dict), "Search response is not a dictionary"
        assert "results" in search_data, "Search response missing 'results' key"
        assert isinstance(search_data["results"], list), "'results' should be a list"
        # Further optional checks if results contain expected fields
        for item in search_data["results"]:
            assert isinstance(item, dict), "Each search result item should be a dictionary"
            assert "id" in item, "Search result item missing 'id'"
            assert "type" in item, "Search result item missing 'type'"

    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Global search test failed: {e}")

    # Test notifications endpoint to get list of notifications
    notifications_url = f"{BASE_URL}/api/notifications"

    try:
        notifications_response = requests.get(
            notifications_url, headers=HEADERS, timeout=30
        )
        assert notifications_response.status_code == 200, f"Notifications API failed with status code {notifications_response.status_code}"
        notifications_data = notifications_response.json()
        assert isinstance(notifications_data, dict), "Notifications response is not a dictionary"
        assert "notifications" in notifications_data, "Notifications response missing 'notifications' key"
        assert isinstance(notifications_data["notifications"], list), "'notifications' should be a list"
        # Check structure of a notification object if any exists
        if notifications_data["notifications"]:
            notif = notifications_data["notifications"][0]
            assert isinstance(notif, dict), "Notification item should be a dictionary"
            assert "id" in notif, "Notification missing 'id'"
            assert "message" in notif, "Notification missing 'message'"
            assert "read" in notif, "Notification missing 'read' status"
    except (requests.RequestException, AssertionError) as e:
        raise AssertionError(f"Notifications test failed: {e}")

testadminsearchandnotificationsystem()
