const express = require("express");
const Quiz = require("../models/Quiz");
const router = express.Router();

router.post("/", async (req, res, next) => {
  try {
    const { date, question, choices, answer_index, explanation } = req.body;

    if (!date || !question || !choices || answer_index === undefined) {
      return res.status(400).json({ error: "필수 항목 누락 " });
    }

    const quiz = new Quiz({
      date,
      question,
      choices,
      answer_index,
      explanation: explanation || "",
    });

    await quiz.save();

    res.status(201).json(quiz);
  } catch (err) {
    console.error("퀴즈 생성 에러:", err);
    res.status(500).json({ error: "퀴즈 생성 중 오류 발생" });
  }
});

// 특정 날짜 퀴즈 조회
router.get("/:date", async (req, res, next) => {
  try {
    const { date } = req.params;

    const quiz = await Quiz.findOne({ date: date });

    if (!quiz) {
      return res.status(404).json({ error: "해당 날짜의 퀴즈가 없습니다." });
    }

    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: "퀴즈 조회 중 오류 발생" });
  }
});

// 퀴즈 제출 API
router.post("/submit/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { selectedIndex } = req.body;
    const { date } = req.query; // 쿼리 파라미터로 날짜 받기

    if (selectedIndex === undefined) {
      return res.status(400).json({ error: "선택한 답안이 없음" });
    }

    if (!date) {
      return res.status(400).json({ error: "날짜 파라미터가 필요요" });
    }

    const quiz = await Quiz.findOne({ date: date });

    if (!quiz) {
      return res.status(404).json({ error: "해당 날짜의 퀴즈가 없음음" });
    }

    // 정답 여부
    const isCorrect = selectedIndex === quiz.answer_index;

    const response = {
      isCorrect: isCorrect,
      explanation: quiz.explanation || "",
      reward: isCorrect ? 30 : 0
    };

    res.json(response);
  } catch (err) {
    console.error("퀴즈 제출 에러:", err);
    res.status(500).json({ error: "퀴즈 제출 중 오류 발생" });
  }
});

module.exports = router;
