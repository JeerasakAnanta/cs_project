# Use the official Python 3.11 image as the base image
FROM python:3.11.9-slim

# Set the working directory inside the container
WORKDIR /app

# copy 
COPY . .

# install requirements
RUN pip install --no-cache-dir  -r requirements.txt 

# Expose the necessary ports
EXPOSE 8003 

# For now, only run Uvicorn server
CMD ["uvicorn", "chatbot_api:app", "--host", "0.0.0.0", "--port", "8003", "--reload"]
