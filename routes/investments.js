const express = require("express");
const router = express.Router();
const Investments = require("../models/Investment");
const VoteAfter = require("../models/VoteAfter");
const Category = require("../models/Category");
const VoteBefore = require("../models/VoteBefore");
const Settlement = require("../models/Settlement");
const UserInfo = require("../models/UserInfo");


// 1. 구체적인 라우트 먼저!
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

    res.json({
      message: "투표 결과 조회 성공",
      date: date,
      categoryRankings: sortedCategories.map((cat) => ({
        category: categoryMap[cat.categoryId] || `카테고리${cat.categoryId}`,
        voteCount: cat.voteCount,
        rank: cat.rank,
      })),
    });
  } catch (err) {
    console.error("투표 결과 조회 에러:", err);
    res.status(500).json({ error: "투표 결과 조회 중 오류 발생" });
  }
});

router.get("/settlement-result/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: "날짜 파라미터가 필요합니다." });
    }

    // 오늘 날짜 확인
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();

    // 오전 11시 05분 이전이면 정산 중 메시지 반환
    if (date === today && (currentHour < 11 || (currentHour === 11 && currentMinute < 5))) {
      return res.status(200).json({
        status: "settling",
        message: "투표 결과 정산 중입니다. 기다려주세요.",
        settleTime: "오전 11시 05분"
      });
    }

    // Settlement 테이블에서 정산 결과 조회
    const settlement = await Settlement.findOne({
      user_id: Number(userId),
      date: date,
    });

    if (!settlement) {
      return res.status(404).json({ 
        error: "해당 날짜의 정산 결과가 없습니다.",
        message: "아직 정산이 완료되지 않았거나 투자 기록이 없습니다."
      });
    }

    // 카테고리 정보 조회
    const category = await Category.findOne({ id: settlement.category_id });
    const categoryName = category ? category.name : `카테고리${settlement.category_id}`;

    res.status(200).json({
      status: "settled",
      user_id: userId,
      date: date,
      category: categoryName,
      rank: settlement.rank,
      investment_amount: settlement.investment_amount,
      actual_return: settlement.actual_return,
      profit: settlement.profit,
      coins_paid: settlement.coins_paid,
      settled_at: settlement.settled_at
    });
  } catch (err) {
    console.error("정산 결과 조회 에러:", err);
    res.status(500).json({ error: "정산 결과 조회 중 오류 발생" });
  }
});

