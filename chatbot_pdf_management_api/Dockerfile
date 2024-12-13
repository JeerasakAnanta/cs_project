# Use the official Python 3.12.3 image as the base image
FROM python:3.12.3-alpine

# Set the working directory inside the container
WORKDIR /app

# Install Poetry
RUN pip install poetry==1.8.4

# Copy the chatbot base API  
COPY ./pdf_management_api.py ./

# Copy pyproject.toml from parent directory
COPY ./pyproject.toml .


# Install requirements with Poetry
RUN poetry config virtualenvs.create false && poetry install --no-root --without dev  # Disable virtualenv creation

EXPOSE 8004

# run the command to start uWSGI
CMD ["uvicorn", "pdf_management_api:app", "--host", "0.0.0.0", "--port", "8004"]
