'use strict';

var _const = require('../config/const');

var _const2 = _interopRequireDefault(_const);

var _logger = require('../utils/logger');

var _logger2 = _interopRequireDefault(_logger);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var mongoose = require('mongoose');

var Mongoose = function Mongoose() {
    _classCallCheck(this, Mongoose);

    mongoose.connect(process.env.DB_HOST, {
        auth: {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        },
        useNewUrlParser: true,
        //these parameters will change in production 

        autoIndex: false, // Don't build indexes
        reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
        reconnectInterval: 500, // Reconnect every 500ms
        poolSize: 10, // Maintain up to 10 socket connections
        // If not connected, return errors immediately rather than waiting for reconnect
        bufferMaxEntries: 0,
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        socketTimeoutMS: 45000 // Close sockets after 45 seconds of inactivity
    });
    return mongoose;
};

module.exports = new Mongoose();
//# sourceMappingURL=db.js.map