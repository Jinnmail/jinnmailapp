var express = require('express');
var router = express.Router();
var user = require('../controller/user.js');
const userAuth = require('../middlewares/userAuth')
const validator = require('../middlewares/validator')
const reqRes = require('../middlewares/reqRes')

function login(req, res) {
    user.login(req.body)
        .then((data) => {
            reqRes.responseHandler('Login Successful', data, res);
            res.end();
        })
        .catch((err) => {
            reqRes.httpErrorHandler(err, res)
            res.end()
        })
}

    // register(req, res) {
    //     user.register(req.body)
    //         .then((data) => {
    //             reqRes.responseHandler('signup Successfull', data, res);
    //         }).catch((err) => {
    //             reqRes.httpErrorHandler(err, res)
    //             res.end()
    //         })
    // }

    // resetPassword(req, res) {
    //     req.body.userId = req.userId;
    //     user.changePassword(req.body)
    //         .then((data) => {
    //             reqRes.responseHandler('password changed', data, res);
    //         }).catch((err) => {
    //             reqRes.httpErrorHandler(err, res)
    //             res.end()
    //         })
    // }

    // codeVerification(req,res){
        
    //     user.codeVerification(req.body)
    //         .then((data) => {
    //             reqRes.responseHandler('', data, res); //Handle Response
    //         }).catch((err) => {
    //             reqRes.httpErrorHandler(err, res)
    //             res.end()
    //         })
    // }

    // resendCode(req, res){
        
    //     user.resendCode(req.body)
    //         .then((data) => {
    //             reqRes.responseHandler('', data, res); //Handle Response
    //         }).catch((err) => {
    //             reqRes.httpErrorHandler(err, res)
    //             res.end()
    //         })
    // }

    // forgetPassword(req,res){
         
    //     user.forgetPassword(req.body)
    //         .then((data) => {
    //             reqRes.responseHandler('', data, res); //Handle Response
    //         }).catch((err) => {
    //             reqRes.httpErrorHandler(err, res)
    //             res.end()
    //         })
    // }

    // resetPasswordChange(req,res){
    //     user.resetPasswordChange(req.body)
    //         .then( data => {
    //             reqRes.responseHandler('',data, res);
    //         })
    //         .catch( err => {
    //             reqRes.httpErrorHandler(err, res);
    //             res.end();
    //         });
    // }

function getRegisteredUsers(req, res) {
    // return res.json({"name": "james"});
    user.getUsers(req)
        .then((data) => {
            // reqRes.responseHandler('fetched successfully', data, res);
            res.status(200).send(data)
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
}

// router.post('/', validator.registerValidator, register);
router.post('/session', validator.loginValidator, login);
// router.post('/reset/password', userAuth, resetPassword);
// router.post('/code/verify', codeVerification);
// router.post('/code/resend', resendCode);
// router.post('/forgot/password', forgetPassword);
// router.post('/forgot/password/reset', resetPasswordChange);

router.get('/', userAuth.validateUser, getRegisteredUsers);

module.exports = router;