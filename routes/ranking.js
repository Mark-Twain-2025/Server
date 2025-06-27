// 랭킹 반환 -기준1: todayLunch, 기준2: returnRate, 기준3: 공동순위
const express = require("express");
const router = express.Router();
const Investments = require("../models/Investment");

router.get("/daily", async (req, res, next) => {
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


router.get("/weekly", async (req, res) => {
  const { week } = req.query;

  let baseDate, targetDate;
  let baseValueForRanking; // 1주차 기준값 1000 고정, 2주차는 baseLunch 사용

  if (week === "1") {
    baseDate = null; // 1주차는 기준일 데이터 조회 안함 (기준값 1000 고정)
    targetDate = "2025-07-04";
    baseValueForRanking = 1000;
  } else if (week === "2") {
    baseDate = "2025-07-04";
    targetDate = "2025-07-11";
  } else {
    return res.status(400).json({ error: "week는 1 또는 2만 가능합니다." });
  }

  try {
    let baseInvestments = [];
    if (baseDate) {
      baseInvestments = await Investments.find({ date: baseDate }).select("user_id todayLunch");
    }

    const targetInvestments = await Investments.find({ date: targetDate }).select("user_id todayLunch");

    const baseMap = {};
    baseInvestments.forEach((item) => {
      baseMap[item.user_id] = item.todayLunch;
    });

    // 랭킹 산출용 배열 생성
    const rankingCandidates = targetInvestments.map((item) => {
      const baseLunch = baseDate ? (baseMap[item.user_id] ?? 0) : baseValueForRanking;
      const todayLunch = item.todayLunch;

      // 랭킹 기준 금액 계산
      const rankValue = week === "1"
        ? todayLunch - baseValueForRanking
        : todayLunch - baseLunch;

      // 수익률 계산
      const returnRate = baseLunch > 0 ? Math.round(todayLunch / baseLunch * 100)-100: null;

      return {
        user_id: item.user_id,
        baseLunch,
        todayLunch,
        rankValue,
        returnRate,
      };
    });

    // 1차: rankValue 내림차순 정렬
    rankingCandidates.sort((a, b) => b.rankValue - a.rankValue);

    // 동점자 처리 함수
    function assignRanks(arr) {
      const result = [];
      let currentRank = 1;

      for (let i = 0; i < arr.length; ) {
        // 같은 rankValue 그룹 찾기
        const sameRankGroup = arr.filter(x => x.rankValue === arr[i].rankValue);

        if (sameRankGroup.length === 1) {
          // 동점자가 없으면 바로 순위 부여
          sameRankGroup[0].rank = currentRank;
          result.push(sameRankGroup[0]);
          currentRank++;
          i++;
        } else {
          // 동점자가 여러명일 경우, returnRate로 다시 정렬 (내림차순)
          sameRankGroup.sort((a, b) => b.returnRate - a.returnRate);

          // returnRate 기준으로 또 동점 그룹 나눔 (연속된 그룹)
          let start = 0;
          while (start < sameRankGroup.length) {
            const currentReturn = sameRankGroup[start].returnRate;
            let end = start + 1;
            while (end < sameRankGroup.length && sameRankGroup[end].returnRate === currentReturn) {
              end++;
            }
            // 해당 그룹에 같은 rank 부여
            for (let j = start; j < end; j++) {
              sameRankGroup[j].rank = currentRank;
              result.push(sameRankGroup[j]);
            }
            currentRank += (end - start);
            start = end;
          }
          i += sameRankGroup.length;
        }
      }
      return result;
    }

    const finalRanking = assignRanks(rankingCandidates);

    res.status(200).json({ week, ranking: finalRanking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;  
