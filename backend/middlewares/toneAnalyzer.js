// # Tone analysis proxy
const axios = require("axios");
const { ML_TONE_ANALYZER_URL } = require("../config/constants");

async function analyzeTone(text) {
  try {
    const response = await axios.post(ML_TONE_ANALYZER_URL, { text });
    return response.data.tone; // e.g., { tone: "depressed", risk: "high" }
  } catch (error) {
    console.error("Tone analysis failed:", error);
    return { tone: "neutral", risk: "low" };
  }
}

module.exports = analyzeTone;