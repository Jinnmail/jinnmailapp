'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

// Importing route files from ./routes

//logger


var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cookieParser = require('cookie-parser');

var _cookieParser2 = _interopRequireDefault(_cookieParser);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

require('dotenv/config');

var _expressValidator = require('express-validator');

var _expressValidator2 = _interopRequireDefault(_expressValidator);

var _user = require('./routes/user');

var _user2 = _interopRequireDefault(_user);

var _alias = require('./routes/alias');

var _alias2 = _interopRequireDefault(_alias);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var server = function () {
  function server() {
    _classCallCheck(this, server);

    this.app = (0, _express2.default)();
    this.config();
    this.routes();
    process.on('unhandledRejection', function (reason, p) {
      console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
      // application specific logging, throwing an error, or other logic here
    });
  }

  _createClass(server, [{
    key: 'config',
    value: function config() {
      this.app.use((0, _expressValidator2.default)());
      this.app.use((0, _cors2.default)());
      this.app.use(_bodyParser2.default.urlencoded({ extended: true }));
      this.app.use(_bodyParser2.default.json());
      this.app.use((0, _cookieParser2.default)());
    }
  }, {
    key: 'routes',
    value: function routes() {

      this.app.use('/api/v1/user', _user2.default);
      this.app.use('/api/v1/alias', _alias2.default);
    }
  }]);

  return server;
}();

exports.default = new server().app;
//# sourceMappingURL=app.js.map