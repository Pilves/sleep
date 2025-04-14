# Server API Endpoints Needed for Frontend

This document outlines the API endpoints needed to be added or modified on the server to match the client-side code.

## Endpoints to Add

1. **User Management (Admin)**
   - `PUT /api/users/:userId/status` - Activate/deactivate a user
   - `POST /api/users/:userId/roles/admin` - Add admin role to a user
   - `DELETE /api/users/:userId/roles/admin` - Remove admin role from a user
   - `GET /api/users` - Get all users (with pagination, filtering by role and status) - Admin only

2. **Invitation Management**
   - `POST /api/invitations/:invitationId/resend` - Resend an invitation

## Endpoints to Confirm or Adjust

1. **Sleep Data**
   - Ensure `/api/sleep/data` supports the `days` query parameter for fetching recent sleep data

2. **Competitions**
   - Ensure `/api/competitions` supports the `status` query parameter (active, upcoming, completed)

## Client-Side API Calls Reference

### Dashboard Page
```javascript
// Fetch user's sleep data (recent 7 days)
const sleepResponse = await api.get('/sleep/data?days=7');
sleepData = sleepResponse.data;

// Fetch active competitions
const competitionsResponse = await api.get('/competitions?status=active');
competitions = competitionsResponse.data;
```

### Sleep History Page
```javascript
const days = range === '7days' ? 7 : range === '14days' ? 14 : range === '30days' ? 30 : 90;
const response = await api.get(`/sleep/data?days=${days}`);
sleepData = response.data;
```

### Profile Page
```javascript
await api.post('/users/oura/connect', { token: ouraToken });
```

### Admin Competitions Page
```javascript
const response = await api.get('/competitions');
competitions = response.data;

await api.post('/competitions', competitionData); // Create
await api.put(`/competitions/${editingCompetition.id}`, competitionData); // Update
await api.delete(`/competitions/${id}`); // Delete
```

### Admin Users Page
```javascript
const response = await api.get(`/users?${params.toString()}`);
users = response.data.users;
totalUsers = response.data.total;

await api.put(`/users/${userId}/status`, { status: !currentStatus });

if (isCurrentlyAdmin) {
    await api.delete(`/users/${userId}/roles/admin`);
} else {
    await api.post(`/users/${userId}/roles/admin`);
}
```

### Admin Invitations Page
```javascript
const response = await api.get(`/invitations?${params.toString()}`);
invitations = response.data;

await api.post('/invitations', { emails: emailList, expirationDays });
await api.post(`/invitations/${invitationId}/resend`);
await api.put(`/invitations/${invitationId}/revoke`);
```

### Leaderboard Page
```javascript
const competitionsResponse = await api.get('/competitions?status=active');
competitions = competitionsResponse.data;

const response = await api.get(`/competitions/${competitionId}/leaderboard`);
leaderboard = response.data.rankings || [];
```