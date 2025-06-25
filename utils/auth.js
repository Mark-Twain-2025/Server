const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (visibleUser, maxAge = 60 * 60 * 24 * 3) => {
    return jwt.sign(visibleUser, process.env.JWT_SECRET || "MyJWT", {
        expiresIn: maxAge,
    });
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.login(email, password);
        const token = createToken(user);
        res.status(200).json({ token, user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const signupUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.signUp(email, password);
        const token = createToken(user);
        res.status(201).json({ token, user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

module.exports = {
    loginUser,
    signupUser,
    createToken,
};
