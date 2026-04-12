const express = require("express");
const router = express.Router();
const Roadmap = require("../models/Roadmap");

// GET ROADMAP BY TOPIC
router.get("/:topic", async (req, res) => {
  try {
    const { topic } = req.params;

    const roadmap = await Roadmap.findOne({
      topic: { $regex: `^${topic}$`, $options: "i" },
    });

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    res.json(roadmap);
  } catch (error) {
    console.log("Roadmap Fetch Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;