const uuidv4 = require('uuid/v4');
const dotenv = require("dotenv").config()
const logger = require('heroku-logger')
const mailParse = require('@sendgrid/inbound-mail-parser');
const mail = require('../services/mail');
const userModel = require('../models/user');
const aliasModel = require('../models/alias');
const proxymailModel = require('../models/proxymail');
const { simpleParser } = require("mailparser");
const proxymail = require('../models/proxymail');
require('dotenv');

module.exports = { 
    create_proxymail: async function(proxyMail, aliasId, senderAliasId) {
        let newproxymail = new proxymailModel();
        newproxymail.proxyMailId = uuidv4();
        newproxymail.aliasId = aliasId;
        newproxymail.senderAliasId = senderAliasId;
        newproxymail.proxyMail = proxyMail;
        return newproxymail.save();
    },

    inbound: async function(data) {
        var headers = '';  
        var newline = '';
        
        // sendgrid inbound parse node.js library does not include attachements or reply-to
        // even though the docs say it does, and it is inconsistent, sometimes it does, 
        // so we are using MailParser instead
        
        const mailParserParts = await simpleParser(data.body.email); 

        for(var i=0; i < mailParserParts.headerLines.length; i++) {
            if (headers) 
                newline = '\n';
            headers += newline + mailParserParts.headerLines[i].line
        }

        var params = {
            to: mailParserParts.to.text, 
            from: mailParserParts.from.text, 
            replyTo: (mailParserParts.replyTo ? mailParserParts.replyTo.text : ''), 
            cc: (mailParserParts.cc ? mailParserParts.cc.text : ''), 
            headers: headers, 
            subject: (mailParserParts.subject ? mailParserParts.subject : ' '), 
            messageBody: mailParserParts.html, 
            attachments: mailParserParts.attachments
        }

        const msg = await module.exports.parse(params)

        mail.send_mail(msg, mailParserParts.to.text)

        return
    }, 

    parse: async function(params) {
        await replyToOwnAlias(JSON.parse(JSON.stringify(params))) // an exception, included their own alias in the to and/or cc

        var to = params.to.replace(/"/g, '').split(', ')[0]; // outlook email addresses have double quotes '"emailaddress", "x", "y"'
        var from = params.from.replace(/"/g, '');
        var replyTo = params.replyTo;
        var subject = (params.subject ? params.subject : ' '); // subject is required in sendgrid
        var messageBody = (params.messageBody ? params.messageBody : ' ');
        var headers = params.headers.toString();
        var cc = (params.cc ? params.cc : '')
    
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

async function replyToOwnAlias(params) {
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
    
    var toArr = to.replace(/"/g, '').split(', ')
    // if (toArr.length > 1) {
    var firstTo = toArr[0];
    if (firstTo.includes(process.env.JM_REPLY_EMAIL_SUBDOMAIN)) {
        var restTo = toArr.slice(1)
        var flattenedRestTo = restTo.toString()

        var toName = extractName(firstTo)
        var toEmail = extractEmailAddress(firstTo)
        var fromName = extractName(from)
        var fromEmail = extractEmailAddress(from)
    
        const jinnmailUser = await userModel.findOne({email: fromEmail})
        const senderAlias = await aliasModel.findOne({alias: toEmail})
        // const proxyMail = await proxymailModel.findOne({proxyMail: toEmail})
        // const alias = await aliasModel.findOne({ userId: jinnmailUser.userId, aliasId: proxyMail.aliasId, type: 'alias' })

        if (flattenedRestTo.includes(senderAlias.alias) || cc.includes(senderAlias.alias)) {
        // if (flattenedRestTo.includes(alias.alias) || cc.includes(alias.alias)) {
            params.to = jinnmailUser.email 
            params.alias = senderAlias
            msg = bounceback2(params)
            mail.send_mail(msg)
        }
    }
    // }
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

    var toName = extractName(to)
    var toEmail = extractEmailAddress(to)
    var fromName = extractName(from)
    var fromEmail = extractEmailAddress(from)

    if (toEmail.includes(process.env.JM_EMAIL_DOMAIN)) { 
        const alias = await aliasModel.findOne({alias: toEmail}) // xxx@dev.jinnmail.com
        const jinnmailUser = await userModel.findOne({userId: alias.userId}) // jinnmailuser@gmail.com
        if (jinnmailUser && (jinnmailUser.email === fromEmail)) {
            params.to = jinnmailUser.email
            params.alias = alias
            msg = bounceback2(params) // Use case 3, test case 6
        } else if (alias && alias.status) {
            params.alias = alias
            if (replyTo) {
                msg = await nonUserOwnReplyToToUser(params) // Use case 4, Test case 8
            } else {
                if (subject.startsWith('Re: ')) {
                    msg = await nonUserToUser2(params) // Use case ?, Test case ?
                } else {
                    msg = await nonUserToUser(params) // Use case ?, Test case ?
                }
            }
        } else {
            msg = bounceback(to, from, headers)
        }
    } else if (toEmail.includes(process.env.JM_RECEIVER_DOMAIN)) {
        jinnmailUser = await userModel.findOne({ email: fromEmail })
        if (jinnmailUser) {
            msg = await userToReceiver(params);
        } else {
            msg = bounceback(to, from, headers)
        }
    } else if (toEmail.includes(process.env.JM_REPLY_EMAIL_SUBDOMAIN)) {
        jinnmailUser = await userModel.findOne({email: fromEmail})
        if (jinnmailUser) {
            if (subject.includes("Re: [𝕁𝕄]")) {
                msg = await userToNonUser(params); // Use case 5, test cases 2 and 5
            } else if (subject.startsWith("[𝕁𝕄] ")) { 
                msg = await userToNonUserOwnReplyTo(params); // Use case 4, test case 9
            } else {
                params.jinnmailUser = jinnmailUser
                msg = userToNonUser2(params) // Use case 2, test case 4
            }
        } else {
            msg = bounceback(to, from, headers)
        }
    }

    return msg;
}

async function nonUserToUser(params) { // test case 1
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

    var toName = extractName(to)
    var toEmail = extractEmailAddress(to)
    var fromName = extractName(from)
    var fromEmail = extractEmailAddress(from)

    const proxyMail = await get_or_create_proxymail(fromEmail, alias.aliasId, alias.userId)
    const senderAlias = await get_sender_alias(proxyMail.senderAliasId);
    // const senderAlias = await get_or_create_sender_alias(fromEmail, alias.userId)
    // const proxyMail = await get_or_create_proxymail(alias.aliasId, senderAlias.aliasId)
    const jinnmailUser = await userModel.findOne({userId: alias.userId})

    if (proxyMail && senderAlias && jinnmailUser) {
        subject = `[𝕁𝕄] ${subject.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')}`
        headers =  headers.replace(new RegExp(alias.alias, 'g'), '')
        headerHtml = '<div id="jinnmail-header"><table style="background-color:rgb(238,238,238);width:100%"><tbody><tr><td colspan="4" style="text-align:center"><h2 style="margin:0px"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/privacy.png?raw=true" height="30px"> Shielded by Jinnmail</h2></td></tr><tr><td style="width:25%;text-align:center"> </td><td style="width:25%;text-align:center"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/exclam.png?raw=true" height="30px"></a><a clicktracking=off href="https://jinnmail.com/account">Spam?</a></td><td style="width:5%;text-align:center"> </td><td style="width:45%;text-align:left"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/toggles.png?raw=true" height="40px"></a><a clicktracking=off href="https://jinnmail.com/account">Turn on/off this alias</a></td></tr></tbody></table><div style="width:100%;text-align:center"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/clearbackarrow.png?raw=true" height="30px"><span style="vertical-align:middle;opacity:0.4">Reply normally to HIDE your email address.</span></div><br><br></div><div id="jinnmail-header-end"></div>'
        footerHtml = '<div id="jinnmail-footer"><br><br><hr><hr><div style="text-align:center"><span style="vertical-align:middle;opacity:0.4">Note: Replying normally HIDES your email address. Forwarding REVEALS it.<p><a clicktracking=off href="https://jinnmail.com/account">👤</a> <a clicktracking=off href="https://jinnmail.com/account">Manage your Jinnmail account and aliases</a></p></span></div><div id="jinnmail-footer-end"></div>'
        html = messageBody.replace(/\[\[Hidden by Jinnmail\]\]/g, jinnmailUser.email)
        html = html.replace(new RegExp(`mailto:${alias.alias}`, 'g'), '[[Hidden by Jinnmail]]')
        html = html.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')
        html = `${headerHtml}${html}${footerHtml}`
        msg = {
            to: (toName ? `${toName} <${jinnmailUser.email}>` : jinnmailUser.email), 
            from: from,
            replyTo: (fromName ? `${fromName} <${senderAlias.alias}>` : senderAlias.alias), 
            // replyTo: `${fromName} <${proxyMail.proxyMail}>`,  
            subject: subject, 
            cc: cc, 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(toEmail, fromEmail, headers)
    }

    return msg
}

async function userToNonUser(params) { // test case 2
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

    var toName = extractName(to)
    var toEmail = extractEmailAddress(to)
    var fromName = extractName(from)
    var fromEmail = extractEmailAddress(from)

    const senderAlias = await aliasModel.findOne({alias: toEmail});
    const proxyMail = await proxymailModel.findOne({senderAliasId: senderAlias.aliasId });
    const alias = await aliasModel.findOne({ aliasId: proxyMail.aliasId });
    // const proxyMail = await proxymailModel.findOne({proxyMail: toEmail});
    // const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId, type: "sender"});
    // const alias = await aliasModel.findOne({aliasId: proxyMail.aliasId});

    if (proxyMail && senderAlias && (alias && alias.status)) {
        subject = subject.replace(/\[𝕁𝕄\] /g, "")
        subject = subject.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
        const user = await userModel.findOne({userId: alias.userId})
        subject = subject.replace(new RegExp(user.email, 'g'), '[[Hidden by Jinnmail]]')
        headers = headers.replace(new RegExp(user.email, 'g'), '')
        // cc = cc.replace(new RegExp(alias.alias, 'g'), '')
        footerHtml = '<div id="jinnmail-secretly">Sent secretly with <a clicktracking=off href="https://emailclick.jinnmail.com/homepage-from-signature">Jinnmail</a></div><div id="jinnmail-secretly-end"></div>'
        messageBody = messageBody.replace(/<div id="(.*)jinnmail-header">(.*)<\/div><div id="(.*)jinnmail-header-end"><\/div>/, '')
        messageBody = messageBody.replace(/<div id="(.*)jinnmail-footer">(.*)<\/div><div id="(.*)jinnmail-footer-end"><\/div>/, '')
        messageBody = messageBody.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
        messageBody = messageBody.replace(new RegExp(`mailto:${senderAlias.alias}`, 'g'), "[[Hidden with Jinnmail]]")
        messageBody = messageBody.replace(new RegExp(senderAlias.alias, 'g'), "[[Hidden with Jinnmail]]")
        html += `${messageBody}<br />${footerHtml}`
        msg = {
            to: (toName ? `${toName} <${proxyMail.proxyMail}>` : proxyMail.proxyMail), 
            // to: `${toName} <${senderAlias.alias}>`, 
            from: (fromName ? `${fromName} <${alias.alias}>` : alias.alias), 
            // from: `${fromName} <${alias.alias}>`, 
            replyTo: '',  
            subject: subject, 
            cc: '', 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(toEmail, fromEmail, headers)
    }

    return msg
}

async function userToReceiver(params) {
    var footerHtml = ''
    var html = ''
    var msg = {}
    let {
        to: to, 
        from: from,
        headers: headers,
        subject: subject,
        messageBody: messageBody,
        attachments: attachments
     } = params;

    var toName = extractName(to)
    var toEmail = extractEmailAddress(to)
    var fromName = extractName(from)
    var fromEmail = extractEmailAddress(from)

    const receiverAlias = await aliasModel.findOne({alias: toEmail, type: 'receiver'});
    if (receiverAlias) {
        const masterAlias = await aliasModel.findOne({userId: receiverAlias.userId, type: 'master'});
        if (masterAlias) {
            const proxymail = await proxymailModel.findOne({aliasId: masterAlias.aliasId, senderAliasId: receiverAlias.aliasId});
            if (proxymail) {
                const user = await userModel.findOne({userId: masterAlias.userId})
                headers = headers.replace(new RegExp(user.email, 'g'), '')
                headerHtml = '<div id="jinnmail-header"><table style="background-color:rgb(238,238,238);width:100%"><tbody><tr><td colspan="4" style="text-align:center"><h2 style="margin:0px"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/privacy.png?raw=true" height="30px"> Shielded by Jinnmail</h2></td></tr><tr><td style="width:25%;text-align:center"> </td><td style="width:25%;text-align:center"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/exclam.png?raw=true" height="30px"></a><a clicktracking=off href="https://jinnmail.com/account">Spam?</a></td><td style="width:5%;text-align:center"> </td><td style="width:45%;text-align:left"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/toggles.png?raw=true" height="40px"></a><a clicktracking=off href="https://jinnmail.com/account">Turn on/off this alias</a></td></tr></tbody></table><div style="width:100%;text-align:center"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/clearbackarrow.png?raw=true" height="30px"><span style="vertical-align:middle;opacity:0.4">Reply normally to HIDE your email address.</span></div><br><br></div><div id="jinnmail-header-end"></div>'
                footerHtml = '<div id="jinnmail-footer"><br><br><hr><hr><div style="text-align:center"><span style="vertical-align:middle;opacity:0.4">Note: Replying normally HIDES your email address. Forwarding REVEALS it.<p><a clicktracking=off href="https://jinnmail.com/account">👤</a> <a clicktracking=off href="https://jinnmail.com/account">Manage your Jinnmail account and aliases</a></p></span></div><div id="jinnmail-footer-end"></div>'
                html = `${headerHtml}${messageBody}${footerHtml}`
                msg = {
                    to: (toName ? `${toName} <${proxymail.proxyMail}>` : proxymail.proxyMail),
                    from: (fromName ? `${fromName} <${masterAlias.alias}>` : masterAlias.alias),
                    replyTo: '',
                    subject: subject,
                    cc: '',
                    headers: headers,
                    messageBody: html,
                    attachments: attachments
                }
            }
        }
    }

    return msg;
}

async function nonUserToUser2(params) { // test case 3
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

    var toName = extractName(to)
    var toEmail = extractEmailAddress(to)
    var fromName = extractName(from)
    var fromEmail = extractEmailAddress(from)

    const proxyMail = await get_or_create_proxymail(fromEmail, alias.aliasId, alias.userId)
    const senderAlias = await get_sender_alias(proxyMail.senderAliasId);
    // const senderAlias = await get_or_create_sender_alias(fromEmail, alias.userId)
    // const proxyMail = await get_or_create_proxymail(alias.aliasId, senderAlias.aliasId)
    const jinnmailUser = await userModel.findOne({userId: alias.userId})

    if (proxyMail && senderAlias && jinnmailUser) {
        subject = `[𝕁𝕄] ${subject.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')}`
        headers =  headers.replace(new RegExp(alias.alias, 'g'), '')
        headerHtml = '<div id="jinnmail-header"><table style="background-color:rgb(238,238,238);width:100%"><tbody><tr><td colspan="4" style="text-align:center"><h2 style="margin:0px"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/privacy.png?raw=true" height="30px"> Shielded by Jinnmail</h2></td></tr><tr><td style="width:25%;text-align:center"> </td><td style="width:25%;text-align:center"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/exclam.png?raw=true" height="30px"></a><a clicktracking=off href="https://jinnmail.com/account">Spam?</a></td><td style="width:5%;text-align:center"> </td><td style="width:45%;text-align:left"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/toggles.png?raw=true" height="40px"></a><a clicktracking=off href="https://jinnmail.com/account">Turn on/off this alias</a></td></tr></tbody></table><div style="width:100%;text-align:center"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/clearbackarrow.png?raw=true" height="30px"><span style="vertical-align:middle;opacity:0.4">Reply normally to HIDE your email address.</span></div><br><br></div><div id="jinnmail-header-end"></div>'
        footerHtml = '<div id="jinnmail-footer"><br><br><hr><hr><div style="text-align:center"><span style="vertical-align:middle;opacity:0.4">Note: Replying normally HIDES your email address. Forwarding REVEALS it.<p><a clicktracking=off href="https://jinnmail.com/account">👤</a> <a clicktracking=off href="https://jinnmail.com/account">Manage your Jinnmail account and aliases</a></p></span></div><div id="jinnmail-footer-end"></div>'
        html = messageBody.replace(/\[\[Hidden by Jinnmail\]\]/g, jinnmailUser.email)
        html = messageBody.replace(/\[\[Hidden with Jinnmail\]\]/g, senderAlias.alias)
        // html = html.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')
        html = html.replace(new RegExp(`mailto:${alias.alias}`, 'g'), "[[Hidden by Jinnmail]]")
        html = html.replace(new RegExp(alias.alias, 'g'), "[[Hidden by Jinnmail]]")
        html = html.replace(/<div id="(.*)jinnmail-secretly">(.*)<\/div><div id="(.*)jinnmail-secretly-end"><\/div>/, '')
        // html = html.replace("<br />Sent secretly with <a clicktracking=off href=\"https://emailclick.jinnmail.com/homepage-from-signature\">Jinnmail</a>", "")
        html = `${headerHtml}${html}<br />${footerHtml}`
        msg = {
            to: (toName ? `${toName} <${jinnmailUser.email}>` : jinnmailUser.email), 
            from: from, 
            replyTo: (fromName ? `${fromName} <${senderAlias.alias}>` : senderAlias.alias), 
            // replyTo: `${fromName} <${proxyMail.proxyMail}>`,  
            subject: subject, 
            cc: cc, 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(toEmail, fromEmail, headers)
    }

    return msg
}

async function userToNonUser2(params) { // test case 4
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

    var toName = extractName(to)
    var toEmail = extractEmailAddress(to)
    var fromName = extractName(from)
    var fromEmail = extractEmailAddress(from)

    const senderAlias = await aliasModel.findOne({alias: toEmail});
    const proxyMail = await proxymail.findOne({senderAliasId: senderAlias.aliasId});
    const alias = await aliasModel.findOne({ userId: jinnmailUser.userId, aliasId: proxyMail.aliasId, type: "alias" });
    // const proxyMail = await proxymailModel.findOne({proxyMail: toEmail});
    // const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId, type: "sender"});
    // const alias = await aliasModel.findOne({userId: jinnmailUser.userId, aliasId: proxyMail.aliasId, type: "alias"});

    if (proxyMail && senderAlias && (alias && alias.status)) {
        subject = subject.replace(new RegExp(senderAlias.alias, 'g'), '[[Hidden with Jinnmail]]')
        // subject = subject.replace(new RegExp(jinnmailUser.email, 'g'), '[[Hidden by Jinnmail]]')
        const user = await userModel.findOne({userId: alias.userId})
        headers =  headers.replace(new RegExp(user.email, 'g'), '')
        footerHtml = '<div id="jinnmail-secretly">Sent secretly with <a clicktracking=off href="https://emailclick.jinnmail.com/homepage-from-signature">Jinnmail</a></div><div id="jinnmail-secretly-end"></div>'
        // html = messageBody.replace(new RegExp(`mailto:${jinnmailUser.email}`, 'g'), "[[Hidden by Jinnmail]]")
        // html = html.replace(new RegExp(jinnmailUser.email, 'g'), '[[Hidden by Jinnmail]]')
        html = messageBody.replace(new RegExp(`mailto:${senderAlias.alias}`, 'g'), "[[Hidden with Jinnmail]]")
        html = html.replace(new RegExp(senderAlias.alias, 'g'), '[[Hidden with Jinnmail]]')
        html += `<br />${footerHtml}`
        msg = {
            to: proxyMail.proxyMail, 
            from: (fromName ? `${fromName} <${alias.alias}>` : alias.alias), 
            // from: `${fromName} <${alias.alias}>`,
            replyTo: '',  
            subject: subject, 
            cc: cc, 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(toEmail, fromEmail, headers)
    }

    return msg
}

async function nonUserOwnReplyToToUser(params) { // test case 8
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

    var toName = extractName(to)
    var toEmail = extractEmailAddress(to)
    var fromName = extractName(from)
    var fromEmail = extractEmailAddress(from)
    var replyToEmail = extractEmailAddress(replyTo);

    const proxyMail = await get_or_create_proxymail(replyToEmail, alias.aliasId, alias.userId)
    const senderAlias = await get_sender_alias(proxyMail.senderAliasId);
    // const senderAlias = await get_or_create_sender_alias(replyToEmail, alias.userId)
    // const proxyMail = await get_or_create_proxymail(alias.aliasId, senderAlias.aliasId)
    const jinnmailUser = await userModel.findOne({userId: alias.userId})

    if (senderAlias && proxyMail && jinnmailUser) {
        subject = `[𝕁𝕄] ${subject.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')}`
        headers =  headers.replace(new RegExp(alias.alias, 'g'), '')
        headerHtml = '<div id="jinnmail-header"><table style="background-color:rgb(238,238,238);width:100%"><tbody><tr><td colspan="4" style="text-align:center"><h2 style="margin:0px"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/privacy.png?raw=true" height="30px"> Shielded by Jinnmail</h2></td></tr><tr><td style="width:25%;text-align:center"> </td><td style="width:25%;text-align:center"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/exclam.png?raw=true" height="30px"></a><a clicktracking=off href="https://jinnmail.com/account">Spam?</a></td><td style="width:5%;text-align:center"> </td><td style="width:45%;text-align:left"><a clicktracking=off href="https://jinnmail.com/account"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/toggles.png?raw=true" height="40px"></a><a clicktracking=off href="https://jinnmail.com/account">Turn on/off this alias</a></td></tr></tbody></table><div style="width:100%;text-align:center"><img style="vertical-align: middle;" src="https://github.com/Jinnmail/uxdesign/blob/master/Images/clearbackarrow.png?raw=true" height="30px"><span style="vertical-align:middle;opacity:0.4">Reply normally to HIDE your email address.</span></div><br><br></div><div id="jinnmail-header-end"></div>'
        footerHtml = '<div id="jinnmail-footer"><br><br><hr><hr><div style="text-align:center"><span style="vertical-align:middle;opacity:0.4">Note: Replying normally HIDES your email address. Forwarding REVEALS it.<p><a clicktracking=off href="https://jinnmail.com/account">👤</a> <a clicktracking=off href="https://jinnmail.com/account">Manage your Jinnmail account and aliases</a></p></span></div><div id="jinnmail-footer-end"></div>'
        html = messageBody.replace(new RegExp(`mailto:${alias.alias}`, 'g'), '[[Hidden by Jinnmail]]')
        html = html.replace(new RegExp(alias.alias, 'g'), '[[Hidden by Jinnmail]]')
        html = `${headerHtml}${html}${footerHtml}`
        var msg = {
            to: jinnmailUser.email, 
            from: from, 
            replyTo: (fromName ? `${fromName} <${senderAlias.alias}>` : senderAlias.alias),
            // replyTo: `${fromName} <${proxyMail.proxyMail}>`, 
            subject: subject, 
            cc: '', 
            headers: headers, 
            messageBody: html, 
            attachments: attachments
        }
    } else {
        msg = bounceback(to, from, headers)
    }

    return msg
}

async function userToNonUserOwnReplyTo(params) { // test case 9
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

    var toName = extractName(to)
    var toEmail = extractEmailAddress(to)
    var fromName = extractName(from)
    var fromEmail = extractEmailAddress(from)

    const jinnmailUser = await userModel.findOne({email: fromEmail});
    const senderAlias = await aliasModel.findOne({alias: toEmail});
    const proxyMail = await proxymailModel.findOne({senderAliasId: senderAlias.aliasId});
    const alias = await aliasModel.findOne({userId: jinnmailUser.userId, aliasId: proxyMail.aliasId, type: 'alias'})

    // const proxyMail = await proxymailModel.findOne({proxyMail: toEmail})
    // const alias = await aliasModel.findOne({userId: jinnmailUser.userId, aliasId: proxyMail.aliasId, type: 'alias'})
    // const senderAlias = await aliasModel.findOne({aliasId: proxyMail.senderAliasId})

    if (jinnmailUser && alias && proxyMail && senderAlias) {
        subject = subject.replace(/\[𝕁𝕄\] /g, "")
        subject = subject.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
        headers =  headers.replace(new RegExp(jinnmailUser.email, 'g'), '')
        footerHtml = '<div id="jinnmail-secretly">Sent secretly with <a clicktracking=off href=\"https://emailclick.jinnmail.com/homepage-from-signature\">Jinnmail</a></div><div id="jinnmail-secretly-end"></div>'
        html = messageBody.replace(/<div id="(.*)jinnmail-header">(.*)<\/div><div id="(.*)jinnmail-header-end"><\/div>/, '')
        html = html.replace(/<div id="(.*)jinnmail-footer">(.*)<\/div><div id="(.*)jinnmail-footer-end"><\/div>/, '')
        html = html.replace(/\[\[Hidden by Jinnmail\]\]/g, alias.alias)
        html = html.replace(new RegExp(`mailto:${senderAlias.alias}`, 'g'), '[[Hidden with Jinnmail]]')
        html = html.replace(new RegExp(senderAlias.alias, 'g'), '[[Hidden with Jinnmail]]')
        html = `${html}${footerHtml}`
        msg = {
            to: (toName ? `${toName} <${proxyMail.proxyMail}>` : proxyMail.proxyMail),
            // to: `${toName} <${senderAlias.alias}>`,
            from: (fromName ? `${fromName} <${alias.alias}>` : alias.alias), 
            // from: `${fromName} <${alias.alias}>`, 
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
        </tbody></table>
        </td></tr>
        </tbody></table>
        </td></tr>
        <tr style="border:none;background-color:#fff;font-size:12.8px;width:90%">
        <td align="left" style="padding:48px 10px">
        The response was:<br>
        <p style="font-family:monospace">
        550 5.1.1 The email account that you tried to reach does not exist. Please try double-checking the recipient's email address for typos or unnecessary spaces.
        </p>
        </td>
        </tr>
        </tbody></table>
        </div>`
    var msg = {
        to: from, 
        from: "Mail Delivery Subsystem <mailer-daemon@jinnmail.com>", 
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
        from: "Mail Delivery Subsystem <mailer-daemon@jinnmail.com>", 
        subject: "Delivery Status Notification (Failure)", 
        cc: '', 
        headers: headers, 
        messageBody: `You attempted to send this message from your own mailbox "${to}" to your own alias "${alias.alias}".<br><br>Jinnmail aliases shield your real address when sending to and receiving mail from others. Aliases are not needed when sending to your own address and will be stripped when included in TO/CC/BCC sent by you.`, 
        attachments: []
    }

    return msg
}

async function get_sender_alias(senderAliasId) {
    const res = await aliasModel.findOne({ aliasId: senderAliasId });
    return res;
}

async function create_sender_alias(userId) {
    let newSenderAlias = new aliasModel();
    newSenderAlias.aliasId = uuidv4();
    newSenderAlias.userId = userId
    newSenderAlias.alias = `${randomString(11)}${process.env.JM_REPLY_EMAIL_SUBDOMAIN}`;
    newSenderAlias.type = "sender";
    newSenderAlias.mailCount = 0;
    return newSenderAlias.save();
}

async function get_or_create_proxymail(sender, aliasId, userId) {
    const proxymail = await proxymailModel.findOne({ aliasId: aliasId, proxyMail: sender })
    if (proxymail) {
        return proxymail
    } else {
        const senderAlias = await create_sender_alias(userId);
        return await module.exports.create_proxymail(sender, aliasId, senderAlias.aliasId);
    }
}

// async function get_or_create_sender_alias(sender, userId) {
//     senderAlias = await aliasModel.findOne({alias: sender})
//     if (senderAlias) {
//         return senderAlias
//     } else {
//         let newSenderAlias = new aliasModel();
//         newSenderAlias.aliasId = uuidv4();
//         newSenderAlias.userId = userId
//         newSenderAlias.alias = sender;
//         newSenderAlias.type = "sender";
//         newSenderAlias.mailCount = 0;

//         return newSenderAlias.save();
//     }
// }

// async function get_or_create_proxymail(aliasId, senderAliasId) {
//     proxymail = await proxymailModel.findOne({aliasId: aliasId, senderAliasId: senderAliasId})
//     if (proxymail) {
//         return proxymail
//     } else {
//         let newproxymail = new proxymailModel();
//         newproxymail.proxyMailId = uuidv4();
//         newproxymail.aliasId = aliasId;
//         newproxymail.senderAliasId = senderAliasId
//         newproxymail.proxyMail = `${randomString(11)}${process.env.JM_REPLY_EMAIL_SUBDOMAIN}`;

//         return newproxymail.save();
//     }
// }

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
    } else {
        return ''
    }
}

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