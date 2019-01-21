'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var logger = function () {
    function logger() {
        _classCallCheck(this, logger);

        this.log = _bunyan2.default.createLogger({
            name: 'jinnmail',
            streams: [{
                level: 'debug',
                stream: process.stdout
            }, {
                level: 'debug',
                stream: process.stdout
            }]
        });
    }

    _createClass(logger, [{
        key: 'info',
        value: function info(message) {
            this.log.info(message);
        }
    }, {
        key: 'warn',
        value: function warn(message) {
            this.log.warn(message);
        }
    }, {
        key: 'debug',
        value: function debug(message) {
            this.log.debug(message);
        }
    }]);

    return logger;
}();

exports.default = new logger();
//# sourceMappingURL=logger.js.map