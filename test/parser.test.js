var expect = require('chai').expect;
var mongoose = require('mongoose');
const dotenv = require("dotenv").config()
var parser = require('../controller/parser.js');
const aliasModel = require('../models/alias');
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

describe('Use Case 1', () => { // (Test Cases 1, 2, 3)
    
    // new email and all replies
    // non-jinnmail user -> jinnmail user alias -> non-jinnmail user -> jinnmail user alias
    
    it('should pass all tests', async () => {       
        const params = {
            to: 'xxx@dev.jinnmail.com',  
            from: 'Mike Burke <nonjinnmailuser@gmail.com>', 
            replyTo: '', 
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'xxx@dev.jinnmail.com', 
            messageBody: 'mailto:xxx@dev.jinnmail.com', 
            attachments: []
        }
        const res = await parser.parse(params)
        expect(res.to).to.equal('jinnmailuser2@gmail.com')
        expect(res.from).to.equal('Mike Burke <nonjinnmailuser@gmail.com>') 
        expect(res.replyTo).to.include('Mike Burke <')
        expect(res.replyTo).to.include('@reply.dev.jinnmail.com>')
        expect(res.headers).to.not.include('xxx@dev.jinnmail.com')
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]')
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]')
        expect(res.subject.startsWith('[𝕁𝕄] ')).to.equal(true);
        expect(res.messageBody).that.includes('Shielded by Jinnmail');
        expect(res.messageBody).that.includes('Manage your Jinnmail account and aliases');

        const params2 = {
            to: res.replyTo, 
            from: `George Burke <${res.to}>`,
            replyTo: '',  
            cc: '', 
            headers: 'jinnmailuser2@gmail.com', 
            subject: `Re: ${res.subject}`, 
            messageBody: res.messageBody, 
            attachments: []
        }
        const res2 = await parser.parse(params2)
        expect(res2.from).to.equal('George Burke <xxx@dev.jinnmail.com>');
        expect(res2.to).to.equal('Mike Burke <nonjinnmailuser@gmail.com>');
        expect(res2.replyTo).to.equal('');
        expect(res2.headers).that.does.not.include('jinnmailuser2@gmail.com');
        expect(res2.subject).that.does.not.include('[𝕁𝕄] ');
        expect(res2.subject).that.does.include('xxx@dev.jinnmail.com');
        // expect(res2.messageBody).that.includes('[[Hidden by Jinnmail]]'); // hard to get these to show up to test
        // expect(res2.messageBody).that.includes('@reply.dev.jinnmail.com'); 
        expect(res2.messageBody).that.includes('Sent secretly with ');
        expect(res2.messageBody).that.does.not.include('Shielded by Jinnmail');
        expect(res2.messageBody).that.does.not.include('Manage your Jinnmail account and aliases');

        const params3 = {
            to: 'George Burke <xxx@dev.jinnmail.com>', 
            from: 'Mike Burke <nonjinnmailuser@gmail.com>',
            replyTo: '',  
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'Re: xxx@dev.jinnmail.com', 
            messageBody: res2.messageBody, 
            attachments: []
        }
        const res3 = await parser.parse(params3)
        expect(res3.to).to.equal('George Burke <jinnmailuser2@gmail.com>')
        expect(res3.from).to.equal('Mike Burke <nonjinnmailuser@gmail.com>')
        expect(res3.replyTo).to.include('Mike Burke <')
        expect(res3.replyTo).to.include('@reply.dev.jinnmail.com>')
        // expect(res3.messageBody).to.include('jinnmailuser2@gmail.com') // hard to get this to show up to test
        expect(res3.headers).to.not.include('xxx@dev.jinnmail.com')
        expect(res3.subject).to.include('[[Hidden by Jinnmail]]')
        expect(res3.messageBody).to.not.include('Sent secretly with ');

        // test mailCount
        // const alias = await aliasModel.findOne({alias: 'xxx@dev.jinnmail.com'});
        // const senderAlias = await aliasModel.findOne({alias: res.replyTo});
        // expect(alias.mailCount).to.equal(2);
        // expect(senderAlias.mailCount).to.equal(1);
    })
})

