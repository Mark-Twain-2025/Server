const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  date: {
    type: String,
    required: true,
  },
  question: {
    type: String,
    required: true,
  },
  choices: {
    type: [String],
    required: true,
  },
  answer_index: {
    type: Number,
    required: true,
  },
  explanation: {
    type: String,
    default: "",
  },
});

QuizSchema.pre("save", async function (next) {
  // ❗ 중요: this.id가 undefined일 때만 증가
  if (!this.id) {
    const Counter = require("./Counter");
    const counter = await Counter.findOneAndUpdate(
      { model: "Quiz" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.count;
  }
  next();
});

const Quiz = mongoose.model("quiz", QuizSchema);
module.exports = Quiz;
