const express = require("express");
const Vote = require("../models/Vote");
const router = express.Router();

router.post("/", async function (req, res) {
  const data = req.body;

  const vote = await Vote.create({
    user: data.user,
    date: data.date,
    category: data.category,
    amount: data.amount,
  });

  res.json(vote);
});
module.exports = router;
