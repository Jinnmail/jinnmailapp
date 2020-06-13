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

async function testcase1and3(params) {
    var html = ''
    var headerHtml = ''
    var footerHtml = ''
    var {
        to: to, 
        from: from, 
        cc: cc, 
        headers: headers, 
        subject: subject, 
        messageBody: messageBody, 
        attachments: attachments, 
        alias
    } = params

    const senderAlias = await get_or_create_sender_alias(from, alias.userId)
    const proxyMail = await get_or_create_proxymail(alias.aliasId, senderAlias.aliasId)
    const user = await userModel.findOne({userId: alias.userId})

    if (proxyMail && senderAlias && user) {
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
    } else {
        bounceback(to, from, headers)
    }
}

async function testcase2(params) {
    var footerHtml = ''
    var html = ''
    var {
        to: to, 
        from: from, 
        cc: cc, 
        headers: headers, 
        subject: subject, 
        messageBody: messageBody, 
        attachments: attachments
    } = params

    const proxyMail = await proxymailModel.findOne({proxyMail: to});
    const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId, type: "sender"});
    const alias = await aliasModel.findOne({aliasId: proxyMail.aliasId});

    if (proxyMail && senderAlias && (alias && alias.status)) {
        subject = subject.replace(/\[𝕁𝕄\] /g, "").replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
        const user = await userModel.findOne({userId: alias.userId})
        headers =  headers.replace(new RegExp(user.email, 'g'), '')
        footerHtml = "Sent secretly with <a clicktracking=off href=\"https://emailclick.jinnmail.com/homepage-from-signature\">Jinnmail</a>"
        messageBody = messageBody.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
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
    } else {
        bounceback(to, from, headers)
    }
}

async function testcase4(params) {
    var html = ''
    var footerHtml = ''
    var {
        to: to, 
        from: from, 
        cc: cc, 
        headers: headers, 
        subject: subject, 
        messageBody: messageBody, 
        attachments: attachments, 
        jinnmailUser: jinnmailUser
    } = params

    to = extractEmailAddress(to)
    const proxyMail = await proxymailModel.findOne({proxyMail: to});
    const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId, type: "sender"});
    const alias = await aliasModel.findOne({userId: jinnmailUser.userId, type: "alias"});

    if (proxyMail && senderAlias && (alias && alias.status)) {
        subject = subject.replace(new RegExp(jinnmailUser.email, 'g'), '[[Hidden by Jinnmail]]')
        const user = await userModel.findOne({userId: alias.userId})
        headers =  headers.replace(new RegExp(user.email, 'g'), '')
        footerHtml = "Sent secretly with <a clicktracking=off href='https://emailclick.jinnmail.com/homepage-from-signature'>Jinnmail</a>"
        html = messageBody.replace(new RegExp(jinnmailUser.email, 'g'), '[[Hidden by Jinnmail]]')
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
    } else {
        bounceback(to, from, headers)
    }
}

async function testcase5() {

}

async function testcase6() {

}

