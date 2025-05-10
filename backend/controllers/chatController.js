const Chat = require("../models/Chat");
const { getTherapistResponse } = require("../services/geminiService");
const analyzeTone = require("../middlewares/toneAnalyzer");
const { SOS_CONTACT } = require("../config/constants");

async function handleChat(req, res) {
  const { userId, message } = req.body;

 
//   const { tone, risk } = await analyzeTone(message);
const {tone , risk} = {tone: "happy", risk: "low"}; 

  // 2. Crisis detection
  if (risk === "high") {
    await escalateToSOS(userId, message);
    return res.status(200).json({
      response: "We’re connecting you to help. Please hold on.",
      sosTriggered: true,
    });
  }

   
  const chatHistory = await Chat.find({ userId }).sort({ timestamp: 1 });
  const llmResponse = await getTherapistResponse(chatHistory, message);

 
  const newChat = new Chat({ userId, message, response: llmResponse, tone });
  await newChat.save();

  res.status(200).json({ response: llmResponse });
}

async function escalateToSOS(userId, message) {
  // Notify emergency contact (e.g., Twilio API)
  console.log(`ALERT: User ${userId} needs help. Message: ${message}`);
  // Implement SMS/email to SOS_CONTACT
}

module.exports = { handleChat };