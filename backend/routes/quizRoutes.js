const express = require("express");
const router = express.Router();

const { generateQuiz, submitQuiz, getAttempt } = require("../controllers/QuizCont");

router.post("/", generateQuiz); 
router.post("/:id/submit", submitQuiz);
router.get("/:quizId/attempt", getAttempt);

module.exports = router;