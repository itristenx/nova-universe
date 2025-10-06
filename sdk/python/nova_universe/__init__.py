"""
Nova Universe Python SDK
Official Python client library for the Nova Universe Platform API V1

Installation:
    pip install nova-universe-sdk

Usage:
    from nova_universe import NovaClient
    
    client = NovaClient(
        base_url="http://localhost:3000",
        api_key="your-api-key"
    )
    
    # List tickets
    tickets = client.tickets.list(status="open", limit=50)
    
    # Create a ticket
    ticket = client.tickets.create({
        "title": "Network issue",
        "description": "Cannot access shared drive",
        "priority": "high"
    })
"""

import requests
from typing import Dict, List, Optional, Any
from datetime import datetime
import json


class NovaUniverseError(Exception):
    """Base exception for Nova Universe SDK"""
    pass


class AuthenticationError(NovaUniverseError):
    """Raised when authentication fails"""
    pass


class ValidationError(NovaUniverseError):
    """Raised when request validation fails"""
    pass


class ResourceNotFoundError(NovaUniverseError):
    """Raised when requested resource is not found"""
    pass


class RateLimitError(NovaUniverseError):
    """Raised when rate limit is exceeded"""
    pass


class APIResource:
    """Base class for API resources"""
    
    def __init__(self, client):
        self.client = client
    
    def _make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None
    ) -> Any:
        """Make HTTP request to API"""
        return self.client._request(method, endpoint, data=data, params=params)


class TicketsResource(APIResource):
    """Tickets API resource"""
    
    def list(
        self,
        page: int = 1,
        limit: int = 50,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        search: Optional[str] = None,
        sort: str = "created_at",
        order: str = "desc"
    ) -> Dict:
        """
        List tickets with optional filters
        
        Args:
            page: Page number for pagination
            limit: Number of items per page
            status: Filter by status (open, in_progress, closed)
            priority: Filter by priority (low, medium, high, urgent)
            search: Search query
            sort: Sort field
            order: Sort order (asc, desc)
        
        Returns:
            Dict containing tickets list and pagination info
        """
        params = {
            "page": page,
            "limit": limit,
            "sort": sort,
            "order": order
        }
        
        if status:
            params["status"] = status
        if priority:
            params["priority"] = priority
        if search:
            params["search"] = search
        
        return self._make_request("GET", "/tickets", params=params)
    
    def get(self, ticket_id: int) -> Dict:
        """
        Get ticket by ID
        
        Args:
            ticket_id: Ticket ID
        
        Returns:
            Dict containing ticket details
        """
        return self._make_request("GET", f"/tickets/{ticket_id}")
    
    def create(self, data: Dict) -> Dict:
        """
        Create a new ticket
        
        Args:
            data: Ticket data including title, description, priority, category
        
        Returns:
            Dict containing created ticket
        """
        required_fields = ["title", "description"]
        for field in required_fields:
            if field not in data:
                raise ValidationError(f"Missing required field: {field}")
        
        return self._make_request("POST", "/tickets", data=data)
    
    def update(self, ticket_id: int, data: Dict) -> Dict:
        """
        Update ticket
        
        Args:
            ticket_id: Ticket ID
            data: Fields to update
        
        Returns:
            Dict containing updated ticket
        """
        return self._make_request("PATCH", f"/tickets/{ticket_id}", data=data)
    
    def delete(self, ticket_id: int) -> Dict:
        """
        Delete ticket
        
        Args:
            ticket_id: Ticket ID
        
        Returns:
            Dict with deletion confirmation
        """
        return self._make_request("DELETE", f"/tickets/{ticket_id}")
    
    def add_comment(self, ticket_id: int, content: str, is_public: bool = False) -> Dict:
        """
        Add comment to ticket
        
        Args:
            ticket_id: Ticket ID
            content: Comment content
            is_public: Whether comment is public
        
        Returns:
            Dict containing created comment
        """
        data = {
            "content": content,
            "is_public": is_public
        }
        return self._make_request("POST", f"/tickets/{ticket_id}/comments", data=data)


class AssetsResource(APIResource):
    """Assets API resource"""
    
    def list(self, page: int = 1, limit: int = 50) -> Dict:
        """List assets"""
        params = {"page": page, "limit": limit}
        return self._make_request("GET", "/assets", params=params)
    
    def get(self, asset_id: int) -> Dict:
        """Get asset by ID"""
        return self._make_request("GET", f"/assets/{asset_id}")
    
    def create(self, data: Dict) -> Dict:
        """Create new asset"""
        return self._make_request("POST", "/assets", data=data)
    
    def update(self, asset_id: int, data: Dict) -> Dict:
        """Update asset"""
        return self._make_request("PATCH", f"/assets/{asset_id}", data=data)


class UsersResource(APIResource):
    """Users/Directory API resource"""
    
    def list(self, page: int = 1, limit: int = 50) -> Dict:
        """List directory users"""
        params = {"page": page, "limit": limit}
        return self._make_request("GET", "/directory", params=params)
    
    def get(self, user_id: int) -> Dict:
        """Get user by ID"""
        return self._make_request("GET", f"/directory/{user_id}")
    
    def sync(self) -> Dict:
        """Trigger directory sync"""
        return self._make_request("POST", "/directory/sync")


