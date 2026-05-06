const Roadmap = require("../models/Roadmap");
const { generateRoadmapFromAI } = require("../services/aiService");

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

    const aiData = await generateRoadmapFromAI(cleanTopic, level, duration);

    console.log("🔥 AI RAW DATA:", JSON.stringify(aiData, null, 2));

    if (!aiData || !Array.isArray(aiData.topics)) {
      return res.status(500).json({
        message: "Invalid roadmap format from AI"
      });
    }

    const structuredRoadmap = {
      title: cleanTopic,
      status: "red",
      children: aiData.topics.map((mainTopic) => ({
        title: mainTopic.name || "Untitled Topic",
        type: "topic",
        status: "red",
        resources: mainTopic.resources || [],
        children: (mainTopic.subtopics || []).map((sub) => ({
          title: sub.name || "Untitled Subtopic",
          type: "subtopic",
          status: "red",
          resources: sub.resources || [],
          children: [] // future expansion
        }))
      }))
    };

    if (!structuredRoadmap.children.length) {
      return res.status(500).json({
        message: "AI generated empty roadmap"
      });
    }

    try {
      roadmap = await Roadmap.create({
        topic: cleanTopic,
        level,
        learningTime: duration,
        description:
          aiData.description ||
          `A personalized roadmap for learning ${cleanTopic}.`,
        roadmap: structuredRoadmap
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

    const roadmapDoc = await Roadmap.findById(id);

      if (!roadmapDoc) {
        return res.status(404).json({ message: "Roadmap not found" });
      }

      const updateStatus = (node) => {
        if (node.title === step) {
          node.status = status;
          return true;
        }

        if (node.children) {
          for (let child of node.children) {
            if (updateStatus(child)) return true;
          }
        }

        return false;
      };

      const updated = updateStatus(roadmapDoc.roadmap);

      if (!updated) {
        return res.status(404).json({
          message: "Step not found"
        });
      }

      await roadmapDoc.save();

      console.log(`📝 Step updated: ${step} → ${status}`);

      return res.status(200).json({
        message: "Step updated successfully",
        roadmap: roadmapDoc
      });

  } catch (error) {
    console.error("❌ Update Step Error:", error);

    return res.status(500).json({
      message: "Error updating roadmap step",
      error: error.message
    });
  }
};

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

exports.updateResourceComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { stepTitle, resourceLink, completed } = req.body;

    const roadmapDoc = await Roadmap.findById(id);
    if (!roadmapDoc) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    const updateNode = (node) => {
      if (node.title === stepTitle) {

        // Add or remove resource from completedResources
        if (completed) {
          if (!node.completedResources.includes(resourceLink)) {
            node.completedResources.push(resourceLink);
          }
        } else {
          node.completedResources = node.completedResources.filter(
            (r) => r !== resourceLink
          );
        }

        // Auto update status based on how many resources completed
        const total = node.resources.length;
        const done = node.completedResources.length;

        if (done === 0) node.status = "red";
        else if (done < total) node.status = "yellow";
        else node.status = "green";

        return true;
      }

      if (node.children) {
        for (let child of node.children) {
          if (updateNode(child)) return true;
        }
      }

      return false;
    };

    updateNode(roadmapDoc.roadmap);
    roadmapDoc.markModified("roadmap");
    await roadmapDoc.save();

    return res.status(200).json({ roadmap: roadmapDoc });

  } catch (error) {
    console.error("❌ Resource Update Error:", error);
    return res.status(500).json({ message: "Error updating resource", error: error.message });
  }
};