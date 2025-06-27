const express = require("express");
const Category = require("../models/Category");
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
