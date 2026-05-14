const express = require('express');
const { uploadWorkerDocs, getProfile } = require('../controllers/profileController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const router = express.Router();

router.use(verifyToken);
router.get('/', getProfile);
router.post('/worker', requireRole('worker'), upload.fields([
    { name: 'cccdFront', maxCount: 1 },
    { name: 'cccdBack', maxCount: 1 },
    { name: 'certificate', maxCount: 1 }
]), uploadWorkerDocs);

module.exports = router;
