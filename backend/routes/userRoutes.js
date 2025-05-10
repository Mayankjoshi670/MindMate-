const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
});

// Update user profile
router.patch('/profile', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'phone', 'emergencyContact', 'preferences'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
    }

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(400).json({ message: 'Error updating profile', error: error.message });
    }
});

// Update emergency contact
router.patch('/emergency-contact', auth, async (req, res) => {
    try {
        const { name, phone, relationship } = req.body;
        req.user.emergencyContact = { name, phone, relationship };
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(400).json({ message: 'Error updating emergency contact', error: error.message });
    }
});

// Update preferences
router.patch('/preferences', auth, async (req, res) => {
    try {
        const { language, notifications } = req.body;
        req.user.preferences = { language, notifications };
        await req.user.save();
        res.json(req.user);
    } catch (error) {
        res.status(400).json({ message: 'Error updating preferences', error: error.message });
    }
});

module.exports = router; 