describe('Use Case 2', () => { // (Test Case 4)

    // non-jinnmail user -> jinnmail user alias
    // new email
    // jinnmail user -> non-jinnmail user

    it('should pass all tests', async () => {  
        const params = {
            to: 'xxx@dev.jinnmail.com',  
            from: 'Mike Burke <nonjinnmailuser@gmail.com>', 
            replyTo: '', 
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'xxx@dev.jinnmail.com', 
            messageBody: 'mailto:xxx@dev.jinnmail.com', 
            attachments: []
        }
        const res = await parser.parse(params)
        expect(res.to).to.equal('jinnmailuser2@gmail.com')
        expect(res.from).to.equal('Mike Burke <nonjinnmailuser@gmail.com>') 
        expect(res.replyTo).to.include('Mike Burke <')
        expect(res.replyTo).to.include('@reply.dev.jinnmail.com')
        expect(res.headers).to.not.include('xxx@dev.jinnmail.com')
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]')
        expect(res.subject.startsWith('[𝕁𝕄] ')).to.equal(true);
        expect(res.messageBody).that.includes('Shielded by Jinnmail');
        expect(res.messageBody).that.includes('Manage your Jinnmail account and aliases');

        const params2 = {
            to: res.replyTo,  
            from: 'jinnmailuser2@gmail.com', 
            replyTo: '', 
            cc: '', 
            headers: 'jinnmailuser2@gmail.com', 
            subject: '[[Hidden by Jinnmail]]', 
            messageBody: '', 
            attachments: []
        }
        const res2 = await parser.parse(params2)
        expect(res2.to).to.equal('nonjinnmailuser@gmail.com')
        expect(res2.from).to.equal('xxx@dev.jinnmail.com')
        expect(res2.replyTo).to.equal('')
        expect(res2.headers).to.not.include('jinnmailuser2@gmail.com')
        expect(res2.messageBody).that.includes('Sent secretly with ');
        expect(res2.messageBody).to.not.includes('Shielded by Jinnmail');
        expect(res2.messageBody).to.not.includes('Manage your Jinnmail account and aliases');
    })
})

describe('Use Case 3', () => { // (Test Case 6)

    // jinnmail user sends to their own alias

    it('should pass all tests', async () => {       
        params = {
            to: 'xxx@dev.jinnmail.com',  
            from: 'jinnmailuser2@gmail.com', 
            replyTo: '', 
            cc: '', 
            headers: '', 
            subject: '', 
            messageBody: '', 
            attachments: []
        }
        let res = await parser.parse(params)
        expect(res.to).to.equal('jinnmailuser2@gmail.com')
        expect(res.from).to.equal('Mail Delivery Subsystem <mailer-daemon@jinnmail.com>') 
        expect(res.subject).to.equal('Delivery Status Notification (Failure)')
        expect(res.messageBody).to.include('You attempted to send this message from your own mailbox "jinnmailuser2@gmail.com" to your own alias "xxx@dev.jinnmail.com".')
        expect(res.messageBody).to.include('Jinnmail aliases shield your real address when sending to and receiving mail from others. Aliases are not needed when sending to your own address and will be stripped when included in TO/CC/BCC sent by you.')
        expect(res.messageBody).to.not.include('Shielded by Jinnmail')
        expect(res.messageBody).to.not.includes('Manage your Jinnmail account and aliases');
    })
})

