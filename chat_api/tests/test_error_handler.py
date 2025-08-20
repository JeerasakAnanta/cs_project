"""
Test cases for error_handler.py
"""
import pytest
from unittest.mock import patch, MagicMock
from fastapi.responses import JSONResponse
from app.utils.error_handler import (
    LannaFinChatError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    ResourceNotFoundError,
    DatabaseError,
    ExternalServiceError,
    log_error,
    create_error_response,
    handle_validation_errors,
    safe_execute,
    safe_async_execute,
    retry_operation,
    retry_async_operation,
    create_success_response,
    format_error_for_user,
    get_error_summary
)


class TestErrorHandler:
    """Test cases for error handling functions"""
    
    def test_lannafinchat_error(self):
        """Test base LannaFinChatError class"""
        error = LannaFinChatError(
            message="Test error",
            error_code="TEST_ERROR",
            status_code=400,
            details={"field": "test"}
        )
        
        assert str(error) == "Test error"
        assert error.error_code == "TEST_ERROR"
        assert error.status_code == 400
        assert error.details == {"field": "test"}
        assert error.timestamp is not None
    
    def test_validation_error(self):
        """Test ValidationError class"""
        error = ValidationError(
            message="Invalid input",
            field="username",
            value="test",
            details={"constraint": "min_length"}
        )
        
        assert error.message == "Invalid input"
        assert error.error_code == "VALIDATION_ERROR"
        assert error.status_code == 400
        assert error.field == "username"
        assert error.value == "test"
    
    def test_authentication_error(self):
        """Test AuthenticationError class"""
        error = AuthenticationError("Invalid credentials")
        
        assert error.message == "Invalid credentials"
        assert error.error_code == "AUTHENTICATION_ERROR"
        assert error.status_code == 401
    
    def test_authorization_error(self):
        """Test AuthorizationError class"""
        error = AuthorizationError("Insufficient permissions")
        
        assert error.message == "Insufficient permissions"
        assert error.error_code == "AUTHORIZATION_ERROR"
        assert error.status_code == 403
    
    def test_resource_not_found_error(self):
        """Test ResourceNotFoundError class"""
        error = ResourceNotFoundError("User", 123)
        
        assert error.message == "User with id 123 not found"
        assert error.error_code == "RESOURCE_NOT_FOUND"
        assert error.status_code == 404
        assert error.resource_type == "User"
        assert error.resource_id == 123
    
    def test_database_error(self):
        """Test DatabaseError class"""
        error = DatabaseError("Connection failed", "connect")
        
        assert error.message == "Connection failed"
        assert error.error_code == "DATABASE_ERROR"
        assert error.status_code == 500
        assert error.operation == "connect"
    
    def test_external_service_error(self):
        """Test ExternalServiceError class"""
        error = ExternalServiceError("API Service", "Service unavailable")
        
        assert error.message == "Service unavailable"
        assert error.error_code == "EXTERNAL_SERVICE_ERROR"
        assert error.status_code == 502
        assert error.service_name == "API Service"
    
    @patch('app.utils.error_handler.logger')
    def test_log_error(self, mock_logger):
        """Test log_error function"""
        error = ValueError("Test value error")
        context = {"user_id": 123, "action": "test"}
        
        log_error(error, context)
        
        mock_logger.error.assert_called_once()
        log_call = mock_logger.error.call_args[0][0]
        assert "Test value error" in log_call
        assert "user_id" in log_call
        assert "action" in log_call
    
    def test_create_error_response(self):
        """Test create_error_response function"""
        # Test with LannaFinChatError
        error = ValidationError("Invalid input", "username")
        response = create_error_response(error)
        
        assert isinstance(response, JSONResponse)
        assert response.status_code == 400
        content = response.body.decode()
        assert "Invalid input" in content
        assert "VALIDATION_ERROR" in content
        
        # Test with regular exception
        error = ValueError("Test error")
        response = create_error_response(error)
        
        assert isinstance(response, JSONResponse)
        assert response.status_code == 500
        content = response.body.decode()
        assert "INTERNAL_SERVER_ERROR" in content
        
        # Test with traceback
        response = create_error_response(error, include_traceback=True)
        content = response.body.decode()
        assert "traceback" in content
    
    def test_handle_validation_errors(self):
        """Test handle_validation_errors function"""
        validation_errors = [
            {"field": "username", "message": "Username is required"},
            {"field": "email", "message": "Invalid email format"},
            {"field": "username", "message": "Username too short"}
        ]
        
        error = handle_validation_errors(validation_errors)
        
        assert isinstance(error, ValidationError)
        assert error.status_code == 400
        assert "username: Username is required; Username too short" in error.message
        assert "email: Invalid email format" in error.message
        
        # Test empty errors
        error = handle_validation_errors([])
        assert error.message == "No validation errors"
    
    def test_safe_execute(self):
        """Test safe_execute function"""
        def success_func():
            return "success"
        
        def error_func():
            raise ValueError("Test error")
        
        # Test successful execution
        result = safe_execute(success_func)
        assert result == "success"
        
        # Test error handling
        result = safe_execute(error_func, default_return="default")
        assert result == "default"
        
        # Test with context
        result = safe_execute(error_func, default_return=None, error_context={"test": "context"})
        assert result is None
    
    @pytest.mark.asyncio
    async def test_safe_async_execute(self):
        """Test safe_async_execute function"""
        async def success_func():
            return "success"
        
        async def error_func():
            raise ValueError("Test error")
        
        # Test successful execution
        result = await safe_async_execute(success_func)
        assert result == "success"
        
        # Test error handling
        result = await safe_async_execute(error_func, default_return="default")
        assert result == "default"
    
    @patch('time.sleep')
    def test_retry_operation(self, mock_sleep):
        """Test retry_operation function"""
        mock_sleep.return_value = None
        
        attempt_count = 0
        
        def failing_operation():
            nonlocal attempt_count
            attempt_count += 1
            if attempt_count < 3:
                raise ValueError("Temporary failure")
            return "success"
        
        # Test successful retry
        result = retry_operation(failing_operation, max_retries=3, delay_seconds=0.1)
        assert result == "success"
        assert attempt_count == 3
        
        # Test max retries exceeded
        attempt_count = 0
        with pytest.raises(ValueError):
            retry_operation(failing_operation, max_retries=1, delay_seconds=0.1)
    
    @pytest.mark.asyncio
    @patch('asyncio.sleep')
    async def test_retry_async_operation(self, mock_sleep):
        """Test retry_async_operation function"""
        mock_sleep.return_value = None
        
        attempt_count = 0
        
        async def failing_operation():
            nonlocal attempt_count
            attempt_count += 1
            if attempt_count < 3:
                raise ValueError("Temporary failure")
            return "success"
        
        # Test successful retry
        result = await retry_async_operation(failing_operation, max_retries=3, delay_seconds=0.1)
        assert result == "success"
        assert attempt_count == 3
        
        # Test max retries exceeded
        attempt_count = 0
        with pytest.raises(ValueError):
            await retry_async_operation(failing_operation, max_retries=1, delay_seconds=0.1)
    
    def test_create_success_response(self):
        """Test create_success_response function"""
        # Test with data
        response = create_success_response(data={"id": 123}, message="Created successfully")
        
        assert isinstance(response, JSONResponse)
        assert response.status_code == 200
        content = response.body.decode()
        assert "Created successfully" in content
        assert "123" in content
        
        # Test without data
        response = create_success_response(message="Operation completed")
        
        assert isinstance(response, JSONResponse)
        assert response.status_code == 200
        content = response.body.decode()
        assert "Operation completed" in content
        assert "data" not in content
        
        # Test with custom status code
        response = create_success_response(status_code=201)
        assert response.status_code == 201
    
    def test_format_error_for_user(self):
        """Test format_error_for_user function"""
        # Test LannaFinChatError
        error = ValidationError("Invalid input")
        message = format_error_for_user(error)
        assert message == "Invalid input"
        
        # Test common exceptions
        message = format_error_for_user(ValueError("Invalid value"))
        assert message == "Invalid input provided"
        
        message = format_error_for_user(TypeError("Wrong type"))
        assert message == "Invalid data type"
        
        message = format_error_for_user(KeyError("Missing key"))
        assert message == "Missing required information"
        
        message = format_error_for_user(IndexError("Invalid index"))
        assert message == "Invalid index or position"
        
        message = format_error_for_user(Exception("Unknown error"))
        assert message == "An unexpected error occurred"
    
    def test_get_error_summary(self):
        """Test get_error_summary function"""
        errors = [
            ValidationError("Invalid input"),
            ValueError("Value error"),
            ValidationError("Another validation error"),
            TypeError("Type error")
        ]
        
        summary = get_error_summary(errors)
        
        assert summary["total_errors"] == 4
        assert summary["error_types"]["ValidationError"] == 2
        assert summary["error_types"]["ValueError"] == 1
        assert summary["error_types"]["TypeError"] == 1
        assert len(summary["error_messages"]) == 4
        assert "Invalid input" in summary["error_messages"]
        assert "Value error" in summary["error_messages"]
        
        # Test empty errors
        summary = get_error_summary([])
        assert summary["total_errors"] == 0
        assert len(summary["error_types"]) == 0
        assert len(summary["error_messages"]) == 0


if __name__ == "__main__":
    pytest.main([__file__])
