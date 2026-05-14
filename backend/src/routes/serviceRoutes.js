const express = require('express');
const { getAllServices, getService } = require('../controllers/serviceController');
const { verifyToken } = require('../middleware/authMiddleware'); // có thể public hoặc không cần token
const router = express.Router();

router.get('/', getAllServices);        // public
router.get('/:id', getService);         // public

module.exports = router;