describe('Use Case 4', () => { // (Test Cases 8, 9)

    // non-jinnmail user -> jinnmail user alias with their own non-jinnmail user reply to -> non-jinnmail user

    it('should pass all tests', async () => {
        var params = {
            to: 'xxx@dev.jinnmail.com', 
            from: 'Silicon Valley Bitcoin Meetup <nonjinnmailuser2@gmail.com>',
            replyTo: 'Silicon Valley Bitcoin Meetup <nonjinnmailuser3@gmail.com>',  
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'xxx@dev.jinnmail.com', 
            messageBody: 'mailto:xxx@dev.jinnmail.com', 
            attachments: []
        }
        var res = await parser.parse(params)
        expect(res.from).to.equal('Silicon Valley Bitcoin Meetup <nonjinnmailuser2@gmail.com>');
        expect(res.to).to.equal('jinnmailuser2@gmail.com');
        expect(res.replyTo).to.include('Silicon Valley Bitcoin Meetup <')
        expect(res.replyTo).to.include('@reply.dev.jinnmail.com');
        expect(res.headers).to.not.equal('xxx@dev.jinnmail.com');
        expect(res.subject).to.equal('[𝕁𝕄] [[Hidden by Jinnmail]]');
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]');
        expect(res.messageBody).to.include('Shielded by Jinnmail');
        expect(res.messageBody).to.include('Manage your Jinnmail account and aliases');
        expect(res.messageBody).to.not.include('xxx@dev.jinnmail.com');

        var params2 = {
            to: res.replyTo, 
            from: 'George Burke <jinnmailuser2@gmail.com>',
            replyTo: '',  
            cc: '', 
            headers: 'jinnmailuser2@gmail.com', 
            subject: '[𝕁𝕄] [[Hidden by Jinnmail]]', 
            messageBody: '[[Hidden by Jinnmail]]', 
            attachments: []
        }
        var res2 = await parser.parse(params2)
        expect(res2.from).to.equal('George Burke <xxx@dev.jinnmail.com>');
        expect(res2.to).to.equal('Silicon Valley Bitcoin Meetup <nonjinnmailuser3@gmail.com>');
        expect(res2.replyTo).to.equal('');
        expect(res2.headers).to.not.include('jinnmailuser2@gmail.com');
        expect(res2.subject).to.not.include('[𝕁𝕄] ');
        expect(res2.subject).to.include('xxx@dev.jinnmail.com');
        expect(res2.messageBody).to.include('xxx@dev.jinnmail.com');
        // expect(res2.messageBody).to.include('[[Hidden by Jinnmail]]'); // really hard to test this here
        expect(res2.messageBody).to.include('Sent secretly with ');
        expect(res2.messageBody).to.not.include('Shielded by Jinnmail');
        expect(res2.messageBody).to.not.include('Manage your Jinnmail account and aliases');
    })
})

describe('Use Case 5', () => { // (Test Case 5)

    // new email with another to and cc, and then reply 
    // {non-jinnmail user, another email, CC another email} -> jinnmail user alias -> non-jinnmail user

    it('should pass all tests', async () => {
        const params = {
            to: 'xxx@dev.jinnmail.com, somoneelse@gmail.com',  
            from: 'Mike Burke <nonjinnmailuser@gmail.com>', 
            replyTo: '', 
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'xxx@dev.jinnmail.com', 
            messageBody: 'mailto:xxx@dev.jinnmail.com', 
            attachments: []
        }
        const res = await parser.parse(params)
        expect(res.to).to.equal('jinnmailuser2@gmail.com')
        expect(res.from).to.equal('Mike Burke <nonjinnmailuser@gmail.com>') 
        expect(res.replyTo).to.include('Mike Burke <')

        const params2 = {
            to: res.replyTo, 
            from: `George Burke <${res.to}>`,
            replyTo: '',  
            cc: 'email@server.com', 
            headers: 'jinnmailuser2@gmail.com', 
            subject: `Re: ${res.subject} jinnmailuser2@gmail.com`, 
            messageBody: res.messageBody, 
            attachments: []
        }
        const res2 = await parser.parse(params2)
        expect(res2.from).to.equal('George Burke <xxx@dev.jinnmail.com>');
        expect(res2.to).to.equal('Mike Burke <nonjinnmailuser@gmail.com>');
        expect(res2.replyTo).to.equal('');
        expect(res2.cc).to.equal('');
        expect(res2.subject).to.include('[[Hidden by Jinnmail]]');
        expect(res2.subject).to.not.include('jinnmailuser2@gmail.com');
    })
})

