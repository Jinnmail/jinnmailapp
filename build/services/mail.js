'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.email_sender = email_sender;

var _sendgrid = require('sendgrid');

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
function email_sender(toEmails) {
    for (var i = 0; i < toEmails.length; i += 1) {
        // Add from emails
        var senderEmail = new _sendgrid.mail.Email('george@jinnmail.com');
        // Add to email
        var toEmail = new _sendgrid.mail.Email(toEmails[i]);
        // HTML Content
        var content = new _sendgrid.mail.Content('text/html', 'welcome to jinnmail');
        var mail = new _sendgrid.mail.Mail(senderEmail, 'jinnmail', toEmail, content);
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
    // parentCallback(null,
    //     {
    //         successfulEmails,
    //         errorEmails,
    //     }
    // );
}

// async.parallel([
//     callback => {
//         email_sender(
//             callback,
//             'george@jinnmail.com',
//             ['anuragpurwar007@gmail.com'],
//             'Subject Line',
//             'Text Content',
//             '<p style="font-size: 32px;">HTML Content</p>'
//         );
//     }
// ], (err, results) => {
//     console.log(results, "res")
// });


// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// export function email_sender(to) {
//     console.log(to)
//   const msg = {
//         to: to,
//         from:"george@jinnmail.com",
//         subject: 'jinnmail',
//         text: 'hello',
//         html: '<strong>welcome to jinnmail</strong>',
//     };
//     sgMail.send(msg);
// }
//# sourceMappingURL=mail.js.map