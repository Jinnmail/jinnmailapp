const mailParse = require('@sendgrid/inbound-mail-parser');
const mail = require('../services/mail');
const userModel = require('../models/user');
const aliasModel = require('../models/alias');

module.exports = {

    inbound: function(data) {
        var attachments = data.files
        var config = {keys: ['to', 'from', 'subject', 'text', 'headers']};
        var parsing = new mailParse(config, data);
        var response = parsing.keyValues();

        var toEmail = response.to;
        var fromEmail = response.from;
        var subject = response.subject;
        var messageBody = response.text
        var headers = response.headers

        return new Promise((resolve, reject) => {
            aliasModel.findOne({alias: toEmail}).then((alias) => {
                if (alias && alias.status) {
                    userModel.findOne({userId: alias.userId}).then((user) => {
                        if (user) {
                            toEmail = user.email
                            mail.send_mail(fromEmail, subject, toEmail, messageBody)
                            resolve();
                        } else {
                            reject({code: 500, msg: "No User found"});
                        }
                    })
                } else {
                    reject({code: 500, msg: "No active Alias found"});
                }
            })
        });
    }

}

// var spaceIndex = fromEmail.lastIndexOf(' '); // "first last <email@server.com>"
// fromEmail = fromEmail.substring(spaceIndex+2, fromEmail.length-1) // => email@server.com