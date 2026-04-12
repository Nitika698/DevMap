const axios = require("axios");

const generateRoadmapFromAI = async (topic, level, duration) => {
  try {
    console.log("📡 Calling AI Service...");

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/generate-roadmap`,
      {
        topic,
        level,
        duration
      }
    );

    console.log("✅ AI Response received");

    if (!response.data || response.data.status !== "success") {
      throw new Error("Invalid AI response");
    }

    return response.data.data;

  } catch (error) {
    console.error("❌ AI SERVICE ERROR:");

    if (error.response) {
      console.error("Response:", error.response.data);
    } else if (error.request) {
      console.error("No response from Flask");
    } else {
      console.error(error.message);
    }

    throw new Error("AI Service failed");
  }
};

module.exports = { generateRoadmapFromAI };