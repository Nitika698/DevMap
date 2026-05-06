const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["video", "article"],
    default: "article"
  },
  title: String,
  link: String
});

const nodeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ["topic", "subtopic"],
    default: "subtopic"
  },
  status: {
    type: String,
    enum: ["red", "yellow", "green"],
    default: "red"
  },
  resources: [resourceSchema],
  completedResources: [String], 
  children: []
});

nodeSchema.add({
  children: [nodeSchema]
});

const roadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  topic: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    default: "Beginner"
  },
  learningTime: {
    type: String,
    default: "3 Months"
  },
  description: {
    type: String,
    default: ""
  },

  roadmap: nodeSchema,

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Roadmap", roadmapSchema);