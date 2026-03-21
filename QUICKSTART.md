# Quick Start Guide - MERN Stack Internship Monitoring System

Get up and running in 5 minutes!

## Prerequisites
- Node.js v14+ installed
- MongoDB running (local or MongoDB Atlas)
- Terminal/PowerShell access

## Step 1: Start MongoDB

### Option A: MongoDB Local
```bash
# Windows
mongod

# macOS/Linux
brew services start mongodb-community
```

### Option B: MongoDB Atlas
- Create account at mongodb.com
- Create cluster
- Get connection string
- Update MONGODB_URI in backend/.env

## Step 2: Start Backend

```bash
# Navigate to backend
cd backend

# Install dependencies (if not done)
npm install

# Check .env file
cat .env

# Should contain:
# MONGODB_URI=mongodb://localhost:27017/internship_tracker
# JWT_SECRET=your_jwt_secret_key_change_this_in_production
# JWT_EXPIRE=7d
# NODE_ENV=development
# PORT=5000
# CORS_ORIGIN=http://localhost:5173

# Start backend
npm run dev
```

✅ Backend running on: `http://localhost:5000/api`

## Step 3: Start Frontend

```bash
# In new terminal, go to root directory
cd ..

# Check .env
cat .env

# Should contain:
# VITE_API_URL=http://localhost:5000/api

# Install dependencies (if not done)
npm install

# Start frontend
npm run dev
```

✅ Frontend running on: `http://localhost:5173`

## Step 4: Access Application

Open browser and go to: **http://localhost:5173**

## First Time Setup

### Create Admin User (MongoDB)

Open MongoDB shell in another terminal:

```bash
mongosh

# Connect to database
use internship_tracker

# Hash a password first (bcrypt)
# For testing, use this pre-hashed password for "admin123"

# Insert admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$7x.T0e.MKu1LuK4sK7D.v.H8E.hUqOqrqYqYqYqYqYqYqYqYqYqYq",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Create Student User (Via UI)

1. Click "Sign up"
2. Fill form:
   - Name: Student User
   - Email: student@example.com
   - Password: student123
   - Role: Student
   - Department: Computer Science
   - Semester: 6
3. Click "Sign Up"

## Test the Application

### As Student:
1. Login with student account
2. Click "Add Internship"
3. Fill internship details
4. Click "Add Internship"
5. Click "Submit Report" on approved internship
6. Fill report and upload file
7. Submit

### As Admin:
1. Login with admin account
2. Access Dashboard
3. View Overview stats
4. Go to "internships" tab
5. Approve/Reject pending internships
6. Go to "reports" tab
7. Give feedback on reports

## Common Commands

```bash
# Backend
cd backend
npm start              # Production
npm run dev            # Development with auto-reload

# Frontend
npm run dev            # Development
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Check code quality

# MongoDB
mongosh               # Interactive shell
mongo --version       # Check version
```

## Environment Files

### Backend (.env)
```bash
MONGODB_URI=mongodb://localhost:27017/internship_tracker
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
```

## Troubleshooting

### Issue: Cannot connect to MongoDB
```
Error: connect ECONNREFUSED
```
**Fix**: Start MongoDB service
```bash
# Windows PowerShell (Admin)
net start MongoDB

# macOS
brew services start mongodb-community

# Check if running
mongosh
```

### Issue: Port 5000 already in use
```
Error: listen EADDRINUSE
```
**Fix**: Kill process on port 5000
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID {PID} /F

# macOS/Linux
lsof -i :5000
kill -9 {PID}
```

### Issue: "Invalid token" error
**Fix**: Login again to get new token

### Issue: CORS error in browser
**Fix**: Verify CORS_ORIGIN in backend/.env matches frontend URL

### Issue: File upload not working
**Fix**: Ensure backend/uploads folder exists
```bash
cd backend
mkdir uploads
```

## File Structure Reference

```
internship-tracker/
├── backend/                      # Express backend
│   ├── models/                   # MongoDB schemas
│   ├── controllers/              # Business logic
│   ├── routes/                   # API endpoints
│   ├── middleware/               # Auth, error handling
│   ├── config/                   # Multer config
│   ├── uploads/                  # Uploaded files
│   ├── server.js                 # Entry point
│   ├── package.json
│   ├── .env                      # Config (create from .env.example)
│   └── README.md
│
├── src/                          # React frontend
│   ├── components/               # React components
│   ├── contexts/                 # Auth context
│   ├── lib/
│   │   ├── api.ts               # Axios API client
│   │   └── supabase.ts          # DEPRECATED
│   ├── App.tsx
│   └── main.tsx
│
├── package.json                  # Frontend dependencies
├── .env                          # Frontend config
├── SETUP.md                      # Detailed setup guide
├── MIGRATION_NOTES.md            # Supabase to MERN migration
└── README.md
```

## API Quick Reference

### Authentication
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Current user

### Student
- `POST /api/student/internships` - Add internship
- `GET /api/student/internships` - Get internships
- `POST /api/student/reports` - Submit report
- `GET /api/student/reports` - Get reports

### Admin
- `GET /api/admin/dashboard/stats` - Stats
- `GET /api/admin/students` - All students
- `GET /api/admin/internships` - All internships
- `POST /api/admin/internships/:id/approve` - Approve
- `POST /api/admin/internships/:id/reject` - Reject
- `GET /api/admin/reports` - All reports
- `POST /api/admin/reports/:id/feedback` - Feedback

## Next Steps

1. ✅ Backend running
2. ✅ Frontend running
3. ✅ Create test accounts
4. ✅ Test features
5. 📖 Read [SETUP.md](./SETUP.md) for detailed guide
6. 📖 Read [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) for architecture
7. 📖 Read [backend/README.md](./backend/README.md) for API docs

## Support

- **Setup Issues**: Check SETUP.md
- **API Documentation**: See backend/README.md
- **Migration Details**: See MIGRATION_NOTES.md
- **Architecture**: Check project README.md

## Development Servers

Keep these running during development:

**Terminal 1 - MongoDB** (if using local)
```bash
mongod
```

**Terminal 2 - Backend**
```bash
cd backend
npm run dev
```

**Terminal 3 - Frontend**
```bash
npm run dev
```

Now access: **http://localhost:5173**

---

**Ready to start?** Follow the 4 steps above!

**Questions?** Check troubleshooting section or read detailed docs.

**Happy coding!** 🚀
