// import * as jwt from "jsonwebtoken";
var jwt = require("jsonwebtoken")
var cred = require('../config/const')


module.exports = {
    
    validateUser: function(req, res, next) {
        var token = req.header('Authorization');
        if (token) {
            console.log('In jwt verify middleware for userId');
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
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
    }, 
    
}
