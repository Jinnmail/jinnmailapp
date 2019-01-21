'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.registerValidator = registerValidator;
exports.loginValidator = loginValidator;
function registerValidator(req, res, next) {
    req.checkBody({
        'email': {
            notEmpty: true,
            isEmail: {
                errorMessage: 'Invalid Email Address'
            },
            errorMessage: 'Email is required'
        },
        'password': {
            notEmpty: true,
            errorMessage: 'Password is required'
        }
    });
    req.asyncValidationErrors().then(function () {
        next();
    }).catch(function (errors) {
        if (errors) {
            return res.status(422).json({
                status: 422,
                error: errors,
                result: ""
            });
        }
        ;
    });
}

function loginValidator(req, res, next) {
    req.checkBody({
        'email': {
            notEmpty: true,
            isEmail: {
                errorMessage: 'Invalid Email Address'
            },
            errorMessage: 'Email is required'
        },

        'password': {
            notEmpty: true,
            errorMessage: 'Password is required'
        }
    });
    req.asyncValidationErrors().then(function () {
        next();
    }).catch(function (errors) {
        if (errors) {
            return res.status(422).json({
                status: 422,
                error: errors,
                result: ""
            });
        }
        ;
    });
}
//# sourceMappingURL=validator.js.map