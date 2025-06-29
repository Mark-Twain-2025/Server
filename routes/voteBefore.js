const express = require("express");
const router = express.Router();
const VoteBefore = require("../models/VoteBefore");
const VoteAfter = require("../models/VoteAfter");
const UserInfo = require("../models/UserInfo");
// 테스트용 더미 데이터 생성 API 삭제

router.post("/:userId", async (req, res, next) => {
  try {
    const { category_id, amount, date } = req.body;
    const { userId } = req.params;

    const userInfo = await UserInfo.findOne({ user_id: parseInt(userId) });
    if (!userInfo) {
      return res.status(404).json({ error: "유저 정보를 찾을 수 없습니다." });
    }
    if (userInfo.coins < amount) {
      return res.status(400).json({ error: "보유 코인이 부족합니다." });
    }
    console.log(req.body);
    const votebefore = await VoteBefore.create({
      user_id: userId,
      date: date,
      category_id: category_id,
      amount: amount,
    });
    // user_info의 coins 수 차감
    userInfo.coins -= amount;
    await userInfo.save();

    console.log("성공!!");
    res.status(201).json({
      vote: votebefore,
      remainingCoins: userInfo.coins,
    });
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
    const votebefore = await VoteBefore.find({
      user_id: Number(userId),
      date: date,
    });
    res.status(200).json(votebefore);
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

router.patch("/:voteId", async (req, res) => {
  try {
    const { voteId } = req.params;
    const { category_id } = req.body;

    if (!category_id) {
      return res.status(400).json({ error: "category_id가 필요합니다." });
    }

    const updatedVote = await VoteBefore.findByIdAndUpdate(
      voteId,
      { category_id },
      { new: true }
    );

    if (!updatedVote) {
      return res
        .status(404)
        .json({ error: "해당 투표 정보를 찾을 수 없습니다." });
    }

    res.status(200).json(updatedVote);
  } catch (err) {
    console.error("PATCH 투표 수정 오류:", err);
    res.status(500).json({ error: "서버 오류" });
  }
});

module.exports = router;
