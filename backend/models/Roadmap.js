const mongoose = require("mongoose");

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
  roadmap: [
    {
      step: {
        type: String,
        required: true
      },
      status: {
        type: String,
        enum: ["red", "yellow", "green"],
        default: "red"
      },
      resources: [
        {
          type: {
            type: String,
            enum: ["video", "article"]
          },
          title: String,
          link: String
        }
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Roadmap", roadmapSchema);