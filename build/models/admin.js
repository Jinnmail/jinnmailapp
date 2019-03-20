'use strict';

var mongoose = require('../db/db');
var bcrypt = require('bcrypt-nodejs');

var SALT_WORK_FACTOR = 10;

var adminSchema = mongoose.Schema({
    adminId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'username field is Required']
    },
    password: {
        type: String,
        required: [true, 'password field is Required'],
        validate: [function (v) {
            return v.length >= 8;
        }, 'Password min length is 8 chars']
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date
    },
    created: {
        type: Date,
        default: Date.now
    }
});
/*
 * Encrypt the password before saving it to DB
 */

adminSchema.pre('save', function (next) {
    var admin = this;
    if (!admin.isModified('password')) return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
        bcrypt.hash(admin.password, salt, null, function (err, hash) {
            if (err) return next(err);

            admin.password = hash;
            next();
        });
    });
});

var admin = mongoose.model('admin', adminSchema);

module.exports = admin;
//# sourceMappingURL=admin.js.map