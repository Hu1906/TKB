require('dotenv').config();
const express = require('express');
const cors = require('cors');
const DB = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Essential for parsing JSON bodies

// Routes
app.use('/api', require('./routes'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Schedule Builder API is running!' });
});

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB & Start server
const startServer = async () => {
  try {
    await DB.connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`📝 API Documentation:`);
      console.log(`   - POST /api/import/upload - Import data from Excel`);
      console.log(`   - GET  /api/subjects/search?q=... - Search subjects`);
      console.log(`   - GET  /api/subjects/:id/classes - Get classes by subject`);
      console.log(`   - POST /api/generate/generate - Generate schedules`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();