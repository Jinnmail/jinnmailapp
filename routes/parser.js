var express = require('express');
var router = express.Router();
const webhookCheck = require('../middlewares/webhookCheck')
var parser = require('../controller/parser.js');

function inbound(req, res) {
    parser.inbound(req)
    .then(() => {
        return res.status(200)
    }).catch((err) => {
        return res.status(200) // sendgrid requires a 200 response
    })
}

// router.post('/inbound', inbound);
router.post('/inbound', webhookCheck.checkAccess, inbound);

module.exports = router;