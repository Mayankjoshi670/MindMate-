const axios = require('axios');

class GeminiService {
    constructor() {
        // Using a free and open LLM model
        this.MODEL_URL = "https://api-inference.huggingface.co/models/facebook/opt-350m";
        this.API_KEY = process.env.HUGGINGFACE_API_KEY;
        
        if (!this.API_KEY) {
            console.warn('HUGGINGFACE_API_KEY not found, using fallback responses');
            this.useFallback = true;
        } else {
            this.useFallback = false;
            console.log('LLM service initialized');
        }
 
        this.fallbackResponses = [
            "I'm here to listen. How can I help you today?",
            "I understand. Would you like to tell me more?",
            "I'm here to support you. What's on your mind?",
            "I'm listening. Please continue.",
            "I'm here to help. How are you feeling?"
        ];
    }

    async generateResponse(message, chatHistory = []) {
        try {
            if (this.useFallback) {
                return this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
            }

            const prompt = `
You are a supportive and empathetic mental health assistant. Your role is to provide understanding and helpful responses.

Previous conversation:
${chatHistory.map(msg => `User: ${msg.user}\nAssistant: ${msg.bot}`).join('\n')}

User: ${message}
Assistant:`;

            const response = await axios.post(
                this.MODEL_URL,
                { inputs: prompt },
                {
                    headers: {
                        'Authorization': `Bearer ${this.API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data && response.data[0] && response.data[0].generated_text) {
                // Extract the assistant's response from the generated text
                const generatedText = response.data[0].generated_text;
                const assistantResponse = generatedText.split('Assistant:').pop().trim();
                return assistantResponse || this.getFallbackResponse();
            }

            return this.getFallbackResponse();
        } catch (error) {
            console.error('Error generating response:', error);
            return this.getFallbackResponse();
        }
    }

    getFallbackResponse() {
        return this.fallbackResponses[Math.floor(Math.random() * this.fallbackResponses.length)];
    }
}

module.exports = new GeminiService();