import os
import logging
import subprocess
import requests
from pathlib import Path
from dotenv import load_dotenv
from jose import jwt
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
import datetime

from app.utils.config import DB_USER, DB_PASSWORD, DB_HOST, DB_NAME


def check_env():
    print("🔍 Checking .env file...")
    env_path = Path(".") / ".env"
    if not env_path.exists():
        return "❌ .env file not found"
    load_dotenv()
    required_keys = ["OPENAI_API_KEY"]
    missing = [key for key in required_keys if not os.getenv(key)]
    return "✅ .env loaded correctly" if not missing else f"❌ Missing keys: {missing}"


def check_docker_running():
    print("🐳 Checking Docker container...")
    try:
        result = subprocess.run(["docker", "ps"], capture_output=True, text=True)
        if result.returncode == 0:
            return "✅ Docker running successfully"
        else:
            return f"❌ Docker not running: {result.stderr}"
    except Exception as e:
        return f"❌ Docker not available: {str(e)}"


def check_jwt():
    print("🔐 Checking JWT Token...")
    try:
        secret = os.getenv("SECRET_KEY", "dummysecret")
        data = {
            "sub": "testuser",
            "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=5),
        }
        token = jwt.encode(data, secret, algorithm="HS256")
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
        return "✅ JWT token encode/decode successful"
    except Exception as e:
        return f"❌ JWT error: {str(e)}"


def check_database():
    print("🗄️ Checking database connection...")
    try:
        url = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}"

        engine = create_engine(url)
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return "✅ Database connected successfully"
    except OperationalError as oe:
        return f"❌ Database connection failed: {str(oe)}"
    except Exception as e:
        return f"❌ DB error: {str(e)}"


def check_healthz():
    print("🌐 Checking /healthz API...")
    try:
        url = "http://localhost:8000/healthz"
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            return "✅ /healthz is OK"
        return f"❌ /healthz returned {response.status_code}"
    except Exception as e:
        return f"❌ Failed to connect to /healthz: {str(e)}"


def run_all_checks():
    """Run all startup checks"""
    results = {
        "env": check_env(),
        "docker": check_docker_running(),
        "jwt": check_jwt(),
        "database": check_database(),
        "healthz": check_healthz(),
    }
    print("\n📋 Summary:")
    for key, value in results.items():
        print(f"- {key}: {value}")
    return results
