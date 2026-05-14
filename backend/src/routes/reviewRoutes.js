const express = require('express');
const { addReview, getWorkerReviews } = require('../controllers/reviewController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', verifyToken, requireRole('customer'), addReview);
router.get('/worker/:workerId', getWorkerReviews);   // public

module.exports = router;
