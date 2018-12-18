import mongoose from '../db/db'
import bcrypt from 'bcrypt-nodejs';

let SALT_WORK_FACTOR = 10;

const userSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        required:  [true, 'email field is Required']
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
    const user = this;
    if (!user.isModified('password'))
        return next();

    bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
        if (err)
            return next(err);
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err)
                return next(err);

            user.password = hash;
            next();
        });
    });
});

const user = mongoose.model('user', userSchema);

export default user;

