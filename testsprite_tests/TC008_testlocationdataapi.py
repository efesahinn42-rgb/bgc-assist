import requests

BASE_URL = "http://localhost:3000"
TIMEOUT = 30


def test_location_data_api():
    # Test GET /api/cities
    # API returns { cities: [...] } format
    cities_url = f"{BASE_URL}/api/cities"
    try:
        cities_response = requests.get(cities_url, timeout=TIMEOUT)
        assert cities_response.status_code == 200, f"Expected 200 OK but got {cities_response.status_code} for cities"
        response_data = cities_response.json()
        # API returns { cities: [...] } format
        assert isinstance(response_data, dict), "Cities response should be a dictionary"
        assert "cities" in response_data, "Cities response missing 'cities' key"
        cities_data = response_data["cities"]
        assert isinstance(cities_data, list), "Cities data should be a list"
        assert len(cities_data) > 0, "Cities list should not be empty"
        for city in cities_data:
            assert "id" in city, "City object missing 'id'"
            assert "name" in city, "City object missing 'name'"
            assert isinstance(city["name"], str) and city["name"], "City name should be a non-empty string"
    except requests.RequestException as e:
        assert False, f"Request to {cities_url} failed: {e}"

    # Test GET /api/districts
    # API requires 'city' query parameter and returns { districts: [...] } format
    districts_url = f"{BASE_URL}/api/districts"
    try:
        # Test with a city parameter (e.g., Istanbul)
        districts_response = requests.get(
            districts_url,
            params={"city": "Istanbul"},
            timeout=TIMEOUT
        )
        assert districts_response.status_code == 200, (
            f"Expected 200 OK but got {districts_response.status_code} for districts"
        )
        response_data = districts_response.json()
        # API returns { districts: [...] } format
        assert isinstance(response_data, dict), "Districts response should be a dictionary"
        assert "districts" in response_data, "Districts response missing 'districts' key"
        districts_data = response_data["districts"]
        assert isinstance(districts_data, list), "Districts data should be a list"
        assert len(districts_data) > 0, "Districts list should not be empty"
        for district in districts_data:
            assert "id" in district, "District object missing 'id'"
            assert "name" in district, "District object missing 'name'"
            assert isinstance(district["name"], str) and district["name"], "District name should be a non-empty string"
        
        # Test without city parameter (should return 400)
        error_response = requests.get(districts_url, timeout=TIMEOUT)
        assert error_response.status_code == 400, (
            f"Expected 400 Bad Request when city parameter is missing, got {error_response.status_code}"
        )
    except requests.RequestException as e:
        assert False, f"Request to {districts_url} failed: {e}"


test_location_data_api()
