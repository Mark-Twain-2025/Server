const express = require("express");
const Attendance = require("../models/Attendance");
const Category = require("../models/Category");
const router = express.Router();
const UserInfo = require("../models/UserInfo");

router.post("/", async function (req, res) {
  const data = req.body;

  const category = await Category.create({
    id: data.id,
    name: data.name,
  });

  res.json(category);
});

// 출석 처리 API
router.post("/:user_id", async (req, res, next) => {
  try {

    const { user_id } = req.params;
    const { date } = req.query;
    const bonus = 30;

    console.log("user_id:", user_id, "date:", date);

    if (!date) {
      console.log("date 파라미터 없음");
      return res.status(400).json({ error: "date 파라미터가 필요합니다." });
    }

    const already = await Attendance.findOne({ user_id: Number(user_id), date: date });
    
    if (already) {
      return res.status(400).json({ error: "이미 해당 날짜에 출석이 처리되었습니다." });
    }

    await Attendance.create({
      user_id: Number(user_id),
      date: date
    });
    
    await UserInfo.findOneAndUpdate(
      { user_id: Number(user_id) },
      { $inc: { coins: bonus } },
      { new: true }
    );
    console.log("UserInfo 코인 증가 완료");

    res.status(201).json({
      message: "출석 완료",
      today: date,
      bonus: bonus
    });
  } catch (err) {
    console.error("출석 처리 에러:", err);
    res.status(500).json({ error: "출석 처리 중 오류 발생" });
  }
});

module.exports = router;
