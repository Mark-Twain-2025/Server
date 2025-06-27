const VoteBefore = require("../models/VoteBefore");
const VoteAfter = require("../models/VoteAfter");
const getTodayStr = require("../utils/date");

async function getTodayMenuRanking() {
  const today = getTodayStr();

  // 오전 투표 집계
  const beforeVotes = await VoteBefore.aggregate([
    { $match: { date: today } },
    {
      $group: {
        _id: "$category_id",
        votes_before_lunch: { $sum: 1 },
        total_investment: { $sum: "$amount" },
      },
    },
  ]);

  // 오후 투표 집계
  const afterVotes = await VoteAfter.aggregate([
    { $match: { date: today } },
    {
      $group: {
        _id: "$category_id",
        votes_after_lunch: { $sum: 1 },
      },
    },
  ]);

  const beforeMap = {};
  for (const b of beforeVotes) {
    beforeMap[b._id] = {
      votes_before_lunch: b.votes_before_lunch,
      total_investment: b.total_investment,
    };
  }

  const ranked = afterVotes
    .sort((a, b) => b.votes_after_lunch - a.votes_after_lunch)
    .map((item, idx) => {
      const before = beforeMap[item._id] || {
        votes_before_lunch: 0,
        total_investment: 0,
      };

      return {
        result_rank: idx + 1,
        category_id: item._id,
        votes_after_lunch: item.votes_after_lunch,
        votes_before_lunch: before.votes_before_lunch,
        total_investment: before.total_investment,
      };
    });

  return ranked;
}

module.exports = { getTodayMenuRanking };
