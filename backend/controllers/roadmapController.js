const Roadmap = require("../models/Roadmap");
const { generateRoadmapFromAI } = require("../services/aiService");

// =======================================
// GET OR CREATE ROADMAP
// =======================================
exports.getOrCreateRoadmap = async (req, res) => {
  try {
    const { topic } = req.params;
    const level = req.query.level?.trim() || "Beginner";
    const duration = req.query.duration?.trim() || "3 Months";

    if (!topic || !topic.trim()) {
      return res.status(400).json({
        message: "Topic is required"
      });
    }

    const cleanTopic = decodeURIComponent(topic).trim();

    console.log("📘 Topic:", cleanTopic);
    console.log("🎯 Level:", level);
    console.log("⏳ Duration:", duration);

    // =======================================
    // 1. CHECK DATABASE
    // =======================================
    let roadmap = await Roadmap.findOne({
      topic: { $regex: new RegExp(`^${cleanTopic}$`, "i") },
      level,
      learningTime: duration
    });

    if (roadmap) {
      console.log("✅ Roadmap found in database");
      return res.status(200).json({
        source: "database",
        roadmap
      });
    }

    console.log("⚡ Generating roadmap from AI...");

    // =======================================
    // 2. CALL AI SERVICE
    // =======================================
    const aiData = await generateRoadmapFromAI(cleanTopic, level, duration);

    console.log("🔥 AI RAW DATA:", JSON.stringify(aiData, null, 2));

    if (!aiData || !Array.isArray(aiData.topics)) {
      return res.status(500).json({
        message: "Invalid roadmap format from AI"
      });
    }

    // =======================================
    // 3. FORMAT DATA SAFELY
    // =======================================
    const steps = [];

    aiData.topics.forEach((mainTopic) => {

      // Main topic
      if (mainTopic?.name) {
        steps.push({
          step: mainTopic.name,
          status: "red",
          resources: []
        });
      }

      // Subtopics (SAFE CHECK)
      if (Array.isArray(mainTopic?.subtopics)) {
        mainTopic.subtopics.forEach((sub) => {
          steps.push({
            step: sub?.name || "Untitled Subtopic",
            status: "red",
            resources: sub?.resources || []
          });
        });
      }

    });

    // Prevent empty roadmap
    if (steps.length === 0) {
      return res.status(500).json({
        message: "AI generated empty roadmap"
      });
    }

    // =======================================
    // 4. SAVE TO DATABASE (SAFE)
    // =======================================
    try {
      roadmap = await Roadmap.create({
        topic: cleanTopic,
        level,
        learningTime: duration,
        description:
          aiData.description ||
          `A personalized roadmap for learning ${cleanTopic}.`,
        roadmap: steps
      });

      console.log("💾 New roadmap saved");

    } catch (err) {

      // Handle duplicate key safely
      if (err.code === 11000) {
        console.log("⚠️ Duplicate roadmap detected, fetching existing...");

        roadmap = await Roadmap.findOne({
          topic: cleanTopic,
          level,
          learningTime: duration
        });

      } else {
        throw err;
      }
    }

    return res.status(200).json({
      source: "ai",
      roadmap
    });

  } catch (error) {
    console.error("❌ Get/Create Roadmap Error:", error);

    return res.status(500).json({
      message: "Server error while fetching roadmap",
      error: error.message
    });
  }
};

// =======================================
// UPDATE ROADMAP STEP STATUS
// =======================================
exports.updateRoadmapStep = async (req, res) => {
  try {
    const { id } = req.params;
    const { step, status } = req.body;

    if (!step || !status) {
      return res.status(400).json({
        message: "Step and status are required"
      });
    }

    if (!["red", "yellow", "green"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value"
      });
    }

    const updated = await Roadmap.findOneAndUpdate(
      {
        _id: id,
        "roadmap.step": step
      },
      {
        $set: { "roadmap.$.status": status }
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Roadmap or step not found"
      });
    }

    console.log(`📝 Step updated: ${step} → ${status}`);

    return res.status(200).json({
      message: "Step updated successfully",
      roadmap: updated
    });

  } catch (error) {
    console.error("❌ Update Step Error:", error);

    return res.status(500).json({
      message: "Error updating roadmap step",
      error: error.message
    });
  }
};

// =======================================
// GET ALL ROADMAPS
// =======================================
exports.getAllRoadmaps = async (req, res) => {
  try {
    const roadmaps = await Roadmap.find().sort({ createdAt: -1 });

    return res.status(200).json({
      roadmaps
    });

  } catch (error) {
    console.error("❌ Get All Roadmaps Error:", error);

    return res.status(500).json({
      message: "Error fetching roadmaps",
      error: error.message
    });
  }
};