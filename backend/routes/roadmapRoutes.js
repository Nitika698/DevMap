const express = require("express");
const router = express.Router();

const roadmapController = require("../controllers/roadmapController");

// ✅ GET all roadmaps
router.get("/", roadmapController.getAllRoadmaps);

// ✅ 🔥 IMPORTANT: THIS MUST BE CORRECT
router.get("/:topic", roadmapController.getOrCreateRoadmap);

// ✅ update step
router.put("/:id/update-step", roadmapController.updateRoadmapStep);

module.exports = router;