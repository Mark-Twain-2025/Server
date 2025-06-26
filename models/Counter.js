// Counter.js
// 자동으로 증가하는 인덱스가 없어서 Counter.js 모델 만듦
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  model: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
});

module.exports = mongoose.model("counter", counterSchema);
