require('dotenv').config();
const app = require("./app");
const mongoose = require('mongoose');
const winston = require('winston');
 
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: process.env.LOG_FILE_PATH || 'logs/app.log' }),
        new winston.transports.Console()
    ]
});
 
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    logger.info('Connected to MongoDB successfully');
    logger.info(`MongoDB URI: ${process.env.MONGODB_URI}`);
})
.catch((error) => {
    logger.error('MongoDB connection error:', error);
    logger.error('MongoDB URI:', process.env.MONGODB_URI);
    process.exit(1);
});

const PORT = process.env.PORT || 3000;
 
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});
 
process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});