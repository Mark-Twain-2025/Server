const express = require("express");
const QuizHistory = require("../models/Quiz_history");
const router = express.Router();

router.post("/", async function (req, res) {
  const data = req.body;

  const quiz = await QuizHistory.create({
    date: data.date,
    question: data.question,
    choices: data.choices,
    answer_index: data.answer_index,
    explanation: data.explanation || "",
  });

  res.json(quiz);
});
module.exports = router;
