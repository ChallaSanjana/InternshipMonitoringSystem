# Internship Monitoring System - MERN Stack

A comprehensive full-stack application for managing student internships with role-based access control. Built with **MongoDB, Express, React, and Node.js**.

![Status](https://img.shields.io/badge/Status-Ready%20for%20Development-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Stack](https://img.shields.io/badge/Stack-MERN-brightgreen)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Documentation](#documentation)
- [Deployment](#deployment)

## ✨ Features

### Student Features
- ✅ **Add & Manage Internships** - Create and update internship details
- ✅ **Submit Progress Reports** - Weekly reports with file attachments
- ✅ **Track Status** - Monitor internship approval and feedback
- ✅ **File Upload** - Attach documents (PDF, DOC, images)
- ✅ **View Feedback** - See admin comments and suggestions

### Admin Features
- ✅ **Dashboard** - Real-time statistics and overview
- ✅ **Approve/Reject** - Review and manage internship applications
- ✅ **Student Management** - View all registered students
- ✅ **Report Review** - Evaluate progress reports
- ✅ **Feedback System** - Provide constructive feedback

### Security
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Password Hashing** - Bcrypt encrypted passwords
- ✅ **Role-Based Access** - Admin and student roles
- ✅ **CORS Protection** - Cross-origin request handling

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI components and state management
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icons
- **Vite** - Lightning-fast build tool

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM with validation
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/internship_tracker
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

#### 2. Frontend Setup
```bash
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

Access application: **http://localhost:5173**

For detailed setup, see [QUICKSTART.md](./QUICKSTART.md)

## 📁 Project Structure

```
internship-tracker/
│
├── backend/                          # Node.js/Express Backend
│   ├── models/                       # MongoDB Schemas
│   │   ├── User.js                   # User model (student/admin)
│   │   ├── Internship.js             # Internship model
│   │   └── Report.js                 # Progress report model
│   │
│   ├── controllers/                  # Business Logic
│   │   ├── authController.js         # Auth operations
│   │   ├── studentController.js      # Student operations
│   │   └── adminController.js        # Admin operations
│   │
│   ├── routes/                       # API Endpoints
│   │   ├── auth.js                   # Auth routes
│   │   ├── student.js                # Student routes
│   │   └── admin.js                  # Admin routes
│   │
│   ├── middleware/                   # Express Middleware
│   │   ├── auth.js                   # JWT verification
│   │   └── errorHandler.js           # Error handling
│   │
│   ├── config/                       # Configuration
│   │   └── multer.js                 # File upload config
│   │
│   ├── uploads/                      # Uploaded files
│   ├── server.js                     # Express server
│   ├── package.json
│   └── .env                          # Environment variables
│
├── src/                              # React Frontend
│   ├── components/                   # React Components
│   │   ├── Login.tsx                 # Login page
│   │   ├── Signup.tsx                # Registration page
│   │   ├── StudentDashboard.tsx      # Student dashboard
│   │   ├── AdminDashboard.tsx        # Admin dashboard
│   │   ├── AddInternship.tsx         # Add internship modal
│   │   ├── AddReport.tsx             # Add report modal
│   │   ├── ProtectedRoute.tsx        # Route protection
│   │   └── ...
│   │
│   ├── contexts/                     # React Contexts
│   │   └── AuthContext.tsx           # Authentication context
│   │
│   ├── lib/                          # Libraries & Utilities
│   │   └── api.ts                    # Axios API client
│   │
│   ├── App.tsx                       # Root component
│   └── main.tsx                      # Entry point
│
├── QUICKSTART.md                     # Quick start guide
├── SETUP.md                          # Detailed setup guide
├── MIGRATION_NOTES.md                # Supabase to MERN migration
├── package.json                      # Frontend dependencies
├── .env                              # Frontend environment
└── vite.config.ts                    # Vite configuration
```

## 🔌 API Overview

All endpoints require authentication (except signup/login).

### Base URL: `http://localhost:5000/api`

### Authentication
```
POST   /auth/signup          Register new user
POST   /auth/login           Login user
GET    /auth/me              Get current user (requires token)
```

### Student Routes (Protected)
```
POST   /student/internships              Add internship
GET    /student/internships              Get all internships
GET    /student/internships/:id          Get single internship
PUT    /student/internships/:id          Update internship

POST   /student/reports                  Submit report (with file)
GET    /student/reports                  Get all reports
GET    /student/internships/:id/reports  Get reports by internship
GET    /student/reports/:id              Get single report
```

### Admin Routes (Protected - Admin only)
```
GET    /admin/dashboard/stats                      Dashboard statistics
GET    /admin/students                             All students
GET    /admin/students/:id                         Student details
GET    /admin/internships                          All internships
POST   /admin/internships/:id/approve              Approve internship
POST   /admin/internships/:id/reject               Reject internship
GET    /admin/reports                              All reports
GET    /admin/internships/:id/reports              Reports by internship
POST   /admin/reports/:id/feedback                 Give feedback
```

## 📊 Database Schema

### User
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed),
  role: String (enum: student | admin),
  department: String (optional),
  semester: Number (optional),
  createdAt: Date,
  updatedAt: Date
}
```

### Internship
```javascript
{
  _id: ObjectId,
  studentId: ObjectId (ref: User),
  companyName: String,
  position: String,
  startDate: Date,
  endDate: Date,
  location: String,
  description: String,
  status: String (enum: pending | approved | rejected),
  mentorName: String,
  mentorEmail: String,
  adminFeedback: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Report
```javascript
{
  _id: ObjectId,
  internshipId: ObjectId (ref: Internship),
  studentId: ObjectId (ref: User),
  weekNumber: Number,
  title: String,
  description: String,
  tasksCompleted: String,
  learningsGained: String,
  hoursWorked: Number,
  fileUrl: String,
  fileName: String,
  status: String (enum: submitted | reviewed | feedback_given),
  adminFeedback: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 📖 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get running in 5 minutes
- **[SETUP.md](./SETUP.md)** - Detailed setup instructions
- **[MIGRATION_NOTES.md](./MIGRATION_NOTES.md)** - Supabase to MERN migration details
- **[backend/README.md](./backend/README.md)** - Backend API documentation

## 🔐 Authentication Flow

1. **Registration** - User signs up with email/password
2. **Login** - User receives JWT token
3. **Storage** - Token stored in browser localStorage
4. **Requests** - Token sent in Authorization header
5. **Verification** - Backend validates token on each request
6. **Access** - Role-based access control enforced

## 📁 File Upload

- **Location**: `backend/uploads/`
- **Supported Types**: PDF, DOC, DOCX, JPG, PNG, GIF
- **Max Size**: 10MB per file
- **Access**: Via `/uploads/{filename}` endpoint

## 🌍 Environment Variables

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend `.env`
```env
MONGODB_URI=mongodb://localhost:27017/internship_tracker
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
git push heroku main
```

### MongoDB
Use MongoDB Atlas for cloud hosting

## 📝 Development

### Commands

**Frontend:**
```bash
npm run dev         # Start dev server
npm run build       # Build for production
npm run preview     # Preview build
npm run lint        # Check code quality
```

**Backend:**
```bash
npm run dev         # Start with nodemon
node server.js      # Start production
```

### Development Servers

Run in separate terminals:

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd backend
npm run dev

# Terminal 3: Frontend
npm run dev
```

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Start MongoDB service
mongod
# or
brew services start mongodb-community
mongosh  # Test connection
```

### Port Already in Use
```bash
# Find process on port 5000
netstat -ano | findstr :5000
# Kill process
taskkill /PID {PID} /F
```

### CORS Error
- Check `CORS_ORIGIN` in backend `.env`
- Should match frontend URL (e.g., `http://localhost:5173`)

### Auth Token Invalid
- Login again to get new token
- Check `JWT_SECRET` consistency

## 📚 Key Features Explained

### Role-Based Access
- **Students** can only access their data
- **Admins** can access all data
- JWT payload includes user role and ID

### File Upload
- Uses Multer middleware
- Validates file type and size
- Stores in `backend/uploads/`
- Returns URL for retrieval

### Password Security
- Hashed with bcrypt (10 rounds)
- Never stored in plain text
- Verified using bcrypt.compare()

### Error Handling
- Try-catch in all async operations
- Centralized error handler middleware
- Proper HTTP status codes
- Detailed error messages

## 🔄 Migration from Supabase

This project was migrated from Supabase to MERN Stack. See [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) for:
- What changed
- Why MERN was chosen
- Architecture differences
- Complete migration checklist

## 💡 Best Practices

- ✅ Environment variables for configuration
- ✅ Error handling at every level
- ✅ Input validation on backend
- ✅ Secure password hashing
- ✅ JWT for stateless auth
- ✅ CORS for frontend protection
- ✅ Comments in complex code
- ✅ Meaningful variable names

## 📄 License

MIT License - Feel free to use and modify

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📞 Support

For issues and questions:
1. Check relevant documentation files
2. Review troubleshooting section
3. Check browser console for errors
4. Check terminal output for backend errors

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] Real-time updates with Socket.io
- [ ] Advanced analytics and reporting
- [ ] File preview functionality
- [ ] Bulk operations
- [ ] API rate limiting
- [ ] Two-factor authentication
- [ ] Dark mode UI

## 📌 Version

- **Current**: 1.0.0
- **Status**: Production Ready
- **Last Updated**: March 21, 2026
- **Stack**: MERN (MongoDB, Express, React, Node.js)

---

## 🚀 Get Started Now!

**[Quick Start →](./QUICKSTART.md)** | **[Detailed Setup →](./SETUP.md)** | **[API Docs →](./backend/README.md)**

**Happy building!** ✨
