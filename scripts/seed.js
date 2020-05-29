var mongoose = require('mongoose');
const dotenv = require("dotenv").config()
const logger = require('heroku-logger')
const userModel = require('../models/user');
const aliasModel = require('../models/alias');
const proxymailModel = require('../models/proxymail');

mongoose.connect(process.env.DB_HOST, {
    auth: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    useUnifiedTopology: true, 
    useNewUrlParser: true
});

var db = mongoose.connection

db.on('error', () => {
     console.error('Error occured in db connection');
});

db.on('open', () => {
    console.log('DB Connection established successfully');
});

async function main() {
    const userEmails = process.env.USER_EMAILS.split(', ');
    const userResetPwdTokens = process.env.USER_RESET_PASSWORD_TOKENS.split(', ');
    const userPwds = process.env.USER_PASSWORDS.split(', ');
    const userCodes = process.env.USER_CODES.split(', ');
    const aliasAliases = process.env.ALIAS_ALIASES.split(', ');

    const user = await userModel.deleteMany({});
    const alias = await aliasModel.deleteMany({});
    const proxymail = await proxymailModel.deleteMany({}); 

    const users = await userModel.insertMany([
        {
            verified: true,
            resetPasswordToken: userResetPwdTokens[0],
            aliasesCount: 0,
            userId: "7dea2c9e-a6f6-40f2-b24d-d0c29b757493",
            email: userEmails[0],
            password: userPwds[0],
            verificationCode: userCodes[0]
        }, 
        {
            verified: true,
            resetPasswordToken: userResetPwdTokens[1],
            aliasesCount: 0,
            userId: "bf116d63-1d2d-48ae-8692-5e4602a959a5",
            email: userEmails[1],
            password: userPwds[1],
            verificationCode: userCodes[1]
        }
    ]);

    const aliases = await aliasModel.insertMany([
        {
            status: true,
            userId: "7dea2c9e-a6f6-40f2-b24d-d0c29b757493",
            aliasId: "9bcf6057-0a96-4182-89ac-b9555ee0dd4a",
            alias: aliasAliases[0],
            type: "alias", 
            mailCount: 0,
            refferedUrl: "www.veed.io"
        }, 
        {
            status: true,
            userId: "bf116d63-1d2d-48ae-8692-5e4602a959a5",
            aliasId: "8df12e8a-f4fc-4473-a094-6259632ddae4",
            alias: aliasAliases[1],
            type: "alias", 
            mailCount: 0,
            refferedUrl: "xxx.com"
        } 
    ]);

    console.log("seed complete")
    process.exit()
}

main() 


