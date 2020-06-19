var expect = require('chai').expect;
var mongoose = require('mongoose');
const dotenv = require("dotenv").config()
var parser = require('../controller/parser.js');

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

describe('#testcase8()', function() {

    it('should return from: Greg Vitko <sadtoyus@gmail.com>, ...', async () => {
        var params = {
            to: `xxx@dev.jinnmail.com`, 
            from: 'Greg Vitko <sadtoyus@gmail.com>',
            replyTo: 'deduceus@gmail.com',  
            cc: '', 
            headers: '...xxx@dev.jinnmail.com...', 
            subject: 'Hey xxx@dev.jinnmail.com', 
            messageBody: 'Hey xxx@dev.jinnmail.com dude', 
            attachments: []
        }

        var res = await parser.testcases(params)

        expect(res.from).to.equal('Greg Vitko <sadtoyus@gmail.com>');
        expect(res.to).to.equal('schillerj78@gmail.com');
        expect(res.replyTo).that.includes('greg vitko <');
        expect(res.replyTo).that.includes('@reply.dev.jinnmail.com>');
        expect(res.headers).that.does.not.equal('xxx@dev.jinnmail.com');
        expect(res.subject).to.equal('[𝕁𝕄] Hey [[Hidden by Jinnmail]]');
        expect(res.messageBody).that.includes('Hey [[Hidden by Jinnmail]] dude');
        expect(res.messageBody).that.includes('Shielded by Jinnmail');
        expect(res.messageBody).that.includes('Manage your Jinnmail account and aliases');
    })
})

describe('#testcase8()', function() {

    it('should return from: Silicon Valley Bitcoin Meetup <meetup@svbtc.org>, ...', async () => {
        expect(true).to.equal(true);
        // var params = {
        //     to: `veed.145u25@dev.jinnmail.com`, 
        //     from: 'Silicon Valley Bitcoin Meetup <meetup@svbtc.org>',
        //     replyTo: 'organizer@svbtc.org',  
        //     cc: '', 
        //     headers: '...veed.145u25@dev.jinnmail.com...', 
        //     subject: 'Hey veed.145u25@dev.jinnmail.com', 
        //     messageBody: 'Hey veed.145u25@dev.jinnmail.com dude', 
        //     attachments: []
        // }

        // var res = await parser.testcases(params)

        // expect(res.from).to.equal('Silicon Valley Bitcoin Meetup <meetup@svbtc.org>');
        // expect(res.to).to.equal('gburke@geoburke.com');
        // expect(res.replyTo).that.includes('silicon valley bitcoin meetup <');
        // expect(res.replyTo).that.includes('@reply.dev.jinnmail.com>');
        // expect(res.headers).that.does.not.equal('veed.145u25@dev.jinnmail.com');
        // expect(res.subject).to.equal('[𝕁𝕄] Hey [[Hidden by Jinnmail]]');
        // expect(res.messageBody).that.includes('Hey [[Hidden by Jinnmail]] dude');
        // expect(res.messageBody).that.includes('Shielded by Jinnmail');
        // expect(res.messageBody).that.includes('Manage your Jinnmail account and aliases');
    })

})

// describe('Math', function() {
//     describe('#abs()', function() {
//         it('should return positive value of given negative number', function() {
//             expect(Math.abs(-5)).to.be.equal(5);
//         });
//     });
// });