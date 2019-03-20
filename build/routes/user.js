'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _userAuth = require('../middlewares/userAuth');

var _userAuth2 = _interopRequireDefault(_userAuth);

var _reqRes = require('../middlewares/reqRes');

var _reqRes2 = _interopRequireDefault(_reqRes);

var _user = require('../controller/user');

var _user2 = _interopRequireDefault(_user);

var _validator = require('../middlewares/validator');

var validator = _interopRequireWildcard(_validator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserRoute = function () {
    function UserRoute() {
        _classCallCheck(this, UserRoute);

        this.router = _express2.default.Router();
        this.routes();
    }

    //writing routes here


    _createClass(UserRoute, [{
        key: 'login',
        value: function login(req, res) {
            _user2.default.login(req.body).then(function (data) {
                _reqRes2.default.responseHandler('Login Successful', data, res);
                res.end();
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'register',
        value: function register(req, res) {
            _user2.default.register(req.body).then(function (data) {
                _reqRes2.default.responseHandler('signup Successfull', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'resetPassword',
        value: function resetPassword(req, res) {
            req.body.userId = req.userId;
            _user2.default.changePassword(req.body).then(function (data) {
                _reqRes2.default.responseHandler('password changed', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'codeVerification',
        value: function codeVerification(req, res) {

            _user2.default.codeVerification(req.body).then(function (data) {
                _reqRes2.default.responseHandler('', data, res); //Handle Response
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'resendCode',
        value: function resendCode(req, res) {

            _user2.default.resendCode(req.body).then(function (data) {
                _reqRes2.default.responseHandler('', data, res); //Handle Response
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'forgetPassword',
        value: function forgetPassword(req, res) {

            _user2.default.forgetPassword(req.body).then(function (data) {
                _reqRes2.default.responseHandler('', data, res); //Handle Response
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'resetPasswordChange',
        value: function resetPasswordChange(req, res) {
            _user2.default.resetPasswordChange(req.body).then(function (data) {
                _reqRes2.default.responseHandler('', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'getRegisteredUsers',
        value: function getRegisteredUsers(req, res) {
            _user2.default.getUsers(req).then(function (data) {
                // reqRes.responseHandler('fetched successfully', data, res);
                res.status(200).send(data);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'routes',
        value: function routes() {
            this.router.post('/', validator.registerValidator, this.register);
            this.router.post('/session', validator.loginValidator, this.login);
            this.router.post('/reset/password', _userAuth2.default, this.resetPassword);
            this.router.post('/code/verify', this.codeVerification);
            this.router.post('/code/resend', this.resendCode);
            this.router.post('/forgot/password', this.forgetPassword);
            this.router.post('/forgot/password/reset', this.resetPasswordChange);

            this.router.get('/', _userAuth2.default, this.getRegisteredUsers);
        }
    }]);

    return UserRoute;
}();

exports.default = new UserRoute().router;
//# sourceMappingURL=user.js.map