const express = require('express');
const router = express.Router();
const Board = require('../models/Home');

router.post("/", async function (req, res) {

    const data = req.body;
    console.log(data);
    const home = await Board.create({
        title: data.title,
        content: data.content
    });

    res.json(home);
})

module.exports = router;