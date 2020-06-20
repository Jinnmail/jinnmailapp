const uuidv4 = require('uuid/v4');
const dotenv = require("dotenv").config()
const logger = require('heroku-logger')
const mailParse = require('@sendgrid/inbound-mail-parser');
const mail = require('../services/mail');
const userModel = require('../models/user');
const aliasModel = require('../models/alias');
const proxymailModel = require('../models/proxymail');
const user = require('../models/user');
require('dotenv');

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

function bounceback(to, from, headers) {
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
    var msg = {
        to: from, 
        from: "Mail Deivery Subsystem <mailer-daemon@googlemail.com>", 
        subject: "Delivery Status Notification (Failure)", 
        headers: headers, 
        messageBody: html
    }

    return msg
} 

function bounceback2(params) {
    var {
        to: to,
        headers: headers,  
        alias: alias
    } = params

    var msg = {
        to: to, 
        from: "Mail Deivery Subsystem <mailer-daemon@googlemail.com>", 
        subject: "Delivery Status Notification (Failure)", 
        cc: '', 
        headers: headers, 
        messageBody: `You attempted to send this message from your own mailbox "${to}" to your own alias "${alias.alias}".<br><br>Jinnmail aliases shield your real address when sending to and receiving mail from others. Aliases are not needed when sending to your own address and will be stripped when included in TO/CC/BCC sent by you.`, 
        attachments: []
    }

    return msg
}

async function usecases(params) {
    var msg = {}
    var {
        to: to, 
        from: from, 
        replyTo: replyTo, 
        cc: cc, 
        headers: headers, 
        subject: subject, 
        messageBody: messageBody, 
        attachments: attachments
    } = params

    if (extractEmailAddress(to).includes(process.env.JM_EMAIL_DOMAIN)) { 
        const alias = await aliasModel.findOne({alias: extractEmailAddress(to)}) // xxx@dev.jinnmail.com
        const jinnmailUser = await userModel.findOne({userId: alias.userId}) // jinnmailuser@gmail.com
        if (jinnmailUser && (jinnmailUser.email === extractEmailAddress(from))) {
            params.to = jinnmailUser.email
            params.alias = alias
            msg = bounceback2(params)
        } else if (alias && alias.status) {
            params.alias = alias
            if (replyTo) {
                msg = await nonUserOwnReplyToToUser(params)
            } else {
                msg = await nonUserToUser(params)
            }
        } else {
            msg = bounceback(to, from, headers)
        }
    } else if (extractEmailAddress(to).includes(process.env.JM_REPLY_EMAIL_SUBDOMAIN)) {
        jinnmailUser = await userModel.findOne({email: extractEmailAddress(from)})
        if (jinnmailUser) {
            if (subject.includes("Re: [𝕁𝕄]")) {
                msg = await userToNonuser(params);
        } else if (subject.startsWith("[𝕁𝕄] ")) { 
                    msg = await userToNonUserOwnReplyTo(params);
            } else {
                    params.jinnmailUser = jinnmailUser
                    msg = userToNonUser2(params)
            }
        } else {
            msg = bounceback(to, from, headers)
        }
    }

    return msg;
}

