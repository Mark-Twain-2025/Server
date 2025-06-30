const mongoose = require("mongoose");
const Investments = require("../models/Investment"); // 경로에 따라 조정

mongoose.connect(
  "mongodb+srv://admin:admin1234@hwalbin.zbfsrz5.mongodb.net/?retryWrites=true&w=majority&appName=hwalbin"
);

const dummydata = [
  {
    user_id: 21,
    date: "2025-06-23",
    category_id: 1,
    amount: 10,
    actual_return: 100,
    rank: 3,
    todayLunch: 1000,
  },
  {
    user_id: 21,
    date: "2025-06-24",
    category_id: 2,
    amount: 20,
    actual_return: -50,
    rank: 2,
    todayLunch: 950,
  },
  {
    user_id: 21,
    date: "2025-06-25",
    category_id: 1,
    amount: 10,
    actual_return: 150,
    rank: 1,
    todayLunch: 1100,
  },
  {
    user_id: 21,
    date: "2025-06-26",
    category_id: 2,
    amount: 15,
    actual_return: 70,
    rank: 2,
    todayLunch: 1170,
  },
  {
    user_id: 21,
    date: "2025-06-27",
    category_id: 1,
    amount: 15,
    actual_return: -30,
    rank: 4,
    todayLunch: 1140,
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
