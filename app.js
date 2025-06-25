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

const loginRouter = require("./routes/login");
const signupRouter = require("./routes/signup");

const mongoose = require("mongoose");
const MONGO_HOST = process.env.DB_URL;

const DB_URL =
  "mongodb+srv://admin:admin1234@hwalbin.zbfsrz5.mongodb.net/?retryWrites=true&w=majority&appName=hwalbin";

mongoose
  .connect(MONGO_HOST, {
    retryWrites: true,
    w: "majority",
  })
  .then(() => {
    console.log("Connected Successful");
  })
  .catch((err) => {
    console.log("error");
  });


var app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');

const cors = require("cors");
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(logger('dev'));
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

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/vote", voteRouter);

app.use("/login", loginRouter);
app.use("/signup", signupRouter)

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
