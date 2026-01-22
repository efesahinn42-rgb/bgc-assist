import requests
import io
import sys
import os

# Add test_helpers to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from test_helpers import get_auth_headers, BASE_URL

HEADERS = get_auth_headers()

def testslidermanagementwithimageupload():
    slider_id = None
    image_url = None
    try:
        # 1. Create a new slider item (without image)
        create_payload = {
            "title": "Test Slider Item",
            "subtitle": "Subtitle for test slider",
            "description": "Description for test slider item.",
            "link": "https://example.com/test-slider",
            "sortOrder": 10,
            "isActive": True,
            "imageUrl": ""  # Initially empty, will update after image upload
        }
        resp_create = requests.post(
            f"{BASE_URL}/api/sliders",
            headers=HEADERS,
            json=create_payload,
            timeout=30
        )
        assert resp_create.status_code == 201, f"Expected 201 Created but got {resp_create.status_code}"
        slider = resp_create.json()
        assert "id" in slider, "Response missing slider id"
        slider_id = slider["id"]

        # 2. Upload image for slider using /api/sliders/upload route
        # Create a simple in-memory image (e.g., a small PNG)
        image_content = (
            b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01"
            b"\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89"
            b"\x00\x00\x00\nIDATx\xdac\xf8\x0f\x00\x01\x01\x01\x00"
            b"\x18\xdd\x18\xdb\x00\x00\x00\x00IEND\xaeB`\x82"
        )
        files = {
            "file": ("test-image.png", io.BytesIO(image_content), "image/png")
        }
        # Note: Use auth headers for multipart upload
        headers_upload = get_auth_headers()
        # Remove Content-Type for multipart/form-data (requests will set it automatically)
        headers_upload.pop("Content-Type", None)
        resp_upload = requests.post(
            f"{BASE_URL}/api/sliders/upload",
            headers=headers_upload,
            files=files,
            timeout=30
        )
        assert resp_upload.status_code == 200, f"Expected 200 OK on upload but got {resp_upload.status_code}"
        upload_data = resp_upload.json()
        assert "url" in upload_data, "Upload response missing 'url'"
        image_url = upload_data["url"]
        assert image_url.startswith("http"), "Invalid image URL returned"

        # 3. Update the slider item with imageUrl
        update_payload = {
            "title": "Test Slider Item Updated",
            "subtitle": "Updated subtitle",
            "description": "Updated description.",
            "link": "https://example.com/test-slider-updated",
            "sortOrder": 20,
            "isActive": False,
            "imageUrl": image_url
        }
        resp_update = requests.put(
            f"{BASE_URL}/api/sliders/{slider_id}",
            headers=HEADERS,
            json=update_payload,
            timeout=30
        )
        assert resp_update.status_code == 200, f"Expected 200 OK on update but got {resp_update.status_code}"
        updated_slider = resp_update.json()
        assert updated_slider.get("imageUrl") == image_url, "Slider imageUrl not updated correctly"
        assert updated_slider.get("title") == update_payload["title"], "Slider title not updated"

        # 4. Retrieve the slider to verify update
        resp_get = requests.get(
            f"{BASE_URL}/api/sliders/{slider_id}",
            headers=HEADERS,
            timeout=30
        )
        assert resp_get.status_code == 200, f"Expected 200 OK on get but got {resp_get.status_code}"
        slider_data = resp_get.json()
        assert slider_data.get("id") == slider_id, "Returned slider id mismatch"
        assert slider_data.get("imageUrl") == image_url, "Retrieved slider imageUrl mismatch"

    finally:
        # 5. Clean up: Delete the created slider item
        if slider_id:
            try:
                resp_delete = requests.delete(
                    f"{BASE_URL}/api/sliders/{slider_id}",
                    headers=HEADERS,
                    timeout=30
                )
                assert resp_delete.status_code == 204, f"Expected 204 No Content on delete but got {resp_delete.status_code}"
            except Exception as e:
                # Log but do not raise to allow test to finish
                print(f"Exception during cleanup delete slider: {e}")

testslidermanagementwithimageupload()