async function nonUserToUser(params) {
    var html = ''
    var headerHtml = ''
    var footerHtml = ''
    var msg = {}
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

    const senderAlias = await get_or_create_sender_alias(extractEmailAddress(from), alias.userId)
    const proxyMail = await get_or_create_proxymail(alias.aliasId, senderAlias.aliasId)
    const jinnmailUser = await userModel.findOne({userId: alias.userId})

    if (proxyMail && senderAlias && jinnmailUser) {
        subject = `[𝕁𝕄] ${subject.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')}`
        headers =  headers.replace(new RegExp(alias.alias, 'g'), '')
        headerHtml = '<div id="jinnmail-header"><table style="background-color:rgb(238,238,238);width:100%"><tbody><tr><td colspan="4" style="text-align:center"><h2 style="margin:0px"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/privacy.png?raw=true" height="30px"> Shielded by Jinnmail</h2></td></tr><tr><td style="width:25%;text-align:center"> </td><td style="width:25%;text-align:center"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/exclam.png?raw=true" height="30px"></a><a clicktracking=off href="https://jinnmail.com/account">Spam?</a></td><td style="width:5%;text-align:center"> </td><td style="width:45%;text-align:left"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/toggles.png?raw=true" height="40px"></a><a clicktracking=off href="https://jinnmail.com/account">Turn on/off this alias</a></td></tr></tbody></table><div style="width:100%;text-align:center"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/clearbackarrow.png?raw=true" height="30px"><span style="vertical-align:middle;opacity:0.4">Reply normally to HIDE your email address.</span></div><br><br></div><div id="jinnmail-header-end"></div>'
        footerHtml = '<div id="jinnmail-footer"><br><br><hr><hr><div style="text-align:center"><span style="vertical-align:middle;opacity:0.4">Note: Replying normally HIDES your email address. Forwarding REVEALS it.<p><a clicktracking=off href="https://jinnmail.com/account">👤</a> <a clicktracking=off href="https://jinnmail.com/account">Manage your Jinnmail account and aliases</a></p></span></div><div id="jinnmail-footer-end"></div>'
        html = messageBody.replace(/\[\[Hidden by Jinnmail\]\]/g, jinnmailUser.email)
        html = html.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')
        html = `${headerHtml}<br /><br />${html}<br /><br />${footerHtml}`
        msg = {
            to: jinnmailUser.email, 
            from: extractEmailAddress(from), 
            replyTo: proxyMail.proxyMail,  
            subject: subject, 
            cc: cc, 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(extractEmailAddress(to), extractEmailAddress(from), headers)
    }

    return msg
}

async function userToNonuser(params) {
    var footerHtml = ''
    var html = ''
    var msg = {}
    var {
        to: to, 
        from: from, 
        cc: cc, 
        headers: headers, 
        subject: subject, 
        messageBody: messageBody, 
        attachments: attachments
    } = params

    const proxyMail = await proxymailModel.findOne({proxyMail: extractEmailAddress(to)});
    const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId, type: "sender"});
    const alias = await aliasModel.findOne({aliasId: proxyMail.aliasId});

    if (proxyMail && senderAlias && (alias && alias.status)) {
        subject = subject.replace(/\[𝕁𝕄\] /g, "")
        subject = subject.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
        const user = await userModel.findOne({userId: alias.userId})
        headers =  headers.replace(new RegExp(user.email, 'g'), '')
        cc = cc.replace(new RegExp(alias.alias, 'g'), '')
        footerHtml = "Sent secretly with <a clicktracking=off href=\"https://emailclick.jinnmail.com/homepage-from-signature\">Jinnmail</a>"
        messageBody = messageBody.replace(/<div id="(.*)jinnmail-header">(.*)<\/div><div id="(.*)jinnmail-header-end"><\/div>/, '')
        messageBody = messageBody.replace(/<div id="(.*)jinnmail-footer">(.*)<\/div><div id="(.*)jinnmail-footer-end"><\/div>/, '')
        messageBody = messageBody.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
        messageBody = messageBody.replace(new RegExp(proxyMail.proxyMail, 'g'), "[[Hidden by Jinnmail]]")
        html += `${messageBody}<br /><br />${footerHtml}`

        msg = {
            to: senderAlias.alias, 
            from: alias.alias, 
            replyTo: '',  
            subject: subject, 
            cc: cc, 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(extractEmailAddress(to), extractEmailAddress(from), headers)
    }

    return msg
}

async function userToNonUser2(params) {
    var html = ''
    var footerHtml = ''
    var msg = {}
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

    const proxyMail = await proxymailModel.findOne({proxyMail: extractEmailAddress(to)});
    const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId, type: "sender"});
    const alias = await aliasModel.findOne({userId: jinnmailUser.userId, type: "alias"});

    if (proxyMail && senderAlias && (alias && alias.status)) {
        subject = subject.replace(new RegExp(jinnmailUser.email, 'g'), '[[Hidden by Jinnmail]]')
        const user = await userModel.findOne({userId: alias.userId})
        headers =  headers.replace(new RegExp(user.email, 'g'), '')
        footerHtml = "Sent secretly with <a clicktracking=off href='https://emailclick.jinnmail.com/homepage-from-signature'>Jinnmail</a>"
        html = messageBody.replace(new RegExp(jinnmailUser.email, 'g'), '[[Hidden by Jinnmail]]')
        html += `<br /><br />${footerHtml}`

        msg = {
            to: senderAlias.alias, 
            from: alias.alias,
            replyTo: '',  
            subject: subject, 
            cc: cc, 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(extractEmailAddress(to), extractEmailAddress(from), headers)
    }

    return msg
}

