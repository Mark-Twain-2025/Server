const express = require("express");
const Attendance = require("../models/Attendance");
const Category = require("../models/Category");
const router = express.Router();
const UserInfo = require("../models/UserInfo");
const { verifyToken } = require("../utils/auth");

router.post("/", async function (req, res) {
  const data = req.body;

  const category = await Category.create({
    id: data.id,
    name: data.name,
  });

  res.json(category);
});

// 출석 처리 API
router.post("/:user_id", verifyToken, async (req, res) => {
  const user_id = parseInt(req.params.user_id, 10);
  const today = new Date().toISOString().slice(0, 10);

  try {
    // 이미 오늘 출석했는지 확인
    const already = await Attendance.findOne({ user_id, date: today });
    if (already) {
      const userInfo = await UserInfo.findOne({ user_id });
      return res.json({
        coins: userInfo ? userInfo.coins : 0,
        message: "이미 출석 처리됨",
      });
    }

    // 출석 처리
    await Attendance.create({ user_id, date: today });

    // 코인 10개 지급
    const userInfo = await UserInfo.findOne({ user_id });
    if (userInfo) {
      userInfo.coins += 10;
      await userInfo.save();
      return res.json({
        coins: userInfo.coins,
        message: "출석 보상 10코인 지급",
      });
    } else {
      return res.status(404).json({ message: "UserInfo not found" });
    }
  } catch (err) {
    console.error("출석 처리 에러:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const records = await Attendance.find({ user_id: Number(user_id) }).select(
      "date -_id"
    );
    const dates = records.map((record) => record.date);
    res.status(200).json({ dates });
  } catch (err) {
    console.error("Error fetching attendance:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
