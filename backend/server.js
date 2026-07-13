import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import 'express-async-errors';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/student.js';
import adminRoutes from './routes/admin.js';
import mentorRoutes from './routes/mentor.js';
import notificationRoutes from './routes/notification.js';
import chatRoutes from './routes/chat.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// MongoDB Connection & Seeding
const seedDatabase = async () => {
  try {
    const User = (await import('./models/User.js')).default;
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Seeding default users...');
      
      // Admin user
      await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        department: "Computer Science"
      });

      // Mentor user
      const mentor = await User.create({
        name: "Mentor User",
        email: "mentor@example.com",
        password: "mentor123",
        role: "mentor",
        department: "Computer Science"
      });

      // Student user
      await User.create({
        name: "Student User",
        email: "student@example.com",
        password: "student123",
        role: "student",
        department: "Computer Science",
        semester: 6,
        mentorId: mentor._id
      });

      console.log('Database seeding complete:');
      console.log('  Admin: admin@example.com / admin123');
      console.log('  Mentor: mentor@example.com / mentor123');
      console.log('  Student: student@example.com / student123');
    }
  } catch (seedErr) {
    console.error('Error seeding database:', seedErr);
  }
};

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;
    
    if (process.env.USE_MEMORY_DB === 'true' || !mongoUri) {
      console.log('Using in-memory MongoDB server...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create({
        binary: {
          version: '4.0.25'
        }
      });
      mongoUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started at ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
    await seedDatabase();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    
    // Try fallback to memory server
    if (process.env.USE_MEMORY_DB !== 'true') {
      console.log('Attempting fallback to in-memory MongoDB server...');
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongoServer = await MongoMemoryServer.create({
          binary: {
            version: '4.0.25'
          }
        });
        const fallbackUri = mongoServer.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`Fallback MongoDB connected at ${fallbackUri}`);
        await seedDatabase();
      } catch (fallbackErr) {
        console.error('Fallback MongoDB connection failed:', fallbackErr);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

connectDB();


// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes for uploads
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/mentor', mentorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