async function nonUserOwnReplyToToUser(params) {
    var html = ''
    var headerHtml = ''
    var footerHtml = ''
    var msg = {}
    var {
        to: to, 
        from: from, 
        replyTo: replyTo, 
        cc: cc, 
        headers: headers, 
        subject: subject, 
        messageBody: messageBody, 
        attachments: attachments, 
        alias: alias
    } = params

    const senderAlias = await get_or_create_sender_alias(extractEmailAddress(from), alias.userId)
    const proxyMail = await get_or_create_proxymail(alias.aliasId, senderAlias.aliasId)
    const jinnmailUser = await userModel.findOne({userId: alias.userId})

    if (senderAlias && proxyMail && jinnmailUser) {
        subject = `[𝕁𝕄] ${subject.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')}`
        headers =  headers.replace(new RegExp(alias.alias, 'g'), '')
        headerHtml = '<div id="jinnmail-header"><table style="background-color:rgb(238,238,238);width:100%"><tbody><tr><td colspan="4" style="text-align:center"><h2 style="margin:0px"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/privacy.png?raw=true" height="30px"> Shielded by Jinnmail</h2></td></tr><tr><td style="width:25%;text-align:center"> </td><td style="width:25%;text-align:center"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/exclam.png?raw=true" height="30px"></a><a clicktracking=off href="https://jinnmail.com/account">Spam?</a></td><td style="width:5%;text-align:center"> </td><td style="width:45%;text-align:left"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/toggles.png?raw=true" height="40px"></a><a clicktracking=off href="https://jinnmail.com/account">Turn on/off this alias</a></td></tr></tbody></table><div style="width:100%;text-align:center"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/clearbackarrow.png?raw=true" height="30px"><span style="vertical-align:middle;opacity:0.4">Reply normally to HIDE your email address.</span></div><br><br></div><div id="jinnmail-header-end"></div>'
        footerHtml = '<div id="jinnmail-footer"><br><br><hr><hr><div style="text-align:center"><span style="vertical-align:middle;opacity:0.4">Note: Replying normally HIDES your email address. Forwarding REVEALS it.<p><a clicktracking=off href="https://jinnmail.com/account">👤</a> <a clicktracking=off href="https://jinnmail.com/account">Manage your Jinnmail account and aliases</a></p></span></div><div id="jinnmail-footer-end"></div>'
        html = messageBody.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')
        html = html.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')
        html = `${headerHtml}<br /><br />${html}<br /><br />${footerHtml}`
        var msg = {
            to: jinnmailUser.email, 
            from: from, 
            replyTo: proxyMail.proxyMail, 
            subject: subject, 
            cc: cc, 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(to, from, headers)
    }

    return msg
}

async function userToNonUserOwnReplyTo(params)  {
    var html = ''
    var headerHtml = ''
    var footerHtml = ''
    var msg = {}
    var {
        to: to, 
        from: from, 
        replyTo: replyTo, 
        cc: cc, 
        headers: headers, 
        subject: subject, 
        messageBody: messageBody, 
        attachments: attachments, 
    } = params

    const jinnmailUser = await userModel.findOne({email: extractEmailAddress(from)})
    const alias = await aliasModel.findOne({userId: jinnmailUser.userId, type: 'alias'})
    const proxyMail = await proxymailModel.findOne({proxyMail: extractEmailAddress(to)})
    const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId})

    if (jinnmailUser && alias && proxyMail && senderAlias) {
        subject = subject.replace(/\[𝕁𝕄\] /g, "")
        subject = subject.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
        headers =  headers.replace(new RegExp(jinnmailUser.email, 'g'), '')
        footerHtml = "Sent secretly with <a clicktracking=off href=\"https://emailclick.jinnmail.com/homepage-from-signature\">Jinnmail</a>"
        html = messageBody.replace(/<div id="(.*)jinnmail-header">(.*)<\/div><div id="(.*)jinnmail-header-end"><\/div>/, '')
        html = html.replace(/<div id="(.*)jinnmail-footer">(.*)<\/div><div id="(.*)jinnmail-footer-end"><\/div>/, '')
        html = html.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
        html = html.replace(proxyMail.proxyMail, '[[Hidden by Jinnmail]]')
        html = `${html}<br /><br />${footerHtml}`
        msg = {
            to: senderAlias.alias, 
            from: alias.alias, 
            replyTo: '', 
            subject: subject, 
            cc: cc, 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(to, from, headers)
    }

    return msg
}

module.exports = { 

    inbound: async function(data) {
        var attachments = data.files
        var config = {keys: ['to', 'from', 'subject', 'cc', 'html', 'text', 'headers', 'envelope', 'reply_to']};
        var parsing = new mailParse(config, data);
        var parts = parsing.keyValues();
        
        var params = {
            to: parts.to, 
            from: parts.from, 
            cc: parts.cc, 
            headers: parts.headers, 
            subject: parts.subject, 
            messageBody: parts.text, 
            attachments: attachments
        }

        const msg = await module.exports.parse(params)
        // return await parse(parts)

        mail.send_mail(msg)

        return
    },

    parse: async function(params) {
        var to = params.to.replace(/"/g, '').split(', ')[0];
        var from = params.from.replace(/"/g, '');
        var replyTo = params.reply_to;
        var subject = (params.subject ? params.subject : " "); // subject is required in sendgrid
        var messageBody = (params.html ? params.html : " ");
        var headers = params.headers.toString();
        var cc = (params.cc ? params.cc : "")
    
        var params2 = {
            to: to, 
            from: from, 
            replyTo: replyTo, 
            cc: cc, 
            headers: headers, 
            subject: subject, 
            messageBody: messageBody, 
            attachments: params.attachments
        }
    
        return await usecases(params2)
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
    proxymail = await proxymailModel.findOne({aliasId: aliasId, senderAliasId: senderAliasId})
    if (proxymail) {
        return proxymail
    } else {
        let newproxymail = new proxymailModel();
        newproxymail.proxyMailId = uuidv4();
        newproxymail.aliasId = aliasId;
        newproxymail.senderAliasId = senderAliasId
        newproxymail.proxyMail = `${randomString(11)}${process.env.JM_REPLY_EMAIL_SUBDOMAIN}`;

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