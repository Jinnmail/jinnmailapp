export function registerValidator(req, res, next) {
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
    req.asyncValidationErrors().then(() => {
        next();
    }).catch(errors => {
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

export function loginValidator(req, res, next) {
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
    req.asyncValidationErrors().then(() => {
        next();
    }).catch(errors => {
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