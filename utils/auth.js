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

        // JWT 토큰을 쿠키에 저장
        res.cookie('AuthToken', token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 24 * 3 * 1000, // 3일
            path: '/'
        });

        res.status(200).json({ token, user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

const signupUser = async (req, res) => {
    const { name, email, password } = req.body;
    console.log(req.body)
    try {
        const user = await User.signUp(name, email, password);
        const token = createToken(user);
        console.log(token);

        // JWT 토큰을 쿠키에 저장
        res.cookie('AuthToken', token, {
            httpOnly: true,
            secure: false,
            maxAge: 60 * 60 * 24 * 3 * 1000, // 3일
            path: '/'
        });

        res.status(201).json({ token, user });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 로그아웃 함수 추가
const logoutUser = async (req, res) => {
    res.clearCookie('AuthToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// 토큰 검증 함수 추가
const verifyToken = (req, res, next) => {
    const token = req.cookies.AuthToken || req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "MyJWT");
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: 'Invalid token.' });
    }
};

module.exports = {
    loginUser,
    signupUser,
    logoutUser,
    verifyToken,
    createToken,
};
