const { updateWorkerProfile, getProfileByUserId } = require('../models/profileModel');
const { findUserById } = require('../models/userModel');

const uploadWorkerDocs = async (req, res) => {
    try {
        const userId = req.user.id;
        const { fullName } = req.body;
        if (!fullName) return res.status(400).json({ message: 'Full name required' });
        
        const files = req.files;
        if (!files || !files.cccdFront || !files.cccdBack || !files.certificate) {
            return res.status(400).json({ message: 'Please upload CCCD front, back and certificate' });
        }
        
        const cccdFrontUrl = `/uploads/${files.cccdFront[0].filename}`;
        const cccdBackUrl = `/uploads/${files.cccdBack[0].filename}`;
        const certificateUrl = `/uploads/${files.certificate[0].filename}`;
        
        await updateWorkerProfile(userId, cccdFrontUrl, cccdBackUrl, certificateUrl, fullName);
        res.json({ message: 'Profile submitted for approval, status is pending' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const profile = await getProfileByUserId(req.user.id);
        const user = await findUserById(req.user.id);
        res.json({ user, profile });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { uploadWorkerDocs, getProfile };
