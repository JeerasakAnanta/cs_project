import os
import pytz
from datetime import datetime
from typing import Optional

# Default timezone - can be overridden by environment variable
DEFAULT_TIMEZONE = os.getenv("TIMEZONE", "Asia/Bangkok")

def get_system_timezone() -> str:
    """Get the system timezone from environment or default to Asia/Bangkok"""
    return os.getenv("TIMEZONE", DEFAULT_TIMEZONE)

def get_timezone() -> pytz.timezone:
    """Get pytz timezone object for the configured timezone"""
    timezone_name = get_system_timezone()
    try:
        return pytz.timezone(timezone_name)
    except pytz.exceptions.UnknownTimeZoneError:
        # Fallback to UTC if timezone is invalid
        print(f"Warning: Unknown timezone '{timezone_name}', falling back to UTC")
        return pytz.UTC

def now() -> datetime:
    """Get current datetime in the configured timezone"""
    return datetime.now(get_timezone())

def utc_now() -> datetime:
    """Get current datetime in UTC"""
    return datetime.now(pytz.UTC)

def localize_datetime(dt: datetime) -> datetime:
    """Localize a naive datetime to the configured timezone"""
    if dt.tzinfo is None:
        return get_timezone().localize(dt)
    return dt

def format_datetime(dt: datetime, format_str: str = "%Y-%m-%d %H:%M:%S") -> str:
    """Format datetime to string in the configured timezone"""
    if dt.tzinfo is None:
        dt = localize_datetime(dt)
    return dt.strftime(format_str)

def parse_datetime(datetime_str: str, format_str: str = "%Y-%m-%d %H:%M:%S") -> datetime:
    """Parse datetime string and return localized datetime"""
    dt = datetime.strptime(datetime_str, format_str)
    return localize_datetime(dt)

def to_utc(dt: datetime) -> datetime:
    """Convert datetime to UTC"""
    if dt.tzinfo is None:
        dt = localize_datetime(dt)
    return dt.astimezone(pytz.UTC)

def from_utc(dt: datetime) -> datetime:
    """Convert UTC datetime to local timezone"""
    if dt.tzinfo is None:
        dt = pytz.UTC.localize(dt)
    return dt.astimezone(get_timezone()) 