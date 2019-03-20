'use strict';

var mongoose = require('../db/db');

var mailSchema = mongoose.Schema({
    alias: {
        type: String,
        required: true
    },
    wildduckId: {
        type: String
    },
    inboxId: {
        type: String
    },
    sentId: {
        type: String
    }
});

var mail = mongoose.model('mail', mailSchema);

module.exports = mail;
//# sourceMappingURL=mailDetails.js.map