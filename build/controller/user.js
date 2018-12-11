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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// import logger from '../utils/logger';

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
                    token = _jsonwebtoken2.default.sign(tokenObj, (0, _const2.default)().secret, { expiresIn: '24h' });
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
                var newUser = new _user2.default();
                newUser.email = data.email;
                newUser.password = data.password;
                newUser.userId = (0, _v2.default)();
                newUser.save(function (err, savedUser) {
                    if (err) {
                        reject({ code: 500, msg: err });
                    } else {
                        resolve(savedUser);
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
    }]);

    return UserController;
}();

exports.default = new UserController();
//# sourceMappingURL=user.js.map