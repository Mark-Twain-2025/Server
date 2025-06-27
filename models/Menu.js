// Vote table
const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  category_id: {
    type: Number,
    required: true,
  },

  total_investment: { type: Number },
  votes_before_lunch: { type: Number },
  votes_after_lunch: { type: Number },
  result_rank: { type: Number },
});

const Menus = mongoose.model("Menus", MenuSchema);

module.exports = Menus;
