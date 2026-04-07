const axios = require("axios");

const OLLAMA_URL = process.env.OLLAMA_URL || "http://ollama:11434";
const MODEL = "tinyllama";

/**
 * Get AI travel recommendations for a listing
 * @param {Object} listing - listing details
 * @param {string} listing.title - listing title
 * @param {string} listing.location - listing location
 * @param {string} listing.country - listing country
 * @param {string} listing.description - listing description
 * @param {number} listing.price - listing price
 * @returns {Promise<string>} - AI generated travel tips
 */
const getTravelRecommendations = async (listing) => {
  const prompt = `You are a helpful travel assistant. Based on the following travel listing, provide 3 short and practical travel tips for a visitor. Keep each tip to 1-2 sentences. Be friendly and enthusiastic.

Listing: ${listing.title}
Location: ${listing.location}, ${listing.country}
Description: ${listing.description || "A wonderful place to stay"}
Price per night: $${listing.price}

Give exactly 3 travel tips numbered 1, 2, 3. Focus on local experiences, best time to visit, and what to pack or prepare.`;

  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 300,
        },
      },
      {
        timeout: 60000, // 60 seconds timeout
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data.response;
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error("AI service is not available. Please try again later.");
    }
    if (error.code === "ECONNABORTED") {
      throw new Error("AI service timed out. Please try again.");
    }
    throw new Error("Failed to get AI recommendations: " + error.message);
  }
};

/**
 * Chat with the AI travel assistant
 * @param {string} message - user message
 * @param {Array} history - conversation history [{role, content}]
 * @param {Object|null} listing - optional listing context
 * @returns {Promise<string>} - AI response
 */
const chat = async (message, history = [], listing = null) => {
  // Build system prompt based on context
  let systemPrompt = `You are a friendly travel assistant for WanderLust, a travel accommodation platform. 
Help users with travel planning, destination tips, packing advice, local experiences, and accommodation questions.
Keep responses concise and friendly. Max 3-4 sentences per response.`;

  if (listing) {
    systemPrompt += `\n\nThe user is currently viewing this listing:
- Name: ${listing.title}
- Location: ${listing.location}, ${listing.country}
- Price: $${listing.price}/night
- Description: ${listing.description || "A wonderful place to stay"}
You can answer questions specifically about this listing as well as general travel questions.`;
  }

  // Build conversation as a single prompt with history
  let fullPrompt = `${systemPrompt}\n\n`;

  // Add conversation history
  for (const msg of history) {
    if (msg.role === "user") {
      fullPrompt += `User: ${msg.content}\n`;
    } else {
      fullPrompt += `Assistant: ${msg.content}\n`;
    }
  }

  // Add current message
  fullPrompt += `User: ${message}\nAssistant:`;

  try {
    const response = await axios.post(
      `${OLLAMA_URL}/api/generate`,
      {
        model: MODEL,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.8,
          num_predict: 200,
          stop: ["User:", "\nUser:"],
        },
      },
      {
        timeout: 60000,
        headers: { "Content-Type": "application/json" },
      }
    );

    return response.data.response.trim();
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      throw new Error("AI service is not available. Please try again later.");
    }
    if (error.code === "ECONNABORTED") {
      throw new Error("AI service timed out. Please try again.");
    }
    throw new Error("Chat failed: " + error.message);
  }
};

module.exports = { getTravelRecommendations, chat };
