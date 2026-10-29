const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Public route: Submit an inquiry
router.post('/', inquiryController.createInquiry);

// Protected routes: Admin access only via custom JWT middleware
router.get('/', authenticateAdmin, inquiryController.getAllInquiries);
router.patch('/:id/status', authenticateAdmin, inquiryController.updateStatus);
router.patch('/:id/notes', authenticateAdmin, inquiryController.updateNotes);
router.delete('/:id', authenticateAdmin, inquiryController.deleteInquiry);

module.exports = router;
