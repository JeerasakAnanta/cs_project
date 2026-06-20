"""
Error handling utilities for LannaFinChat
"""
import logging
import traceback
import json
from typing import Any, Dict, List, Optional, Union
from datetime import datetime
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


class LannaFinChatError(Exception):
    """Base exception class for LannaFinChat"""
    
    def __init__(self, message: str, error_code: str = None, status_code: int = 500, details: Dict[str, Any] = None):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        self.timestamp = datetime.utcnow()
        super().__init__(self.message)


class ValidationError(LannaFinChatError):
    """Validation error exception"""
    
    def __init__(self, message: str, field: str = None, value: Any = None, details: Dict[str, Any] = None):
        super().__init__(message, "VALIDATION_ERROR", 400, details)
        self.field = field
        self.value = value


class AuthenticationError(LannaFinChatError):
    """Authentication error exception"""
    
    def __init__(self, message: str = "Authentication failed", details: Dict[str, Any] = None):
        super().__init__(message, "AUTHENTICATION_ERROR", 401, details)


class AuthorizationError(LannaFinChatError):
    """Authorization error exception"""
    
    def __init__(self, message: str = "Access denied", details: Dict[str, Any] = None):
        super().__init__(message, "AUTHORIZATION_ERROR", 403, details)


class ResourceNotFoundError(LannaFinChatError):
    """Resource not found error exception"""
    
    def __init__(self, resource_type: str, resource_id: Any, details: Dict[str, Any] = None):
        message = f"{resource_type} with id {resource_id} not found"
        super().__init__(message, "RESOURCE_NOT_FOUND", 404, details)
        self.resource_type = resource_type
        self.resource_id = resource_id


class DatabaseError(LannaFinChatError):
    """Database error exception"""
    
    def __init__(self, message: str, operation: str = None, details: Dict[str, Any] = None):
        super().__init__(message, "DATABASE_ERROR", 500, details)
        self.operation = operation


class ExternalServiceError(LannaFinChatError):
    """External service error exception"""
    
    def __init__(self, service_name: str, message: str, details: Dict[str, Any] = None):
        super().__init__(message, "EXTERNAL_SERVICE_ERROR", 502, details)
        self.service_name = service_name


def log_error(error: Exception, context: Dict[str, Any] = None) -> None:
    """Log error with context information"""
    try:
        error_info = {
            "error_type": type(error).__name__,
            "error_message": str(error),
            "timestamp": datetime.utcnow().isoformat(),
            "traceback": traceback.format_exc(),
            "context": context or {}
        }
        
        if isinstance(error, LannaFinChatError):
            error_info.update({
                "error_code": error.error_code,
                "status_code": error.status_code,
                "details": error.details
            })
        
        logger.error(f"Error occurred: {json.dumps(error_info, default=str)}")
        
    except Exception as log_error:
        logger.error(f"Failed to log error: {str(log_error)}")


def create_error_response(error: Exception, include_traceback: bool = False) -> JSONResponse:
    """Create standardized error response"""
    try:
        if isinstance(error, LannaFinChatError):
            status_code = error.status_code
            error_data = {
                "error": {
                    "code": error.error_code,
                    "message": error.message,
                    "timestamp": error.timestamp.isoformat(),
                    "details": error.details
                }
            }
        else:
            status_code = 500
            error_data = {
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An unexpected error occurred",
                    "timestamp": datetime.utcnow().isoformat(),
                    "details": {}
                }
            }
        
        if include_traceback:
            error_data["error"]["traceback"] = traceback.format_exc()
        
        return JSONResponse(
            status_code=status_code,
            content=error_data
        )
        
    except Exception as response_error:
        logger.error(f"Failed to create error response: {str(response_error)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "ERROR_RESPONSE_FAILED",
                    "message": "Failed to create error response",
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
        )


def handle_validation_errors(validation_errors: List[Dict[str, Any]]) -> ValidationError:
    """Handle validation errors and create appropriate exception"""
    try:
        if not validation_errors:
            return ValidationError("No validation errors")
        
        # Group errors by field
        field_errors = {}
        for error in validation_errors:
            field = error.get("field", "unknown")
            if field not in field_errors:
                field_errors[field] = []
            field_errors[field].append(error.get("message", "Validation failed"))
        
        # Create error message
        error_messages = []
        for field, messages in field_errors.items():
            if field == "unknown":
                error_messages.extend(messages)
            else:
                error_messages.append(f"{field}: {'; '.join(messages)}")
        
        error_message = "; ".join(error_messages)
        
        return ValidationError(
            message=error_message,
            details={"field_errors": field_errors}
        )
        
    except Exception as e:
        logger.error(f"Failed to handle validation errors: {str(e)}")
        return ValidationError("Validation error handling failed")


