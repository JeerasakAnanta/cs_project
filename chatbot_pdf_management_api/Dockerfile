# Use the official Qdrant image as the base

FROM python:3.11-slim 

# Set the working directory
WORKDIR /app

# update pip
RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8004

# COPY create_vecter_db.py .
COPY . . 

# run the command to start uWSGI
CMD ["uvicorn", "pdf_management_api:app", "--host", "0.0.0.0", "--port", "8004"]
