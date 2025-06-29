const dotenv = require("dotenv");
dotenv.config();

var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

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

app.use("/api/vote_before", voteBeforeRouter);
app.use("/api/vote_after", voteAfterRouter);
app.use("/api/ranking", rankingRouter);
app.use("/api/menu-options", menuOptionsRouter);
app.use("/api/attendance", attendanceRouter);

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
