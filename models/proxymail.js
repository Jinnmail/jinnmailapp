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

const proxyMail = mongoose.model('proxyMail', proxyMailSchema);

export default proxyMail;

