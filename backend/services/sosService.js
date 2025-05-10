const twilio = require('twilio');
const User = require('../models/User');

class SosService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
    }

    async sendEmergencyAlert(userId, message) {
        try {
            const user = await User.findById(userId);
            if (!user || !user.emergencyContact) {
                throw new Error('Emergency contact not found');
            }

            // Send SMS to emergency contact
            await this.client.messages.create({
                body: `EMERGENCY ALERT: ${user.name} has sent a message indicating distress: "${message}". 
                    Please check on them immediately.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.emergencyContact.phone
            });

            // Send SMS to user with crisis resources
            await this.client.messages.create({
                body: `We're here for you. Please know that you're not alone. 
                    Crisis Helpline: 1800-599-0019 (Vandrevala Foundation)
                    Emergency Services: 112
                    We've notified your emergency contact.`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.phone
            });

            return {
                success: true,
                message: 'Emergency alerts sent successfully'
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
                    Reply with your current mood or any concerns.`,
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
}

module.exports = new SosService(); 