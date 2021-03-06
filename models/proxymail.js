var mongoose = require('mongoose');

const proxyMailSchema = mongoose.Schema({
    proxyMailId: {
        type: String,
        required: true
    },
    aliasId: {
        type: String,
        required: true
    },
    senderAliasId: {
        type: String,
        required: true
    }, 
    replytoAliasId: {
        type: String
    }, 
    proxyMail: {
        type: String,
        lowercase: true,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('proxyMail', proxyMailSchema);

