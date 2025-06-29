const mongoose = require("mongoose");
const Counter = require("./Counter"); // index 용 id 필드 생성
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");
const UserInfo = require("./UserInfo"); // userInfo 생성하기 위해 추가

const userSchema = new mongoose.Schema({
  user_id: { type: Number, unique: true },
  name: {
    type: String,
    required: [true, "이름을 입력하여 주세요."],
  },
  email: {
    type: String,
    required: [true, "이메일을 입력하여 주세요."],
    unique: true,
    lowercase: true,
    validate: [isEmail, "올바른 이메일 형식이 아닙니다."],
  },
  password: {
    type: String,
    required: [true, "비밀번호가 입력되어야 합니다."],
  },
});

// id index 생성
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const Counter = require("./Counter");
    const counter = await Counter.findOneAndUpdate(
      { model: "User" },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
    this.user_id = counter.count;
  }
  next();
});

userSchema.statics.signUp = async function (name, email, password) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  try {
    const user = await this.create({ name, email, password: hashedPassword });

    // user에 해당하는 user_info table 생성
    (await UserInfo.create({ user_id: user.user_id })).save();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
    };
  } catch (err) {
    throw err;
  }
};

userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user.visibleUser;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const visibleUser = userSchema.virtual("visibleUser");
visibleUser.get(function (value, virtual, doc) {
  return {
    _id: doc._id,
    name: doc.name,
    email: doc.email,
    user_id: doc.user_id,
  };
});

const User = mongoose.model("user", userSchema);

module.exports = User;
