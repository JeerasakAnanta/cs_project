# Use the official Python 3.12.3 image as the base image
FROM python:3.12.3-alpine

# Set the working directory inside the container
WORKDIR /app

# Install Poetry
RUN pip install poetry==1.8.4

# Copy the chatbot base API  
COPY ./chatbot_api.py ./

# Copy pyproject.toml from parent directory
COPY ./pyproject.toml .

# Install requirements with Poetry
RUN poetry config virtualenvs.create false && poetry install --no-root --without dev  # Disable virtualenv creation

# Expose the necessary ports
EXPOSE 8003

# For now, only run Uvicorn server
CMD ["sh", "-c", "uvicorn chatbot_api:app --host 0.0.0.0 --port 8003 --reload"]  