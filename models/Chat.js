const mongoose = require('mongoose');

let ChatSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    timeout: {
        type: Number,
        default: 60
    },
    expiration_date: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('Chat', ChatSchema);