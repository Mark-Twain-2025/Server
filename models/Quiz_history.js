const mongoose = require("mongoose");

const QuizHistorySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    // unique: true,
  },
  user_id: {
    type: Number,
    required: true,
  },
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "quiz",
    required: true,
  },
  selected_index: {
    type: Number,
    default: null,
  },
  is_correct: {
    type: Boolean,
    default: null,
  },
  date: {
    type: String,
    required: true,
  },
});

const QuizHistory = mongoose.model("quizHistory", QuizHistorySchema);

module.exports = QuizHistory;
