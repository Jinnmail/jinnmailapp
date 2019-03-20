'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mailModel = require('../models/mailDetails');
var request = require('request');

var MailController = function () {
    function MailController() {
        _classCallCheck(this, MailController);
    }

    _createClass(MailController, [{
        key: 'getDetails',
        value: function getDetails(data) {
            // console.log("DATA: "+JSON.stringify(data))
            return new Promise(function (resolve, reject) {
                // console.log("DATA: "+typeof(data.uid))
                mailModel.find({ "alias": data.uid }).then(function (result) {
                    resolve(result);
                }).catch(function (err) {
                    reject({ code: 500, msg: err });
                });
            });
        }
    }, {
        key: 'getInboxDetails',
        value: function getInboxDetails(data) {
            // data = JSON.parse(data);
            return new Promise(function (resolve, reject) {
                var url = 'https://jinnmail.com/api/users/' + data.wid + '/mailboxes/' + data.mid;
                var options = {
                    method: 'get',
                    json: true,
                    url: url
                };
                request(options, function (err, res, body) {
                    if (err) {
                        console.log(err);
                    }
                    var result = {};
                    result.unseen = body.unseen;
                    console.log(JSON.stringify(data) + '-' + _typeof(data.wid) + '-' + data["wid"]);
                    var link = 'https://jinnmail.com/api/users/' + data.wid + '/mailboxes/' + data.mid + '/messages';
                    var option = {
                        method: 'get',
                        json: true,
                        url: link
                    };
                    request(option, function (err, res, doc) {
                        if (err) {
                            console.log(err);
                        }
                        console.log(doc);
                        if (doc.results.length > 0) {
                            result.count = doc.results.length;
                            result.mostRecent = doc.results[0].from.address;
                        } else {
                            result.count = 0;
                            result.mostRecent = "None";
                        }
                        console.log(result);
                        resolve(result);
                    });
                });
            });
        }
    }, {
        key: 'getOutboxDetails',
        value: function getOutboxDetails(data) {
            // data = JSON.parse(data);
            return new Promise(function (resolve, reject) {
                var url = 'https://jinnmail.com/api/users/' + data.wid + '/mailboxes/' + data.mid;
                var options = {
                    method: 'get',
                    json: true,
                    url: url
                };
                request(options, function (err, res, body) {
                    if (err) {
                        console.log(err);
                    }
                    var result = {};
                    result.unseen = body.unseen;
                    console.log(JSON.stringify(data) + '-' + _typeof(data.wid) + '-' + data["wid"]);
                    var link = 'https://jinnmail.com/api/users/' + data.wid + '/mailboxes/' + data.mid + '/messages';
                    var option = {
                        method: 'get',
                        json: true,
                        url: link
                    };
                    request(option, function (err, res, doc) {
                        if (err) {
                            console.log(err);
                        }
                        console.log(doc);
                        if (doc.results.length > 0) {
                            result.count = doc.results.length;
                            result.mostRecent = doc.results[0].to[0].address;
                        } else {
                            result.count = 0;
                            result.mostRecent = "None";
                        }
                        console.log(result);
                        resolve(result);
                    });
                });
            });
        }
    }]);

    return MailController;
}();

module.exports = new MailController();
//# sourceMappingURL=mailDetails.js.map