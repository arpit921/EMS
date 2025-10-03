const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware'); // Import middleware

// POST /api/auth/signup - Register a new user (default role: employee)
router.post('/signup', authController.signup);

// POST /api/auth/login - Log in an existing user
router.post('/login', authController.login);

// POST /api/auth/create-user - Create Admin or HR users (Restricted to 'admin' role)
router.post('/create-user', protect, restrictTo('admin'), authController.createAdminUser);

module.exports = router;
