const mongoose = require("mongoose");

const userInfoSchema = new mongoose.Schema({
  user_id: { type: Number, required: true }, // users.id 참조
  coins: { type: Number, default: 1000 },
  total_profit: { type: Number, default: 0 },
  correct_prediction_count: { type: Number, default: 0 },
  total_participation: { type: Number, default: 0 },
});

module.exports = mongoose.model("user_info", userInfoSchema);
