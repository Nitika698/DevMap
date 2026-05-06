const axios = require("axios");

exports.generateRoadmapFromAI = async (topic, level, duration) => {
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

exports.askQuiz = async (topic, difficulty, qtype) => {
  try {
    console.log("📡 Calling Quiz AI Service...");
    console.log("AI URL:", process.env.AI_SERVICE_URL);
    console.log("➡️ Data:", { topic, difficulty, qtype });

    const response = await axios.post(
      `${process.env.AI_SERVICE_URL}/generate-quiz`,
      {
        topic,
        difficulty,
        qtype
      }
    );

    console.log("✅ Quiz AI Response received");

    // 🔥 Validation (same as her style)
    if (!response.data || response.data.status !== "success") {
      throw new Error("Invalid Quiz AI response");
    }

    // 🔥 Return ONLY useful data
    return response.data.data;

  } catch (error) {
    console.error("❌ QUIZ AI ERROR:");

    if (error.response) {
      console.error("Response:", error.response.data);
    } else if (error.request) {
      console.error("No response from Flask");
    } else {
      console.error(error.message);
    }

    throw new Error("Quiz AI Service failed");
  }
};

// module.exports = { generateRoadmapFromAI, askQuiz };