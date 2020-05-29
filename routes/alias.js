var express = require('express');
var router = express.Router();
var alias = require('../controller/alias.js');
const userAuth = require('../middlewares/userAuth')
const validator = require('../middlewares/validator')
const reqRes = require('../middlewares/reqRes')

function registerAlias(req, res) {
    req.body.userId = req.userId;
    alias.registerAlias(req.body)
        .then((data) => {
            reqRes.responseHandler('alias registered', data, res);
            res.end();
        })
        .catch((err) => {
            console.log(err)
            reqRes.httpErrorHandler(err, res)
            res.end()
        })
}

function checkAvailability(req, res) {
    alias.checkAvailability(req.body)
        .then((data) => {
            reqRes.responseHandler('alias available', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res)
            res.end()
        })
}

function getRegisteredAlias(req, res) {
    alias.getRegisteredAlias(req)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

function getAlias(req, res) {
    alias.getAlias(req)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

function changeAliasStatus(req, res) {
    req.body.userId = req.userId;
    alias.changeStatusOfAlias(req.body)
        .then((data) => {
            reqRes.responseHandler('updated successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

function deleteAlias(req, res) {
    console.log('delete', req.params.aliasId);
    alias.deleteAlias(req)
    .then((data) => {
        reqRes.responseHandler('deleted successfully', data, res);
    }).catch((err) => {
        reqRes.httpErrorHandler(err, res);
        res.end();
    })
}

function getAliasUser(req,res) {
    alias.getAliasUser(req)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

router.post('/', userAuth.validateUser, registerAlias);
router.get('/', userAuth.validateUser, getRegisteredAlias);
router.get('/checkAlias', userAuth.validateUser, getAlias);
router.post('/avail', userAuth.validateUser, checkAvailability);
router.put('/status', userAuth.validateUser, changeAliasStatus);
router.delete('/:aliasId', userAuth.validateUser, deleteAlias);
router.get('/linkedUser', getAliasUser)

module.exports = router;