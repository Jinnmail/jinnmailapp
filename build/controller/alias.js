'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _alias = require('../models/alias');

var _alias2 = _interopRequireDefault(_alias);

var _proxymail = require('../models/proxymail');

var _proxymail2 = _interopRequireDefault(_proxymail);

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

var AliasController = function () {
    function AliasController() {
        var _this = this;

        _classCallCheck(this, AliasController);

        this.getHostName = function (url) {
            var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
            if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
                return match[2];
            } else {
                return null;
            }
        };

        this.randomString = function (string_length) {
            var chars = "0123456789abcdefghiklmnopqrstuvwxyz";
            var randomstring = '';
            for (var i = 0; i < string_length; i++) {
                var rnum = Math.floor(Math.random() * chars.length);
                randomstring += chars.substring(rnum, rnum + 1);
            }
            return randomstring;
        };

        this.getDomain = function (url) {
            var hostName = _this.getHostName(url);
            var domain = hostName;

            if (hostName != null) {
                var parts = hostName.split('.').reverse();

                if (parts != null && parts.length > 1) {
                    domain = parts[1] + '.' + parts[0];

                    if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
                        domain = parts[2] + '.' + domain;
                    }
                }
            }

            return domain.split('.')[0];
        };
    }

    // checkAvailability(data) {
    //     return new Promise((resolve, reject) => {
    //         aliasModel.findOne({ alias: data.alias }).then((data) => {
    //             if (data) {
    //                 reject({ code: 403, msg: 'Not available' })
    //             } else {
    //                 resolve(null)
    //             }
    //         })
    //     }).catch((err) => {
    //         reject({ code: 500, msg: 'something went wrong' })
    //     });
    // }

    _createClass(AliasController, [{
        key: 'registerAlias',
        value: function registerAlias(data) {
            var _this2 = this;

            console.log(data);
            return new Promise(function (resolve, reject) {
                var domain = _this2.getDomain(data.url);
                var token = _this2.randomString(6);
                var email_address = domain + '.' + token + '@jinnmail.com';
                _alias2.default.findOne({ alias: email_address }).then(function (isAvail) {
                    if (isAvail) {
                        reject({ code: 403, msg: 'Not available' });
                    } else {
                        data.aliasId = (0, _v2.default)();
                        data.alias = email_address;
                        data.refferedUrl = data.url;
                        var alias = new _alias2.default(data);
                        alias.save(function (err, saved) {
                            console.log(err);
                            if (err) {
                                reject({ code: 500, msg: 'something went wrong' });
                            } else {
                                resolve(saved);
                            }
                        });
                    }
                }).catch(function (err) {
                    reject({ code: 500, msg: 'something went wrong' });
                });
            });
        }
    }, {
        key: 'getRegisteredAlias',
        value: function getRegisteredAlias(data) {
            return new Promise(function (resolve, reject) {
                _alias2.default.find({ userId: data.userId }).sort({ created: -1 }).then(function (aliases) {
                    resolve(aliases);
                }).catch(function (err) {
                    reject({ code: 500, msg: 'something went wrong' });
                });
            });
        }
    }, {
        key: 'changeStatusOfAlias',
        value: function changeStatusOfAlias(data) {
            return new Promise(function (resolve, reject) {
                console.log(data.aliasId, data.status);
                _alias2.default.findOneAndUpdate({ aliasId: data.aliasId }, { status: data.status }).then(function (alias) {
                    console.log(alias);
                    resolve(null);
                }).catch(function (err) {
                    reject({ code: 500, msg: 'something went wrong' });
                });
            });
        }
    }, {
        key: 'deleteAlias',
        value: function deleteAlias(data) {
            return new Promise(function (resolve, reject) {
                console.log(data.body.userId, data.params.aliasId);
                _alias2.default.remove({ aliasId: data.params.aliasId }).then(function (data) {
                    resolve(null);
                }).catch(function (err) {
                    reject({ code: 500, msg: 'something went wrong' });
                });
            });
        }

        //parsing domain name 


        //end

        // generating a random number 

    }]);

    return AliasController;
}();

exports.default = new AliasController();
//# sourceMappingURL=alias.js.map