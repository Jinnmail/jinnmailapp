'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _admin = require('../models/admin');

var _admin2 = _interopRequireDefault(_admin);

var _alias = require('../models/alias');

var _alias2 = _interopRequireDefault(_alias);

var _user = require('../models/user');

var _user2 = _interopRequireDefault(_user);

var _bcryptNodejs = require('bcrypt-nodejs');

var _bcryptNodejs2 = _interopRequireDefault(_bcryptNodejs);

var _uuidV = require('uuid-v4');

var _uuidV2 = _interopRequireDefault(_uuidV);

var _jsonwebtoken = require('jsonwebtoken');

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var AdminController = function () {
    function AdminController() {
        _classCallCheck(this, AdminController);
    }

    _createClass(AdminController, [{
        key: 'getAdmin',
        value: function getAdmin(data) {
            // console.log("JWT:"+process.env.JWT_SECRET)
            return new Promise(function (resolve, reject) {
                _admin2.default.findOne({}).then(function (adminData) {
                    if (!adminData) {
                        reject({ code: 500, msg: 'err' });
                    } else {
                        // console.log(data.username+"***"+data.password)
                        // console.log(adminData.username+"---"+adminData.password)
                        if (data.username === adminData.username) {
                            _bcryptNodejs2.default.compare(data.password, adminData.password, function (err, res) {
                                console.log("Password: " + res);
                                if (res) {
                                    var payload = { subject: adminData.username };
                                    var token = _jsonwebtoken2.default.sign(payload, process.env.JWT_SECRET);
                                    resolve({ token: token });
                                } else resolve(undefined);
                            });
                        } else {
                            resolve(undefined);
                        }
                    }
                });
            });
        }
    }, {
        key: 'getUser',
        value: function getUser(data) {
            return new Promise(function (resolve, reject) {
                // console.log(data.uid)
                _user2.default.aggregate([{
                    $match: {
                        "userId": data.uid
                    }
                }, {
                    $lookup: {
                        "from": "aliases",
                        "localField": "userId",
                        "foreignField": "userId",
                        "as": "aliases"
                    }
                }, {
                    $sort: {
                        // "created":-1,
                        "aliases.created": -1
                    }
                }]).then(function (result) {
                    // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                    // console.log(JSON.stringify(result[0].aliases))
                    resolve(result);
                    // console.log(val[0].user[0].email);
                }).catch(function (err) {
                    reject({ code: 500, msg: err });
                });
            });
        }
    }, {
        key: 'getAlias',
        value: function getAlias(data) {
            return new Promise(function (resolve, reject) {
                _alias2.default.aggregate([{
                    $match: {
                        "aliasId": data.aid
                    }
                }, {
                    $lookup: {
                        "from": "users",
                        "localField": "userId",
                        "foreignField": "userId",
                        "as": "user"
                    }
                }, {
                    $unwind: "$user"
                }]).then(function (result) {
                    // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                    // console.log(JSON.stringify(result[0].aliases))
                    resolve(result);
                    // console.log(val[0].user[0].email);
                }).catch(function (err) {
                    reject({ code: 500, msg: err });
                });
            });
        }
    }, {
        key: 'getSearched',
        value: function getSearched(data) {
            return new Promise(function (resolve, reject) {
                if (data.key === "aliasId") {
                    _alias2.default.aggregate([{
                        $match: {
                            "aliasId": data.value
                        }
                    }, {
                        $lookup: {
                            "from": "users",
                            "localField": "userId",
                            "foreignField": "userId",
                            "as": "user"
                        }
                    }, {
                        $unwind: "$user"
                    }]).then(function (result) {
                        // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                        // console.log(JSON.stringify(result[0].aliases))
                        resolve(result);
                        // console.log(val[0].user[0].email);
                    }).catch(function (err) {
                        reject({ code: 500, msg: err });
                    });
                } else if (data.key === "alias") {
                    _alias2.default.aggregate([{
                        $match: {
                            "alias": data.value
                        }
                    }, {
                        $lookup: {
                            "from": "users",
                            "localField": "userId",
                            "foreignField": "userId",
                            "as": "user"
                        }
                    }, {
                        $unwind: "$user"
                    }]).then(function (result) {
                        // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                        // console.log(JSON.stringify(result[0].aliases))
                        resolve(result);
                        // console.log(val[0].user[0].email);
                    }).catch(function (err) {
                        reject({ code: 500, msg: err });
                    });
                } else if (data.key === "email") {
                    _user2.default.aggregate([{
                        $match: {
                            "email": data.value
                        }
                    }, {
                        $lookup: {
                            "from": "aliases",
                            "localField": "userId",
                            "foreignField": "userId",
                            "as": "aliases"
                        }
                    }, {
                        $sort: {
                            // "created":-1,
                            "aliases.created": -1
                        }
                    }]).then(function (result) {
                        // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                        // console.log(JSON.stringify(result[0].aliases))
                        resolve(result);
                        // console.log(val[0].user[0].email);
                    }).catch(function (err) {
                        reject({ code: 500, msg: err });
                    });
                } else {
                    _user2.default.aggregate([{
                        $match: {
                            "userId": data.value
                        }
                    }, {
                        $lookup: {
                            "from": "aliases",
                            "localField": "userId",
                            "foreignField": "userId",
                            "as": "aliases"
                        }
                    }, {
                        $sort: {
                            // "created":-1,
                            "aliases.created": -1
                        }
                    }]).then(function (result) {
                        // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                        // console.log(JSON.stringify(result[0].aliases))
                        resolve(result);
                        // console.log(val[0].user[0].email);
                    }).catch(function (err) {
                        reject({ code: 500, msg: err });
                    });
                }
                // resolve(data)
            });
        }
    }]);

    return AdminController;
}();

exports.default = new AdminController();
//# sourceMappingURL=admin.js.map