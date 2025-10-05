require('dotenv').config(); // Load .env early
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const departmentRoutes = require('./routes/departmentRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors()); // Enable CORS for frontend access
app.use(express.json()); // Body parser, reading data from body into req.body

// --- 2. DATABASE CONNECTION (Atlas-ready) ---
// Prefer a fully qualified MONGODB_URI (Atlas). Fall back to DB_URI or local Mongo.
const DB_URI = process.env.MONGODB_URI || process.env.DB_URI || 'mongodb://localhost:27017/EMS_db_mock';

// Recommended mongoose connection options for modern drivers
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // use maxPoolSize to control connection pool; do not use keepAlive (unsupported option)
    maxPoolSize: 10,
    // Uncomment and adjust poolSize if you expect many parallel connections
    // maxPoolSize: 10,
};

mongoose.connect(DB_URI, mongooseOptions)
    .then(() => console.log('DB connection successful!'))
    .catch(err => {
        console.error('DB connection failed:', err && err.message ? err.message : err);
        // If the DB connection is critical for the app, exit with failure
        // so deployment platforms detect the failure. For development you may
        // want to keep the process alive and retry; modify as needed.
        process.exit(1);
    });

// --- 3. ROUTES ---

// Authentication routes
app.use('/api/auth', authRoutes);

// Management routes
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);

// Handle undefined routes
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

// --- 4. START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}...`);
});
