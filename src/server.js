const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose'); // Add this line
require('dotenv').config();


const app = express();
const port = 3003;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('src/public'));

// MongoDB Connection
const connectDB = async () => { // Add this function
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error(error);
    process.exit(1); // Exit process with failure
  }
};

connectDB(); // Call the connectDB function

// Routes - only after the db is connected
const scrapeRoutes = require('./routes/scrape')(mongoose.connection); // Update this line
app.use('/scrape', scrapeRoutes);

const categorizeRoutes = require('./routes/categorize')(mongoose.connection);
app.use('/categorize', categorizeRoutes);

// Start Server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});