class MonitoringResource(APIResource):
    """Monitoring API resource"""
    
    def dashboard(self) -> Dict:
        """Get monitoring dashboard"""
        return self._make_request("GET", "/monitoring")
    
    def health(self) -> Dict:
        """Get system health"""
        return self._make_request("GET", "/monitoring/health")
    
    def alerts(self, status: Optional[str] = None) -> Dict:
        """List alerts"""
        params = {}
        if status:
            params["status"] = status
        return self._make_request("GET", "/alerts", params=params)
    
    def create_alert(self, data: Dict) -> Dict:
        """Create alert"""
        return self._make_request("POST", "/alerts", data=data)
    
    def acknowledge_alert(self, alert_id: int) -> Dict:
        """Acknowledge alert"""
        data = {"status": "acknowledged"}
        return self._make_request("PATCH", f"/alerts/{alert_id}", data=data)


class WorkflowsResource(APIResource):
    """Workflows API resource"""
    
    def list(self) -> Dict:
        """List workflows"""
        return self._make_request("GET", "/workflows")
    
    def get(self, workflow_id: int) -> Dict:
        """Get workflow by ID"""
        return self._make_request("GET", f"/workflows/{workflow_id}")
    
    def create(self, data: Dict) -> Dict:
        """Create workflow"""
        return self._make_request("POST", "/workflows", data=data)


class AnalyticsResource(APIResource):
    """Analytics API resource"""
    
    def dashboard(self) -> Dict:
        """Get analytics dashboard"""
        return self._make_request("GET", "/analytics")
    
    def tickets(self, period: str = "7d") -> Dict:
        """Get ticket metrics"""
        params = {"period": period}
        return self._make_request("GET", "/analytics/tickets", params=params)


class NovaClient:
    """
    Nova Universe API Client
    
    Example:
        client = NovaClient(base_url="http://localhost:3000")
        client.authenticate("admin@example.com", "password")
        
        # Or use API key
        client = NovaClient(
            base_url="http://localhost:3000",
            api_key="your-api-key"
        )
        
        tickets = client.tickets.list(status="open")
    """
    
    def __init__(
        self,
        base_url: str = "http://localhost:3000",
        api_key: Optional[str] = None,
        api_version: str = "v1",
        timeout: int = 30
    ):
        """
        Initialize Nova Universe client
        
        Args:
            base_url: Base URL of the API
            api_key: API key for authentication (optional)
            api_version: API version to use
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip("/")
        self.api_version = api_version
        self.timeout = timeout
        self.auth_token = api_key
        self.session = requests.Session()
        
        # Initialize resource endpoints
        self.tickets = TicketsResource(self)
        self.assets = AssetsResource(self)
        self.users = UsersResource(self)
        self.monitoring = MonitoringResource(self)
        self.workflows = WorkflowsResource(self)
        self.analytics = AnalyticsResource(self)
    
    def authenticate(self, username: str, password: str) -> Dict:
        """
        Authenticate with username and password
        
        Args:
            username: User email or username
            password: User password
        
        Returns:
            Dict containing auth token and user info
        """
        response = self._request(
            "POST",
            "/auth/login",
            data={"username": username, "password": password},
            skip_auth=True
        )
        
        if "token" in response:
            self.auth_token = response["token"]
        
        return response
    
    def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        params: Optional[Dict] = None,
        skip_auth: bool = False
    ) -> Any:
        """
        Make HTTP request to API
        
        Args:
            method: HTTP method
            endpoint: API endpoint
            data: Request body data
            params: Query parameters
            skip_auth: Skip authentication header
        
        Returns:
            Response data
        
        Raises:
            AuthenticationError: If authentication fails
            ValidationError: If request validation fails
            ResourceNotFoundError: If resource not found
            RateLimitError: If rate limit exceeded
            NovaUniverseError: For other API errors
        """
        url = f"{self.base_url}/api/{self.api_version}{endpoint}"
        
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "nova-universe-python-sdk/1.0.0"
        }
        
        if self.auth_token and not skip_auth:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                headers=headers,
                json=data,
                params=params,
                timeout=self.timeout
            )
            
            # Handle different status codes
            if response.status_code == 401:
                raise AuthenticationError("Authentication failed")
            elif response.status_code == 404:
                raise ResourceNotFoundError("Resource not found")
            elif response.status_code == 422:
                raise ValidationError(f"Validation error: {response.text}")
            elif response.status_code == 429:
                raise RateLimitError("Rate limit exceeded")
            elif response.status_code >= 400:
                raise NovaUniverseError(
                    f"API error ({response.status_code}): {response.text}"
                )
            
            # Try to parse JSON response
            try:
                return response.json()
            except json.JSONDecodeError:
                return {"success": True, "data": response.text}
        
        except requests.exceptions.Timeout:
            raise NovaUniverseError("Request timeout")
        except requests.exceptions.ConnectionError:
            raise NovaUniverseError("Connection error")
        except requests.exceptions.RequestException as e:
            raise NovaUniverseError(f"Request failed: {str(e)}")
    
    def close(self):
        """Close the session"""
        self.session.close()
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit"""
        self.close()


# Convenience function
def create_client(
    base_url: str = "http://localhost:3000",
    username: Optional[str] = None,
    password: Optional[str] = None,
    api_key: Optional[str] = None
) -> NovaClient:
    """
    Create and optionally authenticate a Nova Universe client
    
    Args:
        base_url: Base URL of the API
        username: Username for authentication
        password: Password for authentication
        api_key: API key for authentication
    
    Returns:
        Configured NovaClient instance
    """
    client = NovaClient(base_url=base_url, api_key=api_key)
    
    if username and password and not api_key:
        client.authenticate(username, password)
    
    return client
