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

var _alias = require('../controller/alias');

var _alias2 = _interopRequireDefault(_alias);

var _validator = require('../middlewares/validator');

var validator = _interopRequireWildcard(_validator);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AliasRoute = function () {
    function AliasRoute() {
        _classCallCheck(this, AliasRoute);

        this.router = _express2.default.Router();
        this.routes();
    }

    //writing routes here


    _createClass(AliasRoute, [{
        key: 'registerAlias',
        value: function registerAlias(req, res) {
            req.body.userId = req.userId;
            _alias2.default.registerAlias(req.body).then(function (data) {
                _reqRes2.default.responseHandler('alias registered', data, res);
                res.end();
            }).catch(function (err) {
                console.log(err);
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'checkAvailability',
        value: function checkAvailability(req, res) {
            _alias2.default.checkAvailability(req.body).then(function (data) {
                _reqRes2.default.responseHandler('alias available', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'getRegisteredAlias',
        value: function getRegisteredAlias(req, res) {
            _alias2.default.getRegisteredAlias(req).then(function (data) {
                _reqRes2.default.responseHandler('fetched successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'changeAliasStatus',
        value: function changeAliasStatus(req, res) {
            req.body.userId = req.userId;
            _alias2.default.changeStatusOfAlias(req.body).then(function (data) {
                _reqRes2.default.responseHandler('updated successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'deleteAlias',
        value: function deleteAlias(req, res) {
            console.log('delete', req.params.aliasId);
            _alias2.default.deleteAlias(req).then(function (data) {
                _reqRes2.default.responseHandler('deleted successfully', data, res);
            }).catch(function (err) {
                _reqRes2.default.httpErrorHandler(err, res);
                res.end();
            });
        }
    }, {
        key: 'routes',
        value: function routes() {
            this.router.post('/', _userAuth2.default, this.registerAlias);
            this.router.get('/', _userAuth2.default, this.getRegisteredAlias);
            this.router.post('/avail', _userAuth2.default, this.checkAvailability);
            this.router.put('/status', _userAuth2.default, this.changeAliasStatus);
            this.router.delete('/:aliasId', _userAuth2.default, this.deleteAlias);
        }
    }]);

    return AliasRoute;
}();

exports.default = new AliasRoute().router;
//# sourceMappingURL=alias.js.map