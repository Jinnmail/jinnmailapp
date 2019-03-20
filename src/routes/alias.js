import express from 'express'
import userAuth from '../middlewares/userAuth'
import reqRes from '../middlewares/reqRes'
import alias from '../controller/alias';
import * as validator from '../middlewares/validator'


class AliasRoute {
    router

    constructor() {
        this.router = express.Router()
        this.routes()
    }

    //writing routes here
    registerAlias(req, res) {
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

    checkAvailability(req, res) {
        alias.checkAvailability(req.body)
            .then((data) => {
                reqRes.responseHandler('alias available', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res)
                res.end()
            })
    }

    getRegisteredAlias(req, res) {
        alias.getRegisteredAlias(req)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }

    getAlias(req, res) {
        alias.getAlias(req)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }

    changeAliasStatus(req, res) {
        req.body.userId = req.userId;
        alias.changeStatusOfAlias(req.body)
            .then((data) => {
                reqRes.responseHandler('updated successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }


    deleteAlias(req, res) {
        console.log('delete', req.params.aliasId);
        alias.deleteAlias(req)
        .then((data) => {
            reqRes.responseHandler('deleted successfully', data, res);
        }).catch((err) => {
            reqRes.httpErrorHandler(err, res);
            res.end();
        })
    }

    getAliasUser(req,res) {
        alias.getAliasUser(req)
            .then((data) => {
                reqRes.responseHandler('fetched successfully', data, res);
            }).catch((err) => {
                reqRes.httpErrorHandler(err, res);
                res.end();
            })
    }
        

    routes() {
        this.router.post('/', userAuth, this.registerAlias);
        this.router.get('/', userAuth,  this.getRegisteredAlias);
        this.router.get('/checkAlias', userAuth, this.getAlias);
        this.router.post('/avail', userAuth, this.checkAvailability);
        this.router.put('/status', userAuth, this.changeAliasStatus);
        this.router.delete('/:aliasId', userAuth, this.deleteAlias);
        this.router.get('/linkedUser', this.getAliasUser)
    }
}
export default new AliasRoute().router