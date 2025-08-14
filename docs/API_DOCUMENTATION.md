# API Documentation

## Authentication Endpoints

### POST /api/auth/login
Login user with email and password.

**Request Body:**
\`\`\`json
{
  "email": "string",
  "password": "string"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "admin|lecturer|student"
  }
}
\`\`\`

## User Management Endpoints

### GET /api/users
Get all users (Admin only).

### POST /api/users
Create new user (Admin only).

### PUT /api/users/:id
Update user (Admin only).

### DELETE /api/users/:id
Delete user (Admin only).

## Results Endpoints

### GET /api/results
Get results (filtered by user role).

### POST /api/results
Upload new results (Admin/Lecturer only).

### POST /api/results/bulk
Bulk upload results via CSV (Admin/Lecturer only).

## Feedback Endpoints

### GET /api/feedback
Get feedback data (filtered by user role).

### POST /api/feedback
Submit new feedback (Student only).

### GET /api/feedback/analytics
Get feedback analytics (Lecturer/Admin only).

## Courses Endpoints

### GET /api/courses
Get all courses.

### POST /api/courses
Create new course (Admin only).

### PUT /api/courses/:id
Update course (Admin only).

### DELETE /api/courses/:id
Delete course (Admin only).
