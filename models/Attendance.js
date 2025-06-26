const mongoose = require("mongoose");
const Counter = require("./Counter");
const attendanceSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  user_id: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    require: true,
  },
});

// id index 추가
attendanceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await Counter.findOneAndUpdate(
      { model: "Attendance" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    this.id = counter.count;
  }
  next();
});

const Attendance = mongoose.model("attendance", attendanceSchema);
module.exports = Attendance;
