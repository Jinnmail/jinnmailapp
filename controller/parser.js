const mailParse = require('@sendgrid/inbound-mail-parser');
const mail = require('../services/mail');
const userModel = require('../models/user');
const aliasModel = require('../models/alias');

module.exports = {

    inbound: function(data) {
        var config = {keys: ['to', 'from', 'subject', 'text']};
        var parsing = new mailParse(config, data);
        console.log(parsing)
        var response = parsing.keyValues();

        var toEmail = response.to;
        var fromEmail = response.from;
        var subject = response.subject;
        var messageBody = response.text

        var spaceIndex = fromEmail.lastIndexOf(' '); // "first last <email@server.com>"
        
        fromEmail = fromEmail.substring(spaceIndex+2, fromEmail.length-1) // => email@server.com

        return new Promise((resolve, reject) => {
            userModel.findOne({email: fromEmail}).then((user) => {
                if (user) {
                    aliasModel.findOne({userId: user.userId}).then((alias) => {
                        if (alias) {
                            toEmail = "schillerj78@gmail.com"
                            mail.send_email(alias.alias, subject, toEmail, messageBody)
                            resolve();
                        } else {
                            reject({code: 500, msg: "No Alias found"});
                        }
                    })
                } else {
                    reject({code: 500, msg: "No User found"});
                }
            })
        });
    }

}