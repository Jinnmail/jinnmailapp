import { mail as helper } from 'sendgrid';
import async from 'async';
const sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
export function email_sender(
    toEmails,
    code
) {
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
}


export function forget_mail(
    toEmails,
    msg
) {
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