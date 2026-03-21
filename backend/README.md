# Backend - Internship Monitoring System

MERN Stack Backend built with Express.js and MongoDB

## Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm

### Installation

```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/internship_tracker
# JWT_SECRET=your_secret_key

# Start development server
npm run dev
```

Server runs on `http://localhost:5000`

## Project Structure

```
backend/
├── models/          # MongoDB Mongoose models
│   ├── User.js
│   ├── Internship.js
│   └── Report.js
├── controllers/     # Business logic
│   ├── authController.js
│   ├── studentController.js
│   └── adminController.js
├── routes/          # API endpoints
│   ├── auth.js
│   ├── student.js
│   └── admin.js
├── middleware/      # Express middleware
│   ├── auth.js      # JWT verification
│   └── errorHandler.js
├── config/          # Configuration
│   └── multer.js    # File upload config
├── uploads/         # Uploaded files
├── server.js        # Entry point
├── package.json
├── .env.example
└── .gitignore
```

## API Documentation

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student",
  "department": "Computer Science",
  "semester": 6
}

Response: { token, user }
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: { token, user }
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}

Response: { user }
```

### Student Endpoints

All require `Authorization: Bearer {token}` header

#### Add Internship
```
POST /api/student/internships
{
  "companyName": "Google",
  "position": "Software Engineer Intern",
  "startDate": "2026-06-01",
  "endDate": "2026-08-31",
  "location": "Mountain View, CA",
  "description": "Working on backend services",
  "mentorName": "John Smith",
  "mentorEmail": "john@google.com"
}
```

#### Get Internships
```
GET /api/student/internships
```

#### Submit Report
```
POST /api/student/reports
Content-Type: multipart/form-data

{
  "internshipId": "...",
  "weekNumber": 1,
  "title": "Week 1 Progress",
  "description": "Completed onboarding...",
  "tasksCompleted": "Setup, meetings",
  "learningsGained": "Learned about codebase",
  "hoursWorked": 40,
  "file": [FILE]
}
```

#### Get Reports
```
GET /api/student/reports
```

### Admin Endpoints

All require `Authorization: Bearer {token}` header and admin role

#### Dashboard Stats
```
GET /api/admin/dashboard/stats

Response: {
  totalStudents: 10,
  totalInternships: 15,
  pendingInternships: 3,
  approvedInternships: 10,
  totalReports: 25
}
```

#### Get All Students
```
GET /api/admin/students
```

#### Get All Internships
```
GET /api/admin/internships
```

#### Approve Internship
```
POST /api/admin/internships/:id/approve
{
  "feedback": "Looks great! Approved."
}
```

#### Reject Internship
```
POST /api/admin/internships/:id/reject
{
  "feedback": "Need more details about the role"
}
```

#### Get All Reports
```
GET /api/admin/reports
```

#### Give Feedback on Report
```
POST /api/admin/reports/:id/feedback
{
  "feedback": "Great work this week!"
}
```

## Middleware

### Authentication Middleware
- Verifies JWT token
- Extracts user info
- Attaches to `req.user`

### Authorization Middleware
- Checks user role
- Prevents unauthorized access

### Error Handler
- Catches all errors
- Returns proper HTTP status codes
- Handles validation errors

## Configuration Files

### .env
```env
MONGODB_URI=mongodb://localhost:27017/internship_tracker
JWT_SECRET=your_jwt_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Multer Config
- Max file size: 10MB
- Allowed types: PDF, DOC, DOCX, JPG, PNG, GIF
- Storage: `backend/uploads/`

## Error Handling

The API returns proper error responses:

```json
{
  "error": "Error message",
  "details": ["Specific error details if applicable"]
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Server Error

## Testing

### Using Postman
1. Import API endpoints
2. Set `Authorization: Bearer {token}` header
3. Test endpoints

### Using cURL
```bash
# Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }'

# Get internships
curl -X GET http://localhost:5000/api/student/internships \
  -H "Authorization: Bearer {token}"
```

## Database Commands

### MongoDB Shell
```javascript
// Connect to MongoDB
mongosh

// Use database
use internship_tracker

// View collections
show collections

// View users
db.users.find()

// View internships
db.internships.find()

// View reports
db.reports.find()
```

## Deployment

### Docker (Optional)
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### Environment Variables for Production
- Use strong JWT_SECRET
- Set NODE_ENV=production
- Use MongoDB Atlas connection string
- Update CORS_ORIGIN to your frontend domain

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED
```
Solution: Start MongoDB service or verify connection string

### Port Already in Use
```
Error: listen EADDRINUSE
```
Solution: Change PORT in .env or kill process using port 5000

### JWT Invalid
```
Error: Invalid token
```
Solution: Login again to get new token, check JWT_SECRET

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
Solution: Check CORS_ORIGIN in .env matches frontend URL

## Development Best Practices

1. **Authentication**: Always use Bearer token in headers
2. **Validation**: All inputs are validated at API level
3. **Error Handling**: Try-catch blocks in all routes
4. **Security**: Passwords hashed with bcrypt
5. **Logging**: Console logs for debugging

## Performance Tips

1. Use MongoDB indexes on frequently queried fields
2. Implement pagination for large datasets
3. Cache dashboard stats
4. Optimize file uploads with size limits

## Future Enhancements

- [ ] Email notifications
- [ ] Real-time updates with Socket.io
- [ ] Advanced analytics
- [ ] File preview functionality
- [ ] Bulk operations
- [ ] API rate limiting

---

**Status**: Production Ready
**Last Updated**: March 21, 2026