function bounceback(to, from, headers) {
    logger.error("No active Alias found", {code: 500})
    html = `
        <div>
        <table cellpadding="0" cellspacing="0" style="padding-top:32px;background-color:#ffffff"><tbody>
        <tr><td>
        <table cellpadding="0" cellspacing="0"><tbody>
        <tr><td style="max-width:560px;padding:24px 24px 32px;background-color:#fafafa;border:1px solid #e0e0e0;border-radius:2px">
        <img style="padding:0 24px 16px 0;float:left" width="72" height="72" alt="Error Icon" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/gmail-warning.png?raw=true" data-image-whitelisted="" class="CToWUd">
        <table style="min-width:272px;padding-top:8px"><tbody>
        <tr><td><h2 style="font-size:20px;color:#212121;font-weight:bold;margin:0">
        Address not found
        </h2></td></tr>
        <tr><td style="padding-top:20px;color:#757575;font-size:16px;font-weight:normal;text-align:left">
        Your message wasn't delivered to <a style="color:#212121;text-decoration:none"><b>${to}</b></a> because the address couldn't be found, or is unable to receive mail.
        </td></tr>
        <tr><td style="padding-top:24px;color:#4285f4;font-size:14px;font-weight:bold;text-align:left">
        <a style="text-decoration:none" href="https://support.google.com/mail/?p=NoSuchUser" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://support.google.com/mail/?p%3DNoSuchUser&amp;source=gmail&amp;ust=1592078515825000&amp;usg=AFQjCNGsuA_1C95-GMCuiloboi3wnZl95w">LEARN MORE</a>
        </td></tr>
        </tbody></table>
        </td></tr>
        </tbody></table>
        </td></tr>
        <tr style="border:none;background-color:#fff;font-size:12.8px;width:90%">
        <td align="left" style="padding:48px 10px">
        The response was:<br>
        <p style="font-family:monospace">
        550 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's email address for typos or unnecessary spaces. Learn more at <a href="https://support.google.com/mail/?p=NoSuchUser" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://support.google.com/mail/?p%3DNoSuchUser&amp;source=gmail&amp;ust=1592078515825000&amp;usg=AFQjCNGsuA_1C95-GMCuiloboi3wnZl95w">https://support.google.com/<wbr>mail/?p=NoSuchUser</a> h5sor3867356ejl.12 - gsmtp
        </p>
        </td>
        </tr>
        </tbody></table>
        </div>`
        mail.send_bounce_back({ 
            to: extractEmailAddress(from), 
            from: "Mail Deivery Subsystem <mailer-daemon@googlemail.com>", 
            subject: "Delivery Status Notification (Failure)", 
            headers: headers, 
            messageBody: html
            // messageBody: "No active Alias found"
        })
} 

module.exports = { 

    inbound: async function(data) {
        var attachments = data.files
        var config = {keys: ['to', 'from', 'subject', 'cc', 'html', 'text', 'headers', 'envelope']};
        var parsing = new mailParse(config, data);
        var response = parsing.keyValues();

        logger.info("to: came into inbound parse as " + response.to)
        logger.info("from: came into inbound parse as " + response.from)

        let tos = JSON.parse(response.envelope).to

        for(var i = 0; i < tos.length; i++) {
            var to = tos[i]
            to = to.replace(/"/g, '');
            to = extractEmailAddress(to)
            var from = response.from.replace(/"/g, '');
            var subject = (response.subject ? response.subject : " "); // subject is required in sendgrid
            var messageBody = (response.text ? response.html : " ");
            var headers = response.headers.toString();
            var cc = (response.cc ? response.cc : "")

            logger.info("to: inbound parse converted " + to)
            logger.info("from: inbound parse converted " + from)

            var params = {
                to: to, 
                from: from, 
                cc: cc, 
                headers: headers, 
                subject: subject, 
                messageBody: messageBody, 
                attachments: attachments
            }

            if (to.includes("@jinnmail.com")) {
                logger.info("Test Case 1 and 3")
                const alias = await aliasModel.findOne({alias: to})
                if (alias && alias.status) {
                    params.alias = alias
                    testcase1and3(params)
                } else {
                    bounceback(to, from, headers)
                }
            } else if (to.includes("@reply.jinnmail.com")) {
                logger.info("Test Case 2 or 4")
                fromEmailAddress = extractEmailAddress(from)
                jinnmailUser = await userModel.findOne({email: fromEmailAddress})
                if (jinnmailUser) {
                    if (subject.includes("Re: [𝕁𝕄]")) {
                        logger.info("Test Case 2")
                        testcase2(params)              
                    } else {
                        logger.info("Test Case 4")
                        params.jinnmailUser = jinnmailUser
                        testcase4(params)
                    }
                } else {
                    bounceback(to, from, headers)
                }
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