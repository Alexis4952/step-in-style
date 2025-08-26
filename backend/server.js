const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Import routes
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const orderRoutes = require('./routes/orders');
const stripeRoutes = require('./routes/stripe');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Trust proxy for Render
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [
      'http://localhost:3000',
      'https://step-in-style.vercel.app',
      'https://stepinstyle24.vercel.app'
    ];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Step in Style API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stripe', stripeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Step in Style API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Supabase URL: ${process.env.SUPABASE_URL ? 'SET' : 'NOT SET'}`);
  console.log(`🔑 Supabase Key: ${process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`💳 Stripe Secret Key: ${process.env.STRIPE_SECRET_KEY ? 'SET' : 'NOT SET'}`);
  console.log(`💳 Stripe Publishable Key: ${process.env.STRIPE_PUBLISHABLE_KEY ? 'SET' : 'NOT SET'}`);
});

module.exports = app; 