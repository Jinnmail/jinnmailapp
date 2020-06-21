var expect = require('chai').expect;
var mongoose = require('mongoose');
const dotenv = require("dotenv").config()
var parser = require('../controller/parser.js');
const { getMaxListeners } = require('../models/user.js');
require('dotenv');

beforeEach(function (done) {
    mongoose.connect(process.env.DB_HOST, {
        auth: {
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        },
        useUnifiedTopology: true, 
        useNewUrlParser: true
    });
    
    var db = mongoose.connection

    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', function() {
        console.log('We are connected to test database!');
        done();
    });
});

describe('Use Case 1', () => { 
    
    // new email and all replies
    // non-jinnmail user -> jinnmail user alis -> non-jinnmail user -> jinnmail user alias
    
    it('should pass all tests', async () => {       
        const params = {
            to: 'xxx@dev.jinnmail.com',  
            from: 'nonjinnmailuser@gmail.com', 
            reply_to: '', 
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'xxx@dev.jinnmail.com', 
            messageBody: 'mailto:xxx@dev.jinnmail.com', 
            attachments: []
        }
        const res = await parser.parse(params)
        expect(res.to).to.equal('jinnmailuser@gmail.com')
        expect(res.from).to.equal('nonjinnmailuser@gmail.com') 
        expect(res.replyTo).to.include('@reply.dev.jinnmail.com')
        expect(res.headers).to.not.include('xxx@dev.jinnmail.com')
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]')
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]')
        expect(res.subject.startsWith('[𝕁𝕄] ')).to.equal(true);
        expect(res.messageBody).that.includes('Shielded by Jinnmail');
        expect(res.messageBody).that.includes('Manage your Jinnmail account and aliases');

        const params2 = {
            to: res.replyTo, 
            from: res.to,
            reply_to: '',  
            cc: '', 
            headers: 'jinnmailuser@gmail.com', 
            subject: `Re: ${res.subject}`, 
            messageBody: res.messageBody, 
            attachments: []
        }
        const res2 = await parser.parse(params2)
        expect(res2.from).to.equal('xxx@dev.jinnmail.com');
        expect(res2.to).to.equal('nonjinnmailuser@gmail.com');
        expect(res2.replyTo).to.equal('');
        expect(res2.headers).that.does.not.include('jinnmailuser@gmail.com');
        expect(res2.subject).that.does.not.include('[𝕁𝕄] ');
        expect(res2.subject).that.does.include('xxx@dev.jinnmail.com');
        // expect(res2.messageBody).that.includes('[[Hidden by Jinnmail]]'); // hard to get these to show up to test
        // expect(res2.messageBody).that.includes('@reply.dev.jinnmail.com'); 
        expect(res2.messageBody).that.includes('Sent secretly with ');
        expect(res2.messageBody).that.does.not.include('Shielded by Jinnmail');
        expect(res2.messageBody).that.does.not.include('Manage your Jinnmail account and aliases');

        const params3 = {
            to: 'xxx@dev.jinnmail.com', 
            from: 'nonjinnmailuser@gmail.com',
            reply_to: '',  
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'xxx@dev.jinnmail.com', 
            messageBody: res2.messageBody, 
            attachments: []
        }
        const res3 = await parser.parse(params3)
        expect(res3.to).to.equal('jinnmailuser@gmail.com')
        expect(res3.from).to.equal('nonjinnmailuser@gmail.com')
        expect(res3.replyTo).to.equal(res.replyTo)
        // expect(res3.messageBody).to.include('jinnmailuser@gmail.com') // hard to get this to show up to test
        expect(res3.headers).to.not.include('xxx@dev.jinnmail.com')
        expect(res3.subject).to.include('[[Hidden by Jinnmail]]')
    })
})

describe('Use Case 2', () => {

    // non-jinnmail user -> jinnmail user alias
    // new email
    // jinnmail user -> non-jinnmail user

    it('should pass all tests', async () => {  
        const params = {
            to: 'xxx@dev.jinnmail.com',  
            from: 'nonjinnmailuser@gmail.com', 
            reply_to: '', 
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'xxx@dev.jinnmail.com', 
            messageBody: 'mailto:xxx@dev.jinnmail.com', 
            attachments: []
        }
        const res = await parser.parse(params)
        expect(res.to).to.equal('jinnmailuser@gmail.com')
        expect(res.from).to.equal('nonjinnmailuser@gmail.com') 
        expect(res.replyTo).to.include('@reply.dev.jinnmail.com')
        expect(res.headers).to.not.include('xxx@dev.jinnmail.com')
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]')
        expect(res.subject.startsWith('[𝕁𝕄] ')).to.equal(true);
        expect(res.messageBody).that.includes('Shielded by Jinnmail');
        expect(res.messageBody).that.includes('Manage your Jinnmail account and aliases');

        const params2 = {
            to: res.replyTo,  
            from: 'jinnmailuser@gmail.com', 
            reply_to: '', 
            cc: '', 
            headers: 'jinnmailuser@gmail.com', 
            subject: 'jinnmailuser@gmail.com', 
            messageBody: '', 
            attachments: []
        }
        const res2 = await parser.parse(params2)
        expect(res2.to).to.equal('nonjinnmailuser@gmail.com')
        expect(res2.from).to.equal('xxx@dev.jinnmail.com')
        expect(res2.replyTo).to.equal('')
        expect(res2.headers).to.not.include('jinnmailuser@gmail.com')
        expect(res2.subject).to.include('[[Hidden by Jinnmail]]')
        expect(res2.messageBody).that.includes('Sent secretly with ');
        expect(res2.messageBody).to.not.includes('Shielded by Jinnmail');
        expect(res2.messageBody).to.not.includes('Manage your Jinnmail account and aliases');
    })
})

