var express = require('express');
var router = express.Router();
var proxymail = require('../controller/proxymail.js');
const userAuth = require('../middlewares/userAuth');

router.get('/:aliasId', userAuth.validateUser, proxymail.getProxymail);

module.exports = router;
