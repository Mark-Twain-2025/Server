const express = require("express");
const router = express.Router();
const UserInfo = require("../models/UserInfo");

router.get("/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const userInfo = await UserInfo.findOne({ user_id: parseInt(user_id) });

    if (!userInfo) {
      return res.status(404).json({ error: "유저 정보를 찾을 수 없습니다." });
    }

    res.json({
      user_id: userInfo.user_id,
      coins: userInfo.coins,
      total_profit: userInfo.total_profit,
      correct_prediction_count: userInfo.correct_prediction_count,
      total_participation: userInfo.total_participation,
    });
  } catch (err) {
    console.error("유저 정보 조회 에러:", err);
  }
});

module.exports = router;
