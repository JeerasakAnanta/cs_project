# Admin Statistics API Documentation

## Overview
This document describes the admin statistics API endpoints that provide comprehensive system statistics for administrators.

## Authentication
All endpoints require admin authentication. Use the `is_admin` dependency to ensure only admin users can access these endpoints.

## Endpoints

### 1. Get System Statistics
**GET** `/admin/statistics/`

Returns comprehensive system statistics including user counts, conversation counts, message counts, and feedback statistics.

#### Response
```json
{
  "users": {
    "total": 150,
    "active": 142,
    "inactive": 8,
    "role_distribution": {
      "user": 140,
      "admin": 10
    }
  },
  "conversations": {
    "total_registered": 1250,
    "total_guest": 890,
    "total_all": 2140,
    "recent_registered": 45,
    "recent_guest": 32,
    "recent_total": 77
  },
  "messages": {
    "total_registered": 15600,
    "total_guest": 11200,
    "total_all": 26800,
    "user_messages_registered": 7800,
    "bot_messages_registered": 7800,
    "user_messages_guest": 5600,
    "bot_messages_guest": 5600,
    "recent_registered": 540,
    "recent_guest": 384,
    "recent_total": 924
  },
  "feedbacks": {
    "total": 1250,
    "likes": 1100,
    "dislikes": 150,
    "satisfaction_rate": 88.0
  },
  "system": {
    "unique_machines": 45,
    "last_updated": "2024-01-15T10:30:00"
  }
}
```

### 2. Get User Statistics
**GET** `/admin/statistics/users/`

Returns detailed user statistics including role distribution and top users by conversation count.

#### Response
```json
{
  "total_users": 150,
  "active_users": 142,
  "inactive_users": 8,
  "role_distribution": {
    "user": 140,
    "admin": 10
  },
  "top_users_by_conversations": [
    {
      "username": "john_doe",
      "conversation_count": 25
    },
    {
      "username": "jane_smith",
      "conversation_count": 18
    }
  ]
}
```

### 3. Get Conversation Statistics
**GET** `/admin/statistics/conversations/`

Returns detailed conversation statistics including daily breakdowns and recent activity.

#### Response
```json
{
  "total_registered": 1250,
  "total_guest": 890,
  "total_all": 2140,
  "recent_30_days": {
    "registered": 180,
    "guest": 120,
    "total": 300
  },
  "daily_stats_last_7_days": [
    {
      "date": "2024-01-15",
      "registered": 8,
      "guest": 5,
      "total": 13
    },
    {
      "date": "2024-01-14",
      "registered": 12,
      "guest": 8,
      "total": 20
    }
  ]
}
```

## Data Sources

### Users
- **Registered Users**: Users who have created accounts
- **Active Users**: Users with `is_active = True`
- **Inactive Users**: Users with `is_active = False`
- **Role Distribution**: Breakdown by user roles (user, admin, etc.)

### Conversations
- **Registered Conversations**: Conversations created by registered users
- **Guest Conversations**: Conversations created by anonymous/guest users
- **Machine Separation**: Tracks unique devices for guest conversations

### Messages
- **User Messages**: Messages sent by users
- **Bot Messages**: Messages sent by the AI system
- **Recent Activity**: Messages from the last 7 days

### Feedbacks
- **Likes**: Positive feedback from users
- **Dislikes**: Negative feedback from users
- **Satisfaction Rate**: Percentage of positive feedback

## Usage Examples

### Frontend Dashboard
```javascript
// Fetch system statistics
const response = await fetch('/admin/statistics/', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const stats = await response.json();

// Display user count
document.getElementById('total-users').textContent = stats.users.total;

// Display conversation count
document.getElementById('total-conversations').textContent = stats.conversations.total_all;
```

### Monitoring Scripts
```python
import requests

def get_system_stats(admin_token):
    headers = {'Authorization': f'Bearer {admin_token}'}
    response = requests.get('http://localhost:8000/admin/statistics/', headers=headers)
    return response.json()

# Monitor system health
stats = get_system_stats(admin_token)
if stats['users']['total'] > 1000:
    print("High user count detected!")
```

## Error Handling

All endpoints return appropriate HTTP status codes:

- **200**: Success
- **401**: Unauthorized (not admin)
- **500**: Internal server error

Error responses include detailed error messages:
```json
{
  "detail": "Error retrieving system statistics: Database connection failed"
}
```

## Performance Considerations

- Statistics are calculated in real-time from the database
- Consider implementing caching for frequently accessed statistics
- Large datasets may require pagination or time-based filtering
- Database indexes on timestamp fields improve query performance

## Security Notes

- Only admin users can access these endpoints
- Statistics may contain sensitive information about system usage
- Consider implementing rate limiting for these endpoints
- Log all admin statistics access for audit purposes
