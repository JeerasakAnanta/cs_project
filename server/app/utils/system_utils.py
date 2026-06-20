"""
System utility functions for LannaFinChat
"""
import os
import psutil
import platform
import json
import shutil
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import logging

logger = logging.getLogger(__name__)


def get_system_info() -> Dict[str, Any]:
    """Get comprehensive system information"""
    try:
        return {
            "platform": {
                "system": platform.system(),
                "release": platform.release(),
                "version": platform.version(),
                "machine": platform.machine(),
                "processor": platform.processor(),
                "python_version": platform.python_version()
            },
            "cpu": {
                "count": psutil.cpu_count(),
                "count_logical": psutil.cpu_count(logical=True),
                "frequency": psutil.cpu_freq()._asdict() if psutil.cpu_freq() else None,
                "percent": psutil.cpu_percent(interval=1)
            },
            "memory": {
                "total": psutil.virtual_memory().total,
                "available": psutil.virtual_memory().available,
                "used": psutil.virtual_memory().used,
                "percent": psutil.virtual_memory().percent
            },
            "disk": {
                "total": psutil.disk_usage('/').total,
                "used": psutil.disk_usage('/').used,
                "free": psutil.disk_usage('/').free,
                "percent": psutil.disk_usage('/').percent
            },
            "network": {
                "interfaces": list(psutil.net_if_addrs().keys()),
                "stats": psutil.net_io_counters()._asdict()
            }
        }
    except Exception as e:
        logger.error(f"Error getting system info: {str(e)}")
        return {"error": str(e)}


def get_process_info() -> List[Dict[str, Any]]:
    """Get information about running processes"""
    try:
        processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'status']):
            try:
                proc_info = proc.info
                processes.append({
                    "pid": proc_info['pid'],
                    "name": proc_info['name'],
                    "cpu_percent": proc_info['cpu_percent'],
                    "memory_percent": proc_info['memory_percent'],
                    "status": proc_info['status']
                })
            except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
                continue
        
        # Sort by CPU usage
        processes.sort(key=lambda x: x['cpu_percent'] or 0, reverse=True)
        return processes[:20]  # Return top 20 processes
    except Exception as e:
        logger.error(f"Error getting process info: {str(e)}")
        return []


def cleanup_temp_files(directory: str = "/tmp", max_age_hours: int = 24) -> Dict[str, Any]:
    """Clean up temporary files older than specified age"""
    try:
        temp_dir = Path(directory)
        if not temp_dir.exists():
            return {"error": f"Directory {directory} does not exist"}
        
        cutoff_time = datetime.now() - timedelta(hours=max_age_hours)
        deleted_files = 0
        deleted_size = 0
        errors = []
        
        for file_path in temp_dir.rglob("*"):
            try:
                if file_path.is_file():
                    file_age = datetime.fromtimestamp(file_path.stat().st_mtime)
                    if file_age < cutoff_time:
                        file_size = file_path.stat().st_size
                        file_path.unlink()
                        deleted_files += 1
                        deleted_size += file_size
            except Exception as e:
                errors.append(f"Error deleting {file_path}: {str(e)}")
        
        return {
            "deleted_files": deleted_files,
            "deleted_size_bytes": deleted_size,
            "deleted_size_mb": round(deleted_size / (1024 * 1024), 2),
            "errors": errors
        }
    except Exception as e:
        logger.error(f"Error cleaning up temp files: {str(e)}")
        return {"error": str(e)}


def check_disk_space(path: str = "/") -> Dict[str, Any]:
    """Check disk space for specified path"""
    try:
        disk_usage = psutil.disk_usage(path)
        return {
            "path": path,
            "total_gb": round(disk_usage.total / (1024**3), 2),
            "used_gb": round(disk_usage.used / (1024**3), 2),
            "free_gb": round(disk_usage.free / (1024**3), 2),
            "percent": disk_usage.percent,
            "status": "critical" if disk_usage.percent > 90 else "warning" if disk_usage.percent > 80 else "healthy"
        }
    except Exception as e:
        logger.error(f"Error checking disk space: {str(e)}")
        return {"error": str(e)}


def get_file_system_info() -> Dict[str, Any]:
    """Get file system information"""
    try:
        partitions = []
        for partition in psutil.disk_partitions():
            try:
                usage = psutil.disk_usage(partition.mountpoint)
                partitions.append({
                    "device": partition.device,
                    "mountpoint": partition.mountpoint,
                    "fstype": partition.fstype,
                    "total_gb": round(usage.total / (1024**3), 2),
                    "used_gb": round(usage.used / (1024**3), 2),
                    "free_gb": round(usage.free / (1024**3), 2),
                    "percent": usage.percent
                })
            except PermissionError:
                continue
        
        return {"partitions": partitions}
    except Exception as e:
        logger.error(f"Error getting file system info: {str(e)}")
        return {"error": str(e)}


def monitor_system_resources(interval_seconds: int = 5, duration_minutes: int = 1) -> List[Dict[str, Any]]:
    """Monitor system resources over time"""
    try:
        import time
        samples = []
        end_time = datetime.now() + timedelta(minutes=duration_minutes)
        
        while datetime.now() < end_time:
            sample = {
                "timestamp": datetime.now().isoformat(),
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_percent": psutil.disk_usage('/').percent
            }
            samples.append(sample)
            time.sleep(interval_seconds)
        
        return samples
    except Exception as e:
        logger.error(f"Error monitoring system resources: {str(e)}")
        return []


def create_system_report() -> Dict[str, Any]:
    """Create a comprehensive system report"""
    try:
        report = {
            "timestamp": datetime.now().isoformat(),
            "system_info": get_system_info(),
            "disk_space": check_disk_space(),
            "file_system": get_file_system_info(),
            "top_processes": get_process_info()[:10],  # Top 10 processes
            "summary": {}
        }
        
        # Add summary
        cpu_status = "healthy"
        if report["system_info"]["cpu"]["percent"] > 80:
            cpu_status = "warning"
        if report["system_info"]["cpu"]["percent"] > 95:
            cpu_status = "critical"
        
        memory_status = "healthy"
        if report["system_info"]["memory"]["percent"] > 80:
            memory_status = "warning"
        if report["system_info"]["memory"]["percent"] > 95:
            memory_status = "critical"
        
        report["summary"] = {
            "cpu_status": cpu_status,
            "memory_status": memory_status,
            "disk_status": report["disk_space"]["status"],
            "overall_status": "healthy"
        }
        
        # Determine overall status
        if any(status == "critical" for status in [cpu_status, memory_status, report["disk_space"]["status"]]):
            report["summary"]["overall_status"] = "critical"
        elif any(status == "warning" for status in [cpu_status, memory_status, report["disk_space"]["status"]]):
            report["summary"]["overall_status"] = "warning"
        
        return report
    except Exception as e:
        logger.error(f"Error creating system report: {str(e)}")
        return {"error": str(e)}


def save_system_report(filename: Optional[str] = None) -> Dict[str, Any]:
    """Save system report to file"""
    try:
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"system_report_{timestamp}.json"
        
        report = create_system_report()
        if "error" in report:
            return report
        
        # Create reports directory if it doesn't exist
        reports_dir = Path("reports")
        reports_dir.mkdir(exist_ok=True)
        
        file_path = reports_dir / filename
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        return {
            "message": "System report saved successfully",
            "filename": filename,
            "file_path": str(file_path),
            "file_size_bytes": file_path.stat().st_size
        }
    except Exception as e:
        logger.error(f"Error saving system report: {str(e)}")
        return {"error": str(e)}
