var express = require('express');
var router = express.Router();
const webhookCheck = require('../middlewares/webhookCheck')
var parser = require('../controller/parser.js');
const logger = require('heroku-logger')

async function inbound(req, res) {
    // res.status(200).send()
    // logger.info("drain")

    try {
        await parser.inbound(req)
        res.status(200).send()
    } catch(err) {
        logger.info(err)
        res.status(200).send() // sendgrid requires a 200 response
    }
}

router.post('/inbound', webhookCheck.checkAccess, inbound);

module.exports = router;

// .then(() => {
//     logger.info("sent email successfully", {key: "msg"})
//     res.status(200).send()
// }).catch((err) => {
//     logger.error(err.msg, {code: err.code})
//     res.status(200).send() // sendgrid requires a 200 response
// })