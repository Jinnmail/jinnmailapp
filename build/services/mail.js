'use strict';

var _sendgrid = require('sendgrid');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function sendEmail(parentCallback, fromEmail, toEmails, subject, textContent, htmlContent) {
    var errorEmails = [];
    var successfulEmails = [];
    //  console.log(process.env.SENDGRID_API_KEY)
    var sg = require('sendgrid')('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');
    _async2.default.parallel([function (callback) {
        // Add to emails
        for (var i = 0; i < toEmails.length; i += 1) {
            // Add from emails
            var senderEmail = new _sendgrid.mail.Email(fromEmail);
            // Add to email
            var toEmail = new _sendgrid.mail.Email(toEmails[i]);
            // HTML Content
            var content = new _sendgrid.mail.Content('text/html', htmlContent);
            var mail = new _sendgrid.mail.Mail(senderEmail, subject, toEmail, content);
            var request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON()
            });
            sg.API(request, function (error, response) {
                console.log('SendGrid');
                if (error) {
                    console.log('Error response received');
                }
                console.log(response, error);
                console.log(response.statusCode);
                console.log(response.body);
                // console.log(response.headers);
            });
        }
        // return
        callback(null, true);
    }], function (err, results) {
        console.log('Done');
    });
    parentCallback(null, {
        successfulEmails: successfulEmails,
        errorEmails: errorEmails
    });
}

_async2.default.parallel([function (callback) {
    sendEmail(callback, 'george@jinnmail.com', ['anuragpurwar007@gmail.com'], 'Subject Line', 'Text Content', '<p style="font-size: 32px;">HTML Content</p>');
}], function (err, results) {
    console.log(results, "res");
});

// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: 'to',
//   from: 'from',
//   subject: 'Sending with SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
// sgMail.send(msg);
//# sourceMappingURL=mail.js.map