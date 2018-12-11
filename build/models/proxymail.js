'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _db = require('../db/db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var proxyMailSchema = _db2.default.Schema({
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

var proxyMail = _db2.default.model('proxyMail', proxyMailSchema);

exports.default = proxyMail;
//# sourceMappingURL=proxymail.js.map