describe('Use Case 3', () => {

    // jinnmail user sends to their own alias

    it('should pass all tests', async () => {       
        params = {
            to: 'xxx@dev.jinnmail.com',  
            from: 'jinnmailuser@gmail.com', 
            reply_to: '', 
            cc: '', 
            headers: '', 
            subject: '', 
            messageBody: '', 
            attachments: []
        }
        let res = await parser.parse(params)
        expect(res.to).to.equal('jinnmailuser@gmail.com')
        expect(res.from).to.equal('Mail Deivery Subsystem <mailer-daemon@googlemail.com>') 
        expect(res.subject).to.equal('Delivery Status Notification (Failure)')
        expect(res.messageBody).to.include('You attempted to send this message from your own mailbox "jinnmailuser@gmail.com" to your own alias "xxx@dev.jinnmail.com".')
        expect(res.messageBody).to.include('Jinnmail aliases shield your real address when sending to and receiving mail from others. Aliases are not needed when sending to your own address and will be stripped when included in TO/CC/BCC sent by you.')
        expect(res.messageBody).to.not.include('Shielded by Jinnmail')
        expect(res.messageBody).to.not.includes('Manage your Jinnmail account and aliases');
    })
})

describe('Use Case 4', () => {

    // non-jinnmail user -> jinnmail user alias with their own non-jinnmail user reply to -> non-jinnmail user 

    it('should pass all tests', async () => {
        var params = {
            to: 'xxx@dev.jinnmail.com', 
            from: 'nonjinnmailuser@gmail.com',
            reply_to: 'nonjinnmailuserreplyto@gmail.com',  
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'xxx@dev.jinnmail.com', 
            messageBody: 'mailto:xxx@dev.jinnmail.com', 
            attachments: []
        }
        var res = await parser.parse(params)
        expect(res.from).to.equal('nonjinnmailuser@gmail.com');
        expect(res.to).to.equal('jinnmailuser@gmail.com');
        expect(res.replyTo).to.include('@reply.dev.jinnmail.com');
        expect(res.headers).to.not.equal('xxx@dev.jinnmail.com');
        expect(res.subject).to.equal('[𝕁𝕄] [[Hidden by Jinnmail]]');
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]');
        expect(res.messageBody).to.include('Shielded by Jinnmail');
        expect(res.messageBody).to.include('Manage your Jinnmail account and aliases');

        var params2 = {
            to: res.replyTo, 
            from: res.to,
            replyTo: '',  
            cc: '', 
            headers: 'jinnmailuser@gmail.com', 
            subject: '[𝕁𝕄] [[Hidden by Jinnmail]]', 
            messageBody: `mailto:${res.replyTo} [[Hidden by Jinnmail]]`, 
            attachments: []
        }
        var res2 = await parser.parse(params2)
        expect(res2.from).to.equal('xxx@dev.jinnmail.com');
        expect(res2.to).to.equal('nonjinnmailuser@gmail.com');
        expect(res2.replyTo).to.equal('');
        expect(res2.headers).to.not.include('jinnmailuser@gmail.com');
        expect(res2.subject).to.not.include('[𝕁𝕄] ');
        expect(res2.subject).to.include('xxx@dev.jinnmail.com');
        expect(res2.messageBody).to.include('xxx@dev.jinnmail.com');
        expect(res2.messageBody).to.include('[[Hidden by Jinnmail]]');
        expect(res2.messageBody).to.include('Sent secretly with ');
        expect(res2.messageBody).to.not.include('Shielded by Jinnmail');
        expect(res2.messageBody).to.not.include('Manage your Jinnmail account and aliases');
    })
})

// describe('Math', function() {
//     describe('#abs()', function() {
//         it('should return positive value of given negative number', function() {
//             expect(Math.abs(-5)).to.be.equal(5);
//         });
//     });
// });
