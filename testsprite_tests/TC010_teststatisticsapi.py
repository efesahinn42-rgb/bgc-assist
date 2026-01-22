import requests
import sys
import os

# Add test_helpers to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_helpers import get_auth_headers, BASE_URL

def teststatisticsapi():
    endpoint = "/api/statistics"
    url = BASE_URL + endpoint
    headers = get_auth_headers()
    try:
        response = requests.get(url, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request to statistics API failed: {e}"
    assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate expected keys and types in the statistics data (basic validation)
    expected_keys = [
        "totalApplications",
        "pendingApplications",
        "approvedApplications",
        "rejectedApplications",
        "kpiMetrics"
    ]
    for key in expected_keys:
        assert key in data, f"Missing expected key in response: {key}"

    assert isinstance(data.get("totalApplications"), int), "totalApplications should be an integer"
    assert isinstance(data.get("pendingApplications"), int), "pendingApplications should be an integer"
    assert isinstance(data.get("approvedApplications"), int), "approvedApplications should be an integer"
    assert isinstance(data.get("rejectedApplications"), int), "rejectedApplications should be an integer"
    assert isinstance(data.get("kpiMetrics"), dict), "kpiMetrics should be a dictionary"

    # Additional sanity checks on counts (non-negative)
    assert data["totalApplications"] >= 0, "totalApplications should be non-negative"
    assert data["pendingApplications"] >= 0, "pendingApplications should be non-negative"
    assert data["approvedApplications"] >= 0, "approvedApplications should be non-negative"
    assert data["rejectedApplications"] >= 0, "rejectedApplications should be non-negative"

teststatisticsapi()
