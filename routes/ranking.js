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

    // 오늘 날짜 investment + user 조인
    const results = await Investments.aggregate([
      { $match: { date } },
      {
        $lookup: {
          from: "users",             // MongoDB 컬렉션 이름
          localField: "user_id",
          foreignField: "user_id",
          as: "user_info"
        }
      },
      { $unwind: "$user_info" },     // user_info 배열을 객체로 변환
      {
        $project: {
          user_id: 1,
          todayLunch: 1,
          actual_return: 1,
          name: "$user_info.name"
        }
      }
    ]);

    // 전날 데이터 조회
    const previousDate = getPreviousDate(date);
    const previousDayInvestments = await Investments.find({
      date: previousDate,
    }).select("user_id todayLunch");

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
        name: doc.name,
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
    let prevKey = null;

    for (let i = 0; i < processed.length; i++) {
      const item = processed[i];
      const key = `${item.todayLunch}|${item.returnRate}`;

      if (prevKey && key === prevKey) {
        // 공동 순위 유지
      } else {
        currentRank = i + 1;
        prevKey = key;
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
  let baseValueForRanking;

  if (week === "1") {
    baseDate = null;
    targetDate = "2025-07-04";
    baseValueForRanking = 1000;
  } else if (week === "2") {
    baseDate = "2025-07-04";
    targetDate = "2025-07-11";
  } else {
    return res.status(400).json({ error: "week는 1 또는 2만 가능합니다." });
  }

  try {
    // 기준일 데이터
    let baseInvestments = [];
    if (baseDate) {
      baseInvestments = await Investments.find({ date: baseDate }).select("user_id todayLunch");
    }

    // 대상일 데이터 + 이름 조인
    const targetInvestments = await Investments.aggregate([
      { $match: { date: targetDate } },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "user_id",
          as: "user_info"
        }
      },
      { $unwind: "$user_info" },
      {
        $project: {
          user_id: 1,
          todayLunch: 1,
          name: "$user_info.name"
        }
      }
    ]);

    // 기준 금액 매핑
    const baseMap = {};
    baseInvestments.forEach((item) => {
      baseMap[item.user_id] = item.todayLunch;
    });

    // 랭킹 계산
    const rankingCandidates = targetInvestments.map((item) => {
      const baseLunch = baseDate ? (baseMap[item.user_id] ?? 0) : baseValueForRanking;
      const todayLunch = item.todayLunch;

      const rankValue = week === "1"
        ? todayLunch - baseValueForRanking
        : todayLunch - baseLunch;

      const returnRate = baseLunch > 0
        ? Math.round((todayLunch / baseLunch) * 100) - 100
        : null;

      return {
        user_id: item.user_id,
        name: item.name,
        baseLunch,
        todayLunch,
        rankValue,
        returnRate,
      };
    });

    // 정렬
    rankingCandidates.sort((a, b) => b.rankValue - a.rankValue);

    // 동점자 처리
    function assignRanks(arr) {
      const result = [];
      let currentRank = 1;

      for (let i = 0; i < arr.length;) {
        const sameRankGroup = arr.filter(x => x.rankValue === arr[i].rankValue);

        if (sameRankGroup.length === 1) {
          sameRankGroup[0].rank = currentRank;
          result.push(sameRankGroup[0]);
          currentRank++;
          i++;
        } else {
          sameRankGroup.sort((a, b) => b.returnRate - a.returnRate);
          let start = 0;

          while (start < sameRankGroup.length) {
            const currentReturn = sameRankGroup[start].returnRate;
            let end = start + 1;

            while (
              end < sameRankGroup.length &&
              sameRankGroup[end].returnRate === currentReturn
            ) {
              end++;
            }

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
