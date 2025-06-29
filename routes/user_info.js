const express = require("express");
const router = express.Router();
const UserInfo = require("../models/UserInfo");

const User = require('../models/User');
const { verifyToken } = require('../utils/auth');


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


// 추가: /api/user_info/me (JWT 쿠키로 현재 로그인한 유저 정보 반환)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      coins: userInfo.coins,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
