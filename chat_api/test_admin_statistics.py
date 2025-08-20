#!/usr/bin/env python3
"""
Test script for Admin Statistics API endpoints
This script tests the new admin statistics functionality
"""

import requests
import json
import time
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
ADMIN_TOKEN = None  # Set this after getting admin token

def get_admin_token():
    """Get admin token for authentication"""
    global ADMIN_TOKEN
    
    # You need to set this manually after logging in as admin
    # or implement login logic here
    print("Please set ADMIN_TOKEN variable with a valid admin JWT token")
    print("You can get this by logging in as admin user through the login endpoint")
    
    # Example of how to get token (uncomment and modify as needed):
    """
    login_data = {
        "username": "admin_username",
        "password": "admin_password"
    }
    
    response = requests.post(f"{BASE_URL}/login/", data=login_data)
    if response.status_code == 200:
        ADMIN_TOKEN = response.json()["access_token"]
        print(f"Admin token obtained: {ADMIN_TOKEN[:20]}...")
    else:
        print(f"Failed to get admin token: {response.status_code}")
        print(response.text)
    """

def test_system_statistics():
    """Test the main system statistics endpoint"""
    print("\n=== Testing System Statistics ===")
    
    if not ADMIN_TOKEN:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    try:
        response = requests.get(f"{BASE_URL}/admin/statistics/", headers=headers)
        
        if response.status_code == 200:
            stats = response.json()
            print("✅ System statistics retrieved successfully")
            print(f"📊 Total Users: {stats['users']['total']}")
            print(f"💬 Total Conversations: {stats['conversations']['total_all']}")
            print(f"💭 Total Messages: {stats['messages']['total_all']}")
            print(f"👍 Total Feedbacks: {stats['feedbacks']['total']}")
            print(f"🖥️  Unique Machines: {stats['system']['unique_machines']}")
            return True
        else:
            print(f"❌ Failed to get system statistics: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error testing system statistics: {str(e)}")
        return False

def test_user_statistics():
    """Test the user statistics endpoint"""
    print("\n=== Testing User Statistics ===")
    
    if not ADMIN_TOKEN:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    try:
        response = requests.get(f"{BASE_URL}/admin/statistics/users/", headers=headers)
        
        if response.status_code == 200:
            stats = response.json()
            print("✅ User statistics retrieved successfully")
            print(f"👥 Total Users: {stats['total_users']}")
            print(f"✅ Active Users: {stats['active_users']}")
            print(f"❌ Inactive Users: {stats['inactive_users']}")
            print(f"🎭 Role Distribution: {stats['role_distribution']}")
            
            if stats['top_users_by_conversations']:
                print("🏆 Top Users by Conversations:")
                for user in stats['top_users_by_conversations'][:3]:
                    print(f"  - {user['username']}: {user['conversation_count']} conversations")
            
            return True
        else:
            print(f"❌ Failed to get user statistics: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error testing user statistics: {str(e)}")
        return False

def test_conversation_statistics():
    """Test the conversation statistics endpoint"""
    print("\n=== Testing Conversation Statistics ===")
    
    if not ADMIN_TOKEN:
        print("❌ No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {ADMIN_TOKEN}"}
    
    try:
        response = requests.get(f"{BASE_URL}/admin/statistics/conversations/", headers=headers)
        
        if response.status_code == 200:
            stats = response.json()
            print("✅ Conversation statistics retrieved successfully")
            print(f"💬 Total Registered Conversations: {stats['total_registered']}")
            print(f"👤 Total Guest Conversations: {stats['total_guest']}")
            print(f"📈 Total All Conversations: {stats['total_all']}")
            print(f"📅 Recent 30 Days: {stats['recent_30_days']['total']}")
            
            if stats['daily_stats_last_7_days']:
                print("📊 Daily Stats (Last 7 Days):")
                for day in stats['daily_stats_last_7_days'][:3]:
                    print(f"  - {day['date']}: {day['total']} conversations")
            
            return True
        else:
            print(f"❌ Failed to get conversation statistics: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error testing conversation statistics: {str(e)}")
        return False

def test_unauthorized_access():
    """Test that non-admin users cannot access statistics"""
    print("\n=== Testing Unauthorized Access ===")
    
    try:
        # Test without token
        response = requests.get(f"{BASE_URL}/admin/statistics/")
        if response.status_code == 401:
            print("✅ Unauthorized access properly blocked (no token)")
        else:
            print(f"❌ Unexpected response without token: {response.status_code}")
        
        # Test with invalid token
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{BASE_URL}/admin/statistics/", headers=headers)
        if response.status_code == 401:
            print("✅ Unauthorized access properly blocked (invalid token)")
        else:
            print(f"❌ Unexpected response with invalid token: {response.status_code}")
            
        return True
        
    except Exception as e:
        print(f"❌ Error testing unauthorized access: {str(e)}")
        return False

def run_all_tests():
    """Run all test functions"""
    print("🚀 Starting Admin Statistics API Tests")
    print(f"📍 Base URL: {BASE_URL}")
    print(f"⏰ Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Get admin token first
    get_admin_token()
    
    # Run tests
    tests = [
        test_unauthorized_access,
        test_system_statistics,
        test_user_statistics,
        test_conversation_statistics,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
            time.sleep(0.5)  # Small delay between tests
        except Exception as e:
            print(f"❌ Test {test.__name__} failed with exception: {str(e)}")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Admin Statistics API is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the implementation.")

if __name__ == "__main__":
    run_all_tests()
