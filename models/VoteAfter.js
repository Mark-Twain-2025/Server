const mongoose = require("mongoose");

const voteAfterSchema = new mongoose.Schema({
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
});

const VoteAfter = mongoose.model("VoteAfter", voteAfterSchema);
module.exports = VoteAfter;
