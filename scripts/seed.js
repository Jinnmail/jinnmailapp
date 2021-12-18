var mongoose = require('mongoose');
const dotenv = require("dotenv").config()
const logger = require('heroku-logger')
const userModel = require('../models/user');
const aliasModel = require('../models/alias');
const proxymailModel = require('../models/proxymail');
const adminModel = require('../models/admin');
const uuidv4 = require('uuid/v4');

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
    const adminPassword = process.env.ADMIN_PASSWORD;

    const user = await userModel.deleteMany({});
    const alias = await aliasModel.deleteMany({});
    const proxymail = await proxymailModel.deleteMany({});
    const admin = await adminModel.deleteMany({});

    uids = [uuidv4(), uuidv4(), uuidv4()]
    const users = await userModel.insertMany([
        {
            verified: true,
            resetPasswordToken: userResetPwdTokens[0],
            aliasesCount: 1,
            userId: uids[0],
            email: userEmails[0],
            password: userPwds[0],
            verificationCode: userCodes[0], 
            premium: true, 
            maxInvites: 5, 
            invites: 5, 
            aliasesCount: 1
        }, 
        {
            verified: true,
            resetPasswordToken: userResetPwdTokens[1],
            aliasesCount: 1,
            userId: uids[1],
            email: userEmails[1],
            password: userPwds[1],
            verificationCode: userCodes[1], 
            premium: true, 
            maxInvites: 5,  
            invites: 5, 
            aliasesCount: 2
        }, 
        {
            verified: true,
            resetPasswordToken: userResetPwdTokens[2],
            aliasesCount: 1,
            userId: uids[2],
            email: userEmails[2],
            password: userPwds[2],
            verificationCode: userCodes[2], 
            premium: true, 
            maxInvites: 5, 
            invites: 5, 
            aliasesCount: 1
        }
    ]);

    const aliases = await aliasModel.insertMany([
        {
            status: true,
            userId: uids[0],
            aliasId: uuidv4(),
            alias: aliasAliases[0],
            type: "alias", 
            mailCount: 0,
            refferedUrl: "www.veed.io"
        }, 
        {
            status: true,
            userId: uids[1],
            aliasId: uuidv4(),
            alias: aliasAliases[1],
            type: "alias", 
            mailCount: 0,
            refferedUrl: "yyy.com"
        },
        {
            status: true,
            userId: uids[1],
            aliasId: uuidv4(),
            alias: aliasAliases[3],
            type: "alias", 
            mailCount: 0,
            refferedUrl: "zzz.com"
        },  
        {
            status: true,
            userId: uids[2],
            aliasId: uuidv4(),
            alias: aliasAliases[2],
            type: "alias", 
            mailCount: 0,
            refferedUrl: "xxx.com"
        }
    ]);

    try {
        const admins = await adminModel.insertMany([
            {
                adminId: uuidv4(), 
                username: 'admin',
                password: adminPassword
            }
        ]);
    } catch(e) {
        console.log(e);
    }

    // todo: james s left off here
    // create master alias, receiver alias, proxymail
    // need user
    try {
        const masterAlias = await aliasModel.insertMany([{
            status: true,
            userId: users[1].userId,
            aliasId: uuidv4(),
            alias: 'ytf91t@dev.jinnmail.com',
            type: "master",
            mailCount: 0,
            refferedUrl: "ytf91t"
        }])
        const receiverAlias = await aliasModel.insertMany([{
            status: true,
            userId: users[1].userId,
            aliasId: uuidv4(),
            alias: 'a@receiver.dev.jinnmail.com',
            type: 'receiver',
            mailCount: 0,
            referredUrl: 'a'

        }]);
        const proxymail = await proxymailModel.insertMany([{
            proxyMailId: uuidv4(),
            aliasId: masterAlias[0].aliasId,
            senderAliasId: receiverAlias[0].aliasId,
            proxyMail: 'a@a.com'
        }]);
        console.log();
    } catch(e) {
        console.log(e);
    }

    console.log("seed complete")
    process.exit()
}

main() 


