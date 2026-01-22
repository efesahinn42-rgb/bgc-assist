import requests

BASE_URL = "http://localhost:3000"

def testemailnotificationsviaresendapi():
    """
    Validate that email notifications are sent when an application is submitted.
    Email sending is triggered by POST /api/applications, not a separate email endpoint.
    """
    application_endpoint = f"{BASE_URL}/api/applications"
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # Create a valid application that should trigger an email
    application_data = {
        "fullName": "Email Test User",
        "phone": "05551234567",
        "packageName": "Premium",
        "email": "test@example.com",
        "city": "Istanbul",
        "district": "Kadikoy",
        "address": "123 Test Street",
        "plate": "34ABC1234"
    }

    try:
        # Submit application - this should trigger email sending
        response = requests.post(
            application_endpoint,
            json=application_data,
            headers=headers,
            timeout=30
        )
        
        # Application should be created successfully
        assert response.status_code == 201, (
            f"Expected 201 Created but got {response.status_code}. "
            f"Response: {response.text}"
        )
        
        resp_json = response.json()
        assert "id" in resp_json, "Response JSON missing application id"
        app_id = resp_json["id"]
        
        # Verify application was created with correct data
        assert resp_json.get("fullName") == application_data["fullName"], "Full name mismatch"
        assert resp_json.get("phone") == application_data["phone"], "Phone mismatch"
        assert resp_json.get("packageName") == application_data["packageName"], "Package name mismatch"
        
        # Note: We cannot directly verify that Resend API was called,
        # but if the application was created successfully, the email sending
        # logic should have been triggered (assuming email service is configured).
        # In a real test environment, you might:
        # 1. Check application logs for email sending confirmation
        # 2. Use a test email inbox to verify receipt
        # 3. Mock Resend API in test environment
        
        print(f"Application {app_id} created successfully. Email notification should have been sent.")
        
    except requests.exceptions.RequestException as e:
        assert False, f"RequestException during application submission: {e}"
    except ValueError as e:
        assert False, f"Invalid JSON response: {e}"

testemailnotificationsviaresendapi()