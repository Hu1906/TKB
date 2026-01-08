require('dotenv').config();
const express = require('express');
const cors = require('cors');
const DB = require('./config/db');

const app = express();
const port = process.env.PORT || 3000;


// Routes
const importRoute = require('./routes/importRoute');
const subjectRoute = require('./routes/subjectRoute');
const generateRoute = require('./routes/generateRoute');

app.use('/api/import', importRoute);
app.use('/api/subjects', subjectRoute);
app.use('/api/generate', generateRoute);

// Connect to MongoDB
DB.connectDB();

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Schedule Builder API is running!' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📝 API Documentation:`);
  console.log(`   - POST /api/import/upload - Import data from Excel`);
  console.log(`   - GET  /api/subjects/search?q=... - Search subjects`);
  console.log(`   - GET  /api/subjects/:id/classes - Get classes by subject`);
  console.log(`   - POST /api/generate/generate - Generate schedules`);
});