router.post("/settle-daily", async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    console.log(`[${new Date().toISOString()}] 일일 정산 시작: ${today}`);

    // 해당 날짜의 VoteAfter 데이터 조회 (순위 결정용)
    const voteAfterData = await VoteAfter.find({ date: today });

    if (voteAfterData.length === 0) {
      console.log(`[${new Date().toISOString()}] ${today} 투표 데이터 없음`);
      return res.status(404).json({ error: "해당 날짜의 투표 데이터가 없습니다." });
    }

    // 해당 날짜의 VoteBefore 데이터 조회 (정산 대상자 확인용)
    const voteBeforeData = await VoteBefore.find({ date: today });
    
    if (voteBeforeData.length === 0) {
      console.log(`[${new Date().toISOString()}] ${today} 투자 데이터 없음`);
      return res.status(404).json({ error: "해당 날짜의 투자 데이터가 없습니다." });
    }

    // VoteBefore에 투표한 사용자 ID 목록 생성
    const voteBeforeUserIds = voteBeforeData.map(vote => vote.user_id);
    console.log(`[${new Date().toISOString()}] 투자 참여자 수: ${voteBeforeUserIds.length}명`);

    // 카테고리 정보 조회
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat.name;
    });

    // 카테고리별 투표 수 집계 (VoteAfter 기준)
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

    // Investment 테이블 업데이트 및 정산 처리
    const settlementResults = [];
    let totalSettledUsers = 0;

    for (const categoryRank of sortedCategories) {
      const { categoryId, rank } = categoryRank;
      const multiplier = getReturnMultiplier(rank);

      // 해당 카테고리의 investment들 찾기 (VoteBefore에 투표한 사람들만)
      const investments = await Investments.find({
        date: today,
        category_id: categoryId,
        user_id: { $in: voteBeforeUserIds } // VoteBefore에 투표한 사람들만 필터링
      });

      // 각 investment 정산 처리
      for (const investment of investments) {
        const actualReturn = Math.round(investment.amount * multiplier);
        const profit = actualReturn - investment.amount;

        // Investment 테이블 업데이트
        await Investments.findByIdAndUpdate(
          investment._id,
          {
            actual_return: actualReturn,
            rank: rank,
          },
          { new: true }
        );

        // Settlement 테이블에 정산 내역 저장 (중복 방지)
        try {
          const settlement = await Settlement.create({
            user_id: investment.user_id,
            date: today,
            investment_amount: investment.amount,
            actual_return: actualReturn,
            profit: profit,
            category_id: categoryId,
            rank: rank,
            coins_paid: actualReturn
          });

          // UserInfo 테이블의 코인 업데이트
          await UserInfo.findOneAndUpdate(
            { user_id: investment.user_id },
            { 
              $inc: { 
                coins: actualReturn,
                total_profit: profit,
                total_participation: 1
              }
            }
          );

          settlementResults.push({
            user_id: investment.user_id,
            category: categoryMap[categoryId] || `카테고리${categoryId}`,
            rank: rank,
            investment_amount: investment.amount,
            actual_return: actualReturn,
            profit: profit,
            coins_paid: actualReturn
          });

          totalSettledUsers++;
        } catch (settlementError) {
          // 이미 정산된 경우 무시
          if (settlementError.code === 11000) {
            console.log(`[${new Date().toISOString()}] 이미 정산된 사용자: ${investment.user_id}`);
            continue;
          }
          throw settlementError;
        }
      }
    }

    console.log(`[${new Date().toISOString()}] 일일 정산 완료: ${totalSettledUsers}명 정산됨`);

    res.json({
      message: "일일 정산이 완료되었습니다.",
      date: today,
      totalSettledUsers: totalSettledUsers,
      categoryRankings: sortedCategories.map((cat) => ({
        category: categoryMap[cat.categoryId] || `카테고리${cat.categoryId}`,
        voteCount: cat.voteCount,
        rank: cat.rank,
        multiplier: getReturnMultiplier(cat.rank),
      })),
      settlements: settlementResults
    });
  } catch (err) {
    console.error("일일 정산 에러:", err);
    res.status(500).json({ error: "일일 정산 중 오류 발생" });
  }
});

