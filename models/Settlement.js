const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema({
  user_id: { type: Number, required: true },
  date: { type: String, required: true },
  investment_amount: { type: Number, required: true },
  actual_return: { type: Number, required: true },
  profit: { type: Number, required: true }, // actual_return - investment_amount
  category_id: { type: Number, required: true },
  rank: { type: Number, required: true },
  settled_at: { type: Date, default: Date.now },
  coins_paid: { type: Number, required: true } // 지급된 코인 수량
});

// user_id와 date로 복합 인덱스 생성 (중복 정산 방지)
settlementSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("settlement", settlementSchema); 