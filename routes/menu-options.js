const express = require('express');
const router = express.Router();
const Menu = require("../models/Menu");
const Category = require("../models/Category");
const VoteBefore = require("../models/VoteBefore");
const VoteAfter = require("../models/VoteAfter");

// 모든 메뉴 데이터 조회 (디버깅용)
router.get("/debug", async (req, res, next) => {
  try {
    const allMenus = await Menu.find({});
    const allCategories = await Category.find({});
    const allVoteBefore = await VoteBefore.find({});
    const allVoteAfter = await VoteAfter.find({});
    
    res.json({
      menus: allMenus,
      categories: allCategories,
      voteBefore: allVoteBefore,
      voteAfter: allVoteAfter,
      menuCount: allMenus.length,
      categoryCount: allCategories.length,
      voteBeforeCount: allVoteBefore.length,
      voteAfterCount: allVoteAfter.length
    });
  } catch (err) {
    console.error("디버깅 조회 에러:", err);
    res.status(500).json({ error: "디버깅 조회 중 오류 발생" });
  }
});

// 메뉴 데이터 추가
router.post("/", async (req, res, next) => {
  try {
    const { date, category_id, total_investment, votes_before_lunch, votes_after_lunch, result_rank } = req.body;
    
    if (!date || category_id === undefined) {
      return res.status(400).json({ error: "날짜와 카테고리 ID는 필수입니다." });
    }
    
    const menu = new Menu({
      date,
      category_id,
      total_investment: total_investment || 0,
      votes_before_lunch: votes_before_lunch || 0,
      votes_after_lunch: votes_after_lunch || 0,
      result_rank: result_rank || 0
    });
    
    await menu.save();
    
    res.status(201).json(menu);
  } catch (err) {
    console.error("메뉴 추가 에러:", err);
    res.status(500).json({ error: "메뉴 추가 중 오류 발생" });
  }
});

// 메뉴 옵션 조회 (실제 투표 데이터 기반)
router.get("/", async (req, res, next) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "날짜 파라미터가 필요합니다." });
    }
    
    // 해당 날짜의 투표 데이터 조회
    const voteBeforeData = await VoteBefore.find({ date: date });
    const voteAfterData = await VoteAfter.find({ date: date });
    
    if (voteBeforeData.length === 0 && voteAfterData.length === 0) {
      return res.status(404).json({ error: "해당 날짜의 투표 데이터가 없습니다." });
    }
    
    // 카테고리 정보 조회
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
    
    // 카테고리별 투표 데이터 집계
    const categoryStats = {};
    
    // VoteBefore 데이터 처리
    voteBeforeData.forEach(vote => {
      const categoryId = vote.category_id;
      const categoryName = categoryMap[categoryId] || `카테고리${categoryId}`;
      
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          category: categoryName,
          totalInvestment: 0,
          votesBeforeLunch: 0,
          votersAfterLunch: [],
          resultRank: 0
        };
      }
      
      categoryStats[categoryName].totalInvestment += vote.amount;
      categoryStats[categoryName].votesBeforeLunch += 1;
    });
    
    // VoteAfter 데이터 처리
    voteAfterData.forEach(vote => {
      const categoryId = vote.category_id;
      const categoryName = categoryMap[categoryId] || `카테고리${categoryId}`;
      
      if (!categoryStats[categoryName]) {
        categoryStats[categoryName] = {
          category: categoryName,
          totalInvestment: 0,
          votesBeforeLunch: 0,
          votersAfterLunch: [],
          resultRank: 0
        };
      }
      
      // user_id를 배열에 추가 (중복 제거)
      if (!categoryStats[categoryName].votersAfterLunch.includes(vote.user_id)) {
        categoryStats[categoryName].votersAfterLunch.push(vote.user_id);
      }
    });
    
    // VoteAfter 투표 수 기준으로 순위 계산
    const sortedCategories = Object.values(categoryStats).sort((a, b) => {
      return b.votersAfterLunch.length - a.votersAfterLunch.length;
    });
    
    // 순위 부여 (공동 순위 처리)
    let currentRank = 1;
    let currentVoteCount = sortedCategories[0]?.votersAfterLunch.length || 0;
    
    sortedCategories.forEach((category, index) => {
      const voteCount = category.votersAfterLunch.length;
      
      if (voteCount < currentVoteCount) {
        currentRank = index + 1;
        currentVoteCount = voteCount;
      }
      
      category.resultRank = currentRank;
    });
    
    res.json(sortedCategories);
  } catch (err) {
    console.error("메뉴 옵션 조회 에러:", err);
    res.status(500).json({ error: "메뉴 옵션 조회 중 오류 발생" });
  }
});

module.exports = router; 