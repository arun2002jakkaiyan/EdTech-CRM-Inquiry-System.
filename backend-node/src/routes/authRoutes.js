const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Public route: Admin login
router.post('/login', authController.login);

// Public route: Health / DB Status
router.get('/status', authController.getStatus);

// Protected route: Current admin profile
router.get('/me', authenticateAdmin, authController.getMe);

module.exports = router;
