const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GEMINI_API_KEY } = require("../config/constants");

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function getTherapistResponse(chatHistory) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `
    Act as a mental health therapist. Respond empathetically in Hinglish.
    User history: ${JSON.stringify(chatHistory)}
    Current message: {USER_MESSAGE}
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { getTherapistResponse };