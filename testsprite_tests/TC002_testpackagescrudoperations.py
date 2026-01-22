import requests
import sys
import os

# Add test_helpers to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_helpers import get_auth_headers, BASE_URL

# Get authenticated headers for admin operations
HEADERS_ADMIN = get_auth_headers()

HEADERS_PUBLIC = {
    "Content-Type": "application/json",
    "Accept": "application/json",
}


def testpackagescrudoperations():
    timeout = 30
    package_id = None
    try:
        # ===== Admin creates a new package =====
        # API expects: name, price, period, description (required)
        # Optional: features, isActive, order, icon
        create_payload = {
            "name": "Premium Road Assistance",
            "description": "24/7 towing and locksmith services with battery support",
            "price": 19999,  # Price in cents/kuruş
            "period": "12",  # Period in months
            "features": [
                "Towing",
                "Battery Support",
                "Locksmith"
            ],
            "isActive": True
        }
        create_resp = requests.post(
            f"{BASE_URL}/api/packages",
            headers=HEADERS_ADMIN,
            json=create_payload,
            timeout=timeout,
        )
        assert create_resp.status_code == 201, f"Create package failed: {create_resp.text}"
        created_package = create_resp.json()
        for key in create_payload:
            assert created_package.get(key) == create_payload[key], f"Mismatch in created package field: {key}"
        package_id = created_package.get("id")
        assert package_id is not None, "Created package ID is None"

        # ===== Admin edits the created package =====
        update_payload = {
            "name": "Premium Road Assistance Plus",
            "price": 24999,  # Price in cents/kuruş
            "isActive": False,
            "features": [
                "Towing",
                "Battery Support",
                "Locksmith",
                "Fuel Delivery"
            ],
        }
        update_resp = requests.put(
            f"{BASE_URL}/api/packages/{package_id}",
            headers=HEADERS_ADMIN,
            json=update_payload,
            timeout=timeout,
        )
        assert update_resp.status_code == 200, f"Update package failed: {update_resp.text}"
        updated_package = update_resp.json()
        for key in update_payload:
            assert updated_package.get(key) == update_payload[key], f"Mismatch in updated package field: {key}"

        # ===== Public user views the list of packages =====
        list_resp = requests.get(
            f"{BASE_URL}/api/packages",
            headers=HEADERS_PUBLIC,
            timeout=timeout,
        )
        assert list_resp.status_code == 200, f"List packages failed: {list_resp.text}"
        packages_list = list_resp.json()
        assert isinstance(packages_list, list), "Packages list response is not a list"
        assert any(pkg.get("id") == package_id for pkg in packages_list), "Created package not found in packages list"

        # ===== Public user views a single package detail =====
        detail_resp = requests.get(
            f"{BASE_URL}/api/packages/{package_id}",
            headers=HEADERS_PUBLIC,
            timeout=timeout,
        )
        assert detail_resp.status_code == 200, f"Get package detail failed: {detail_resp.text}"
        package_detail = detail_resp.json()
        assert package_detail.get("id") == package_id, "Mismatch in package detail id"

        # ===== Public user purchases the package via application submission =====
        # Simulating purchase as public user submitting an application
        # API expects: fullName, phone, packageName (required)
        purchase_payload = {
            "fullName": "John Doe",
            "phone": "05551234567",
            "packageName": created_package.get("name", "Premium Road Assistance"),
            "email": "john.doe@example.com",
            "plate": "34ABC1234",
            "city": "Istanbul",
            "district": "Kadikoy"
        }
        purchase_resp = requests.post(
            f"{BASE_URL}/api/applications",
            headers=HEADERS_PUBLIC,
            json=purchase_payload,
            timeout=timeout,
        )
        assert purchase_resp.status_code == 201, (
            f"Package purchase (application submission) failed: {purchase_resp.status_code} - {purchase_resp.text}"
        )
        purchase_result = purchase_resp.json()
        assert purchase_result.get("fullName") == purchase_payload["fullName"], "Purchased application fullName mismatch"
        assert purchase_result.get("packageName") == purchase_payload["packageName"], "Purchased application packageName mismatch"

    finally:
        # Cleanup: Admin deletes the created package
        if package_id:
            del_resp = requests.delete(
                f"{BASE_URL}/api/packages/{package_id}",
                headers=HEADERS_ADMIN,
                timeout=timeout,
            )
            assert del_resp.status_code in [200, 204], f"Delete package failed: {del_resp.text}"


testpackagescrudoperations()