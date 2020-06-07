const uuidv4 = require('uuid/v4');
const logger = require('heroku-logger')
const mailParse = require('@sendgrid/inbound-mail-parser');
const mail = require('../services/mail');
const userModel = require('../models/user');
const aliasModel = require('../models/alias');
const proxymailModel = require('../models/proxymail');

function randomString(string_length) {
    let numbers = "0123456789";
    let letters = "abcdefghiklmnopqrstuvwxyz";
    let chars = `${numbers}${letters}`
    let char = letters[Math.floor(Math.random() * letters.length)]
    let randomstring = char; // email addresses must begin with a letter

    for (let i = 0; i < string_length-1; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }

    return randomstring;
}

module.exports = { 

    inbound: async function(data) {
        var html = ''
        var headerHtml = ''
        var footerHtml = ''

        var attachments = data.files

        var config = {keys: ['to', 'from', 'subject', 'cc', 'html', 'text', 'headers']};
        var parsing = new mailParse(config, data);
        var response = parsing.keyValues();

        logger.info("to: came into inbound parse as " + response.to)
        logger.info("from: came into inbound parse as " + response.from)

        var to = response.to.replace(/"/g, '');
        to = extractEmailAddress(to)
        var from = response.from.replace(/"/g, '');
        var subject = (response.subject ? response.subject : " "); // subject is required in sendgrid
        var messageBody = (response.text ? response.html : " ");
        var headers = response.headers.toString();
        var cc = (response.cc ? response.cc : "")

        logger.info("to: inbound parse converted " + to)
        logger.info("from: inbound parse converted " + from)

        if (to.includes("@jinnmail.com")) { // test case 1 and 3
            logger.info("Test Case 1 and 3")
            const alias = await aliasModel.findOne({alias: to})
            if (alias && alias.status) {
                const senderAlias = await get_or_create_sender_alias(from, alias.userId)
                const proxyMail = await get_or_create_proxymail(alias.aliasId, senderAlias.aliasId)
                const user = await userModel.findOne({userId: alias.userId})
                if (user) {
                    subject = `[𝕁𝕄] ${subject.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')}`
                    headers =  headers.replace(new RegExp(alias.alias, 'g'), '')
                    headerHtml = 
                        `<div style=\"background-color:#eee;padding:30px 20px 10px;text-align:center;width:100%\">
                            <h1>JinnMail</h1><p>This email has been sent to Jinnmail</p>
                        </div>`
                    footerHtml = 
                        `<hr><hr><div style=\"padding:30px 20px 10px;text-align:center;width:100%\">
                            <p>To contact us send a mail on the following email address:</p>
                            <a href=\"mailto:${proxyMail.proxyMail}\" target=\"_blank\">${proxyMail.proxyMail}</a>
                        </div>`
                    html = messageBody.replace(/\[\[Hidden by Jinnmail\]\]/g, user.email)
                    html = html.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')
                    // html = messageBody.replace(/\n/g, "<br />").replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')
                    html = `${headerHtml}<br /><br />${html}<br /><br />${footerHtml}`
                    mail.send_mail({
                        to: user.email, 
                        from: from, 
                        replyTo: `${extractName(senderAlias.alias)} <${proxyMail.proxyMail}>`,  
                        subject: subject, 
                        cc: cc, 
                        headers: headers, 
                        messageBody: html, 
                        attachments: attachments
                    })
                }
            } else {
                logger.error("No active Alias found", {code: 500})
                mail.send_bounce_back({ 
                    to: extractEmailAddress(from), 
                    from: "Mail Deivery Subsystem <mailer-daemon@jinnmail.com>", 
                    subject: "Delivery Status Notification (Failure)", 
                    headers: headers, 
                    messageBody: "No active Alias found"
                })
                throw new Error("No active Alias found");
            }
        } else if (to.includes("@reply.jinnmail.com")) {
            fromEmailAddress = extractEmailAddress(from)
            jinnmailUser = await userModel.findOne({email: fromEmailAddress})
            if (jinnmailUser) {
                if (subject.includes("Re: [𝕁𝕄]")) { // test case 2
                    logger.info("Test Case 2")
                    const proxyMail = await proxymailModel.findOne({proxyMail: to});
                    const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId, type: "sender"});
                    const alias = await aliasModel.findOne({aliasId: proxyMail.aliasId});

                    subject = subject.replace(/\[𝕁𝕄\] /g, "").replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
                    const user = await userModel.findOne({userId: alias.userId})
                    headers =  headers.replace(new RegExp(user.email, 'g'), '')
                    footerHtml = "Sent secretly with <a clicktracking=off href=\"https://emailclick.jinnmail.com/homepage-from-signature\">Jinnmail</a>"
                    messageBody = messageBody.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
                    // .replace(/-/g, '')
                    // messageBody = messageBody.replace(/\n/g, "<br />").replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias).replace(/-/g, '')
                    // messageBody = messageBody.replace('To contact us send a mail on the following email address:', '')
                    messageBody = messageBody.replace(new RegExp(proxyMail.proxyMail, 'g'), "[[Hidden by Jinnmail]]")
                    html += `${messageBody}<br /><br />${footerHtml}`

                    mail.send_mail({
                        to: senderAlias.alias, 
                        from: alias.alias,  
                        subject: subject, 
                        cc: cc, 
                        headers: headers, 
                        messageBody: html, 
                        attachments: attachments
                    })                
                } else { // test case 4
                    logger.info("Test Case 4")
                    to = extractEmailAddress(to)
                    const proxyMail = await proxymailModel.findOne({proxyMail: to});
                    const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId, type: "sender"});
                    const alias = await aliasModel.findOne({userId: jinnmailUser.userId, type: "alias"});

                    subject = subject.replace(new RegExp(jinnmailUser.email, 'g'), '[[Hidden by Jinnmail]]')
                    const user = await userModel.findOne({userId: alias.userId})
                    headers =  headers.replace(new RegExp(user.email, 'g'), '')
                    footerHtml = "Sent secretly with <a clicktracking=off href='https://emailclick.jinnmail.com/homepage-from-signature'>Jinnmail</a>"
                    html = messageBody.replace(new RegExp(jinnmailUser.email, 'g'), '[[Hidden by Jinnmail]]')
                    // html = messageBody.replace(/\n/g, "<br />").replace(new RegExp(jinnmailUser.email, 'g'), '[[Hidden by Jinnmail]]')
                    html += `<br /><br />${footerHtml}`

                    mail.send_mail({
                        to: senderAlias.alias, 
                        from: alias.alias, 
                        subject: subject, 
                        cc: cc, 
                        headers: headers, 
                        messageBody: html, 
                        attachments: attachments
                    })
                }
            } else {
                mail.send_bounce_back({ 
                    to: extractEmailAddress(from), 
                    from: "Mail Deivery Subsystem <mailer-daemon@jinnmail.com>", 
                    subject: "Delivery Status Notification (Failure)", 
                    headers: headers, 
                    messageBody: "No jinnmail User found"
                })
                throw new Error("No jinnmail User found")
            }
        }

        return
    }

}

