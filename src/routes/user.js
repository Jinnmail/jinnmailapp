import express from 'express'
import userAuth from '../middlewares/userAuth'
import reqRes from '../middlewares/reqRes'
import user from '../controller/user';
import * as validator from '../middlewares/validator'

class UserRoute {
    router

    constructor() {
        this.router = express.Router()
        this.routes()
    }

    //writing routes here
    login(req, res) {
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

    register(req, res) {
        user.register(req.body)
            .then((data) => {
                reqRes.responseHandler('signup Successfull', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res)
                res.end()
            })
    }

    resetPassword(req, res) {
        req.body.userId = req.userId;
        user.changePassword(req.body)
            .then((data) => {
                reqRes.responseHandler('password changed', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res)
                res.end()
            })
    }

    codeVerification(req,res){
        
        user.codeVerification(req.body)
            .then((data) => {
                reqRes.responseHandler('', data, res); //Handle Response
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res)
                res.end()
            })
    }

    resendCode(req, res){
        user.resendCode(req.body)
            .then((data) => {
                reqRes.responseHandler('', data, res); //Handle Response
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res)
                res.end()
            })
    }

    forgetPassword(req,res){
         
        user.forgetPassword(req.body)
            .then((data) => {
                reqRes.responseHandler('', data, res); //Handle Response
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res)
                res.end()
            })
    }

    resetPasswordChange(req,res){
        user.resetPasswordChange(req.body)
            .then( data => {
                reqRes.responseHandler('',data, res);
            })
            .catch( err => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            });
    }

    getRegisteredUsers(req, res) {
        user.getUsers(req)
            .then((data) => {
                // reqRes.responseHandler('fetched successfully', data, res);
                res.status(200).send(data)
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }

    inbound(req, res) {
        console.log("***************************************")
        console.log("******** INBOUND WEBHOOK FIRED ********")
        console.log("***************************************")
        let sg_wh_api_string = req.query.sendgrid_webhook_api_string;
        console.log(sg_wh_api_string)
        if (sg_wh_api_string === process.env.SENDGRID_WEBHOOK_API_STRING) {
            console.log("********MATCHED********")
        }
    }

    routes() {
        this.router.post('/', validator.registerValidator, this.register);
        this.router.post('/session', validator.loginValidator, this.login);
        this.router.post('/reset/password', userAuth, this.resetPassword);
        this.router.post('/code/verify', this.codeVerification);
        this.router.post('/code/resend', this.resendCode);
        this.router.post('/forgot/password', this.forgetPassword);
        this.router.post('/forgot/password/reset', this.resetPasswordChange);
        this.router.post('/inbound', this.inbound);

        this.router.get('/', userAuth, this.getRegisteredUsers);
    }
}
export default new UserRoute().router