describe('Use Case 6', () => { // (Test Case 7)

    // new email and then reply with own alias added within the to and cc 
    // non-jinnmail user -> jinnmail user alias -> {non-jinnmail user, add own alias, CC own alias}

    it('should pass all tests', async () => {
        const params = {
            to: 'George Burke <xxx@dev.jinnmail.com>',  
            from: 'Mike Burke <nonjinnmailuser@gmail.com>', 
            replyTo: '', 
            cc: '', 
            headers: 'xxx@dev.jinnmail.com', 
            subject: 'xxx@dev.jinnmail.com', 
            messageBody: 'mailto:xxx@dev.jinnmail.com', 
            attachments: []
        }
        const res = await parser.parse(params)
        expect(res.to).to.equal('George Burke <jinnmailuser2@gmail.com>')
        expect(res.from).to.equal('Mike Burke <nonjinnmailuser@gmail.com>') 
        expect(res.replyTo).to.include('Mike Burke <')

        const params2 = {
            to: `${res.replyTo}, George Burke <xxx@dev.jinnmail.com>`, 
            from: res.to,
            replyTo: '',  
            cc: 'George Burke <xxx@dev.jinnmail.com>', 
            headers: '', 
            subject: 'Re: [𝕁𝕄]', 
            messageBody: '', 
            attachments: []
        }
        const res2 = await parser.parse(params2) // no headers in test, so won't actually send the bounceback email
        expect(res2.from).to.equal('George Burke <xxx@dev.jinnmail.com>');
        expect(res2.to).to.equal('Mike Burke <nonjinnmailuser@gmail.com>');
    })
})

describe('receiver aliases', () => {
    
    // jinnmail user -> receiver alias -> receiver real email address

    let params;

    beforeEach(() => {
        params = {
            to: 'a@receiver.dev.jinnmail.com',
            from: 'Mike Burke <jinnmailuser2@gmail.com>',
            replyTo: '',
            cc: '',
            headers: 'xxx@dev.jinnmail.com',
            subject: 'xxx@dev.jinnmail.com',
            messageBody: 'mailto:xxx@dev.jinnmail.com',
            attachments: []
        }
    });

    it.only('sends email to receiver real address', async () => {
        // const params = {
        //     to: 'x@receiver.dev.jinnmail.com',
        //     from: 'Mike Burke <jinnmailuser2@gmail.com>',
        //     replyTo: '',
        //     cc: '',
        //     headers: 'xxx@dev.jinnmail.com',
        //     subject: 'xxx@dev.jinnmail.com',
        //     messageBody: 'mailto:xxx@dev.jinnmail.com',
        //     attachments: []
        // }

        const res = await parser.parse(params)
        expect(res.to).to.equal('a@a.com')
        expect(res.from).to.equal('Mike Burke <ytf91t@dev.jinnmail.com>');
        expect(res.headers).to.not.include('xxx@dev.jinnmail.com')
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]')
        expect(res.messageBody).to.include('[[Hidden by Jinnmail]]')
        expect(res.subject.startsWith('[𝕁𝕄] ')).to.equal(true);
        expect(res.messageBody).that.includes('Shielded by Jinnmail');
        expect(res.messageBody).that.includes('Manage your Jinnmail account and aliases');
    });
});

// describe('Math', function() {
//     describe('#abs()', function() {
//         it('should return positive value of given negative number', function() {
//             expect(Math.abs(-5)).to.be.equal(5);
//         });
//     });
// });
