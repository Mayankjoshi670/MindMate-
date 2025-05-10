const sosService = require('../services/sosService');
const User = require('../models/User');
const { SOS_CONTACT } = require('../config/constants');

class SosController {
    async triggerSOS(req, res) {
        try {
            const { userId } = req.user;
            const { reason, location } = req.body;

            // Get user details
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Send emergency alerts
            const result = await sosService.sendEmergencyAlert(userId, {
                reason,
                location,
                timestamp: new Date().toISOString()
            });

            res.status(200).json({
                message: 'SOS alert triggered successfully',
                emergencyContact: user.emergencyContact,
                crisisHelpline: SOS_CONTACT
            });
        } catch (error) {
            console.error('Error triggering SOS:', error);
            res.status(500).json({
                message: 'Error triggering SOS alert',
                error: error.message
            });
        }
    }

    async getEmergencyResources(req, res) {
        try {
            const resources = {
                crisisHelpline: SOS_CONTACT,
                emergencyServices: '112',
                mentalHealthResources: [
                    {
                        name: 'Vandrevala Foundation',
                        phone: '1800-599-0019',
                        available: '24/7'
                    },
                    {
                        name: 'The Live Love Laugh Foundation',
                        phone: '080-4709 2600',
                        available: '9 AM - 6 PM'
                    },
                    {
                        name: 'iCall',
                        phone: '022-25521111',
                        available: 'Monday to Saturday, 8 AM - 10 PM'
                    }
                ],
                emergencySteps: [
                    'Stay calm and find a safe location',
                    'Call emergency services (112) if immediate danger',
                    'Contact your emergency contact',
                    'Use the crisis helpline for immediate support'
                ]
            };

            res.json(resources);
        } catch (error) {
            console.error('Error fetching emergency resources:', error);
            res.status(500).json({
                message: 'Error fetching emergency resources',
                error: error.message
            });
        }
    }

    async updateEmergencyStatus(req, res) {
        try {
            const { userId } = req.user;
            const { status, message } = req.body;

            const result = await sosService.updateEmergencyStatus(userId, status, message);
            res.json(result);
        } catch (error) {
            console.error('Error updating emergency status:', error);
            res.status(500).json({
                message: 'Error updating emergency status',
                error: error.message
            });
        }
    }
}

module.exports = new SosController();
