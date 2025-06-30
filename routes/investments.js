const express = require("express");
const router = express.Router();
const Investments = require("../models/Investment");
const VoteAfter = require("../models/VoteAfter");
const Category = require("../models/Category");
const VoteBefore = require("../models/VoteBefore");

// 투표 결과에 따른 수익률 계산 및 업데이트
router.get("/result", async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "날짜 파라미터가 필요합니다." });
    }

    // 해당 날짜의 VoteAfter 데이터 조회
    const voteAfterData = await VoteAfter.find({ date: date });

    if (voteAfterData.length === 0) {
      return res
        .status(404)
        .json({ error: "해당 날짜의 투표 데이터가 없습니다." });
    }

    // 카테고리 정보 조회
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat.name;
    });

    // 카테고리별 투표 수 집계
    const categoryVoteCounts = {};
    voteAfterData.forEach((vote) => {
      const categoryId = vote.category_id;
      if (!categoryVoteCounts[categoryId]) {
        categoryVoteCounts[categoryId] = 0;
      }
      categoryVoteCounts[categoryId]++;
    });

    // 투표 수 기준으로 순위 계산 (공동 순위 처리)
    const sortedCategories = Object.entries(categoryVoteCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([categoryId, voteCount], index, array) => {
        let rank = index + 1;
        // 공동 순위 처리
        if (index > 0 && voteCount === array[index - 1][1]) {
          rank = array.findIndex(([, count]) => count === voteCount) + 1;
        }
        return { categoryId: parseInt(categoryId), voteCount, rank };
      });

    // 수익률 배수 정의
    const getReturnMultiplier = (rank) => {
      switch (rank) {
        case 1:
          return 3.0; // 1위: 3배
        case 2:
          return 2.0; // 2위: 2배
        case 3:
          return 1.0; // 3위: 원금
        case 4:
          return 0.8; // 4위: 0.8배
        case 5:
          return 0.5; // 5위: 0.5배
        default:
          return 0.0; // 그 외: 0배
      }
    };

    // Investment 테이블 업데이트
    const updatedInvestments = [];

    for (const categoryRank of sortedCategories) {
      const { categoryId, rank } = categoryRank;
      const multiplier = getReturnMultiplier(rank);

      // 해당 카테고리의 investment들 찾기
      const investments = await Investments.find({
        date: date,
        category_id: categoryId,
      });

      // 각 investment 업데이트
      for (const investment of investments) {
        const actualReturn = Math.round(investment.amount * multiplier);

        const updatedInvestment = await Investments.findByIdAndUpdate(
          investment._id,
          {
            actual_return: actualReturn,
            rank: rank,
          },
          { new: true }
        );

        updatedInvestments.push(updatedInvestment);
      }
    }

    res.json({
      message: "투표 결과에 따른 수익률이 업데이트되었습니다.",
      date: date,
      categoryRankings: sortedCategories.map((cat) => ({
        category: categoryMap[cat.categoryId] || `카테고리${cat.categoryId}`,
        voteCount: cat.voteCount,
        rank: cat.rank,
        multiplier: getReturnMultiplier(cat.rank),
      })),
      updatedInvestments: updatedInvestments.length,
    });
  } catch (err) {
    console.error("수익률 계산 에러:", err);
    res.status(500).json({ error: "수익률 계산 중 오류 발생" });
  }
});

router.post("/:userId", async (req, res, next) => {
  try {
    const { category_id, amount, actual_return, rank, todayLunch, date } =
      req.body;
    const { userId } = req.params;
    console.log(req.body);
    const investment = await Investments.create({
      user_id: userId,
      date: date,
      category_id: category_id,
      amount: amount,
      actual_return: actual_return,
      rank: rank,
      todayLunch: todayLunch,
    });
    res.status(201).json(investment);
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

router.get("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    console.log(req.params);
    console.log(req.query);
    if (!date) {
      return res
        .status(400)
        .json({ error: "Query parameter 'date' is required." });
    }
    const investment = await Investments.find({
      user_id: Number(userId),
      date: date,
    });
    res.status(200).json(investment);
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

// 특정 user_id의 investment 정산 결과 조회
router.get("/settlement/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res
        .status(400)
        .json({ error: "Query parameter 'date' is required." });
    }

    const investments = await Investments.find({
      user_id: Number(userId),
      date: date,
    });

    if (!investments || investments.length === 0) {
      return res
        .status(404)
        .json({ error: "해당 유저의 investment 데이터가 없습니다." });
    }

    res.status(200).json({
      user_id: userId,
      date: date,
      investments: investments,
    });
  } catch (err) {
    console.error("정산 결과 조회 에러:", err);
    res.status(500).json({ error: "정산 결과 조회 중 오류 발생" });
  }
});

//mypage용
router.get("/history/:userId", async function (req, res) {
  const user_id = Number(req.params.userId);

  try {
    const history = await Investments.find({ user_id }).sort({ date: 1 });

    const myLunchHistory = history.map((item) => item.todayLunch);
    const investmentHistory = history.map((item) => [
      item.date,
      item.category_id,
      item.rank,
      item.actual_return,
    ]);

    res.status(200).json({
      myLunchHistory,
      investmentHistory,
    });
  } catch (err) {
    console.error("투자 이력 조회 실패:", err);
    res.status(500).json({ error: "서버 오류로 이력 조회 실패" });
  }
});

// 투자 카테고리 업데이트
router.patch("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date, category_id } = req.body;

    if (!date || !category_id) {
      return res.status(400).json({ error: "date와 category_id가 필요합니다." });
    }

    // 해당 사용자의 해당 날짜 투자 기록 찾기
    const investment = await Investments.findOne({
      user_id: Number(userId),
      date: date,
    });

    if (!investment) {
      return res.status(404).json({ error: "해당 투자 기록을 찾을 수 없습니다." });
    }

    // 카테고리 업데이트
    const updatedInvestment = await Investments.findByIdAndUpdate(
      investment._id,
      { category_id: category_id },
      { new: true }
    );

    res.status(200).json({
      message: "투자 카테고리가 성공적으로 업데이트되었습니다.",
      investment: updatedInvestment
    });
  } catch (err) {
    console.error("투자 카테고리 업데이트 에러:", err);
    res.status(500).json({ error: "투자 카테고리 업데이트 중 오류 발생" });
  }
});

module.exports = router;
