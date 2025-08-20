"""
Pytest configuration and fixtures
"""
import pytest
import asyncio
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database.database import get_db
from app.database.models import Base


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
def test_engine():
    """Create test database engine."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    return engine


@pytest.fixture(scope="function")
def test_db(test_engine):
    """Create test database session."""
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def client(test_db):
    """Create test client with database dependency override."""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def mock_current_user():
    """Mock current user for authentication."""
    return {
        "id": 1,
        "email": "test@example.com",
        "username": "testuser",
        "is_admin": True,
        "role": "admin"
    }


@pytest.fixture
def mock_regular_user():
    """Mock regular user for authentication."""
    return {
        "id": 2,
        "email": "user@example.com",
        "username": "regularuser",
        "is_admin": False,
        "role": "user"
    }


@pytest.fixture
def sample_user_data():
    """Sample user data for testing."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "password": "TestPass123!",
        "role": "user",
        "is_active": True
    }


@pytest.fixture
def sample_conversation_data():
    """Sample conversation data for testing."""
    return {
        "title": "Test Conversation",
        "user_id": 1,
        "machine_id": "test-machine-001"
    }


@pytest.fixture
def sample_message_data():
    """Sample message data for testing."""
    return {
        "content": "Hello, this is a test message",
        "role": "user",
        "conversation_id": 1
    }


@pytest.fixture
def sample_document_data():
    """Sample document data for testing."""
    return {
        "filename": "test_document.pdf",
        "file_path": "/uploads/test_document.pdf",
        "file_size": 1024 * 1024,  # 1MB
        "user_id": 1
    }


@pytest.fixture
def sample_feedback_data():
    """Sample feedback data for testing."""
    return {
        "feedback_type": "general",
        "feedback_text": "This is a test feedback",
        "rating": 5,
        "category": "chat",
        "priority": "medium",
        "user_id": 1
    }


@pytest.fixture
def mock_file_upload():
    """Mock file upload for testing."""
    return {
        "filename": "test.pdf",
        "content_type": "application/pdf",
        "size": 1024 * 1024  # 1MB
    }


@pytest.fixture
def mock_system_metrics():
    """Mock system metrics for testing."""
    return {
        "cpu_percent": 25.0,
        "memory_percent": 60.0,
        "disk_percent": 45.0,
        "platform": "Linux-5.15.0-x86_64",
        "python_version": "3.9.0"
    }


@pytest.fixture
def mock_validation_schema():
    """Mock validation schema for testing."""
    return {
        "properties": {
            "name": {"type": "string", "required": True, "min_length": 2, "max_length": 50},
            "age": {"type": "integer", "minimum": 0, "maximum": 150},
            "email": {"type": "string", "pattern": r"^[^@]+@[^@]+\.[^@]+$"}
        }
    }


@pytest.fixture
def mock_error_context():
    """Mock error context for testing."""
    return {
        "user_id": 1,
        "action": "test_operation",
        "timestamp": "2023-01-01T00:00:00",
        "request_id": "test-request-123"
    }


# Database fixtures for integration tests
@pytest.fixture(scope="function")
def clean_database(test_engine):
    """Clean database before each test."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield test_engine


# Authentication fixtures
@pytest.fixture
def mock_jwt_token():
    """Mock JWT token for testing."""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNTE2MjM5MDIyfQ.test_signature"


@pytest.fixture
def mock_auth_headers(mock_jwt_token):
    """Mock authorization headers for testing."""
    return {"Authorization": f"Bearer {mock_jwt_token}"}


# Performance testing fixtures
@pytest.fixture
def performance_test_data():
    """Data for performance testing."""
    return {
        "large_text": "A" * 10000,  # 10KB text
        "many_items": list(range(1000)),  # 1000 items
        "nested_data": {
            "level1": {
                "level2": {
                    "level3": {
                        "data": [i for i in range(100)]
                    }
                }
            }
        }
    }


# Cleanup fixtures
@pytest.fixture(autouse=True)
def cleanup_test_files():
    """Clean up test files after each test."""
    yield
    # Cleanup code here if needed
    pass


# Mark tests by type
def pytest_configure(config):
    """Configure pytest markers."""
    config.addinivalue_line("markers", "slow: marks tests as slow")
    config.addinivalue_line("markers", "integration: marks tests as integration tests")
    config.addinivalue_line("markers", "unit: marks tests as unit tests")
