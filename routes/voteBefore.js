const express = require("express");
const router = express.Router();
const VoteBefore = require("../models/VoteBefore");
const getTodayStr = require("../utils/date");

router.post("/:userId", async (req, res, next) => {
  try {
    const { category_id, amount, date } = req.body;
    const { userId } = req.params;
    console.log(req.body);
    const votebefore = await VoteBefore.create({
      user_id: userId,
      date: date,
      category_id: category_id,
      amount: amount,
    });
    res.status(201).json(votebefore);
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

module.exports = router;
