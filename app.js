const dotenv = require("dotenv");
dotenv.config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cron = require("node-cron"); // 자동 정산 스케줄러 추가 

const session = require("express-session");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const voteRouter = require("./routes/vote");
const categoryRouter = require("./routes/category");
const loginRouter = require("./routes/login");
const signupRouter = require("./routes/signup");
const investRouter = require("./routes/investments");

const quizRouter = require("./routes/quiz");
const quizHistoryRouter = require("./routes/quiz_history");
const userInfoRouter = require("./routes/user_info");

const voteBeforeRouter = require("./routes/voteBefore");
const voteAfterRouter = require("./routes/voteAfter");
const rankingRouter = require("./routes/ranking");
const menuOptionsRouter = require("./routes/menu-options");

const attendanceRouter = require("./routes/attendance");

const mongoose = require("mongoose");
const MONGO_HOST = process.env.DB_URL;

mongoose
  .connect(MONGO_HOST, {
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("Connected Successful");
  })
  .catch((err) => {
    console.log("error mongoose");
  });

var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

const cors = require("cors");

app.use(
  cors({
    origin: [
      "https://54.180.166.227",
      "http://54.180.166.227",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "<my-secret>",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/vote", voteRouter);
app.use("/api/category", categoryRouter);
app.use("/api/login", loginRouter);
app.use("/api/signup", signupRouter);
app.use("/api/investments", investRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/quizHistory", quizHistoryRouter);
app.use("/api/user_info", userInfoRouter);

// 왜 안돼???
app.use("/api/vote_before", voteBeforeRouter);
app.use("/api/vote_after", voteAfterRouter);
app.use("/api/ranking", rankingRouter);
app.use("/api/menu-options", menuOptionsRouter);
app.use("/api/attendance", attendanceRouter);

// 매일 오후 1시 30분에 자동 정산 실행 (운영용)
cron.schedule('30 13 * * *', async () => {
  console.log(`[${new Date().toISOString()}] 자동 정산 스케줄러 실행`);
  
  try {
    const Investments = require("./models/Investment");
    const VoteAfter = require("./models/VoteAfter");
    const VoteBefore = require("./models/VoteBefore");
    const Category = require("./models/Category");
    const Settlement = require("./models/Settlement");
    const UserInfo = require("./models/UserInfo");
    
    const today = new Date().toISOString().split('T')[0];
    
    // 해당 날짜의 VoteAfter 데이터 조회 (순위 결정용)
    const voteAfterData = await VoteAfter.find({ date: today });

    if (voteAfterData.length === 0) {
      console.log(`[${new Date().toISOString()}] ${today} 투표 데이터 없음`);
      return;
    }

    // 해당 날짜의 VoteBefore 데이터 조회 (정산 대상자 확인용)
    const voteBeforeData = await VoteBefore.find({ date: today });
    
    if (voteBeforeData.length === 0) {
      console.log(`[${new Date().toISOString()}] ${today} 투자 데이터 없음`);
      return;
    }

    // VoteBefore에 투표한 사용자 ID 목록 생성
    const voteBeforeUserIds = voteBeforeData.map(vote => vote.user_id);
    console.log(`[${new Date().toISOString()}] 투자 참여자 수: ${voteBeforeUserIds.length}명`);

    // 카테고리 정보 조회
    const categories = await Category.find({});
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.id] = cat.name;
    });

    // 카테고리별 투표 수 집계 (VoteAfter 기준)
    const categoryVoteCounts = {};
    voteAfterData.forEach((vote) => {
      const categoryId = vote.category_id;
      if (!categoryVoteCounts[categoryId]) {
        categoryVoteCounts[categoryId] = 0;
      }
      categoryVoteCounts[categoryId]++;
    });

    // 투표 수 기준으로 순위 계산
    const sortedCategories = Object.entries(categoryVoteCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([categoryId, voteCount], index, array) => {
        let rank = index + 1;
        if (index > 0 && voteCount === array[index - 1][1]) {
          rank = array.findIndex(([, count]) => count === voteCount) + 1;
        }
        return { categoryId: parseInt(categoryId), voteCount, rank };
      });

    // 수익률 배수 정의
    const getReturnMultiplier = (rank) => {
      switch (rank) {
        case 1: return 3.0;
        case 2: return 2.0;
        case 3: return 1.0;
        case 4: return 0.8;
        case 5: return 0.5;
        default: return 0.0;
      }
    };

    let totalSettledUsers = 0;

    for (const categoryRank of sortedCategories) {
      const { categoryId, rank } = categoryRank;
      const multiplier = getReturnMultiplier(rank);

      const investments = await Investments.find({
        date: today,
        category_id: categoryId,
        user_id: { $in: voteBeforeUserIds }
      });

      for (const investment of investments) {
        const actualReturn = Math.round(investment.amount * multiplier);
        const profit = actualReturn - investment.amount;

        // Investment 테이블 업데이트
        await Investments.findByIdAndUpdate(
          investment._id,
          {
            actual_return: actualReturn,
            rank: rank,
          },
          { new: true }
        );

        // Settlement 테이블에 정산 내역 저장 (중복 방지)
        try {
          await Settlement.create({
            user_id: investment.user_id,
            date: today,
            investment_amount: investment.amount,
            actual_return: actualReturn,
            profit: profit,
            category_id: categoryId,
            rank: rank,
            coins_paid: actualReturn
          });

          // UserInfo 테이블의 코인 업데이트
          let coinsUpdate = { 
            $inc: { 
              coins: actualReturn,
              total_profit: profit,
              total_participation: 1
            }
          };
          if (typeof investment.todayLunch === 'number' && !isNaN(investment.todayLunch)) {
            coinsUpdate.$inc.coins += investment.todayLunch;
          }
          await UserInfo.findOneAndUpdate(
            { user_id: investment.user_id },
            coinsUpdate
          );

          // 정산 후 user_info의 coins 값을 investments의 todayLunch로 업데이트
          const userInfo = await UserInfo.findOne({ user_id: investment.user_id });
          if (userInfo) {
            await Investments.findByIdAndUpdate(
              investment._id,
              { todayLunch: userInfo.coins }
            );
          }
        } catch (settlementError) {
          // 이미 정산된 경우에도 todayLunch 업데이트!
          if (settlementError.code === 11000) {
            console.log(`[${new Date().toISOString()}] 이미 정산된 사용자: ${investment.user_id}`);
            const userInfo = await UserInfo.findOne({ user_id: investment.user_id });
            if (userInfo) {
              await Investments.findByIdAndUpdate(
                investment._id,
                { todayLunch: userInfo.coins }
              );
            }
            continue;
          }
          throw settlementError;
        }
      }
    }

    console.log(`[${new Date().toISOString()}] 자동 정산 완료: ${totalSettledUsers}명 정산됨`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] 자동 정산 실패:`, error.message);
  }
}, {
  timezone: "Asia/Seoul"
});

console.log("자동 정산 스케줄러가 설정되었습니다. (매일 오후 1시 30분)");

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render("error");
});

module.exports = app;
