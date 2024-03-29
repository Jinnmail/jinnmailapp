const express = require('express')
var router = express.Router();
const admin = require('../controller/admin')
const mail = require("../controller/mailDetails")
const reqRes = require('../middlewares/reqRes')
const userAuth = require('../middlewares/userAuth')

function getAdminDetails(req, res) {
    // console.log("REQ BODY: "+req.body)
    admin.getAdmin(req.body)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

function getUserDetails(req, res) {
    admin.getUser(req.params)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

function getAliasDetails(req, res) {
    admin.getAlias(req.params)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

function getSearchedContent(req, res) {
    // console.log(req.params)
    admin.getSearched(req.params)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

function getMailDetails(req, res) {
    mail.getDetails(req.params)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

function userSearch(req, res) {
    admin.userSearch(req.query.query)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

function aliasSearch(req, res) {
    admin.aliasSearch(req.query.userId, req.query.query)
        .then((data) => {
            reqRes.responseHandler('fetched successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

async function aliasList(req, res) {
    try {
        const data = await admin.aliasList();
        let response = {
            status: 200,
            message: 'aliases',
            data: data,
            error: ''
        };
        res.status(200).send(response);
    } catch (err) {
        let error = {};
        error.status = 500;
        error.error = err.msg;
        error.result = "";
        res.status(err.status).send(error);
    }
}

async function paidList(req, res) {
  try {
    const data = await admin.paidList();
    let response = {
        status: 200,
        message: 'paid customers',
        data: data,
        error: ''
    };
    res.status(200).send(response);
  } catch (err) {
    let error = {};
    error.status = 500;
    error.error = err.msg;
    error.result = "";
    res.status(err.status).send(error);
  }
}

// The first developer thought we were hosting an inbox for the user, but that is now a deprecated feature.

// function getInboxDetails(req, res){
//     mail.getInboxDetails(req.params)
//         .then((data) => {
//             reqRes.responseHandler('fetched successfully', data, res);
//         }).catch((err) => {
//             reqRes.httpErrorHandler(err, res);
//             res.end();
//         })
// }

// The first developer thought we were hosting an inbox for the user, but that is now a deprecated feature.

// function getOutboxDetails(req, res){
//     mail.getOutboxDetails(req.params)
//         .then((data) => {
//             reqRes.responseHandler('fetched successfully', data, res);
//         }).catch((err) => {
//             reqRes.httpErrorHandler(err, res);
//             res.end();
//         })
// }    

router.post('/', getAdminDetails);
router.get('/user/:uid', userAuth.validateUser, getUserDetails);
router.get('/alias/:aid', userAuth.validateUser, getAliasDetails);
router.get('/search/:key/:value', userAuth.validateUser, getSearchedContent);
router.get('/getMailDetails/:uid', userAuth.validateUser, getMailDetails);
router.get('/userSearch', userAuth.validateUser, userSearch)
router.get('/aliasSearch', userAuth.validateUser, aliasSearch)
router.get('/aliases', userAuth.validateUser, aliasList)
router.get('/paid', userAuth.validateUser, paidList);

// The first developer thought we were hosting an inbox for the user, but that is now a deprecated feature.

// router.get('/inbox/:wid/:mid', userAuth.validateUser, getInboxDetails);
// router.get('/outbox/:wid/:mid', userAuth.validateUser, getOutboxDetails);

module.exports = router;