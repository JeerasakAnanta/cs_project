"""
Data validation utilities for LannaFinChat
"""
import re
import json
from typing import Any, Dict, List, Optional, Union
from datetime import datetime
import logging

logger = logging.getLogger(__name__)


def validate_email(email: str) -> bool:
    """Validate email format"""
    try:
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
    except Exception as e:
        logger.error(f"Email validation error: {str(e)}")
        return False


def validate_username(username: str) -> Dict[str, Any]:
    """Validate username format and requirements"""
    try:
        errors = []
        
        # Check length
        if len(username) < 3:
            errors.append("Username must be at least 3 characters long")
        if len(username) > 30:
            errors.append("Username must be no more than 30 characters long")
        
        # Check allowed characters
        if not re.match(r'^[a-zA-Z0-9_-]+$', username):
            errors.append("Username can only contain letters, numbers, underscores, and hyphens")
        
        # Check if starts with letter or number
        if not re.match(r'^[a-zA-Z0-9]', username):
            errors.append("Username must start with a letter or number")
        
        # Check if ends with letter or number
        if not re.match(r'[a-zA-Z0-9]$', username):
            errors.append("Username must end with a letter or number")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }
    except Exception as e:
        logger.error(f"Username validation error: {str(e)}")
        return {
            "is_valid": False,
            "errors": [f"Validation error: {str(e)}"]
        }


def validate_password(password: str) -> Dict[str, Any]:
    """Validate password strength"""
    try:
        errors = []
        warnings = []
        
        # Check length
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        elif len(password) < 12:
            warnings.append("Consider using a password longer than 12 characters")
        
        # Check for uppercase letters
        if not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
        
        # Check for lowercase letters
        if not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
        
        # Check for numbers
        if not re.search(r'\d', password):
            errors.append("Password must contain at least one number")
        
        # Check for special characters
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            warnings.append("Consider adding special characters for better security")
        
        # Check for common patterns
        if re.search(r'(.)\1{2,}', password):
            warnings.append("Avoid repeating characters more than twice")
        
        if re.search(r'(123|abc|qwe|password|admin)', password.lower()):
            errors.append("Avoid common password patterns")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "strength": "weak" if len(errors) > 0 else "medium" if len(warnings) > 2 else "strong"
        }
    except Exception as e:
        logger.error(f"Password validation error: {str(e)}")
        return {
            "is_valid": False,
            "errors": [f"Validation error: {str(e)}"],
            "warnings": [],
            "strength": "unknown"
        }


def validate_json_schema(data: Any, schema: Dict[str, Any]) -> Dict[str, Any]:
    """Validate data against JSON schema"""
    try:
        errors = []
        
        def validate_field(value: Any, field_schema: Dict[str, Any], field_path: str = ""):
            field_errors = []
            
            # Check required fields
            if field_schema.get("required", False) and value is None:
                field_errors.append(f"{field_path} is required")
                return field_errors
            
            # Check type
            expected_type = field_schema.get("type")
            if expected_type:
                if expected_type == "string" and not isinstance(value, str):
                    field_errors.append(f"{field_path} must be a string")
                elif expected_type == "integer" and not isinstance(value, int):
                    field_errors.append(f"{field_path} must be an integer")
                elif expected_type == "number" and not isinstance(value, (int, float)):
                    field_errors.append(f"{field_path} must be a number")
                elif expected_type == "boolean" and not isinstance(value, bool):
                    field_errors.append(f"{field_path} must be a boolean")
                elif expected_type == "array" and not isinstance(value, list):
                    field_errors.append(f"{field_path} must be an array")
                elif expected_type == "object" and not isinstance(value, dict):
                    field_errors.append(f"{field_path} must be an object")
            
            # Check string constraints
            if isinstance(value, str) and expected_type == "string":
                if "min_length" in field_schema and len(value) < field_schema["min_length"]:
                    field_errors.append(f"{field_path} must be at least {field_schema['min_length']} characters")
                if "max_length" in field_schema and len(value) > field_schema["max_length"]:
                    field_errors.append(f"{field_path} must be no more than {field_schema['max_length']} characters")
                if "pattern" in field_schema and not re.match(field_schema["pattern"], value):
                    field_errors.append(f"{field_path} does not match required pattern")
            
            # Check number constraints
            if isinstance(value, (int, float)) and expected_type in ["integer", "number"]:
                if "minimum" in field_schema and value < field_schema["minimum"]:
                    field_errors.append(f"{field_path} must be at least {field_schema['minimum']}")
                if "maximum" in field_schema and value > field_schema["maximum"]:
                    field_errors.append(f"{field_path} must be no more than {field_schema['maximum']}")
            
            # Check array constraints
            if isinstance(value, list) and expected_type == "array":
                if "min_items" in field_schema and len(value) < field_schema["min_items"]:
                    field_errors.append(f"{field_path} must have at least {field_schema['min_items']} items")
                if "max_items" in field_schema and len(value) > field_schema["max_items"]:
                    field_errors.append(f"{field_path} must have no more than {field_schema['max_items']} items")
                
                # Check array items if schema is provided
                if "items" in field_schema:
                    for i, item in enumerate(value):
                        item_errors = validate_field(item, field_schema["items"], f"{field_path}[{i}]")
                        field_errors.extend(item_errors)
            
            # Check object constraints
            if isinstance(value, dict) and expected_type == "object":
                if "properties" in field_schema:
                    for prop_name, prop_schema in field_schema["properties"].items():
                        if prop_name in value:
                            prop_errors = validate_field(
                                value[prop_name], 
                                prop_schema, 
                                f"{field_path}.{prop_name}"
                            )
                            field_errors.extend(prop_errors)
                        elif prop_schema.get("required", False):
                            field_errors.append(f"{field_path}.{prop_name} is required")
                
                # Check additional properties
                if not field_schema.get("additionalProperties", True):
                    allowed_props = set(field_schema.get("properties", {}).keys())
                    for prop_name in value.keys():
                        if prop_name not in allowed_props:
                            field_errors.append(f"{field_path}.{prop_name} is not allowed")
            
            return field_errors
        
        # Validate root level
        if "properties" in schema:
            for field_name, field_schema in schema["properties"].items():
                if field_name in data:
                    field_errors = validate_field(data[field_name], field_schema, field_name)
                    errors.extend(field_errors)
                elif field_schema.get("required", False):
                    errors.append(f"{field_name} is required")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors
        }
        
    except Exception as e:
        logger.error(f"JSON schema validation error: {str(e)}")
        return {
            "is_valid": False,
            "errors": [f"Schema validation error: {str(e)}"]
        }


