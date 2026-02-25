#!/usr/bin/env python3
"""
Database migration script to add TokenBlacklist table
"""

from sqlalchemy import text
from app.utils.database import engine


def add_token_blacklist_table():
    """Add token_blacklist table to database"""
    sql = """
    CREATE TABLE IF NOT EXISTS token_blacklist (
        id SERIAL PRIMARY KEY,
        token_jti VARCHAR(255) UNIQUE NOT NULL,
        token_type VARCHAR(50) DEFAULT 'access',
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        blacklisted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        user_id INTEGER REFERENCES users(id),
        INDEX idx_token_jti (token_jti)
    );
    """

    try:
        with engine.connect() as conn:
            conn.execute(text(sql))
            conn.commit()
        print("TokenBlacklist table created successfully")
    except Exception as e:
        print(f"Error creating TokenBlacklist table: {e}")


if __name__ == "__main__":
    add_token_blacklist_table()