async function get_or_create_sender_alias(sender, userId) {
    senderAlias = await aliasModel.findOne({alias: sender})
    if (senderAlias) {
        return senderAlias
    } else {
        let newSenderAlias = new aliasModel();
        newSenderAlias.aliasId = uuidv4();
        newSenderAlias.userId = userId
        newSenderAlias.alias = sender;
        newSenderAlias.type = "sender";
        newSenderAlias.mailCount = 0;
        
        return newSenderAlias.save();
    }
}

async function get_or_create_proxymail(aliasId, senderAliasId) {
    proxymail = await proxymailModel.findOne({aliasId: aliasId, senderAliasId})
    if (proxymail) {
        return proxymail
    } else {
        let newproxymail = new proxymailModel();
        newproxymail.proxyMailId = uuidv4();
        newproxymail.aliasId = aliasId;
        newproxymail.senderAliasId = senderAliasId
        newproxymail.proxyMail = `${randomString(11)}@reply.jinnmail.com`;

        return newproxymail.save();
    }
}

function extractEmailAddress(nameAndEmailAddress) {
    if (nameAndEmailAddress.includes('<')) {
        var spaceIndex = nameAndEmailAddress.lastIndexOf(' '); // "first last <email@server.com>"
        var emailAddress = nameAndEmailAddress.substring(spaceIndex+2, nameAndEmailAddress.length-1) // => email@server.com
        return emailAddress
    }

    return nameAndEmailAddress
}

function extractName(nameAndEmailAddress) {
    if (nameAndEmailAddress.includes('<')) {
        var spaceIndex = nameAndEmailAddress.lastIndexOf(' '); // "first last <email@server.com>"
        var name = nameAndEmailAddress.substring(0, spaceIndex) // => first last
        return name
    }

    return nameAndEmailAddress
}

// messageBody = messageBody.replace(
//     `<div style=\"background-color:#eee;padding:30px 20px 10px;text-align:center;width:100%\">
//         <h1>JinnMail</h1><p>This email has been sent to Jinnmail</p>
//     </div>`, '')
// messageBody = messageBody.replace(
//     `<hr><hr><div style=\"padding:30px 20px 10px;text-align:center;width:100%\">
//         <p>To contact us send a mail on the following email address:</p>
//         <a href=\"mailto:${proxyMail.proxyMail}\" target=\"_blank\">${proxyMail.proxyMail}</a>
//     </div>`, '')

// var spaceIndex = fromEmail.lastIndexOf(' '); // "first last <email@server.com>"
// fromEmail = fromEmail.substring(spaceIndex+2, fromEmail.length-1) // => email@server.com

// var attachmentSize = 0

// for (let i=0; i < attachments.length; i++) { 
//     attachmentSize += Buffer.byteLength(attachements[i].toString("base64"))
// }
    
// if (attachemntSize > 20000000) { // 20mb
//     mail.bounce_back(
//         headers, 
//         fromEmail, 
//         "Mail Deivery Subsystem <mailer-daemon@jinnmail.com>", // from
//         "Delivery Status Notification (Failure)", // subject
//         "Your message exceeded message size limits." // message body
//     )

//     reject({code: 552, msg: "Attachments exceeded file size limits"});
// }