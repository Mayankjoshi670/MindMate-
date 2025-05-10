const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const sosController = require('../controllers/sosController');

// Trigger SOS alert
router.post('/trigger', auth, sosController.triggerSOS);

// Get emergency resources
router.get('/resources', auth, sosController.getEmergencyResources);

// Update emergency status
router.post('/status', auth, sosController.updateEmergencyStatus);

module.exports = router; 