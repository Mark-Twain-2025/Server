const express = require("express");
const Attendance = require("../models/Attendance");
const Category = require("../models/");
const router = express.Router();

router.post("/", async function (req, res) {
  const data = req.body;

  const category = await Category.create({
    id: data.id,
    name: data.name,
  });

  res.json(category);
});
module.exports = router;
