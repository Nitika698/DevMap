const express = require("express");
const router = express.Router();

const roadmapController = require("../controllers/roadmapController");

router.get("/", roadmapController.getAllRoadmaps);

router.get("/:topic", roadmapController.getOrCreateRoadmap);

router.put("/:id/update-step", roadmapController.updateRoadmapStep);

router.patch("/:id/resource", roadmapController.updateResourceComplete);
module.exports = router;