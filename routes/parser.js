var express = require('express');
var router = express.Router();
const webhookCheck = require('../middlewares/webhookCheck')
var parser = require('../controller/parser.js');

function inbound(req, res) {
    parser.inbound(req)
    .then(() => {
        res.status(200).send()
    }).catch((err) => {
        res.status(200).send() // sendgrid requires a 200 response
    })
}

router.post('/inbound', webhookCheck.checkAccess, inbound);

module.exports = router;