"""
Test cases for router_system.py
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from app.routers.router_system import router
from app.main import app

# Include the router in the test app
app.include_router(router)


class TestRouterSystem:
    """Test cases for system router"""
    
    @pytest.fixture
    def client(self):
        """Create test client"""
        return TestClient(app)
    
    @pytest.fixture
    def mock_admin_user(self):
        """Mock admin user"""
        return {
            "id": 1,
            "email": "admin@example.com",
            "is_admin": True,
            "username": "admin"
        }
    
    @pytest.fixture
    def mock_regular_user(self):
        """Mock regular user"""
        return {
            "id": 2,
            "email": "user@example.com",
            "is_admin": False,
            "username": "user"
        }
    
    @patch('app.routers.router_system.get_current_user')
    @patch('app.routers.router_system.get_db')
    def test_manage_users_success(self, mock_get_db, mock_get_current_user, client, mock_admin_user):
        """Test successful user management"""
        # Mock dependencies
        mock_get_current_user.return_value = mock_admin_user
        
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # Mock user data
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.username = "testuser"
        mock_user.email = "test@example.com"
        mock_user.role = "user"
        mock_user.is_active = True
        mock_user.created_at = MagicMock()
        mock_user.created_at.isoformat.return_value = "2023-01-01T00:00:00"
        mock_user.last_login = MagicMock()
        mock_user.last_login.isoformat.return_value = "2023-01-01T00:00:00"
        
        # Mock conversation count
        mock_db.query.return_value.filter.return_value.count.return_value = 5
        
        # Mock user query
        mock_user_query = MagicMock()
        mock_user_query.filter.return_value.offset.return_value.limit.return_value.all.return_value = [mock_user]
        mock_user_query.count.return_value = 1
        mock_db.query.return_value = mock_user_query
        
        response = client.get("/system/users")
        
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "pagination" in data
        assert len(data["users"]) == 1
        assert data["users"][0]["username"] == "testuser"
        assert data["users"][0]["conversation_count"] == 5
    
    @patch('app.routers.router_system.get_current_user')
    def test_manage_users_unauthorized(self, mock_get_current_user, client, mock_regular_user):
        """Test user management without admin privileges"""
        mock_get_current_user.return_value = mock_regular_user
        
        response = client.get("/system/users")
        
        assert response.status_code == 403
        data = response.json()
        assert "Access denied" in data["detail"]
    
    @patch('app.routers.router_system.get_current_user')
    @patch('app.routers.router_system.get_db')
    def test_update_user_success(self, mock_get_db, mock_get_current_user, client, mock_admin_user):
        """Test successful user update"""
        mock_get_current_user.return_value = mock_admin_user
        
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # Mock user to update
        mock_user = MagicMock()
        mock_user.id = 2
        mock_user.username = "oldname"
        mock_user.email = "old@example.com"
        mock_user.updated_at = None
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        user_data = {"username": "newname", "email": "new@example.com"}
        
        response = client.put("/system/users/2", json=user_data)
        
        assert response.status_code == 200
        data = response.json()
        assert "User updated successfully" in data["message"]
        assert data["user_id"] == 2
        
        # Verify user was updated
        assert mock_user.username == "newname"
        assert mock_user.email == "new@example.com"
        mock_db.commit.assert_called_once()
    
    @patch('app.routers.router_system.get_current_user')
    @patch('app.routers.router_system.get_db')
    def test_update_user_not_found(self, mock_get_db, mock_get_current_user, client, mock_admin_user):
        """Test user update when user doesn't exist"""
        mock_get_current_user.return_value = mock_admin_user
        
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # Mock user not found
        mock_db.query.return_value.filter.return_value.first.return_value = None
        
        user_data = {"username": "newname"}
        
        response = client.put("/system/users/999", json=user_data)
        
        assert response.status_code == 404
        data = response.json()
        assert "User not found" in data["detail"]
    
    @patch('app.routers.router_system.get_current_user')
    @patch('app.routers.router_system.get_db')
    def test_delete_user_success(self, mock_get_db, mock_get_current_user, client, mock_admin_user):
        """Test successful user deletion"""
        mock_get_current_user.return_value = mock_admin_user
        
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # Mock user to delete
        mock_user = MagicMock()
        mock_user.id = 2
        
        mock_db.query.return_value.filter.return_value.first.return_value = mock_user
        
        response = client.delete("/system/users/2")
        
        assert response.status_code == 200
        data = response.json()
        assert "User deleted successfully" in data["message"]
        
        # Verify deletion operations were called
        mock_db.delete.assert_called_once_with(mock_user)
        mock_db.commit.assert_called_once()
    
    @patch('app.routers.router_system.get_current_user')
    def test_delete_user_self(self, mock_get_current_user, client, mock_admin_user):
        """Test user cannot delete themselves"""
        mock_get_current_user.return_value = mock_admin_user
        
        response = client.delete("/system/users/1")  # Same as admin user ID
        
        assert response.status_code == 400
        data = response.json()
        assert "Cannot delete yourself" in data["detail"]
    
    @patch('app.routers.router_system.get_current_user')
    @patch('app.routers.router_system.get_db')
    def test_view_system_statistics(self, mock_get_db, mock_get_current_user, client, mock_admin_user):
        """Test system statistics endpoint"""
        mock_get_current_user.return_value = mock_admin_user
        
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # Mock database queries
        mock_db.query.return_value.count.return_value = 100
        mock_db.query.return_value.filter.return_value.count.return_value = 10
        
        # Mock system stats
        with patch('psutil.cpu_percent') as mock_cpu, \
             patch('psutil.virtual_memory') as mock_memory, \
             patch('psutil.disk_usage') as mock_disk, \
             patch('platform.platform') as mock_platform, \
             patch('platform.python_version') as mock_python:
            
            mock_cpu.return_value = 25.0
            mock_memory_obj = MagicMock()
            mock_memory_obj.percent = 60.0
            mock_memory.return_value = mock_memory_obj
            
            mock_disk_obj = MagicMock()
            mock_disk_obj.percent = 45.0
            mock_disk.return_value = mock_disk_obj
            
            mock_platform.return_value = "Linux-5.15.0-x86_64"
            mock_python.return_value = "3.9.0"
            
            response = client.get("/system/statistics")
            
            assert response.status_code == 200
            data = response.json()
            assert "period" in data
            assert "users" in data
            assert "conversations" in data
            assert "messages" in data
            assert "documents" in data
            assert "feedback" in data
            assert "daily_stats" in data
            assert "system_stats" in data
            
            # Check system stats
            system_stats = data["system_stats"]
            assert system_stats["cpu_percent"] == 25.0
            assert system_stats["memory_percent"] == 60.0
            assert system_stats["disk_percent"] == 45.0
            assert "Linux" in system_stats["platform"]
            assert system_stats["python_version"] == "3.9.0"
    
    @patch('app.routers.router_system.get_current_user')
    @patch('app.routers.router_system.get_db')
    def test_backup_system_data(self, mock_get_db, mock_get_current_user, client, mock_admin_user):
        """Test system backup endpoint"""
        mock_get_current_user.return_value = mock_admin_user
        
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # Mock database queries
        mock_db.query.return_value.all.return_value = []
        
        # Mock file operations
        with patch('pathlib.Path') as mock_path, \
             patch('builtins.open', create=True) as mock_open:
            
            mock_backup_dir = MagicMock()
            mock_backup_dir.mkdir.return_value = None
            
            mock_backup_path = MagicMock()
            mock_backup_path.stat.return_value.st_size = 1024
            
            mock_path.return_value = mock_backup_dir
            mock_path.return_value.__truediv__.return_value = mock_backup_path
            
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            
            response = client.post("/system/backup?backup_type=full")
            
            assert response.status_code == 200
            data = response.json()
            assert "System backup created successfully" in data["message"]
            assert "filename" in data
            assert data["backup_type"] == "full"
            assert data["file_size"] == 1024
    
    @patch('app.routers.router_system.get_current_user')
    @patch('app.routers.router_system.get_db')
    def test_restore_system_data(self, mock_get_db, mock_get_current_user, client, mock_admin_user):
        """Test system restore endpoint"""
        mock_get_current_user.return_value = mock_admin_user
        
        mock_db = MagicMock()
        mock_get_db.return_value = mock_db
        
        # Mock file operations
        with patch('pathlib.Path') as mock_path, \
             patch('builtins.open', create=True) as mock_open:
            
            mock_backup_path = MagicMock()
            mock_backup_path.exists.return_value = True
            
            mock_path.return_value.__truediv__.return_value = mock_backup_path
            
            mock_file = MagicMock()
            mock_file.read.return_value = '{"timestamp": "2023-01-01T00:00:00", "users": []}'
            mock_open.return_value.__enter__.return_value = mock_file
            
            response = client.post("/system/restore?backup_file=test_backup.json&restore_type=users")
            
            assert response.status_code == 200
            data = response.json()
            assert "System data restored successfully" in data["message"]
            assert data["backup_file"] == "test_backup.json"
            assert data["restore_type"] == "users"
    
    @patch('app.routers.router_system.get_current_user')
    def test_get_system_settings(self, mock_get_current_user, client, mock_admin_user):
        """Test get system settings endpoint"""
        mock_get_current_user.return_value = mock_admin_user
        
        # Mock file operations
        with patch('pathlib.Path') as mock_path, \
             patch('builtins.open', create=True) as mock_open:
            
            # Test with existing config file
            mock_config_path = MagicMock()
            mock_config_path.exists.return_value = True
            
            mock_path.return_value = mock_config_path
            
            mock_file = MagicMock()
            mock_file.read.return_value = '{"system": {"name": "TestSystem"}}'
            mock_open.return_value.__enter__.return_value = mock_file
            
            response = client.get("/system/settings")
            
            assert response.status_code == 200
            data = response.json()
            assert data["system"]["name"] == "TestSystem"
    
    @patch('app.routers.router_system.get_current_user')
    def test_update_system_settings(self, mock_get_current_user, client, mock_admin_user):
        """Test update system settings endpoint"""
        mock_get_current_user.return_value = mock_admin_user
        
        # Mock file operations
        with patch('pathlib.Path') as mock_path, \
             patch('builtins.open', create=True) as mock_open:
            
            mock_config_dir = MagicMock()
            mock_config_dir.mkdir.return_value = None
            
            mock_config_path = MagicMock()
            
            mock_path.return_value = mock_config_dir
            mock_path.return_value.__truediv__.return_value = mock_config_path
            
            mock_file = MagicMock()
            mock_open.return_value.__enter__.return_value = mock_file
            
            settings = {"system": {"name": "UpdatedSystem"}}
            
            response = client.put("/system/settings", json=settings)
            
            assert response.status_code == 200
            data = response.json()
            assert "System settings updated successfully" in data["message"]
    
    @patch('app.routers.router_system.get_current_user')
    def test_monitor_system_performance(self, mock_get_current_user, client, mock_admin_user):
        """Test system performance monitoring endpoint"""
        mock_get_current_user.return_value = mock_admin_user
        
        # Mock system metrics
        with patch('psutil.cpu_percent') as mock_cpu, \
             patch('psutil.virtual_memory') as mock_memory, \
             patch('psutil.disk_usage') as mock_disk, \
             patch('psutil.net_io_counters') as mock_network, \
             patch('psutil.connections') as mock_connections, \
             patch('pathlib.Path') as mock_path, \
             patch('platform.system') as mock_system, \
             patch('platform.release') as mock_release, \
             patch('platform.version') as mock_version, \
             patch('platform.machine') as mock_machine, \
             patch('platform.processor') as mock_processor:
            
            mock_cpu.return_value = 30.0
            mock_cpu.return_value = 4
            
            mock_memory_obj = MagicMock()
            mock_memory_obj.total = 8589934592  # 8GB
            mock_memory_obj.available = 4294967296  # 4GB
            mock_memory_obj.percent = 50.0
            mock_memory_obj.used = 4294967296
            mock_memory.return_value = mock_memory_obj
            
            mock_disk_obj = MagicMock()
            mock_disk_obj.total = 107374182400  # 100GB
            mock_disk_obj.used = 53687091200  # 50GB
            mock_disk_obj.free = 53687091200  # 50GB
            mock_disk_obj.percent = 50.0
            mock_disk.return_value = mock_disk_obj
            
            mock_network_obj = MagicMock()
            mock_network_obj.bytes_sent = 1024
            mock_network_obj.bytes_recv = 2048
            mock_network_obj.packets_sent = 10
            mock_network_obj.packets_recv = 20
            mock_network.return_value = mock_network_obj
            
            mock_connections.return_value = [MagicMock(), MagicMock()]
            
            mock_path.return_value.rglob.return_value = [MagicMock(), MagicMock()]
            mock_path.return_value.rglob.return_value.__iter__.return_value = iter([
                MagicMock(stat=lambda: MagicMock(st_size=1024)),
                MagicMock(stat=lambda: MagicMock(st_size=2048))
            ])
            
            mock_system.return_value = "Linux"
            mock_release.return_value = "5.15.0"
            mock_version.return_value = "Ubuntu 22.04"
            mock_machine.return_value = "x86_64"
            mock_processor.return_value = "Intel(R) Core(TM) i7"
            
            response = client.get("/system/performance")
            
            assert response.status_code == 200
            data = response.json()
            assert "timestamp" in data
            assert "status" in data
            assert "cpu" in data
            assert "memory" in data
            assert "disk" in data
            assert "network" in data
            assert "database" in data
            assert "files" in data
            assert "platform" in data
            
            # Check specific values
            assert data["cpu"]["percent"] == 30.0
            assert data["cpu"]["count"] == 4
            assert data["memory"]["total"] == 8589934592
            assert data["memory"]["percent"] == 50.0
            assert data["disk"]["percent"] == 50.0
            assert data["status"] == "healthy"


if __name__ == "__main__":
    pytest.main([__file__])
