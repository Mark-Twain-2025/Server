const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizHistory = require("../models/Quiz_history");
const UserInfo = require("../models/UserInfo");
const User = require("../models/User");
const router = express.Router();
const Counter = require("../models/Counter");

// 랜덤 퀴즈 조회 (1~10 ID 중에서)
router.get("/random", async (req, res, next) => {
  try {
    // 1~10 사이의 랜덤 ID 생성
    const randomId = Math.floor(Math.random() * 10) + 1;

    const quiz = await Quiz.findOne({ id: randomId });

    if (!quiz) {
      return res.status(404).json({ error: "해당 ID의 퀴즈가 없습니다." });
    }

    res.json(quiz);
  } catch (err) {
    console.error("랜덤 퀴즈 조회 에러:", err);
    res.status(500).json({ error: "랜덤 퀴즈 조회 중 오류 발생" });
  }
});

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
// quiz.js 라우트 수정
router.post("/submit", async (req, res, next) => {

  try {
    const { selectedIndex, quizId } = req.body;
    const now = new Date();
    const today = now.toLocaleDateString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\. /g, '-').replace(/\./g, '');
    console.log("받은 quizId:", quizId);

    // JWT 토큰에서 user_id 추출
    const token = req.cookies.AuthToken;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "MyJWT");
    const userObjectId = decoded.user_id || decoded._id;

    // user_id로 사용자 찾기
    const user = await User.findOne({ user_id: userObjectId });
    if (!user) {
      return res.status(404).json({ error: "사용자를 찾을 수 없습니다." });
    }

    const user_id = user.user_id; // Number 타입의 user_id

    // 오늘 이미 퀴즈를 풀었는지 확인
    const existingHistory = await QuizHistory.findOne({
      user_id: user_id, // Number 타입의 user_id 사용
      date: today
    });

    if (existingHistory) {
      return res.status(400).json({ error: "오늘 이미 퀴즈를 풀었습니다." });
    }

    // 정수형 id로 퀴즈 검색
    let quiz = await Quiz.findOne({ id: quizId });
    console.log("findOne으로 찾은 quiz:", quiz);

    if (!quiz) {
      return res.status(404).json({ error: "퀴즈를 찾을 수 없습니다." });
    }

    const isCorrect = selectedIndex === quiz.answer_index;

    // Counter를 사용하여 QuizHistory의 id 생성
    const counter = await Counter.findOneAndUpdate(
      { model: "QuizHistory" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );

    // 퀴즈 히스토리 저장
    await QuizHistory.create({
      id: counter.count,
      user_id: user_id, // Number 타입의 user_id 사용
      quiz_id: quiz._id,
      selected_index: selectedIndex,
      is_correct: isCorrect,
      date: today
    });

    // 정답 시 코인 지급
    let updatedCoins = 0;
    if (isCorrect) {
      console.log(`정답! 사용자 ${user_id}에게 30 코인 지급`);

      // UserInfo가 없으면 생성, 있으면 업데이트
      const userInfo = await UserInfo.findOneAndUpdate(
        { user_id: user_id }, // Number 타입의 user_id 사용
        {
          $inc: { coins: 30 },
          $setOnInsert: {
            total_profit: 0,
            correct_prediction_count: 0,
            total_participation: 0
          }
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true
        }
      );

      updatedCoins = userInfo.coins;
      console.log(`코인 지급 완료. 현재 보유 코인: ${updatedCoins}`);
    }

    res.json({
      isCorrect: isCorrect,
      explanation: quiz.explanation,
      reward: isCorrect ? 30 : 0,
      updatedCoins: updatedCoins
    });
  } catch (err) {
    console.error("퀴즈 제출 에러:", err);
    res.status(500).json({ error: "퀴즈 제출 오류" });
  }
});

module.exports = router;