def validate_file_upload(filename: str, file_size: int, allowed_extensions: List[str], max_size_mb: int) -> Dict[str, Any]:
    """Validate file upload"""
    try:
        errors = []
        warnings = []
        
        # Check file extension
        file_ext = filename.lower().split('.')[-1] if '.' in filename else ''
        if file_ext not in allowed_extensions:
            errors.append(f"File extension .{file_ext} is not allowed. Allowed: {', '.join(allowed_extensions)}")
        
        # Check file size
        max_size_bytes = max_size_mb * 1024 * 1024
        if file_size > max_size_bytes:
            errors.append(f"File size {file_size / (1024*1024):.2f} MB exceeds maximum allowed size {max_size_mb} MB")
        elif file_size > max_size_bytes * 0.8:
            warnings.append(f"File size is close to the limit ({file_size / (1024*1024):.2f} MB)")
        
        # Check filename length
        if len(filename) > 255:
            errors.append("Filename is too long (maximum 255 characters)")
        
        # Check for suspicious characters in filename
        if re.search(r'[<>:"/\\|?*]', filename):
            errors.append("Filename contains invalid characters")
        
        return {
            "is_valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "file_extension": file_ext,
            "file_size_mb": round(file_size / (1024*1024), 2)
        }
    except Exception as e:
        logger.error(f"File upload validation error: {str(e)}")
        return {
            "is_valid": False,
            "errors": [f"Validation error: {str(e)}"],
            "warnings": []
        }


def validate_date_format(date_string: str, format_string: str = "%Y-%m-%d") -> Dict[str, Any]:
    """Validate date format"""
    try:
        parsed_date = datetime.strptime(date_string, format_string)
        return {
            "is_valid": True,
            "parsed_date": parsed_date.isoformat(),
            "format": format_string
        }
    except ValueError as e:
        return {
            "is_valid": False,
            "error": f"Invalid date format. Expected: {format_string}",
            "input": date_string
        }
    except Exception as e:
        logger.error(f"Date validation error: {str(e)}")
        return {
            "is_valid": False,
            "error": f"Validation error: {str(e)}"
        }


def validate_phone_number(phone: str, country_code: str = "TH") -> Dict[str, Any]:
    """Validate phone number format"""
    try:
        # Remove all non-digit characters
        digits_only = re.sub(r'\D', '', phone)
        
        if country_code == "TH":
            # Thai phone number validation
            if len(digits_only) == 10 and digits_only.startswith('0'):
                # Remove leading 0 and add +66
                international = "+66" + digits_only[1:]
                return {
                    "is_valid": True,
                    "local_format": phone,
                    "international_format": international,
                    "country_code": "TH"
                }
            elif len(digits_only) == 11 and digits_only.startswith('66'):
                # Already international format
                return {
                    "is_valid": True,
                    "local_format": "0" + digits_only[2:],
                    "international_format": "+" + digits_only,
                    "country_code": "TH"
                }
            else:
                return {
                    "is_valid": False,
                    "error": "Invalid Thai phone number format. Expected: 0XXXXXXXXX or +66XXXXXXXXX"
                }
        else:
            # Generic validation for other countries
            if len(digits_only) >= 7 and len(digits_only) <= 15:
                return {
                    "is_valid": True,
                    "local_format": phone,
                    "international_format": "+" + digits_only,
                    "country_code": country_code
                }
            else:
                return {
                    "is_valid": False,
                    "error": "Invalid phone number length"
                }
                
    except Exception as e:
        logger.error(f"Phone number validation error: {str(e)}")
        return {
            "is_valid": False,
            "error": f"Validation error: {str(e)}"
        }


def sanitize_input(input_string: str, max_length: int = 1000) -> Dict[str, Any]:
    """Sanitize user input to prevent injection attacks"""
    try:
        if not isinstance(input_string, str):
            return {
                "is_valid": False,
                "error": "Input must be a string"
            }
        
        # Truncate if too long
        if len(input_string) > max_length:
            input_string = input_string[:max_length]
        
        # Remove potentially dangerous characters
        sanitized = re.sub(r'[<>"\']', '', input_string)
        
        # Remove multiple spaces
        sanitized = re.sub(r'\s+', ' ', sanitized)
        
        # Remove leading/trailing whitespace
        sanitized = sanitized.strip()
        
        return {
            "is_valid": True,
            "original": input_string,
            "sanitized": sanitized,
            "length": len(sanitized),
            "truncated": len(input_string) > max_length
        }
        
    except Exception as e:
        logger.error(f"Input sanitization error: {str(e)}")
        return {
            "is_valid": False,
            "error": f"Sanitization error: {str(e)}"
        }
