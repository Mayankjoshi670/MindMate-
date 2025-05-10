const { PineconeClient } = require('@pinecone-database/pinecone');
require('dotenv').config();

async function testPinecone() {
    try {
        console.log('Testing Pinecone connection...');
        console.log('Environment:', process.env.PINECONE_ENVIRONMENT);
        console.log('Index Name:', process.env.PINECONE_INDEX_NAME);

        const pinecone = new PineconeClient();
        
        await pinecone.init({
            apiKey: process.env.PINECONE_API_KEY,
            environment: process.env.PINECONE_ENVIRONMENT
        });
        
        console.log('Successfully connected to Pinecone!');
        
        const indexes = await pinecone.listIndexes();
        console.log('Available indexes:', indexes);
        
        if (indexes.includes(process.env.PINECONE_INDEX_NAME)) {
            console.log('Index exists!');
        } else {
            console.log('Index does not exist, creating...');
            await pinecone.createIndex({
                createRequest: {
                    name: process.env.PINECONE_INDEX_NAME,
                    dimension: 768,
                    metric: 'cosine'
                }
            });
            console.log('Index created successfully!');
        }
    } catch (error) {
        console.error('Error testing Pinecone:', error);
    }
}

testPinecone(); 