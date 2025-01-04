# Use the official Python 3.12.3 image as the base image
FROM python:3.12.3-alpine

# Set the working directory inside the container
WORKDIR /app

# Update pip
RUN pip install --upgrade pip

# Install Poetry
RUN pip install poetry==1.8.4

# Copy the application code and dependencies configuration
COPY chatbot_api.py ./chatbot_api.py
COPY pyproject.toml ./pyproject.toml

# Install requirements with Poetry and disable virtualenv creation
RUN poetry config virtualenvs.create false && poetry install --no-root --no-dev

# Expose the necessary port
EXPOSE 8003

# Command to run the application
CMD ["uvicorn", "chatbot_api:app", "--host", "127.0.0.1", "--port", "8003"]
