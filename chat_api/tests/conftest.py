"""
Test configuration and fixtures.
"""
import pytest
import os
from unittest.mock import patch


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Set up test environment variables."""
    with patch.dict(os.environ, {
        "DATABASE_URL": "sqlite:///./test.db",
        "OPENAI_API_KEY": "test-key",
        "SECRET_KEY": "test-secret-key",
        "ENVIRONMENT": "test"
    }):
        yield


@pytest.fixture
def mock_openai():
    """Mock OpenAI API calls."""
    with patch("openai.OpenAI") as mock:
        mock_instance = mock.return_value
        mock_instance.chat.completions.create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="Test response"))]
        )
        yield mock_instance


@pytest.fixture
def mock_qdrant():
    """Mock Qdrant client."""
    with patch("qdrant_client.QdrantClient") as mock:
        mock_instance = mock.return_value
        mock_instance.search.return_value = [
            MagicMock(payload={"content": "Test document content"})
        ]
        yield mock_instance
