'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = validateUser;

var _jsonwebtoken = require('jsonwebtoken');

var jwt = _interopRequireWildcard(_jsonwebtoken);

var _const = require('../config/const');

var _const2 = _interopRequireDefault(_const);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function validateUser(req, res, next) {

    var token = req.header('Authorization');
    if (token) {
        console.log('In jwt verify middleware for userId');
        jwt.verify(token, process.env.JWT_SECRET, function (err, decoded) {
            if (err) {
                res.status(401).json({
                    status: 401,
                    error: 'Failed to authenticated user',
                    result: ''
                });
            } else {
                req.userId = decoded.userId;
                console.log('req.userId set to- ' + req.userId);
                next();
            }
        });
    } else {
        return res.status(401).json({
            status: 401,
            error: 'No session token provided',
            result: ''
        });
    }
}
//# sourceMappingURL=userAuth.js.map