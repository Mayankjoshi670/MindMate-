const { QdrantClient } = require('@qdrant/js-client-rest');
const { v4: uuidv4 } = require('uuid');
const geminiService = require('./geminiService');

class ChatService {
    constructor() {
        this.qdrant = new QdrantClient({
            url: process.env.QDRANT_URL || 'http://localhost:6333'
        });
        this.initializeQdrant();
    }

    async initializeQdrant() {
        try {
            console.log('Initializing Qdrant...');
            
            // Check if collection exists
            const collections = await this.qdrant.getCollections();
            const collectionName = process.env.QDRANT_COLLECTION || 'mindmate-chats';
            
            console.log('Available collections:', collections.collections.map(c => c.name));
            
            if (!collections.collections.some(c => c.name === collectionName)) {
                console.log(`Creating new Qdrant collection: ${collectionName}`);
                await this.qdrant.createCollection(collectionName, {
                    vectors: {
                        size: 768,
                        distance: 'Cosine'
                    }
                });
                console.log(`Created Qdrant collection: ${collectionName}`);
            } else {
                console.log(`Using existing Qdrant collection: ${collectionName}`);
            }
        } catch (error) {
            console.error('Error initializing Qdrant:', error);
            console.log('Continuing without Qdrant initialization');
        }
    }

    async analyzeTone(message) {
        // return await geminiService.analyzeTone(message);
        return await {tone : "neutral", risk: "low"}; // Placeholder for tone analysis
    }

    async storeChat(userId, message, response, tone) {
        try {
            const chatText = `User: ${message}\nAssistant: ${response}\nTone: ${JSON.stringify(tone)}`;
            
            // Generate embedding using Gemini
            const embedding = await geminiService.generateEmbedding(chatText);
            console.log('Generated embedding:', embedding);
            // Create a unique UUID for this chat entry
            const chatId = uuidv4();

            // Create the point object
            const point = {
                id: chatId,
                vector: embedding,
                payload: {
                    userId: userId.toString(), // Convert ObjectId to string
                    timestamp: new Date().toISOString(),
                    message,
                    response,
                    tone: JSON.stringify(tone),
                    chatText
                }
            };

            const collectionName = process.env.QDRANT_COLLECTION || 'mindmate-chats';

            console.log('Storing chat in Qdrant with ID:', chatId);
            console.log('Point payload:', JSON.stringify(point.payload, null, 2));
            
            // Perform the upsert operation
            await this.qdrant.upsert(collectionName, {
                points: [point]
            });
            console.log('Chat stored in Qdrant successfully');

            return chatId;
        } catch (error) {
            console.error('Error storing chat in Qdrant:', error);
            console.log('Continuing without storing in Qdrant');
            return null;
        }
    }

    async getChatHistory(userId, limit = 10) {
        try {
            const collectionName = process.env.QDRANT_COLLECTION || 'mindmate-chats';
            
            // Generate embedding for the user ID to find similar conversations
            const userEmbedding = await geminiService.generateEmbedding(userId.toString());
            
            // Create the search request
            const searchResponse = await this.qdrant.search(collectionName, {
                vector: userEmbedding,
                limit: limit,
                filter: {
                    must: [
                        {
                            key: 'userId',
                            match: {
                                value: userId.toString()
                            }
                        }
                    ]
                }
            });

            console.log('Found', searchResponse.length, 'chat entries');

            if (!searchResponse.length) {
                console.log('No matches found in Qdrant');
                return [];
            }

            // Sort matches by timestamp
            return searchResponse
                .map(match => ({
                    id: match.id,
                    ...match.payload,
                    score: match.score
                }))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        } catch (error) {
            console.error('Error querying Qdrant:', error);
            console.log('Continuing without querying Qdrant');
            return [];
        }
    }

    async generateResponse(message, chatHistory) {
        return await geminiService.generateResponse(message, chatHistory);
    }

    async generateSummary(chatHistory) {
        return await geminiService.generateSummary(chatHistory);
    }
}

module.exports = new ChatService(); 