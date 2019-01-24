'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _v = require('uuid/v4');

var _v2 = _interopRequireDefault(_v);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var _const = require('../config/const');

var _const2 = _interopRequireDefault(_const);

var _v3 = require('uuid/v3');

var _v4 = _interopRequireDefault(_v3);

var _mail = require('../services/mail');

var mail = _interopRequireWildcard(_mail);

var _util = require('util');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _btoa = require('btoa');

var _btoa2 = _interopRequireDefault(_btoa);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SALT_WORK_FACTOR = 10;

var UserController = function () {
    function UserController() {
        _classCallCheck(this, UserController);
    }

    _createClass(UserController, [{
        key: 'login',
        value: function login(data) {
            var userObj = void 0;
            var token = void 0;
            return new Promise(function (resolve, reject) {

                _user2.default.findOne({ email: data.email }).then(function (userData) {
                    if (userData) {
                        if (!userData.verified) {
                            reject({ code: 403, msg: 'user not verified' });
                        }
                        userObj = userData;
                        return new Promise(function (resolve, reject) {
                            _bcryptNodejs2.default.compare(data.password.toString(), userData.password, function (err, isMatch) {
                                if (err) reject(err);
                                resolve(isMatch);
                            });
                        });
                    } else {
                        reject({ code: 400, msg: 'No User found' });
                    }
                }).then(function (equal) {
                    if (equal) {
                        return true;
                    } else {
                        reject({ code: 400, msg: 'No Password matched' });
                    }
                }).then(function (isMatch) {
                    var tokenObj = {
                        userId: userObj.userId
                    };
                    token = _jsonwebtoken2.default.sign(tokenObj, process.env.JWT_SECRET);
                    return token;
                }).then(function (token) {
                    var finalOutput = {
                        'status': 'authorized',
                        'userId': userObj.userId,
                        'email': userObj.email,
                        'sessionToken': token,
                        'expiresIn': '24h'
                    };
                    resolve(finalOutput);
                }).catch(function (err) {
                    reject({ code: 500, msg: err });
                });
            });
        }
    }, {
        key: 'register',
        value: function register(data) {
            return new Promise(function (resolve, reject) {
                _user2.default.findOne({ email: data.email }).then(function (user) {
                    console.log(user);
                    if (user) {
                        reject({ code: 500, msg: 'err' });
                    } else {
                        var newUser = new _user2.default();
                        newUser.email = data.email;
                        newUser.password = data.password;
                        newUser.userId = (0, _v2.default)();
                        newUser.verificationCode = Math.floor(100000 + Math.random() * 900000);
                        newUser.save(function (err, savedUser) {
                            if (err) {
                                reject({ code: 500, msg: err });
                            } else {
                                mail.email_sender([data.email], newUser.verificationCode);
                                resolve(savedUser);
                            }
                        });
                    }
                });
            });
        }
    }, {
        key: 'changePassword',
        value: function changePassword(data) {
            return new Promise(function (resolve, reject) {
                _user2.default.findOne({ userId: data.userId }, { password: 1 }).then(function (userData) {
                    if (userData) {
                        return new Promise(function (resolve, reject) {
                            _bcryptNodejs2.default.compare(data.oldPassword.toString(), userData.password, function (err, isMatch) {
                                if (err) reject(err);
                                resolve(isMatch);
                            });
                        });
                    } else {
                        reject({ code: 500, msg: 'unauthorized action.' });
                    }
                }).then(function (equal) {
                    if (equal) {
                        return true;
                    } else {
                        reject({ code: 400, msg: 'No Password matched' });
                    }
                }).then(function (matched) {
                    _bcryptNodejs2.default.genSalt(10, function (err, salt) {
                        if (err) reject({ code: 500, msg: 'something went wrong.' });
                        _bcryptNodejs2.default.hash(data.newPassword, salt, null, function (err, hash) {
                            if (err) reject({ code: 500, msg: 'something went wrong.' });

                            data.newPassword = hash;
                            _user2.default.findOneAndUpdate({ userId: data.userId }, { password: data.newPassword }).then(function (data) {
                                resolve(null);
                            }).catch(function (err) {
                                reject({ code: 500, msg: err });
                            });
                        });
                    });
                }).catch(function (err) {
                    reject({ code: 500, msg: err });
                });
            });
        }
    }, {
        key: 'codeVerification',
        value: function codeVerification(data) {
            return new Promise(function (resolve, reject) {
                _user2.default.findOne({ email: data.email }, { verificationCode: 1 }).then(function (code) {
                    if (data.code === code.verificationCode) {
                        _user2.default.findOneAndUpdate({ email: data.email }, { verified: true }).then(function (ok) {
                            console.log(ok);
                            resolve('ok');
                        });
                    } else {
                        reject({ code: 401, msg: 'invalid code.' });
                    }
                });
            });
        }
    }, {
        key: 'resendCode',
        value: function resendCode(data) {
            return new Promise(function (resolve, reject) {
                _user2.default.findOne({ email: data.email }).then(function (code) {
                    mail.email_sender([data.email], code.verificationCode);
                    resolve('ok');
                }).catch(function (err) {
                    reject({ code: 401, msg: 'invalid code.' });
                });
            });
        }
    }, {
        key: 'forgetPassword',
        value: function forgetPassword(data) {
            return new Promise(function (resolve, reject) {
                _async2.default.waterfall([function (done) {
                    var token = Math.floor(Math.random() * (9999 - 1000) + 1000);
                    done(null, token);
                }, function (token, done) {
                    _user2.default.findOne({ email: data.email }, function (err, user) {
                        if (!user) {
                            reject({ code: 403, 'msg': 'No account with that email address exists.' });
                        }
                        _user2.default.findOneAndUpdate({ email: data.email }, { $set: { resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 } }, function (err, obj) {
                            done(err, token, user);
                        });
                    });
                }, function (token, user, done) {
                    var text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' + 'Please click on the following link:\n\n' + '<a href=' + process.env.DASHBOARD_URL + 'forgetpassword.html?t=' + (0, _btoa2.default)(token) + '&e=' + (0, _btoa2.default)(data.email) + '>click here</a>\n\n' + 'If you did not request this, please ignore this email and your password will remain unchanged.\n';
                    mail.forget_mail([data.email], text);
                    resolve('email is sent');
                }], function (err) {
                    console.log(err);
                    if (err) reject({ code: 500, msg: 'something went wrong.' });
                });
            });
        }
    }, {
        key: 'resetPasswordChange',
        value: function resetPasswordChange(data) {
            return new Promise(function (resolve, reject) {
                if (data.password) {
                    _user2.default.findOne({
                        email: data.email,
                        resetPasswordExpires: {
                            $gt: Date.now()
                        }
                    }, function (err, obj) {
                        if (err) {
                            reject({ code: 500, msg: 'something went wrong' });
                        } else {
                            if (obj == null) {
                                reject({ code: 403, msg: 'Password reset token is invalid or has expired.' });
                            } else {
                                _user2.default.findOne({ email: data.email }, function (err, obj) {
                                    if (err) reject({ code: 500, msg: 'something went wrong.' });else {
                                        if (obj.resetPasswordToken === data.token) {
                                            _bcryptNodejs2.default.genSalt(SALT_WORK_FACTOR, function (err, salt) {
                                                if (err) reject({ code: 500, msg: 'something went wrong.' });
                                                _bcryptNodejs2.default.hash(data.password, salt, null, function (err, hash) {
                                                    if (err) reject({ code: 500, msg: 'something went wrong.' });
                                                    _user2.default.findOneAndUpdate({ email: data.email }, { $set: { password: hash, resetPasswordToken: null } }, function (err, obj) {
                                                        if (err) {
                                                            reject({ code: 500, msg: "something went wrong." });
                                                        } else {
                                                            resolve("Password Changed.");
                                                        }
                                                    });
                                                });
                                            });
                                        } else {
                                            reject({ code: 500, msg: 'Link Expired' });
                                        }
                                    }
                                });
                            }
                        }
                    });
                } else {
                    reject({ code: 422, msg: 'new password is required.' });
                }
            });
        }
    }]);

    return UserController;
}();

exports.default = new UserController();
//# sourceMappingURL=user.js.map