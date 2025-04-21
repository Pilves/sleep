# Sleep Olympics Backend API Endpoints

This document provides an overview of all API endpoints available for the Sleep Olympics frontend application.

## Authentication

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/auth/register` | POST | Register a new user with invitation code | No |
| `/api/auth/login` | POST | Login with email/password | No |
| `/api/auth/refresh` | POST | Refresh authentication token | Yes |
| `/api/auth/reset-password` | POST | Request password reset | No |
| `/api/auth/me` | GET | Get current user profile | Yes |

## User Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/users/profile` | GET | Get current user profile | Yes |
| `/api/users/profile` | PUT | Update user profile | Yes |
| `/api/users/notifications/preferences` | PUT | Update notification preferences | Yes |

## Sleep Data

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/sleep/daily/:date` | GET | Get sleep data for specific date | Yes |
| `/api/sleep/range` | GET | Get sleep data for date range | Yes |
| `/api/sleep/summary` | GET | Get sleep summary statistics | Yes |
| `/api/sleep/daily/:date/notes` | POST | Add notes to sleep data | Yes |
| `/api/sleep/oura/connect` | POST | Connect Oura Ring account | Yes |
| `/api/sleep/oura/sync` | POST | Manually trigger Oura data sync | Yes |
| `/api/sleep/oura/disconnect` | POST | Disconnect Oura Ring account | Yes |

## Competitions

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/competitions` | GET | Get all competitions (filter by status with ?status=) | Yes |
| `/api/competitions/:competitionId` | GET | Get a specific competition | Yes |
| `/api/competitions/:competitionId/join` | POST | Join a competition | Yes |
| `/api/competitions/:competitionId/leave` | POST | Leave a competition | Yes |
| `/api/competitions/:competitionId/leaderboard` | GET | Get competition leaderboard | Yes |
| `/api/competitions/user/me` | GET | Get user's competitions | Yes |
| `/api/competitions/:competitionId/status` | PATCH | Update competition status (participants only) | Yes |

## Admin-Only Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/competitions` | POST | Create a new competition | Yes (Admin) |
| `/api/competitions/:competitionId` | PUT | Update competition details | Yes (Admin) |
| `/api/competitions/:competitionId/winners` | PUT | Update competition winners | Yes (Admin) |
| `/api/invitations` | POST | Create new invitation code | Yes (Admin) |
| `/api/invitations` | GET | List all invitation codes | Yes (Admin) |

## Notifications

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/api/notifications` | GET | Get user notifications | Yes |
| `/api/notifications/:notificationId/read` | PUT | Mark notification as read | Yes |
| `/api/notifications/read-all` | PUT | Mark all notifications as read | Yes |

## Request/Response Format

### Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <firebase_token>
```

### Error Responses

Error responses follow this format:

```json
{
  "error": "Brief error message",
  "message": "Detailed error description",
  "requestId": "unique-request-id"
}
```

### Competition Status Values

When working with competition status, both lowercase and uppercase forms are accepted:

- From frontend: `upcoming`, `active`, `completed`
- Internal representation: `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED`

The dedicated status update endpoint for participants:
```
PATCH /api/competitions/:competitionId/status
Body: { "status": "active" }
```

### Date Formats

Dates must be in ISO format (`YYYY-MM-DD`) when used in API requests.