var helper = require('sendgrid').mail;
const async = require('async');
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
const logger = require('heroku-logger')

const sgNew = require('@sendgrid/mail');
sgNew.setApiKey(process.env.SENDGRID_API_KEY);

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
            const params = { 
                to: toEmails[i],
                from: 'george@jinnmail.com', 
                subject: 'forget',
                html: msg
            };
            sgNew.send(params).catch(err => {
                logger.error(err, {code: 500})
            });  
        }
    }, 

    // forget_mail: function(toEmails, msg) {
    //     for (let i = 0; i < toEmails.length; i += 1) {
    //         // Add from emails
    //         const senderEmail = new helper.Email('george@jinnmail.com');
    //         // Add to email
    //         const toEmail = new helper.Email(toEmails[i]);
    //         // HTML Content
    //         const content = new helper.Content('text/html', msg);
    //         const mail = new helper.Mail(senderEmail, 'forget', toEmail, content);
    //         const request = sg.emptyRequest({
    //             method: 'POST',
    //             path: '/v3/mail/send',
    //             body: helper.toJSON()
    //         });
    //         sg.API(request, (error, response) => {
    //             console.log('SendGrid');
    //             if (error) {
    //                 console.log('Error response received');
    //             }
    //             console.log(response,error)
    //             console.log(response.statusCode);
    //             console.log(response.body);
    //             // console.log(response.headers);
    //         });
    //     }
    //     // parentCallback(null,
    //     //     {
    //     //         successfulEmails,
    //     //         errorEmails,
    //     //     }
    //     // );
    // }, 

    send_mail: function(params) {
        var {to, from, replyTo, subject, cc, headers, messageBody, attachments} = params

        const msg = {
            headers: {headers}, 
            to: to,
            from: from, 
            cc: cc, 
            subject: subject,
            html: messageBody, 
            attachments: []
        };

        if (replyTo) {
            msg.reply_to = replyTo
        } 

        for (let i=0; i < attachments.length; i++) { 
            const {fieldname, originalname, encoding, mimetype, buffer} = attachments[i]
            attachment = {
                content: buffer.toString("base64"), 
                filename: originalname, 
                type: mimetype, 
                disposition: "attachment"
            }
            msg.attachments.push(attachment)
        }

        sgNew.send(msg).catch(err => {
            logger.error(err, {code: 500})
        });

        logger.info("to: " + to)
        logger.info("from: " + from)
        logger.info("subject: " + subject)
    }, 

    send_bounce_back: function(params) {
        var {to, from, subject, headers, messageBody} = params

        const msg = {
            headers: {headers}, 
            to: to,
            from: from, 
            subject: subject,
            html: messageBody
        };  

        sgNew.send(msg).then(() => {
            logger.info("msg: Bounce back email sent")
        }).catch(err => {
            logger.error(err, {code: 500})
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