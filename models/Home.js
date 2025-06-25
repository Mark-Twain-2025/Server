const { default: mongoose } = require("mongoose");

const homeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true
    },
    author: String,
    createAt: {
        type: Date,
        default: Date.now
    }
});

const Home = mongoose.model("Home", homeSchema);
module.exports = Board;