import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import expenseRoutes from './routes/expenses.js';
import aiRoutes from './routes/ai.js';
import authRoutes from './routes/auth.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
<<<<<<< HEAD
  origin: true, // Allow all origins for now - change in production
  credentials: true,
  optionsSuccessStatus: 200
=======
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'], // Vite's default dev server
  credentials: true
>>>>>>> 4a28ad23c792a13546efc4702f64247808721edb
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI_CLUSTER || process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-expense-tracker';
const usingCluster = !!process.env.MONGODB_URI_CLUSTER;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log(`✅ Connected to MongoDB (${usingCluster ? 'cluster' : process.env.MONGODB_URI ? 'env' : 'local'})`);
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Kharcha Mitra API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Kharcha Mitra API running on port ${PORT}`);
  console.log(`📊 Frontend should be available at http://localhost:5173`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
});

export default app;