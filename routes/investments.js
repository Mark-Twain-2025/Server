const express = require("express");
const router = express.Router();
const Investments = require("../models/Investment");

router.post("/:userId", async (req, res, next) => {
  try {
    const { category_id, amount, actual_return, rank, todayLunch, date } = req.body;
    const { userId } = req.params;
    console.log(req.body);
    const investment = await Investments.create({
      user_id: userId,
      date: date,
      category_id: category_id,
      amount: amount,
      actual_return: actual_return,
      rank: rank,
      todayLunch : todayLunch,
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

module.exports = router;
