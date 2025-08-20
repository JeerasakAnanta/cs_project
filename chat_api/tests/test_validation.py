"""
Test cases for validation.py
"""
import pytest
from app.utils.validation import (
    validate_email,
    validate_username,
    validate_password,
    validate_json_schema,
    validate_file_upload,
    validate_date_format,
    validate_phone_number,
    sanitize_input
)


class TestValidation:
    """Test cases for validation functions"""
    
    def test_validate_email(self):
        """Test email validation"""
        # Valid emails
        assert validate_email("test@example.com") == True
        assert validate_email("user.name@domain.co.uk") == True
        assert validate_email("user+tag@example.org") == True
        assert validate_email("123@456.com") == True
        
        # Invalid emails
        assert validate_email("invalid-email") == False
        assert validate_email("@example.com") == False
        assert validate_email("user@") == False
        assert validate_email("user@.com") == False
        assert validate_email("") == False
        assert validate_email(None) == False
    
    def test_validate_username(self):
        """Test username validation"""
        # Valid usernames
        result = validate_username("john_doe")
        assert result["is_valid"] == True
        assert len(result["errors"]) == 0
        
        result = validate_username("user123")
        assert result["is_valid"] == True
        
        result = validate_username("a")
        assert result["is_valid"] == False
        assert "at least 3 characters" in result["errors"][0]
        
        result = validate_username("a" * 31)
        assert result["is_valid"] == False
        assert "no more than 30 characters" in result["errors"][0]
        
        result = validate_username("user@name")
        assert result["is_valid"] == False
        assert "only contain letters, numbers, underscores, and hyphens" in result["errors"][0]
        
        result = validate_username("_username")
        assert result["is_valid"] == False
        assert "start with a letter or number" in result["errors"][0]
        
        result = validate_username("username_")
        assert result["is_valid"] == False
        assert "end with a letter or number" in result["errors"][0]
    
    def test_validate_password(self):
        """Test password validation"""
        # Strong password
        result = validate_password("StrongPass123!")
        assert result["is_valid"] == True
        assert result["strength"] == "strong"
        assert len(result["errors"]) == 0
        assert len(result["warnings"]) <= 2
        
        # Medium password
        result = validate_password("MediumPass123")
        assert result["is_valid"] == True
        assert result["strength"] in ["medium", "strong"]
        assert len(result["errors"]) == 0
        
        # Weak password - too short
        result = validate_password("Short1")
        assert result["is_valid"] == False
        assert result["strength"] == "weak"
        assert "at least 8 characters" in result["errors"][0]
        
        # Weak password - missing uppercase
        result = validate_password("lowercase123")
        assert result["is_valid"] == False
        assert "uppercase letter" in result["errors"][0]
        
        # Weak password - missing lowercase
        result = validate_password("UPPERCASE123")
        assert result["is_valid"] == False
        assert "lowercase letter" in result["errors"][0]
        
        # Weak password - missing number
        result = validate_password("NoNumbers")
        assert result["is_valid"] == False
        assert "number" in result["errors"][0]
        
        # Weak password - common pattern
        result = validate_password("password123")
        assert result["is_valid"] == False
        assert "common password patterns" in result["errors"][0]
        
        # Password with warnings
        result = validate_password("GoodPass123")
        assert result["is_valid"] == True
        assert "special characters" in result["warnings"][0]
    
    def test_validate_json_schema(self):
        """Test JSON schema validation"""
        # Simple schema
        schema = {
            "properties": {
                "name": {"type": "string", "required": True},
                "age": {"type": "integer", "minimum": 0, "maximum": 150},
                "email": {"type": "string", "pattern": r"^[^@]+@[^@]+\.[^@]+$"}
            }
        }
        
        # Valid data
        data = {"name": "John", "age": 25, "email": "john@example.com"}
        result = validate_json_schema(data, schema)
        assert result["is_valid"] == True
        assert len(result["errors"]) == 0
        
        # Missing required field
        data = {"age": 25, "email": "john@example.com"}
        result = validate_json_schema(data, schema)
        assert result["is_valid"] == False
        assert "name is required" in result["errors"][0]
        
        # Invalid type
        data = {"name": "John", "age": "25", "email": "john@example.com"}
        result = validate_json_schema(data, schema)
        assert result["is_valid"] == False
        assert "age must be an integer" in result["errors"][0]
        
        # Invalid value
        data = {"name": "John", "age": 200, "email": "john@example.com"}
        result = validate_json_schema(data, schema)
        assert result["is_valid"] == False
        assert "age must be no more than 150" in result["errors"][0]
        
        # Invalid pattern
        data = {"name": "John", "age": 25, "email": "invalid-email"}
        result = validate_json_schema(data, schema)
        assert result["is_valid"] == False
        assert "does not match required pattern" in result["errors"][0]
    
    def test_validate_file_upload(self):
        """Test file upload validation"""
        allowed_extensions = ["pdf", "doc", "docx"]
        max_size_mb = 10
        
        # Valid file
        result = validate_file_upload("document.pdf", 5 * 1024 * 1024, allowed_extensions, max_size_mb)
        assert result["is_valid"] == True
        assert result["file_extension"] == "pdf"
        assert result["file_size_mb"] == 5.0
        
        # Invalid extension
        result = validate_file_upload("document.txt", 5 * 1024 * 1024, allowed_extensions, max_size_mb)
        assert result["is_valid"] == False
        assert ".txt is not allowed" in result["errors"][0]
        
        # File too large
        result = validate_file_upload("document.pdf", 15 * 1024 * 1024, allowed_extensions, max_size_mb)
        assert result["is_valid"] == False
        assert "exceeds maximum allowed size" in result["errors"][0]
        
        # File close to limit (warning)
        result = validate_file_upload("document.pdf", 8 * 1024 * 1024, allowed_extensions, max_size_mb)
        assert result["is_valid"] == True
        assert len(result["warnings"]) > 0
        assert "close to the limit" in result["warnings"][0]
        
        # Filename too long
        long_filename = "a" * 256 + ".pdf"
        result = validate_file_upload(long_filename, 5 * 1024 * 1024, allowed_extensions, max_size_mb)
        assert result["is_valid"] == False
        assert "too long" in result["errors"][0]
        
        # Invalid characters in filename
        result = validate_file_upload("document<>.pdf", 5 * 1024 * 1024, allowed_extensions, max_size_mb)
        assert result["is_valid"] == False
        assert "invalid characters" in result["errors"][0]
    
    def test_validate_date_format(self):
        """Test date format validation"""
        # Valid dates
        result = validate_date_format("2023-12-25")
        assert result["is_valid"] == True
        assert result["format"] == "%Y-%m-%d"
        
        result = validate_date_format("25/12/2023", "%d/%m/%Y")
        assert result["is_valid"] == True
        assert result["format"] == "%d/%m/%Y"
        
        # Invalid dates
        result = validate_date_format("2023-13-45")
        assert result["is_valid"] == False
        assert "Invalid date format" in result["error"]
        
        result = validate_date_format("invalid-date")
        assert result["is_valid"] == False
        assert "Invalid date format" in result["error"]
    
    def test_validate_phone_number(self):
        """Test phone number validation"""
        # Valid Thai numbers
        result = validate_phone_number("0812345678")
        assert result["is_valid"] == True
        assert result["local_format"] == "0812345678"
        assert result["international_format"] == "+66812345678"
        assert result["country_code"] == "TH"
        
        result = validate_phone_number("+66812345678")
        assert result["is_valid"] == True
        assert result["local_format"] == "0812345678"
        assert result["international_format"] == "+66812345678"
        
        # Invalid Thai numbers
        result = validate_phone_number("123456789")
        assert result["is_valid"] == False
        assert "Invalid Thai phone number format" in result["error"]
        
        result = validate_phone_number("081234567")
        assert result["is_valid"] == False
        assert "Invalid Thai phone number format" in result["error"]
        
        # Generic validation for other countries
        result = validate_phone_number("1234567890", "US")
        assert result["is_valid"] == True
        assert result["country_code"] == "US"
        
        result = validate_phone_number("123", "US")
        assert result["is_valid"] == False
        assert "Invalid phone number length" in result["error"]
    
    def test_sanitize_input(self):
        """Test input sanitization"""
        # Normal input
        result = sanitize_input("Hello World")
        assert result["is_valid"] == True
        assert result["sanitized"] == "Hello World"
        assert result["length"] == 11
        assert result["truncated"] == False
        
        # Input with dangerous characters
        result = sanitize_input("Hello <script>alert('xss')</script>")
        assert result["is_valid"] == True
        assert "<script>" not in result["sanitized"]
        assert "alert" not in result["sanitized"]
        
        # Input with multiple spaces
        result = sanitize_input("  Multiple    Spaces  ")
        assert result["is_valid"] == True
        assert result["sanitized"] == "Multiple Spaces"
        
        # Input too long
        long_input = "a" * 2000
        result = sanitize_input(long_input, max_length=1000)
        assert result["is_valid"] == True
        assert result["truncated"] == True
        assert len(result["sanitized"]) == 1000
        
        # Non-string input
        result = sanitize_input(123)
        assert result["is_valid"] == False
        assert "must be a string" in result["error"]


if __name__ == "__main__":
    pytest.main([__file__])
