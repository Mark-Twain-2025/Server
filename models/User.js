const mongoose = require("mongoose");
const { isEmail } = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
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

userSchema.statics.signUp = async function (name, email, password) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    try {
        const user = await this.create({ name, email, password: hashedPassword });
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
    };
});

const User = mongoose.model("user", userSchema);
module.exports = User;
