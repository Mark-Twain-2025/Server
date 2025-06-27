// 랭킹 반환 -기준1: todayLunch, 기준2: returnRate, 기준3: 공동순위
const express = require("express");
const router = express.Router();
const Investments = require("../models/Investment");

router.get("/", async (req, res, next) => {
  const { date } = req.query;

  try {
    if (!date) {
      return res
        .status(400)
        .json({ error: "Query parameter 'date' is required." });
    }

    // 오늘 데이터 조회
    const results = await Investments.find({ date });

    // 전날 데이터 조회
    const previousDate = getPreviousDate(date);
    const previousDayInvestments = await Investments.find({
      date: previousDate,
    }).select("user_id todayLunch");

    // 전날 데이터 매핑
    const prevLunchMap = {};
    previousDayInvestments.forEach((entry) => {
      prevLunchMap[entry.user_id] = entry.todayLunch;
    });

    // todayLunch, returnRate 계산
    const processed = results.map((doc) => {
      const todayLunch = Number(doc.todayLunch ?? 0);
      const prevLunch = Number(prevLunchMap[doc.user_id] ?? 0);
      const returnRate =
        prevLunch > 0
          ? Math.round(((todayLunch - prevLunch) / prevLunch) * 100)
          : null;

      return {
        user_id: doc.user_id,
        actual_return: doc.actual_return,
        todayLunch,
        returnRate,
      };
    });

    // 정렬: todayLunch ↓, returnRate ↓
    processed.sort((a, b) => {
      if (b.todayLunch !== a.todayLunch) {
        return b.todayLunch - a.todayLunch;
      } else {
        return (b.returnRate ?? -Infinity) - (a.returnRate ?? -Infinity);
      }
    });

    // 순위 부여
    let ranked = [];
    let currentRank = 1;
    let prev = null;

    for (let i = 0; i < processed.length; i++) {
      const item = processed[i];
      const key = `${item.todayLunch}|${item.returnRate}`;

      if (prev && key === prev) {
        // 같은 todayLunch & returnRate면 공동 순위
        // rank 유지
      } else {
        currentRank = i + 1;
        prev = key;
      }

      ranked.push({
        rank: currentRank,
        ...item,
      });
    }

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
  return date.toISOString().split("T")[0];
}

module.exports = router;
