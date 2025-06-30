const mongoose = require("mongoose");
const Investments = require("../models/User"); // 경로에 따라 조정

mongoose.connect(
  "mongodb+srv://admin:admin1234@hwalbin.zbfsrz5.mongodb.net/?retryWrites=true&w=majority&appName=hwalbin"
);

const dummydata = [];

Investments.insertMany(dummydata)
  .then(() => {
    console.log("더미데이터 삽입 완료");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("삽입 실패:", err);
    mongoose.disconnect();
  });
