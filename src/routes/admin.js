import express from 'express'
import admin from '../controller/admin'
import mail from "../controller/mailDetails"
import reqRes from '../middlewares/reqRes'
import userAuth from '../middlewares/userAuth'

class AdminRoute{
    router 

    constructor(){
        this.router = express.Router();
        this.routes();
    }

    getAdminDetails(req, res){
        // console.log("REQ BODY: "+req.body)
        admin.getAdmin(req.body)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }
    
    getUserDetails(req, res){
        admin.getUser(req.params)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }
    
    getAliasDetails(req, res){
        admin.getAlias(req.params)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }
    
    getSearchedContent(req, res){
        // console.log(req.params)
        admin.getSearched(req.params)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }
    
    getMailDetails(req, res){
        mail.getDetails(req.params)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }
    
    getInboxDetails(req, res){
        mail.getInboxDetails(req.params)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }
    
    getOutboxDetails(req, res){
        mail.getOutboxDetails(req.params)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }    

    routes(){
        this.router.post('/', this.getAdminDetails);
        this.router.get('/user/:uid', userAuth, this.getUserDetails);
        this.router.get('/alias/:aid', userAuth, this.getAliasDetails);
        this.router.get('/search/:key/:value', userAuth, this.getSearchedContent);
        this.router.get('/getMailDetails/:uid', userAuth, this.getMailDetails);
        this.router.get('/inbox/:wid/:mid', userAuth, this.getInboxDetails);
        this.router.get('/outbox/:wid/:mid', userAuth, this.getOutboxDetails);
    }

}

export default new AdminRoute().router