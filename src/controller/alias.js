import userModel from '../models/user';
import aliasModel from '../models/alias';
import proxyMailModel from '../models/proxymail'
import uuidv4 from 'uuid/v4';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt-nodejs';
import cred from '../config/const';
import uuidv3 from 'uuid/v3';

// import logger from '../utils/logger';

class AliasController {

    constructor() {

    }

    // checkAvailability(data) {
    //     return new Promise((resolve, reject) => {
    //         aliasModel.findOne({ alias: data.alias }).then((data) => {
    //             if (data) {
    //                 reject({ code: 403, msg: 'Not available' })
    //             } else {
    //                 resolve(null)
    //             }
    //         })
    //     }).catch((err) => {
    //         reject({ code: 500, msg: 'something went wrong' })
    //     });
    // }

    registerAlias(data) {
        console.log(data);
        return new Promise((resolve, reject) => {
            let domain = this.getDomain(data.url);
            let token = this.randomString(6);
            let email_address = domain + '.' + token + '@jinnmail.com'
            aliasModel.findOne({ alias: email_address }).then((isAvail) => {
                if (isAvail) {
                    reject({ code: 403, msg: 'Not available' })
                } else {
                    data.aliasId = uuidv4();
                    data.alias = email_address;
                    data.refferedUrl = data.url;
                    let alias = new aliasModel(data);
                    alias.save((err, saved) => {
                        console.log(err)
                        if (err) {
                            reject({ code: 500, msg: 'something went wrong' })
                        } else {
                            resolve(saved)
                        }
                    })
                }
            }).catch((err) => {
                reject({ code: 500, msg: 'something went wrong' })
            })
        });
    }

    getRegisteredAlias(data) {
        return new Promise((resolve, reject) => {
            aliasModel.find({ userId: data.userId }).sort({ created: -1 }).then((aliases) => {
                resolve(aliases)
            }).catch((err) => {
                reject({ code: 500, msg: 'something went wrong' });
            })
        })

    }

    changeStatusOfAlias(data) {
        return new Promise((resolve, reject) => {
            console.log(data.aliasId, data.status)
            aliasModel.findOneAndUpdate({ aliasId: data.aliasId }, { status: data.status }).then((alias) => {
                console.log(alias)
                resolve(null)
            }).catch((err) => {
                reject({ code: 500, msg: 'something went wrong' });
            })
        })
    }

    deleteAlias(data) {
        return new Promise((resolve, reject) => {
            console.log(data.body.userId, data.params.aliasId);
            aliasModel.remove({ aliasId: data.params.aliasId }).then((data) => {
                resolve(null)
            })
                .catch((err) => {
                    reject({ code: 500, msg: 'something went wrong' })
                })
        })

    }

    //parsing domain name 
    getHostName = (url) => {
        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
            return match[2];
        }
        else {
            return null;
        }
    }

    //end

    // generating a random number 

    randomString = (string_length) => {
        let chars = "0123456789abcdefghiklmnopqrstuvwxyz";
        let randomstring = '';
        for (let i = 0; i < string_length; i++) {
            let rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
    }


    getDomain = (url) => {
        let hostName = this.getHostName(url);
        let domain = hostName;

        if (hostName != null) {
            let parts = hostName.split('.').reverse();

            if (parts != null && parts.length > 1) {
                domain = parts[1] + '.' + parts[0];

                if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
                    domain = parts[2] + '.' + domain;
                }
            }
        }

        return domain.split('.')[0];
    }


}

export default new AliasController();