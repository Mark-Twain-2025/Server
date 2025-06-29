const express = require("express");
const QuizHistory = require("../models/Quiz_history");
const router = express.Router();
const mongoose = require("mongoose");

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

router.get("/:userId", async function (req, res) {
  const user_id = Number(req.params.userId);
  try {
    const count = await QuizHistory.countDocuments({
      user_id: user_id,
      is_correct: true,
    });
    res.status(200).json({ correctCount: count });
  } catch (err) {
    console.error("정답 수 조회 실패:", err);
    res.status(500).json({ error: "정답 수 조회 중 서버 오류" });
  }
});

module.exports = router;
