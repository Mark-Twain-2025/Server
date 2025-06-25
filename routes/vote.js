const express = require("express");
const Vote = require("../models/Vote");
const router = express.Router();

// 데이터 추가
router.post("/", async function (req, res) {
  const data = req.body;
  console.log(data);

  const vote = await Vote.create({
    user: data.user,
    date: data.date,
    category: data.category,
    amount: data.amount,
  });

  res.json(vote);
});
module.exports = router;
