var helper = require('sendgrid').mail;
const async = require('async');
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);

module.exports = {

    email_sender: function(toEmails,code) {
        console.log(code);
        
        for (let i = 0; i < toEmails.length; i += 1) {
            // Add from emails
            const senderEmail = new helper.Email('george@jinnmail.com');
            // Add to email
            const toEmail = new helper.Email(toEmails[i]);
            // HTML Content
            const content = new helper.Content('text/html', `welcome to jinnmail, verification code is: ${code}`);
            const mail = new helper.Mail(senderEmail, 'jinnmail', toEmail, content);
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
        // parentCallback(null,
        //     {
        //         successfulEmails,
        //         errorEmails,
        //     }
        // );
    }, 

    forget_mail: function(toEmails, msg) {
        for (let i = 0; i < toEmails.length; i += 1) {
            // Add from emails
            const senderEmail = new helper.Email('george@jinnmail.com');
            // Add to email
            const toEmail = new helper.Email(toEmails[i]);
            // HTML Content
            const content = new helper.Content('text/html', msg);
            const mail = new helper.Mail(senderEmail, 'forget', toEmail, content);
            const request = sg.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: helper.toJSON()
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
        // parentCallback(null,
        //     {
        //         successfulEmails,
        //         errorEmails,
        //     }
        // );
    }, 

    send_email: function(to, from, subject, messageBody) {
        const fromEmail = new helper.Email(from);
        const toEmail = new helper.Email(to);
        const content = new helper.Content('text/html', messageBody);
        const mail = new helper.Mail(fromEmail, subject, toEmail, content);

        const request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
        });
        sg.API(request, (error, response) => {
            if (error) {
                console.log(error)
                console.log(response)
                console.log('Error response received');
            } else {
                console.log("***Success***")
            }
        });
    }

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