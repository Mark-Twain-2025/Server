// Vote table
const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema({
  user: {
    type: String, // 일단은 string으로 db 연결 되는지 test
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Vote = mongoose.model("Vote", voteSchema);

module.exports = Vote;
