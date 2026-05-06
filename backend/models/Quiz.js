const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  topic: { type: String, required: true },

  difficulty: {
    type: String,
    enum: ['Beginner','Intermediate','Advanced'],
    required: true
  },

  // 🔥 FIXED HERE
  type: {
    type: String,
    enum: ['mcq', 'theory'],  // 👈 allow what you're actually using
    required: true,
    lowercase: true           // 👈 auto-normalizes
  },

  questions: [
    {
      question: String,
      options: {
        A: String,
        B: String,
        C: String,
        D: String
      },
      answer: String,
      topic: String
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);