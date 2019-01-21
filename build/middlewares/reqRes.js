"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var reqRes = function () {
    function reqRes() {
        _classCallCheck(this, reqRes);
    }

    _createClass(reqRes, [{
        key: "responseHandler",
        value: function responseHandler(message, data, res) {
            return new Promise(function (resolve, reject) {
                var response = {
                    status: 200,
                    message: message,
                    data: data,
                    error: ''
                };
                resolve(res.status(200).send(response));
            });
        }
    }, {
        key: "redirectViaResponse",
        value: function redirectViaResponse(path, res) {
            return new Promise(function (resolve, reject) {
                resolve(res.redirect(path));
            });
        }

        //for handling http errors

    }, {
        key: "httpErrorHandler",
        value: function httpErrorHandler(err, res) {
            console.log(err);
            return new Promise(function (resolve, reject) {
                var error = {};
                error.status = err.code;
                error.error = err.msg.message || err.msg.errmsg || err.msg;
                error.result = "";
                resolve(res.status(err.code).send(error));
            });
        }
    }]);

    return reqRes;
}();

exports.default = new reqRes();
//# sourceMappingURL=reqRes.js.map