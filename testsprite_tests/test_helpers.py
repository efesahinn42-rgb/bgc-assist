"""
Test helper functions for NextAuth authentication and common test utilities.

Note: NextAuth uses cookie-based session authentication. For automated tests,
you may need to:
1. Use a test admin account with known credentials
2. Ensure the test environment has NEXTAUTH_SECRET configured
3. Use a session-based approach (cookies) rather than token-based

For now, this helper provides a basic structure. In a real test environment,
you might need to use Playwright or Selenium to get actual session cookies,
or create a test-only authentication endpoint.
"""
import requests
from typing import Optional, Dict, Any

BASE_URL = "http://localhost:3000"

# Test admin credentials - UPDATE THESE with actual test admin credentials
TEST_ADMIN_EMAIL = "admin@test.com"  # Update with real test admin email
TEST_ADMIN_PASSWORD = "testpassword"  # Update with real test admin password

def get_auth_session(email: str = None, password: str = None) -> Optional[Dict[str, Any]]:
    """
    Authenticate with NextAuth and return session cookies.
    
    Args:
        email: Admin email (defaults to TEST_ADMIN_EMAIL)
        password: Admin password (defaults to TEST_ADMIN_PASSWORD)
        
    Returns:
        Dictionary with session cookies and headers, or None if login fails
        
    Note: NextAuth uses cookie-based sessions. This function attempts to get
    session cookies via the sign-in flow. In a real test environment, you may
    need to use browser automation (Playwright/Selenium) or a test-only auth endpoint.
    """
    email = email or TEST_ADMIN_EMAIL
    password = password or TEST_ADMIN_PASSWORD
    
    try:
        session = requests.Session()
        
        # NextAuth sign-in endpoint
        # Try the credentials callback endpoint
        callback_url = f"{BASE_URL}/api/auth/callback/credentials"
        
        # Prepare form data for NextAuth credentials provider
        form_data = {
            "email": email,
            "password": password,
            "redirect": "false",
            "json": "true",
            "csrfToken": ""  # CSRF token might be needed
        }
        
        # First, try to get CSRF token from sign-in page
        try:
            signin_page = session.get(f"{BASE_URL}/admin/login", timeout=10)
            # Extract CSRF token if present (this is simplified)
        except:
            pass
        
        # Make the sign-in request
        resp = session.post(
            callback_url,
            data=form_data,
            headers={
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
                "Referer": f"{BASE_URL}/admin/login"
            },
            allow_redirects=False,
            timeout=30
        )
        
        # Check if we got session cookies
        cookies = session.cookies.get_dict()
        if cookies and ("next-auth.session-token" in cookies or "authjs.session-token" in cookies):
            return {
                "cookies": cookies,
                "session": session,
                "headers": {
                    "Cookie": "; ".join([f"{k}={v}" for k, v in cookies.items()])
                }
            }
        
        # Alternative: Try POST to /api/auth/signin with JSON
        signin_resp = session.post(
            f"{BASE_URL}/api/auth/signin",
            json={"email": email, "password": password},
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        cookies = session.cookies.get_dict()
        if cookies:
            return {
                "cookies": cookies,
                "session": session,
                "headers": {
                    "Cookie": "; ".join([f"{k}={v}" for k, v in cookies.items()])
                }
            }
        
        return None
    except Exception as e:
        print(f"Authentication failed: {e}")
        return None


def get_auth_headers(email: str = None, password: str = None) -> Dict[str, str]:
    """
    Get authentication headers with session cookies.
    
    Args:
        email: Admin email (defaults to TEST_ADMIN_EMAIL)
        password: Admin password (defaults to TEST_ADMIN_PASSWORD)
        
    Returns:
        Dictionary with headers including cookies
        
    Note: If authentication fails, returns headers without cookies.
    The test will likely fail with 401 Unauthorized, which is expected
    if authentication is not properly configured in the test environment.
    """
    auth_session = get_auth_session(email, password)
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    
    if auth_session:
        headers.update(auth_session["headers"])
    else:
        print("Warning: Could not get authentication session. Test may fail with 401.")
        print("Please ensure:")
        print("1. Test admin account exists with email/password")
        print("2. NEXTAUTH_SECRET is configured in test environment")
        print("3. Consider using browser automation for session cookies")
    
    return headers
