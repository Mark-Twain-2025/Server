const express = require("express");
const router = express.Router();
const Investments = require("../models/Investment");

router.get("/", async (req, res, next) => {
  const { date } = req.query; // ❗ req.params → req.query 수정 (GET /?date=2024-06-27)

  try {
    if (!date) {
      return res.status(400).json({ error: "Query parameter 'date' is required." });
    }

    // 오늘 데이터 조회
    const results = await Investments.find({ date }).sort({
      actual_return: -1,
    });

    // 전날 데이터 조회
    const previousDate = getPreviousDate(date);
    const previousDayInvestments = await Investments.find({
      date: previousDate,
    }).select("user_id todayLunch");

    // 전날 데이터 user_id로 매핑
    const prevLunchMap = {};
    previousDayInvestments.forEach((entry) => {
      prevLunchMap[entry.user_id] = entry.todayLunch;
    });

    // 유저별 데이터 구성
    const ranked = results.map((doc, idx) => {
      const todayLunch = Number(doc.todayLunch);
      const prevLunch = Number(prevLunchMap[doc.user_id] ?? 0); // 없으면 0
    
      const returnRate = prevLunch > 0 ? todayLunch / prevLunch*100 : null;
    
      return {
        rank: idx + 1,
        user_id: doc.user_id,
        actual_return: doc.actual_return,
        todayLunch,
        returnRate,
      };
    });

    res.status(200).json({
      date,
      ranking: ranked,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
    next(err);
  }
});

function getPreviousDate(dateStr) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split("T")[0]; // YYYY-MM-DD 형식
}

module.exports = router;
