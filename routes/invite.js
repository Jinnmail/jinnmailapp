var express = require('express');
var router = express.Router();
var inviteController = require('../controller/inviteController.js');
const userAuth = require('../middlewares/userAuth')

/*
 * GET
 */
router.get('/user/:userId', userAuth.validateUser, inviteController.userList);

/*
 * GET
 */
router.get('/', userAuth.validateUser, inviteController.list);

/*
 * GET
 */
router.get('/:id', userAuth.validateUser, inviteController.show);

/*
 * POST
 */
router.post('/', userAuth.validateUser, inviteController.create);

/*
 * PUT
 */
router.put('/:id', userAuth.validateUser, inviteController.update);

/*
 * DELETE
 */
router.delete('/:id', userAuth.validateUser, inviteController.remove);

module.exports = router;
