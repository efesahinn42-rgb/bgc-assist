import requests
import sys
import os

# Add test_helpers to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_helpers import get_auth_headers, BASE_URL

TIMEOUT = 30  # seconds

headers_admin = get_auth_headers()

headers_public = {
    "Accept": "application/json"
}


def testsettingsmanagement():
    # Define new settings data to update
    updated_settings = {
        "contact_info": {
            "phone": "+1-800-123-4567",
            "email": "support@bgcassist.example",
            "address": "1234 Assistance Ave, Help City, HC 12345"
        },
        "social_media_links": {
            "facebook": "https://facebook.com/bgcassist",
            "twitter": "https://twitter.com/bgcassist",
            "instagram": "https://instagram.com/bgcassist"
        },
        "working_hours": {
            "monday": "08:00 - 18:00",
            "tuesday": "08:00 - 18:00",
            "wednesday": "08:00 - 18:00",
            "thursday": "08:00 - 18:00",
            "friday": "08:00 - 18:00",
            "saturday": "09:00 - 14:00",
            "sunday": "Closed"
        }
    }

    # -- Admin updates the settings --
    try:
        response_put = requests.put(
            f"{BASE_URL}/api/settings",
            headers=headers_admin,
            json=updated_settings,
            timeout=TIMEOUT
        )
        response_put.raise_for_status()
        resp_json = response_put.json()

        # Validate response contains updated data (at least keys match)
        assert "contact_info" in resp_json, "Response missing contact_info"
        assert "social_media_links" in resp_json, "Response missing social_media_links"
        assert "working_hours" in resp_json, "Response missing working_hours"

        # Check values match updated data
        assert resp_json["contact_info"] == updated_settings["contact_info"], "contact_info mismatch"
        assert resp_json["social_media_links"] == updated_settings["social_media_links"], "social_media_links mismatch"
        assert resp_json["working_hours"] == updated_settings["working_hours"], "working_hours mismatch"

        # -- Public user retrieves the settings --

        response_get = requests.get(
            f"{BASE_URL}/api/settings",
            headers=headers_public,
            timeout=TIMEOUT
        )
        response_get.raise_for_status()
        settings_data = response_get.json()

        # Validate the retrieved settings contains expected keys and values
        assert "contact_info" in settings_data, "Public GET response missing contact_info"
        assert "social_media_links" in settings_data, "Public GET response missing social_media_links"
        assert "working_hours" in settings_data, "Public GET response missing working_hours"

        assert settings_data["contact_info"] == updated_settings["contact_info"], "Public GET contact_info mismatch"
        assert settings_data["social_media_links"] == updated_settings["social_media_links"], "Public GET social_media_links mismatch"
        assert settings_data["working_hours"] == updated_settings["working_hours"], "Public GET working_hours mismatch"

    except requests.exceptions.HTTPError as http_err:
        assert False, f"HTTP error occurred: {http_err}"
    except requests.exceptions.RequestException as req_err:
        assert False, f"Request error occurred: {req_err}"
    except AssertionError as assert_err:
        assert False, f"Assertion error: {assert_err}"


testsettingsmanagement()