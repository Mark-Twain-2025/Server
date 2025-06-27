const mongoose = require("mongoose");
const Investments = require("./Investment");

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

// votebefore에 해당하는 investements table 생성
voteBeforeSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const existingInvestment = await Investments.findOne({
        user_id: this.user_id,
        date: this.date,
        category_id: this.category_id
      });
      
      if (!existingInvestment) {
        await Investments.create({
          user_id: this.user_id,
          date: this.date,
          category_id: this.category_id,
          amount: this.amount,
          actual_return: 0,
          rank: 0,
          todayLunch: ""
        });
      }
    } catch (err) {
      console.error("Investment 생성 중 오류:", err);
    }
  }
  next();
});

const VoteBefore = mongoose.model("VoteBefore", voteBeforeSchema);
module.exports = VoteBefore;
