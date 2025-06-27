const mongoose = require("mongoose");

const voteBeforeSchema = new mongoose.Schema({
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
});

const VoteBefore = mongoose.model("VoteBefore", voteBeforeSchema);
module.exports = VoteBefore;