def safe_execute(func, *args, default_return: Any = None, error_context: Dict[str, Any] = None, **kwargs):
    """Safely execute a function with error handling"""
    try:
        return func(*args, **kwargs)
    except Exception as e:
        log_error(e, error_context or {"function": func.__name__, "args": args, "kwargs": kwargs})
        return default_return


async def safe_async_execute(func, *args, default_return: Any = None, error_context: Dict[str, Any] = None, **kwargs):
    """Safely execute an async function with error handling"""
    try:
        return await func(*args, **kwargs)
    except Exception as e:
        log_error(e, error_context or {"function": func.__name__, "args": args, "kwargs": kwargs})
        return default_return


def retry_operation(operation, max_retries: int = 3, delay_seconds: float = 1.0, 
                   backoff_factor: float = 2.0, error_context: Dict[str, Any] = None):
    """Retry an operation with exponential backoff"""
    import time
    
    for attempt in range(max_retries + 1):
        try:
            return operation()
        except Exception as e:
            if attempt == max_retries:
                log_error(e, error_context or {"operation": "retry_operation", "attempts": attempt + 1})
                raise e
            
            wait_time = delay_seconds * (backoff_factor ** attempt)
            logger.warning(f"Operation failed, retrying in {wait_time:.2f} seconds. Attempt {attempt + 1}/{max_retries + 1}")
            time.sleep(wait_time)


async def retry_async_operation(operation, max_retries: int = 3, delay_seconds: float = 1.0,
                               backoff_factor: float = 2.0, error_context: Dict[str, Any] = None):
    """Retry an async operation with exponential backoff"""
    import asyncio
    
    for attempt in range(max_retries + 1):
        try:
            return await operation()
        except Exception as e:
            if attempt == max_retries:
                log_error(e, error_context or {"operation": "retry_async_operation", "attempts": attempt + 1})
                raise e
            
            wait_time = delay_seconds * (backoff_factor ** attempt)
            logger.warning(f"Async operation failed, retrying in {wait_time:.2f} seconds. Attempt {attempt + 1}/{max_retries + 1}")
            await asyncio.sleep(wait_time)


def create_success_response(data: Any = None, message: str = "Success", status_code: int = 200) -> JSONResponse:
    """Create standardized success response"""
    try:
        response_data = {
            "success": True,
            "message": message,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        if data is not None:
            response_data["data"] = data
        
        return JSONResponse(
            status_code=status_code,
            content=response_data
        )
        
    except Exception as e:
        logger.error(f"Failed to create success response: {str(e)}")
        return JSONResponse(
            status_code=500,
            content={
                "error": {
                    "code": "SUCCESS_RESPONSE_FAILED",
                    "message": "Failed to create success response",
                    "timestamp": datetime.utcnow().isoformat()
                }
            }
        )


def format_error_for_user(error: Exception) -> str:
    """Format error message for user display"""
    try:
        if isinstance(error, LannaFinChatError):
            return error.message
        
        # Handle common exceptions
        if isinstance(error, ValueError):
            return "Invalid input provided"
        elif isinstance(error, TypeError):
            return "Invalid data type"
        elif isinstance(error, KeyError):
            return "Missing required information"
        elif isinstance(error, IndexError):
            return "Invalid index or position"
        else:
            return "An unexpected error occurred"
            
    except Exception as e:
        logger.error(f"Failed to format error for user: {str(e)}")
        return "An error occurred"


def get_error_summary(errors: List[Exception]) -> Dict[str, Any]:
    """Get summary of multiple errors"""
    try:
        error_types = {}
        error_messages = []
        
        for error in errors:
            error_type = type(error).__name__
            if error_type not in error_types:
                error_types[error_type] = 0
            error_types[error_type] += 1
            
            if isinstance(error, LannaFinChatError):
                error_messages.append(error.message)
            else:
                error_messages.append(str(error))
        
        return {
            "total_errors": len(errors),
            "error_types": error_types,
            "error_messages": error_messages,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to create error summary: {str(e)}")
        return {
            "total_errors": 0,
            "error_types": {},
            "error_messages": [],
            "timestamp": datetime.utcnow().isoformat(),
            "summary_error": str(e)
        }
