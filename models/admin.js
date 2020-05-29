var mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

let SALT_WORK_FACTOR = 10;

const adminSchema = mongoose.Schema({
    adminId: {
        type: String,
        required: true
    },
    username: {
        type: String,
        unique: true,
        lowercase: true,
        required:  [true, 'username field is Required']
    },
    password: {
        type: String,
        required: [true, 'password field is Required'],
        validate: [function (v) {
            return v.length >= 8;
        }, 'Password min length is 8 chars']
    },
    resetPasswordToken:{
        type: String,
        default:null
    },
    resetPasswordExpires:{
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
    const admin = this;
    if (!admin.isModified('password'))
        return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err)
            return next(err);
        bcrypt.hash(admin.password, salt, null, (err, hash) => {
            if (err)
                return next(err);

            admin.password = hash;
            next();
        });
    });
});

const admin = mongoose.model('admin', adminSchema);

module.exports = admin;