router.post("/settle-test", async (req, res, next) => {
  try {
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    console.log(`[${new Date().toISOString()}] 수동 정산 테스트 시작: ${targetDate}`);

    // 해당 날짜의 VoteAfter 데이터 조회 (순위 결정용)
    const voteAfterData = await VoteAfter.find({ date: targetDate });

    if (voteAfterData.length === 0) {
      console.log(`[${new Date().toISOString()}] ${targetDate} 투표 데이터 없음`);
      return res.status(404).json({ error: "해당 날짜의 투표 데이터가 없습니다." });
    }

    // 해당 날짜의 VoteBefore 데이터 조회 (정산 대상자 확인용)
    const voteBeforeData = await VoteBefore.find({ date: targetDate });
    
    if (voteBeforeData.length === 0) {
      console.log(`[${new Date().toISOString()}] ${targetDate} 투자 데이터 없음`);
      return res.status(404).json({ error: "해당 날짜의 투자 데이터가 없습니다." });
    }

    // VoteBefore에 투표한 사용자 ID 목록 생성
    const voteBeforeUserIds = voteBeforeData.map(vote => vote.user_id);
    console.log(`[${new Date().toISOString()}] 투자 참여자 수: ${voteBeforeUserIds.length}명`);

    // 카테고리 정보 조회
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat.name;
    });

    // 카테고리별 투표 수 집계 (VoteAfter 기준)
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

    // Investment 테이블 업데이트 및 정산 처리
    const settlementResults = [];
    let totalSettledUsers = 0;

    for (const categoryRank of sortedCategories) {
      const { categoryId, rank } = categoryRank;
      const multiplier = getReturnMultiplier(rank);

      // 해당 카테고리의 investment들 찾기 (VoteBefore에 투표한 사람들만)
      const investments = await Investments.find({
        date: targetDate,
        category_id: categoryId,
        user_id: { $in: voteBeforeUserIds } // VoteBefore에 투표한 사람들만 필터링
      });

      // 각 investment 정산 처리
      for (const investment of investments) {
        const actualReturn = Math.round(investment.amount * multiplier);
        const profit = actualReturn - investment.amount;

        // Investment 테이블 업데이트
        await Investments.findByIdAndUpdate(
          investment._id,
          {
            actual_return: actualReturn,
            rank: rank,
          },
          { new: true }
        );

        // Settlement 테이블에 정산 내역 저장 (중복 방지)
        try {
          const settlement = await Settlement.create({
            user_id: investment.user_id,
            date: targetDate,
            investment_amount: investment.amount,
            actual_return: actualReturn,
            profit: profit,
            category_id: categoryId,
            rank: rank,
            coins_paid: actualReturn
          });

          // UserInfo 테이블의 코인 업데이트
          await UserInfo.findOneAndUpdate(
            { user_id: investment.user_id },
            { 
              $inc: { 
                coins: actualReturn,
                total_profit: profit,
                total_participation: 1
              }
            }
          );

          settlementResults.push({
            user_id: investment.user_id,
            category: categoryMap[categoryId] || `카테고리${categoryId}`,
            rank: rank,
            investment_amount: investment.amount,
            actual_return: actualReturn,
            profit: profit,
            coins_paid: actualReturn
          });

          totalSettledUsers++;
        } catch (settlementError) {
          // 이미 정산된 경우 무시
          if (settlementError.code === 11000) {
            console.log(`[${new Date().toISOString()}] 이미 정산된 사용자: ${investment.user_id}`);
            continue;
          }
          throw settlementError;
        }
      }
    }

    console.log(`[${new Date().toISOString()}] 수동 정산 테스트 완료: ${totalSettledUsers}명 정산됨`);

    res.json({
      message: "수동 정산 테스트가 완료되었습니다.",
      date: targetDate,
      totalSettledUsers: totalSettledUsers,
      categoryRankings: sortedCategories.map((cat) => ({
        category: categoryMap[cat.categoryId] || `카테고리${cat.categoryId}`,
        voteCount: cat.voteCount,
        rank: cat.rank,
        multiplier: getReturnMultiplier(cat.rank),
      })),
      settlements: settlementResults
    });
  } catch (err) {
    console.error("수동 정산 테스트 에러:", err);
    res.status(500).json({ error: "수동 정산 테스트 중 오류 발생" });
  }
});

// 2. 그 다음에 파라미터 라우트!
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

router.patch("/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { date, category_id } = req.body;

    if (!date || !category_id) {
      return res
        .status(400)
        .json({ error: "date와 category_id가 필요합니다." });
    }

    // 해당 사용자의 해당 날짜 투자 기록 찾기
    const investment = await Investments.findOne({
      user_id: Number(userId),
      date: date,
    });

    if (!investment) {
      return res
        .status(404)
        .json({ error: "해당 투자 기록을 찾을 수 없습니다." });
    }

    // 카테고리 업데이트
    const updatedInvestment = await Investments.findByIdAndUpdate(
      investment._id,
      { category_id: category_id },
      { new: true }
    );

    res.status(200).json({
      message: "투자 카테고리가 성공적으로 업데이트되었습니다.",
      investment: updatedInvestment,
    });
  } catch (err) {
    console.error("투자 카테고리 업데이트 에러:", err);
    res.status(500).json({ error: "투자 카테고리 업데이트 중 오류 발생" });
  }
});

module.exports = router;
