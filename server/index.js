const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing (CORS) for development
app.use(cors());

// Parse incoming JSON requests
app.use(express.json());

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'TDC Matchmaker Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Import and use match routes
const matchRoutes = require('./routes/matchRoutes');
app.use('/api', matchRoutes);

// Start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
