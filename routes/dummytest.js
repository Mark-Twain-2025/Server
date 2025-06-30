const mongoose = require("mongoose");
const Investments = require("../models/Investment"); // 경로에 따라 조정

mongoose.connect(
  "mongodb+srv://admin:admin1234@hwalbin.zbfsrz5.mongodb.net/?retryWrites=true&w=majority&appName=hwalbin"
);

const dummydata = [
  {
    user_id: 7,
    date: "2025-07-01",
    category_id: 1,
    amount: 300,
    actual_return: 312.45,
    rank: 3,
    todayLunch: 1000,
  },
  {
    user_id: 7,
    date: "2025-07-02",
    category_id: 2,
    amount: 200,
    actual_return: 180.12,
    rank: 5,
    todayLunch: 1050,
  },
  {
    user_id: 7,
    date: "2025-07-03",
    category_id: 3,
    amount: 400,
    actual_return: 420.87,
    rank: 2,
    todayLunch: 1020,
  },
  {
    user_id: 7,
    date: "2025-07-04",
    category_id: 1,
    amount: 150,
    actual_return: 162.34,
    rank: 1,
    todayLunch: 1080,
  },
  {
    user_id: 7,
    date: "2025-07-05",
    category_id: 4,
    amount: 350,
    actual_return: 370.5,
    rank: 4,
    todayLunch: 1120,
  },
];

Investments.insertMany(dummydata)
  .then(() => {
    console.log("더미데이터 삽입 완료");
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("삽입 실패:", err);
    mongoose.disconnect();
  });
