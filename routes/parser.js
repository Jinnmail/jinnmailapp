var express = require('express');
var router = express.Router();
const webhookCheck = require('../middlewares/webhookCheck')
const mailParse = require('@sendgrid/inbound-mail-parser');
const mail = require('../services/mail');

function inbound(req, res) {
    const config = {keys: ['to', 'from', 'subject', 'text']};
    const parsing = new mailParse(config, req);
    let response = parsing.keyValues();
    
    let to = response.to;
    let from = response.from;
    let subject = response.subject;
    let messageBody = response.text

    console.log(to)
    console.log(from)
    console.log('This is the subject from the mail: ', subject);
    console.log(messageBody)

    mail.send_email(to, from, subject, messageBody)

    console.log("***************")
    console.log("****INBOUND****")
    console.log("***************")

    reqRes.responseHandler('fetched successfully', {}, res);
}

router.post('/inbound', webhookCheck.checkAccess, inbound);

module.exports = router;