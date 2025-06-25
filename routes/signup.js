const express = require("express");
const router = express.Router();
const { signupUser } = require("../utils/auth");

router.post("/", signupUser);
module.exports = router;
