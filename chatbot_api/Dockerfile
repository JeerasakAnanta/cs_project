# Use the official Python image from the Docker Hub
FROM python:3.12-slim

# Set the working directory in the container
WORKDIR /app

# Copy only the files that are needed to install dependencies
COPY pyproject.toml ./

# Install Poetry
RUN pip install poetry

# Disable virtualenv creation
RUN poetry config virtualenvs.create false 

# Install dependencies
RUN  poetry install --no-root --without dev  # Disable virtualenv creation

# Copy the entire application code to the working directory
COPY . .

# Expose the port FastAPI will run on
EXPOSE 8003

# Command to run the application using uvicorn
CMD ["poetry", "run", "uvicorn", "chatbot_api:app", "--host", "0.0.0.0", "--port", "8003"]

