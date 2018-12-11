'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _db = require('../db/db');

var _db2 = _interopRequireDefault(_db);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SALT_WORK_FACTOR = 10;

var userSchema = _db2.default.Schema({
    userId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'email field is Required']
    },
    password: {
        type: String,
        required: [true, 'password field is Required'],
        validate: [function (v) {
            return v.length >= 8;
        }, 'Password min length is 8 chars']
    },
    created: {
        type: Date,
        default: Date.now
    },
    aliasesCount: {
        type: Number,
        default: 0
    }
});
/*
 * Encrypt the password before saving it to DB
 */

userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) return next();

    _bcryptNodejs2.default.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        _bcryptNodejs2.default.hash(user.password, salt, null, function (err, hash) {
            if (err) return next(err);

            user.password = hash;
            next();
        });
    });
});

var user = _db2.default.model('user', userSchema);

exports.default = user;
//# sourceMappingURL=user.js.map