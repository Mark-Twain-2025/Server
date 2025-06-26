const express = require("express");
const router = express.Router();
const Investments = require("../models/Investment");
const getTodayStr = require("../utils/date");

router.get("/daily", async (req, res, next) => {
  try {
    const today = getTodayStr();
    const results = await Investments.find({ date: today }).sort({
      actual_return: -1,
    });
    const ranked = results.map((doc, idx) => ({
      rank: idx + 1,
      user_id: doc.user_id,
      actual_return: doc.actual_return,
    }));
    res.status(200).json(ranked);
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

module.exports = router;
