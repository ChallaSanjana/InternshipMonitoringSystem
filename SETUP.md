# Internship Monitoring System

A complete full-stack application for managing student internships with role-based access control for students and administrators.

## Features

### Student Features
- **Add/Manage Internships**: Create and track internship details including company, position, dates, and mentor information
- **Submit Progress Reports**: Weekly progress reports with file upload capability
- **View Status**: Track internship approval status and admin feedback
- **File Upload**: Attach documents (PDF, DOC, images) to reports

### Admin Features
- **Dashboard Overview**: View statistics on students, internships, and reports
- **Approve/Reject Internships**: Review student internship applications with feedback
- **Manage Students**: View all registered students and their details
- **Review Reports**: Read and provide feedback on student progress reports
- **Role-Based Access**: Secure authentication with JWT tokens

## Tech Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Axios (API Client)
- Lucide React (Icons)
- Vite (Build tool)

### Backend
- Node.js & Express
- MongoDB
- Mongoose ODM
- JWT Authentication
- Bcrypt (Password hashing)
- Multer (File upload)
- CORS

## Project Structure

```
internship-tracker/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── contexts/           # Auth context
│   │   ├── lib/                # API client
│   │   └── vite-env.d.ts
│   ├── package.json
│   ├── .env                    # Frontend environment variables
│   └── vite.config.ts
│
└── backend/                     # Express backend
    ├── models/                  # MongoDB models
    │   ├── User.js
    │   ├── Internship.js
    │   └── Report.js
    ├── controllers/             # Business logic
    │   ├── authController.js
    │   ├── studentController.js
    │   └── adminController.js
    ├── routes/                  # Express routes
    │   ├── auth.js
    │   ├── student.js
    │   └── admin.js
    ├── middleware/              # Express middleware
    │   ├── auth.js
    │   └── errorHandler.js
    ├── config/                  # Configuration
    │   └── multer.js
    ├── server.js                # Main server file
    ├── package.json
    └── .env                     # Backend environment variables
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or Atlas connection string)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create .env file with:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/internship_tracker
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start MongoDB:**
   ```bash
   # On Windows or if using MongoDB locally
   mongod
   ```

5. **Start the backend server:**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to project root (frontend is already configured):**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install axios react-router-dom
   ```

3. **Create/update .env file:**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## Available APIs

### Authentication (`/api/auth`)
- `POST /signup` - Register new user
- `POST /login` - Login user
- `GET /me` - Get current user (requires auth)

### Student Routes (`/api/student`)*
- `POST /internships` - Create internship
- `GET /internships` - Get student's internships
- `GET /internships/:id` - Get internship details
- `PUT /internships/:id` - Update internship
- `POST /reports` - Submit progress report (with file upload)
- `GET /reports` - Get student's reports
- `GET /internships/:internshipId/reports` - Get reports for internship
- `GET /reports/:id` - Get report details

### Admin Routes (`/api/admin`)*
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /students` - Get all students
- `GET /students/:studentId` - Get student details
- `GET /internships` - Get all internships
- `POST /internships/:internshipId/approve` - Approve internship
- `POST /internships/:internshipId/reject` - Reject internship
- `GET /reports` - Get all reports
- `GET /internships/:internshipId/reports` - Get reports by internship
- `POST /reports/:reportId/feedback` - Give feedback on report

*Requires authentication with valid JWT token

## Authentication Flow

1. **User Registration/Login**:
   - Frontend sends credentials to `/api/auth/signup` or `/api/auth/login`
   - Backend validates and returns JWT token
   - Frontend stores token in localStorage

2. **Protected Requests**:
   - Frontend includes token in Authorization header: `Bearer {token}`
   - Backend middleware validates token and extracts user info
   - Routes check user role for authorization

3. **Logout**:
   - Frontend clears token from localStorage
   - User is redirected to login page

## User Roles

### Student
- Can add and manage their internships
- Can submit weekly progress reports
- Can view their internship status and admin feedback
- Access: `/student` routes

### Admin
- Can view all students and their information
- Can approve or reject internships
- Can view and provide feedback on all reports
- See dashboard statistics
- Access: `/admin` routes

## File Upload

- Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF
- Max file size: 10MB
- Files are stored in `backend/uploads` directory
- Accessible via `GET /uploads/{filename}`

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/internship_tracker
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Try: `mongodb://localhost:27017/internship_tracker`

### CORS Error
- Check CORS_ORIGIN in backend .env matches frontend URL
- Default: `http://localhost:5173` for Vite

### Token Invalid Error
- Login again to get a new token
- Check JWT_SECRET matches in backend .env
- Clear browser localStorage and login again

### File Upload Issues
- Check `/uploads` directory exists in backend
- Verify file size < 10MB
- Check supported file formats

## Development

### To run both frontend and backend:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Production Deployment

Before deploying to production:

1. **Update .env**:
   - Use strong JWT_SECRET
   - Set NODE_ENV=production
   - Use MongoDB Atlas connection string
   - Update CORS_ORIGIN to your domain

2. **Build frontend**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   - Frontend: Deploy `dist` folder to hosting (Vercel, Netlify, etc.)
   - Backend: Deploy to hosting (Heroku, Railway, etc.)

## Database Schema

### User
- `_id`: ObjectId (primary key)
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (hashed, required)
- `role`: String (student | admin)
- `department`: String (optional)
- `semester`: Number (optional)
- `createdAt`: Date

### Internship
- `_id`: ObjectId
- `studentId`: ObjectId (ref: User)
- `companyName`: String
- `position`: String
- `startDate`: Date
- `endDate`: Date
- `location`: String
- `description`: String
- `status`: String (pending | approved | rejected)
- `mentorName`: String
- `mentorEmail`: String
- `adminFeedback`: String
- `createdAt`: Date

### Report
- `_id`: ObjectId
- `internshipId`: ObjectId (ref: Internship)
- `studentId`: ObjectId (ref: User)
- `weekNumber`: Number
- `title`: String
- `description`: String
- `tasksCompleted`: String
- `learningsGained`: String
- `hoursWorked`: Number
- `fileUrl`: String
- `fileName`: String
- `status`: String (submitted | reviewed | feedback_given)
- `adminFeedback`: String
- `createdAt`: Date

## Support & Issues

For issues or questions:
1. Check the troubleshooting section above
2. Review backend .env configuration
3. Ensure MongoDB is running
4. Check frontend API URL configuration
5. Review browser console and terminal for error messages

## License

MIT License - Feel free to use this project for your needs.
