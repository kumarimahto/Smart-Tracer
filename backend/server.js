import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenses.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';

console.log("JWT_SECRET:", process.env.JWT_SECRET);

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

/* ===============================
   SECURITY & MIDDLEWARE
================================= */

app.use(helmet());

// ✅ Proper CORS configuration for production
app.use(cors({
  origin: [
    "http://localhost:5173", // local development
    "https://smart-tracer-uzp.vercel.app" // production frontend
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   DATABASE CONNECTION
================================= */

const mongoURI =
  process.env.MONGODB_URI_CLUSTER ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/smart-expense-tracker';

const usingCluster = !!process.env.MONGODB_URI_CLUSTER;

mongoose.connect(mongoURI)
  .then(() => {
    console.log(
      `✅ Connected to MongoDB (${usingCluster ? 'cluster' : process.env.MONGODB_URI ? 'env' : 'local'})`
    );
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });

/* ===============================
   ROUTES
================================= */

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Kharcha Mitra API is running',
    timestamp: new Date().toISOString()
  });
});

/* ===============================
   ERROR HANDLING
================================= */

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl
  });
});

/* ===============================
   START SERVER
================================= */

app.listen(PORT, () => {
  console.log(`🚀 Kharcha Mitra API running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API Base URL: https://smart-tracer-1.onrender.com/api`);
});

export default app;