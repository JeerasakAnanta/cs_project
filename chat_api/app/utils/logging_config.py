import logging
import logging.handlers
import os
from datetime import datetime
from app.utils.timezone import now, format_datetime

class TimezoneFormatter(logging.Formatter):
    """Custom formatter that uses system timezone for timestamps"""
    
    def formatTime(self, record, datefmt=None):
        """Override formatTime to use system timezone"""
        dt = datetime.fromtimestamp(record.created)
        return format_datetime(dt, datefmt or "%Y-%m-%d %H:%M:%S")

def setup_logging(
    log_level: str = "INFO",
    log_file: str = None,
    max_bytes: int = 10 * 1024 * 1024,  # 10MB
    backup_count: int = 5
):
    """Setup logging configuration with system timezone"""
    
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Create formatter with timezone
    formatter = TimezoneFormatter(
        fmt='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (if log_file is specified)
    if log_file:
        # Ensure log directory exists
        log_dir = os.path.dirname(log_file)
        if log_dir and not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        
        # Use RotatingFileHandler for log rotation
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    # Log startup message with current time
    logger.info(f"Logging initialized at {format_datetime(now())} with timezone: {os.getenv('TIMEZONE', 'Asia/Bangkok')}")

def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name"""
    return logging.getLogger(name) 