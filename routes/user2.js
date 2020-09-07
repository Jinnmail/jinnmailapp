var express = require('express');
var router = express.Router();
var user = require('../controller/user2.js');
const userAuth = require('../middlewares/userAuth')
const validator = require('../middlewares/validator')
const reqRes = require('../middlewares/reqRes');

router.post('/', validator.registerValidator, user.register);

module.exports = router;
