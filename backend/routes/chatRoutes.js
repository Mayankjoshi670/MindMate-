const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const chatService = require('../services/chatService');
const sosService = require('../services/sosService');

// Send message and get response
router.post('/message', auth, async (req, res) => {
    try {
        console.log('Chat message received from user:', req.user._id);
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        // Analyze tone
        console.log('Analyzing message tone...');
        const tone = await chatService.analyzeTone(message);
        console.log('Tone analysis result:', tone);

        // Get chat history for context
        console.log('Fetching chat history...');
        const chatHistory = await chatService.getChatHistory(req.user._id);
        console.log('Chat history fetched:', chatHistory.length, 'messages');

        // Generate response
        console.log('Generating response...');
        const response = await chatService.generateResponse(message, chatHistory);
        console.log('Response generated');

        // Store chat in vector DB
        console.log('Storing chat in vector DB...');
        await chatService.storeChat(req.user._id, message, response, tone);
        console.log('Chat stored successfully');

        // Check for high-risk messages
        if (tone.risk_level === 'high') {
            console.log('High risk message detected, sending emergency alert...');
            await sosService.sendEmergencyAlert(req.user._id, message);
            console.log('Emergency alert sent');
        }

        res.json({
            response,
            tone,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ 
            message: 'Error processing message', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
    try {
        console.log('Fetching chat history for user:', req.user._id);
        const limit = parseInt(req.query.limit) || 10;
        
        const history = await chatService.getChatHistory(req.user._id, limit);
        console.log('Chat history fetched:', history.length, 'messages');
        
        res.json(history);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ 
            message: 'Error fetching chat history', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get daily summary
router.get('/summary', auth, async (req, res) => {
    try {
        console.log('Generating daily summary for user:', req.user._id);
        const history = await chatService.getChatHistory(req.user._id, 50);
        console.log('Chat history fetched for summary:', history.length, 'messages');

        const summary = await chatService.generateSummary(history);
        console.log('Summary generated successfully');

        res.json({ summary });
    } catch (error) {
        console.error('Error generating summary:', error);
        res.status(500).json({ 
            message: 'Error generating summary', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
