'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _admin = require('../controller/admin');

var _admin2 = _interopRequireDefault(_admin);

var _mailDetails = require('../controller/mailDetails');

var _mailDetails2 = _interopRequireDefault(_mailDetails);

var _reqRes = require('../middlewares/reqRes');

var _reqRes2 = _interopRequireDefault(_reqRes);

var _userAuth = require('../middlewares/userAuth');

var _userAuth2 = _interopRequireDefault(_userAuth);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AdminRoute = function () {
    function AdminRoute() {
        _classCallCheck(this, AdminRoute);

        this.router = _express2.default.Router();
        this.routes();
    }

    _createClass(AdminRoute, [{
        key: 'getAdminDetails',
        value: function getAdminDetails(req, res) {
            // console.log("REQ BODY: "+req.body)
            _admin2.default.getAdmin(req.body).then(function (data) {
                _reqRes2.default.responseHandler('fetched successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'getUserDetails',
        value: function getUserDetails(req, res) {
            _admin2.default.getUser(req.params).then(function (data) {
                _reqRes2.default.responseHandler('fetched successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'getAliasDetails',
        value: function getAliasDetails(req, res) {
            _admin2.default.getAlias(req.params).then(function (data) {
                _reqRes2.default.responseHandler('fetched successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'getSearchedContent',
        value: function getSearchedContent(req, res) {
            // console.log(req.params)
            _admin2.default.getSearched(req.params).then(function (data) {
                _reqRes2.default.responseHandler('fetched successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'getMailDetails',
        value: function getMailDetails(req, res) {
            _mailDetails2.default.getDetails(req.params).then(function (data) {
                _reqRes2.default.responseHandler('fetched successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'getInboxDetails',
        value: function getInboxDetails(req, res) {
            _mailDetails2.default.getInboxDetails(req.params).then(function (data) {
                _reqRes2.default.responseHandler('fetched successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'getOutboxDetails',
        value: function getOutboxDetails(req, res) {
            _mailDetails2.default.getOutboxDetails(req.params).then(function (data) {
                _reqRes2.default.responseHandler('fetched successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'routes',
        value: function routes() {
            this.router.post('/', this.getAdminDetails);
            this.router.get('/user/:uid', _userAuth2.default, this.getUserDetails);
            this.router.get('/alias/:aid', _userAuth2.default, this.getAliasDetails);
            this.router.get('/search/:key/:value', _userAuth2.default, this.getSearchedContent);
            this.router.get('/getMailDetails/:uid', _userAuth2.default, this.getMailDetails);
            this.router.get('/inbox/:wid/:mid', _userAuth2.default, this.getInboxDetails);
            this.router.get('/outbox/:wid/:mid', _userAuth2.default, this.getOutboxDetails);
        }
    }]);

    return AdminRoute;
}();

exports.default = new AdminRoute().router;
//# sourceMappingURL=admin.js.map