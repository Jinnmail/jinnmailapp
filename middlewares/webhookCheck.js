const logger = require('heroku-logger')

module.exports = {
    
    checkAccess: function(req, res, next) {
        var apiString = req.query.sendgrid_webhook_api_string;
        if (apiString == process.env.SENDGRID_WEBHOOK_API_STRING) {
            logger.info('message', {key: '**********apiString matched*********'})
            next();
        } else {
            logger.error('error! Invalid api string', {code: 401})
            return res.status(401).json({
                status: 401,
                error: 'Invalid api string',
                result: ''
            });
        }
    }

}