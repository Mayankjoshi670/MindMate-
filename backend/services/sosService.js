const twilio = require('twilio');
const User = require('../models/User');
const { SOS_CONTACT } = require('../config/constants');

class SosService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendEmergencyAlert(userId, emergencyData) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.emergencyContact) {
                throw new Error('Emergency contact not found');
            }

            const { reason, location, timestamp } = emergencyData;

            // Send SMS to emergency contact
            await this.client.messages.create({
                body: `EMERGENCY ALERT: ${user.name} has triggered an SOS alert.
                    Reason: ${reason}
                    Location: ${location || 'Not provided'}
                    Time: ${timestamp}
                    Please check on them immediately.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.emergencyContact.phone
            });

            // Send SMS to user with crisis resources
            await this.client.messages.create({
                body: `We're here for you. Please know that you're not alone.
                    Crisis Helpline: ${SOS_CONTACT}
                    Emergency Services: 112
                    We've notified your emergency contact: ${user.emergencyContact.name}
                    Stay strong, help is on the way.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.phone
            });

            // Log the emergency alert
            console.log(`Emergency alert sent for user ${userId} at ${timestamp}`);

            return {
                success: true,
                message: 'Emergency alerts sent successfully',
                timestamp
            };
        } catch (error) {
            console.error('Error sending emergency alert:', error);
            throw new Error('Failed to send emergency alert');
        }
    }

    async sendDailyCheckIn(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            await this.client.messages.create({
                body: `Hi ${user.name}, this is MindMate. How are you feeling today?
                    Remember, we're here to support you 24/7.
                    Reply with your current mood or any concerns.
                    If you need immediate help, reply with "SOS".`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.phone
            });

            return {
                success: true,
                message: 'Daily check-in sent successfully'
            };
        } catch (error) {
            console.error('Error sending daily check-in:', error);
            throw new Error('Failed to send daily check-in');
        }
    }

    async updateEmergencyStatus(userId, status, message) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Send status update to emergency contact
            if (user.emergencyContact) {
                await this.client.messages.create({
                    body: `Status Update for ${user.name}:
                        Status: ${status}
                        Message: ${message}
                        Time: ${new Date().toISOString()}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: user.emergencyContact.phone
                });
            }

            return {
                success: true,
                message: 'Emergency status updated successfully',
                status,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error updating emergency status:', error);
            throw new Error('Failed to update emergency status');
        }
    }

    async sendFollowUpMessage(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            await this.client.messages.create({
                body: `Hi ${user.name}, this is a follow-up from MindMate.
                    We want to make sure you're doing okay.
                    Please let us know if you need any support.
                    Remember, help is always available at ${SOS_CONTACT}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.phone
            });

            return {
                success: true,
                message: 'Follow-up message sent successfully'
            };
        } catch (error) {
            console.error('Error sending follow-up message:', error);
            throw new Error('Failed to send follow-up message');
        }
    }
}

module.exports = new SosService(); 