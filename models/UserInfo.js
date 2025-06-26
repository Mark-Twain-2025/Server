const mongoose = require("mongoose");

const userInfoSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, //
  user_id: { type: Number, required: true }, // users.id 참조
  coins: { type: Number, default: 1000 },
  total_profit: { type: Number, default: 0 },
  correct_prediction_count: { type: Number, default: 0 },
  total_participation: { type: Number, default: 0 },
});

userInfoSchema.pre("save", async function (next) {
  if (this.isNew) {
    const Counter = require("./Counter");
    const counter = await Counter.findOneAndUpdate(
      { model: "UserInfo" }, // UserInfo의 Counter
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.count;
  }
  next();
});

module.exports = mongoose.model("user_info", userInfoSchema);
