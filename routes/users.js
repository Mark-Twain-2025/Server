const express = require('express');
const router = express.Router();
const User = require("../models/User");
const { createToken, verifyToken } = require("../utils/auth");

// 특정 유저 정보 조회
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const user = await User.findOne({ user_id: parseInt(id) });
    
    if (!user) {
      return res.status(404).json({ error: "유저를 찾을 수 없습니다." });
    }
    
    res.json({
      name: user.name,
      email: user.email
    });
  } catch (err) {
    return res.status(404).json({ error: "유저를 찾을 수 없습니다." });
    console.error("에러:", err);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    console.log(req.body);
    const user = await User.signUp(name, email, password);
    res.status(201).json(user);
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.login(email, password);
    const tokenMaxAge = 60 * 60 * 24 * 3;
    const token = createToken(user, tokenMaxAge);
    user.token = token;
    res.cookie("authToken", token, {
      httpOnly: true,
      maxAge: tokenMaxAge * 1000,
    });
    console.log(user);
    res.status(201).json({
      message: "LogIn successful",
      user: user
    });
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

router.all("/logout", async (req, res, next) => {
  try {
    res.cookie("authToken", "", {
      httpOnly: true,
      expires: new Date(0),  // 즉시 만료
    });

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    res.status(400);
    next(err);
  }
});

async function authenticate(req, res, next) {
  let token = req.cookies.authToken;
  let headerToken = req.headers.authorization;
  if (!token && headerToken) {
    token = headerToken.split(" ")[1];
  }
  const user = verifyToken(token);
  req.user = user;
  if (!user) {
    const error = new Error("Authorization Failed");
    error.status = 403;
    next(error);
  }
  next();
}

router.get("/protected", authenticate, async (req, res, next) => {
  console.log(req.user);
  res.json({ data: "민감한 데이터" });
});

module.exports = router;