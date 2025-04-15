// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

// Import routes and controllers
const { resetPassword } = require('./controllers/authController');

// Load environment variables from .env file
dotenv.config();

// Initialize the Express app
const app = express();

// Middleware setup
app.use(bodyParser.json());  // To parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));  // To parse URL-encoded bodies (from forms)
app.use(cors());  // Enable Cross-Origin Resource Sharing
app.set('view engine', 'ejs');
app.set('views', './views');

// เพิ่ม middleware ตรวจสอบ request สำหรับ debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
console.log('Serving static files from:', path.join(__dirname, 'uploads'));

// เพิ่มเส้นทางให้เข้าถึงรูปภาพโดยตรง
app.get('/images/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);
  console.log(`Requested image: ${filename}, Path: ${filePath}`);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`Error sending file: ${err.message}`);
      res.status(404).send('File not found');
    } else {
      console.log(`Successfully sent image: ${filename}`);
    }
  });
});

// MongoDB connection
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log('MongoDB connection error:', err));

// Routes for authentication
app.use('/api/auth', authRoutes); // API endpoints for login, register
app.use('/auth', authRoutes);     // Alternate route for auth
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);

// Route to display the reset password form
app.get('/reset-password', (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).send('Invalid or expired token');
    }

    res.render('reset-password', { token });
});

// Route to handle password reset request
app.post('/reset-password', resetPassword);  // Use resetPassword function from controller

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
