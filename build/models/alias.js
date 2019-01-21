'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _db = require('../db/db');

var _db2 = _interopRequireDefault(_db);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var aliasSchema = _db2.default.Schema({
    aliasId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    alias: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'alias field is Required']
    },
    refferedUrl: {
        type: String,
        lowercase: true,
        required: false
    },
    status: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now
    }
});

var alias = _db2.default.model('alias', aliasSchema);

exports.default = alias;
//# sourceMappingURL=alias.js.map