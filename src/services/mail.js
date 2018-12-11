import { mail as helper } from 'sendgrid';
import async from 'async';
function sendEmail(
    parentCallback,
    fromEmail,
    toEmails,
    subject,
    textContent,
    htmlContent
) {
    const errorEmails = [];
    const successfulEmails = [];
  //  console.log(process.env.SENDGRID_API_KEY)
    const sg = require('sendgrid')('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');
    async.parallel([
        callback => {
            // Add to emails
            for (let i = 0; i < toEmails.length; i += 1) {
                // Add from emails
                const senderEmail = new helper.Email(fromEmail);
                // Add to email
                const toEmail = new helper.Email(toEmails[i]);
                // HTML Content
                const content = new helper.Content('text/html', htmlContent);
                const mail = new helper.Mail(senderEmail, subject, toEmail, content);
                const request = sg.emptyRequest({
                    method: 'POST',
                    path: '/v3/mail/send',
                    body: mail.toJSON()
                });
                sg.API(request, (error, response) => {
                    console.log('SendGrid');
                    if (error) {
                        console.log('Error response received');
                    }
                    console.log(response,error)
                    console.log(response.statusCode);
                    console.log(response.body);
                    // console.log(response.headers);
                });
            }
            // return
            callback(null, true);
        }
    ], (err, results) => {
        console.log('Done');
    });
    parentCallback(null,
        {
            successfulEmails,
            errorEmails,
        }
    );
}

async.parallel([
    callback => {
        sendEmail(
            callback,
            'george@jinnmail.com',
            ['anuragpurwar007@gmail.com'],
            'Subject Line',
            'Text Content',
            '<p style="font-size: 32px;">HTML Content</p>'
        );
    }
], (err, results) => {
    console.log(results, "res")
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