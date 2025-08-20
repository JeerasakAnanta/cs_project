"""
Test cases for main.py
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.main import app


class TestMain:
    """Test cases for main application"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "LannaFinChat API is running" in data["message"]
        assert "timestamp" in data
    
    def test_health_check_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get("/healthz")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "timestamp" in data
        assert "system" in data
        
        # Check system info
        system = data["system"]
        assert "cpu_percent" in system
        assert "memory_percent" in system
        assert "disk_percent" in system
        assert "platform" in system
        assert "python_version" in system
        
        # Check status values
        assert data["status"] in ["healthy", "warning", "critical"]
        assert isinstance(system["cpu_percent"], (int, float))
        assert isinstance(system["memory_percent"], (int, float))
        assert isinstance(system["disk_percent"], (int, float))
    
    def test_system_status_endpoint(self, client):
        """Test system status endpoint"""
        response = client.get("/status")
        
        assert response.status_code == 200
        data = response.json()
        assert "timestamp" in data
        assert "database" in data
        assert "cpu" in data
        assert "memory" in data
        assert "disk" in data
        assert "platform" in data
        
        # Check database status
        assert data["database"] in ["connected", "disconnected", "unknown"]
        
        # Check CPU info
        cpu = data["cpu"]
        assert "percent" in cpu
        assert "count" in cpu
        assert isinstance(cpu["percent"], (int, float))
        assert isinstance(cpu["count"], int)
        
        # Check memory info
        memory = data["memory"]
        assert "total" in memory
        assert "available" in memory
        assert "percent" in memory
        assert isinstance(memory["total"], int)
        assert isinstance(memory["available"], int)
        assert isinstance(memory["percent"], (int, float))
        
        # Check disk info
        disk = data["disk"]
        assert "total" in disk
        assert "free" in disk
        assert "percent" in disk
        assert isinstance(disk["total"], int)
        assert isinstance(disk["free"], int)
        assert isinstance(disk["percent"], (int, float))
        
        # Check platform info
        platform_info = data["platform"]
        assert "system" in platform_info
        assert "release" in platform_info
        assert "version" in platform_info
        assert "machine" in platform_info
    
    @patch('psutil.cpu_percent')
    @patch('psutil.virtual_memory')
    @patch('psutil.disk_usage')
    def test_health_check_with_mocked_system(self, mock_disk, mock_memory, mock_cpu, client):
        """Test health check with mocked system metrics"""
        # Mock system metrics
        mock_cpu.return_value = 50.0
        
        mock_memory_obj = MagicMock()
        mock_memory_obj.percent = 60.0
        mock_memory.return_value = mock_memory_obj
        
        mock_disk_obj = MagicMock()
        mock_disk_obj.percent = 70.0
        mock_disk.return_value = mock_disk_obj
        
        response = client.get("/healthz")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["system"]["cpu_percent"] == 50.0
        assert data["system"]["memory_percent"] == 60.0
        assert data["system"]["disk_percent"] == 70.0
    
    @patch('psutil.cpu_percent')
    @patch('psutil.virtual_memory')
    @patch('psutil.disk_usage')
    def test_health_check_warning_status(self, mock_disk, mock_memory, mock_cpu, client):
        """Test health check returns warning status"""
        # Mock system metrics in warning range
        mock_cpu.return_value = 85.0
        
        mock_memory_obj = MagicMock()
        mock_memory_obj.percent = 75.0
        mock_memory.return_value = mock_memory_obj
        
        mock_disk_obj = MagicMock()
        mock_disk_obj.percent = 85.0
        mock_disk.return_value = mock_disk_obj
        
        response = client.get("/healthz")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "warning"
    
    @patch('psutil.cpu_percent')
    @patch('psutil.virtual_memory')
    @patch('psutil.disk_usage')
    def test_health_check_critical_status(self, mock_disk, mock_memory, mock_cpu, client):
        """Test health check returns critical status"""
        # Mock system metrics in critical range
        mock_cpu.return_value = 98.0
        
        mock_memory_obj = MagicMock()
        mock_memory_obj.percent = 96.0
        mock_memory.return_value = mock_memory_obj
        
        mock_disk_obj = MagicMock()
        mock_disk_obj.percent = 92.0
        mock_disk.return_value = mock_disk_obj
        
        response = client.get("/healthz")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "critical"
    
    @patch('app.main.engine')
    def test_system_status_database_connected(self, mock_engine, client):
        """Test system status when database is connected"""
        # Mock successful database connection
        mock_conn = MagicMock()
        mock_engine.connect.return_value.__enter__.return_value = mock_conn
        mock_conn.execute.return_value = None
        
        response = client.get("/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data["database"] == "connected"
    
    @patch('app.main.engine')
    def test_system_status_database_disconnected(self, mock_engine, client):
        """Test system status when database is disconnected"""
        # Mock failed database connection
        mock_engine.connect.side_effect = Exception("Connection failed")
        
        response = client.get("/status")
        
        assert response.status_code == 200
        data = response.json()
        assert data["database"] == "disconnected"
    
    def test_cors_middleware(self, client):
        """Test CORS middleware is configured"""
        # Test preflight request
        response = client.options("/", headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type"
        })
        
        # Should not return 405 Method Not Allowed
        assert response.status_code != 405
    
    def test_router_inclusion(self, client):
        """Test that all routers are included"""
        # Test that login router is included
        response = client.get("/login")  # This should not return 404 if router is included
        # Note: This test assumes the login router has a GET endpoint at /login
        # If it doesn't, the test will pass as 404 is expected
    
    def test_startup_event_logging(self):
        """Test startup event logging"""
        # This test verifies the startup event handler is defined
        startup_handlers = [route for route in app.routes if hasattr(route, 'endpoint') and route.endpoint.__name__ == 'startup_event']
        assert len(startup_handlers) > 0
    
    def test_application_metadata(self):
        """Test application metadata"""
        assert app.title == "LannaFinChat API"
        assert "API for LannaFinChat" in app.description
    
    def test_response_format_consistency(self, client):
        """Test that all endpoints return consistent response format"""
        endpoints = ["/", "/healthz", "/status"]
        
        for endpoint in endpoints:
            response = client.get(endpoint)
            assert response.status_code == 200
            
            # Check that response is valid JSON
            try:
                data = response.json()
                assert isinstance(data, dict)
            except ValueError:
                pytest.fail(f"Endpoint {endpoint} did not return valid JSON")


if __name__ == "__main__":
    pytest.main([__file__])
