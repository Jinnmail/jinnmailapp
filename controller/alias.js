const userModel = require('../models/user');
const aliasModel = require('../models/alias');
const mailModel = require('../models/mailDetails');
const proxyMailModel = require('../models/proxymail');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const cred = require('../config/const');
const uuidv3 = require('uuid/v3');
const request = require('request');
const { PromiseProvider } = require('mongoose');
var URL = require('url').URL;
const blacklistModel = require('../models/blacklist');
const logger = require('heroku-logger')
const parser = require("./parser")
var createError = require('http-errors');

// import logger from '../utils/logger';

module.exports = {

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

    registerAlias: function(data) {
        console.log("\nRegister Alias Data:",data);
        return new Promise((resolve, reject) => {
            let source = data.source;
            if (source === 'cust') {
                let myCustUrl = new URL(data.url);
                let str = myCustUrl.hostname;
                let domain = str.substr(0, str.lastIndexOf('.'));
                let email_address = domain + process.env.JM_EMAIL_DOMAIN
                blacklistModel.findOne({localPart: domain, domain: process.env.JM_EMAIL_DOMAIN}).then((blacklist) => {
                    if (blacklist) {
                        reject({code: 403, msg: 'Not available'})
                    } else {
                        aliasModel.findOne({ alias: email_address }).then((isAvail) => {
                            if (isAvail) {
                                reject({ code: 403, msg: 'Not available' })
                            } else {
                                data.aliasId = uuidv4();
                                data.alias = email_address;
                                data.type = "alias";
                                data.mailCount = 0;
                                data.refferedUrl = data.domainAlias 
                                  ? data.domainAlias.substring(0, data.domainAlias.lastIndexOf('@')) 
                                  : domain;
                                let alias = new aliasModel(data);
                                alias.save((err, saved) => {
                                    console.log(err)
                                    if (err) {
                                        reject({ code: 500, msg: 'something went wrong' })
                                    } else {
                                        resolve(saved)

                                        // The first developer thought we were hosting an inbox for the user, but that is now a deprecated feature.
                                        
                                        // this.registerUserOnMailServer(saved, domain ).then((d) => {
                                        //     resolve(saved)
                                        // }).catch((err) => {
                                        //     reject({ code: 500, msg: 'something went wrong' })
                                        // })
                                    }
                                })
                            }
                        }).catch((err) => {
                            reject({ code: 500, msg: 'something went wrong' })
                        })
                    }
                }).catch((err) => {
                    reject({ code: 500, msg: 'something went wrong' })
                })
            } else {
                let domain = this.getDomain(data.url);
                let token = this.randomString(6);
                let email_address = domain + '.' + token + process.env.JM_EMAIL_DOMAIN
                blacklistModel.findOne({localPart: domain + '.' + token, domain: process.env.JM_EMAIL_DOMAIN}).then((blacklist) => {
                    if (blacklist) {
                        reject({code: 403, msg: 'Not available'})
                    } else {
                        aliasModel.findOne({ alias: email_address }).then((isAvail) => {
                            if (isAvail) {
                                reject({ code: 403, msg: 'Not available' })
                            } else {
                                data.aliasId = uuidv4();
                                data.alias = email_address;
                                data.type = "alias";
                                data.mailCount = 0;
                                data.refferedUrl = data.url;
                                let alias = new aliasModel(data);
                                alias.save((err, saved) => {
                                    console.log(err)
                                    if (err) {
                                        reject({ code: 500, msg: 'something went wrong' })
                                    } else {
                                        resolve(saved) 

                                        // The first developer thought we were hosting an inbox for the user, but that is now a deprecated feature.
                                        
                                        // this.registerUserOnMailServer(saved, domain + '.' + token).then((x) => {
                                        //     console.log("\nMail Server Data: ",x)
                                        //     this.registerMailboxesOnServer(x.id).then(x => {
                                        //         console.log("MailBoxes Updated")
                                        //         resolve(saved)
                                        //     }).catch( err => {
                                        //         var d = {
                                        //             params: {
                                        //                 aliasId: x.id
                                        //             }
                                        //         }
                                        //         this.deleteAlias(d).then( x => {
                                        //             reject({ code: 500, msg: 'something went wrong' })
                                        //         }).catch(err => {
                                        //             reject({ code: 500, msg: 'something went wrong' })
                                        //         })
                                        //     })
                                        // }).catch((err) => {
                                        //     reject({ code: 500, msg: 'something went wrong' })
                                        // })
                                    }
                                })
                            }
                        }).catch((err) => {
                            reject({ code: 500, msg: 'something went wrong' })
                        })
                    }
                }).catch((err) => {
                    reject({ code: 500, msg: 'something went wrong' })
                })  
            }
        });
    },

    registerMasterAlias: function (data) {
        console.log("\nRegister Master Alias Data:", data);
        return new Promise((resolve, reject) => {
            let myCustUrl = new URL(data.url);
            let str = myCustUrl.hostname;
            let domain = str.substr(0, str.lastIndexOf('.'));
            let email_address = domain + process.env.JM_EMAIL_DOMAIN
            blacklistModel.findOne({ localPart: domain, domain: process.env.JM_EMAIL_DOMAIN }).then((blacklist) => {
                if (blacklist) {
                    reject({ code: 403, msg: 'Not available' })
                } else {
                    aliasModel.findOne({ alias: email_address }).then((isAvail) => {
                        if (isAvail) {
                            reject({ code: 403, msg: 'Not available' })
                        } else {
                            data.aliasId = uuidv4();
                            data.alias = email_address;
                            data.type = "master";
                            data.mailCount = 0;
                            data.refferedUrl = domain;
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
                }
            }).catch((err) => {
                reject({ code: 500, msg: 'something went wrong' })
            })
        });
    },

    registerReceiverAlias: async function (req, res) {
        const data = req.body;
        console.log("\nRegister Receiver Alias Data:", data);
        const masterAlias = await aliasModel.findOne({userId: req.userId, type: 'master'});
        if (!masterAlias) {
            return res.status(400).json({
                message: 'Error no master alias',
                error: createError(400, 'no master alias')
            })
        }
        let myCustUrl = new URL(data.url);
        let str = myCustUrl.hostname;
        let domain = str.substr(0, str.lastIndexOf('.'));
        let email_address = domain + process.env.JM_RECEIVER_DOMAIN
        const blacklist = await blacklistModel.findOne({localPart: domain, domain: process.env.JM_RECEIVER_DOMAIN});
        if (!blacklist) {
            const alias = await aliasModel.findOne({ alias: email_address });
            if (!alias) {
                data.aliasId = uuidv4();
                data.userId = req.userId;
                data.alias = email_address;
                data.type = "receiver";
                data.mailCount = 0;
                data.refferedUrl = domain;
                const alias = new aliasModel(data);
                const savedAlias = await alias.save();
                if (savedAlias === alias) {
                    const proxyMail = await parser.create_proxymail(data.realEmail, masterAlias.aliasId, savedAlias.aliasId);
                    return res.status(201).json(savedAlias);
                } else {
                    return res.status(500).json({
                        message: 'Something went wrong',
                        error: createError(500, 'something went wrong')
                    });
                }
            } else {
                return res.status(403).json({
                    message: 'Not available',
                    error: createError(403, 'not available')
                });
            }
        } else {
            return res.status(403).json({
                message: 'Not available',
                error: createError(403, 'not available')
            });
        }
    },

    getRegisteredAlias: function(data) {
        return new Promise((resolve, reject) => {
            // aliasModel.find({ userId: data.userId }).sort({ created: -1 }).then((aliases) => {
            //     resolve(aliases)
            // }).catch((err) => {
            //     reject({ code: 500, msg: 'something went wrong' });
            // })
            aliasModel.aggregate([
                {
                    $match: {
                        "userId": data.userId, 
                        "type": "alias"
                    }
                },
                { 
                    $lookup: {
                        "from": "users",
                        "localField": "userId",
                        "foreignField": "userId",
                        "as": "Details"
                    }
                },
                {
                    $unwind: "$Details"
                },
                {
                    $project: {
                        "aliasId":1,
                        "userId":1,
                        "alias":1,
                        "refferedUrl":1,
                        "status":1,
                        "created":1,
                        "mailCount":1,
                        "email":"$Details.email"
                    }
                },
                {
                    $sort: {
                        "created": -1
                    }
                }
            ]).then(result => {
                // console.log("Result is:========================== \n"+ (result)?JSON.stringify(result):"0"+"\n====================================================================");  
                resolve(result);
                // console.log(val[0].user[0].email);
            }).catch((err) => {
                reject({ code: 500, msg: err });
            });
        })

    }, 

    getAlias: function(data) {
        return new Promise((resolve, reject) => {
            aliasModel.aggregate([
                {
                    $match: {
                        "type": "alias"
                    }
                },
                { 
                    $lookup: {
                        "from": "users",
                        "localField": "userId",
                        "foreignField": "userId",
                        "as": "Details"
                    }
                },
                {
                    $unwind: "$Details"
                },
                {
                    $project: {
                        // "aliasId":1,
                        // "userId":1,
                        "alias":1,
                        // "refferedUrl":1,
                        // "status":1,
                        // "created":1,
                        // "mailCount":1,
                        // "email":"$Details.email" // don't reveal user by returning real email
                    }
                },
                // {
                //     $sort: {
                //         "created": -1
                //     }
                // }
            ]).then(result => {
                // console.log("Result is:========================== \n"+ (result)?JSON.stringify(result):"0"+"\n====================================================================");  
                resolve(result);
                // console.log(val[0].user[0].email);
            }).catch((err) => {
                reject({ code: 500, msg: err });
            });
        })

    }, 

    changeStatusOfAlias: function(data) {
        return new Promise((resolve, reject) => {
            // console.log(data.aliasId, data.status)
            aliasModel.findOneAndUpdate({ aliasId: data.aliasId }, { status: data.status })
                    .then((alias) => {
                        // console.log(alias)
                        resolve(null)
                    }).catch((err) => {
                        reject({ code: 500, msg: 'something went wrong' });
                    })
        })
    }, 

    changeAlias: async function(data) {
      // params.aliasId not working, something with app.js, go thru body
      const res = await aliasModel.findOneAndUpdate({aliasId: data.aliasId}, {refferedUrl: data.name});

      return res;
    }, 

    readAlias: async function(data) {
      const res = await aliasModel.findOne({aliasId: data.params.aliasId});

      return res;
    }, 

    deleteAlias: async function(data) {
        const proxymails = await proxyMailModel.find({aliasId: data.params.aliasId})

        for(var i=0; i < proxymails.length; i++) {
            await aliasModel.deleteOne({aliasId: proxymails[i].senderAliasId});
            await proxyMailModel.deleteOne({proxyMailId: proxymails[i].proxyMailId});
        }

        const tempAlias = await aliasModel.findOne({aliasId: data.params.aliasId})
        await userModel.findOneAndUpdate({userId: tempAlias.userId}, {$inc: {aliasesCount: -1}});
        const alias = await aliasModel.deleteOne({aliasId: data.params.aliasId})

        if (alias.deletedCount > 0) { 
            return
        } else {
            throw new Error("No Alias found")
        }
    }, 

    // deleteAlias: function(data) {
    //     return new Promise((resolve, reject) => {
    //         // console.log(data.body.userId, data.params.aliasId);
    //         aliasModel.remove({ aliasId: data.params.aliasId })
    //             .then((data) => {
    //                 console.log(proxymails)
    //                 resolve(null)
    //             })
    //             .catch((err) => {
    //                 reject({ code: 500, msg: 'something went wrong' })
    //             })
    //     })
    // }, 

    // deleteAlias: function(data) {
    //     return new Promise((resolve, reject) => {
    //         // console.log(data.body.userId, data.params.aliasId);
    //         aliasModel.remove({ aliasId: data.params.aliasId })
    //             .then((data) => {
    //                 resolve(null)
    //             })
    //             .catch((err) => {
    //                 reject({ code: 500, msg: 'something went wrong' })
    //             })
    //     })

    // }, 

    //parsing domain name 
    getHostName: function(url) {
        url = url.includes('http')?url:'http://'+url;
        //console.log(url,"url129")
        var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
        if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
            return match[2];
        }
        else {
            return null;
        }
    }, 

    //end

    // generating a random number 

    randomString: function(string_length) {
        let chars = "0123456789abcdefghiklmnopqrstuvwxyz";
        let randomstring = '';
        for (let i = 0; i < string_length; i++) {
            let rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum, rnum + 1);
        }
        return randomstring;
    }, 


    getDomain: function(url) {
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
    }, 

    // The first developer thought we were hosting an inbox for the user, but that is now a deprecated feature.

    // registerMailboxesOnServer: function(id){
    //     console.log(id)
    //     return new Promise((resolve, reject) => {
    //         let url = `https://jinnmail.com/api/users/${id}`
    //         let options = {
    //             method: 'get',
    //             json: true,
    //             url: url
    //         };
    //         request(options, (err,res,body) => {
    //             if (err) { console.log(err); }
    //             console.log("Body",body)
    //             let link = `https://jinnmail.com/api/users/${id}/mailboxes`;
    //             let opt = {
    //                 method: 'get',
    //                 json: true,
    //                 url: link
    //             };
    //             request(opt, (error, result, content)=>{
    //                 if(error) { console.log(error); }
    //                 let mailboxes = content.results;
    //                 let mailData = {};
    //                 mailData.alias = body.address;
    //                 mailData.wildduckId = id;
    //                 mailboxes.map(m=>{
    //                     if(m.name === "INBOX")
    //                     {
    //                         mailData.inboxId = m.id
    //                     }
    //                     if(m.name === "Sent Mail")
    //                     {
    //                         mailData.sentId = m.id
    //                     }
    //                 })
    //                 console.log(mailData)
    //                 let mail = new mailModel(mailData);
    //                 mail.save((err, saved) => {
    //                     if(err) { console.log(err); }
    //                     else { console.log("saved"); }
    //                 })
    //             })
                
    //             resolve("ok")
    //         })  
    //     })
    // }, 

    // The first developer thought we were hosting an inbox for the user, but that is now a deprecated feature.
    
    // registerUserOnMailServer: function(data, username) {
    //     return new Promise((resolve, reject) => {
    //         //console.log(data)
    //         userModel.findOne({ userId: data.userId }, { email: 1 }).then((userInfo) => {
    //             let postData = {
    //                 "username": username,
    //                 "password": process.env.EMAIL_PASSWORD,
    //                 "targets": [],
    //                 "disabledScopes": []
    //             }

    //             let url = process.env.EMAIL_SERVER + 'users'
    //             let options = {
    //                 method: 'post',
    //                 body: postData,
    //                 json: true,
    //                 url: url
    //             };
    //             request(options, function (err, res, body) {
    //                 if (err) {
    //                     console.error('error posting json: ', err)
    //                     throw err
    //                 }
    //                 var headers = res.headers
    //                 var statusCode = res.statusCode
    //                 console.log('\nHeaders: ', headers)
    //                 console.log('\nStatusCode: ', statusCode)
    //                 console.log('\nBody: ', body)
    //                 /////////////////////////////////////////////////////////////////////////////////
                    
    //                 /////////////////////////////////////////////////////////////////////////////////

    //                 resolve(body)
    //             })
    //         }).catch((err) => {
    //             reject(err);
    //         })

    //     })
    // }, 

    getAliasUser: function(data) {
        return new Promise((resolve, reject) => {
            let alias = data.query.alias;
            // console.log(alias)
            aliasModel.aggregate([
                {
                    $match: {
                        alias: alias
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'userId',
                        foreignField: 'userId',
                        as: 'userInfo'
                    }
                },
                {
                    $unwind: "$userInfo"
                },
                {
                    $project:{
                        email:'$userInfo.email',
                        status:1
                    }
                }
            ]).then((info) => {
                resolve(info)
            })
        })

    },

    getMasterAlias: async function(data) {
        return await aliasModel.findOne({ userId: data.params.userId, type: 'master' });
    }
}
