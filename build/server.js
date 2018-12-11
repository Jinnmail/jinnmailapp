'use strict';

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _app = require('./app');

var _app2 = _interopRequireDefault(_app);

var _const = require('./config/const');

var _const2 = _interopRequireDefault(_const);

var _logger = require('./utils/logger');

var _logger2 = _interopRequireDefault(_logger);

var _cluster = require('cluster');

var _cluster2 = _interopRequireDefault(_cluster);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cores = _os2.default.cpus().length;
var app = _http2.default.createServer(_app2.default);
app.listen(process.env.PORT || 9000);
app.on('error', error);
app.on('listening', connected);

function connected() {
    _logger2.default.info(' started at ' + new Date());
}

function error() {
    if (error.syscall !== 'listen') {
        console.log(error);
    }
    var bind = typeof (0, _const2.default)().port === 'string' ? 'Pipe ' + (0, _const2.default)().port : 'Port ' + (0, _const2.default)().port;
    switch (error.code) {
        case 'EACCES':
            _logger2.default.warn(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            _logger2.default.warn(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
//# sourceMappingURL=server.js.map