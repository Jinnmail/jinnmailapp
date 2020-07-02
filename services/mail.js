var helper = require('sendgrid').mail;
const async = require('async');
var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
const logger = require('heroku-logger')
const dotenv = require("dotenv").config()
const sgNew = require('@sendgrid/mail');
sgNew.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {

    email_sender: function(toEmails, code) {
        for (let i = 0; i < toEmails.length; i += 1) {
            let params = { 
                to: toEmails[i],
                from: `Jinnmail <hello${process.env.JM_EMAIL_DOMAIN}>`,
                reply_to: 'Jinnmail Support <help@jinnmail.org>', 
                subject: 'Verification code for Jinnmail',
                html: `Almost there!<br><br>Before you can use your new Jinnmail account, enter this code into the CODE textbox inside your Jinnmail extension window and click "Verify". Once confirmed, your Jinnmail account will be activated and ready to use.<br><br><h2>${code}</h2><br><br><br><br>Any issues? Reply here or email help${process.env.JM_EMAIL_DOMAIN}.`
            };
            sgNew.send(params).catch(err => {
                logger.error(err, {code: 500})
            }); 
        }
    }, 

    forget_mail: function(toEmails, msg) {
        for (let i = 0; i < toEmails.length; i += 1) {
            const params = { 
                to: toEmails[i],
                from: `Jinnmail <hello${process.env.JM_EMAIL_DOMAIN}>`,
                reply_to: 'Jinnmail Support <help@jinnmail.org>', 
                subject: 'Reset your password',
                html: msg
            };
            sgNew.send(params).catch(err => {
                logger.error(err, {code: 500})
            });  
        }
    }, 
    
    send_welcome(to) {
        let html = `Welcome to Jinnmail, the tool that keeps your email address private and spam-free by using aliases that mask your real email address.<br /> \
            <br /> \
            A message sent by anyone to one of your aliases will arrive in this ${to} inbox like normal, but when you reply it is sent by your alias; the recipient never knows your real address. We recommend generating a new alias for every new form. Or create a custom alias at your <a clicktracking=off href='https://jinnmail.com/account'>Account Dashboard</a> to use for mobile apps. (Mobile support soon). Emails are never stored or read by any human beings.<br /> \
            <br /> \
            Generate new email aliases when signing up or filling out any webform using the <a clicktracking=off href='<https://go.jinnmail.com/chrome>'>Jinnmail extension in Chrome</a>. Clicking the small Jinnmail button that appears in any email address box creates and inserts a new alias into the webform.<br /> \
            <br /> \
            You can deactivate/reactivate any aliases from the Jinnmail browser extension, or you can delete your aliases at your <a clicktracking=off href='https://jinnmail.com/account'>Account Dashboard</a>.<br /> \
            <br /> \
            This is a beta and there could be bugs. We want to make this software something you use everyday, so please reach out to help${process.env.JM_EMAIL_DOMAIN} with any comments, problems, or suggestions.<br /> \
            <br /> \
            Thanks for staying private using Jinnmail!`
        const msg = {
            to: to,
            from: `Jinnmail <hello${process.env.JM_EMAIL_DOMAIN}>`, 
            reply_to: `Jinnmail Support <${process.env.JM_EMAIL_DOMAIN}>`, 
            subject: "Welcome to Jinnmail",
            html: html
        };
        sgNew.send(msg).then(() => {
            logger.info("msg: Welcome to Jinnmail email sent")
        }).catch(err => {
            logger.error(err, {code: 500})
        });
    }, 

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

        // msg.attachments = attachments;
        for (let i=0; i < attachments.length; i++) {
            const {filename, contentType, content} = attachments[i]
            attachment = {
                content: content.toString("base64"), 
                filename: filename, 
                type: contentType, 
                disposition: "attachment"
            }
            msg.attachments.push(attachment) 
            // const {fieldname, originalname, encoding, mimetype, buffer} = attachments[i]
            // attachment = {
            //     content: buffer.toString("base64"), 
            //     filename: originalname, 
            //     type: mimetype, 
            //     disposition: "attachment"
            // }
            // msg.attachments.push(attachment)
        }

        sgNew.send(msg)
        .then(() => {
            logger.info("to: " + msg.to)
            logger.info("from: " + msg.from)
            logger.info("subject: " + msg.subject)
        })
        .catch(err => {
            logger.error(err, {code: 500})
        });
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