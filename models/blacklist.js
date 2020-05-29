var mongoose = require('mongoose');

const blacklistSchema = mongoose.Schema({
    localPart: {
        type: String,
        required: true
    },
    domain: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('blacklist', blacklistSchema);