"""
Test cases for system_utils.py
"""
import pytest
import tempfile
import os
from pathlib import Path
from unittest.mock import patch, MagicMock
from app.utils.system_utils import (
    get_system_info,
    get_process_info,
    cleanup_temp_files,
    check_disk_space,
    get_file_system_info,
    monitor_system_resources,
    create_system_report,
    save_system_report
)


class TestSystemUtils:
    """Test cases for system utility functions"""
    
    def test_get_system_info(self):
        """Test get_system_info function"""
        result = get_system_info()
        
        assert isinstance(result, dict)
        assert "platform" in result
        assert "cpu" in result
        assert "memory" in result
        assert "disk" in result
        assert "network" in result
        
        # Check platform info
        assert "system" in result["platform"]
        assert "python_version" in result["platform"]
        
        # Check CPU info
        assert "count" in result["cpu"]
        assert "percent" in result["cpu"]
        assert isinstance(result["cpu"]["count"], int)
        assert isinstance(result["cpu"]["percent"], (int, float))
        
        # Check memory info
        assert "total" in result["memory"]
        assert "percent" in result["memory"]
        assert isinstance(result["memory"]["total"], int)
        assert isinstance(result["memory"]["percent"], (int, float))
    
    @patch('psutil.process_iter')
    def test_get_process_info(self, mock_process_iter):
        """Test get_process_info function with mocked psutil"""
        # Mock process data
        mock_processes = [
            MagicMock(info={
                'pid': 1,
                'name': 'test_process',
                'cpu_percent': 10.5,
                'memory_percent': 5.2,
                'status': 'running'
            }),
            MagicMock(info={
                'pid': 2,
                'name': 'another_process',
                'cpu_percent': 20.0,
                'memory_percent': 8.1,
                'status': 'sleeping'
            })
        ]
        mock_process_iter.return_value = mock_processes
        
        result = get_process_info()
        
        assert isinstance(result, list)
        assert len(result) == 2
        assert result[0]["pid"] == 1
        assert result[0]["name"] == "test_process"
        assert result[0]["cpu_percent"] == 10.5
        assert result[0]["memory_percent"] == 5.2
        assert result[0]["status"] == "running"
    
    def test_cleanup_temp_files(self):
        """Test cleanup_temp_files function"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create some test files
            test_file1 = Path(temp_dir) / "test1.txt"
            test_file2 = Path(temp_dir) / "test2.txt"
            
            test_file1.write_text("test content 1")
            test_file2.write_text("test content 2")
            
            # Test cleanup with very short age (should delete all files)
            result = cleanup_temp_files(temp_dir, max_age_hours=0.001)
            
            assert isinstance(result, dict)
            assert "deleted_files" in result
            assert "deleted_size_bytes" in result
            assert result["deleted_files"] >= 0
    
    def test_check_disk_space(self):
        """Test check_disk_space function"""
        result = check_disk_space("/")
        
        assert isinstance(result, dict)
        assert "path" in result
        assert "total_gb" in result
        assert "used_gb" in result
        assert "free_gb" in result
        assert "percent" in result
        assert "status" in result
        
        assert result["path"] == "/"
        assert isinstance(result["total_gb"], float)
        assert isinstance(result["used_gb"], float)
        assert isinstance(result["free_gb"], float)
        assert isinstance(result["percent"], (int, float))
        assert result["status"] in ["healthy", "warning", "critical"]
    
    @patch('psutil.disk_partitions')
    def test_get_file_system_info(self, mock_disk_partitions):
        """Test get_file_system_info function with mocked psutil"""
        # Mock partition data
        mock_partition = MagicMock()
        mock_partition.device = "/dev/sda1"
        mock_partition.mountpoint = "/"
        mock_partition.fstype = "ext4"
        
        mock_disk_partitions.return_value = [mock_partition]
        
        with patch('psutil.disk_usage') as mock_disk_usage:
            mock_usage = MagicMock()
            mock_usage.total = 100 * 1024**3  # 100 GB
            mock_usage.used = 50 * 1024**3   # 50 GB
            mock_usage.free = 50 * 1024**3   # 50 GB
            mock_usage.percent = 50.0
            mock_disk_usage.return_value = mock_usage
            
            result = get_file_system_info()
            
            assert isinstance(result, dict)
            assert "partitions" in result
            assert len(result["partitions"]) == 1
            
            partition = result["partitions"][0]
            assert partition["device"] == "/dev/sda1"
            assert partition["mountpoint"] == "/"
            assert partition["fstype"] == "ext4"
            assert partition["total_gb"] == 100.0
            assert partition["used_gb"] == 50.0
            assert partition["free_gb"] == 50.0
            assert partition["percent"] == 50.0
    
    @patch('time.sleep')
    def test_monitor_system_resources(self, mock_sleep):
        """Test monitor_system_resources function"""
        # Mock sleep to avoid actual delays
        mock_sleep.return_value = None
        
        result = monitor_system_resources(interval_seconds=1, duration_minutes=0.01)
        
        assert isinstance(result, list)
        # Should have at least one sample
        assert len(result) >= 1
        
        if result:
            sample = result[0]
            assert "timestamp" in sample
            assert "cpu_percent" in sample
            assert "memory_percent" in sample
            assert "disk_percent" in sample
    
    def test_create_system_report(self):
        """Test create_system_report function"""
        result = create_system_report()
        
        assert isinstance(result, dict)
        assert "timestamp" in result
        assert "system_info" in result
        assert "disk_space" in result
        assert "file_system" in result
        assert "top_processes" in result
        assert "summary" in result
        
        # Check summary
        summary = result["summary"]
        assert "cpu_status" in summary
        assert "memory_status" in summary
        assert "disk_status" in summary
        assert "overall_status" in summary
        
        assert summary["overall_status"] in ["healthy", "warning", "critical"]
    
    def test_save_system_report(self):
        """Test save_system_report function"""
        # Test with default filename
        result = save_system_report()
        
        assert isinstance(result, dict)
        assert "message" in result
        assert "filename" in result
        assert "file_path" in result
        assert "file_size_bytes" in result
        
        # Check if file was created
        file_path = Path(result["file_path"])
        assert file_path.exists()
        assert file_path.stat().st_size > 0
        
        # Clean up
        file_path.unlink()
        if file_path.parent.exists() and not list(file_path.parent.iterdir()):
            file_path.parent.rmdir()
        
        # Test with custom filename
        custom_result = save_system_report("custom_report.json")
        assert custom_result["filename"] == "custom_report.json"
        
        # Clean up custom file
        custom_file_path = Path(custom_result["file_path"])
        if custom_file_path.exists():
            custom_file_path.unlink()
        if custom_file_path.parent.exists() and not list(custom_file_path.parent.iterdir()):
            custom_file_path.parent.rmdir()


if __name__ == "__main__":
    pytest.main([__file__])
