'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _randToken = require('rand-token');

var _randToken2 = _interopRequireDefault(_randToken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TokenService = function () {
    function TokenService() {
        _classCallCheck(this, TokenService);
    }

    _createClass(TokenService, [{
        key: 'refreshTokenGenerator',
        value: function refreshTokenGenerator() {
            return new Promise(function (resolve, reject) {
                var refresh_token = _randToken2.default.uid(241);
                resolve(refresh_token);
            });
        }
    }]);

    return TokenService;
}();

exports.default = new TokenService();
//# sourceMappingURL=refreshToken.js.map