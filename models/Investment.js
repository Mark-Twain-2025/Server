const mongoose = require("mongoose");

const investSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  category_id: {
    type: Number,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },
  actual_return: { type: Number },
  rank: { type: Number },
});

const Investments = mongoose.model("Investments", investSchema);

module.exports = Investments;
