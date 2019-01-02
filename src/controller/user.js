import userModel from '../models/user';
import uuidv4 from 'uuid/v4';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt-nodejs';
import cred from '../config/const'
import uuidv3 from 'uuid/v3';
import * as mail from '../services/mail';
import { callbackify } from 'util';
import async from 'async';
import btoa from 'btoa'

class UserController {

    constructor() {

    }


    login(data) {
        let userObj;
        let token;
        return new Promise((resolve, reject) => {

            userModel.findOne({ email: data.email })
                .then((userData) => {
                    if (userData) {
                        if(!userData.verified){
                            reject({ code: 403, msg: 'user not verified' });
                        }
                        userObj = userData;
                        return new Promise((resolve, reject) => {
                            bcrypt.compare(data.password.toString(), userData.password, (err, isMatch) => {
                                if (err)
                                    reject(err);
                                resolve(isMatch)                                
                            })
                        })
                    } else {
                        reject({ code: 400, msg: 'No User found' });
                    }
                })
                .then((equal) => {
                    if (equal) {
                        return true
                    } else {
                        reject({ code: 400, msg: 'No Password matched' });
                    }
                })
                .then((isMatch) => {
                    let tokenObj = {
                        userId: userObj.userId
                    };
                    token = jwt.sign(tokenObj, process.env.JWT_SECRET, { expiresIn: '24h' });
                    return token
                })
                .then((token) => {
                    let finalOutput = {
                        'status': 'authorized',
                        'userId': userObj.userId,
                        'email': userObj.email,
                        'sessionToken': token,
                        'expiresIn': '24h'
                    };
                    resolve(finalOutput);
                })
                .catch((err) => {
                    reject({ code: 500, msg: err });
                });
        })
    }

    register(data) {
        return new Promise((resolve, reject) => {
            userModel.findOne({ email: data.email }).then((user) => {
                console.log(user)
                if (user) {
                    reject({ code: 500, msg: 'err' });
                } else {
                    let newUser = new userModel();
                    newUser.email = data.email;
                    newUser.password = data.password;
                    newUser.userId = uuidv4();
                    newUser.verificationCode = Math.floor(100000 + Math.random() * 900000);
                    newUser.save((err, savedUser) => {
                        if (err) {
                            reject({ code: 500, msg: err });
                        } else {
                            mail.email_sender([data.email], newUser.verificationCode);
                            resolve(savedUser);
                        }
                    })
                }
            })

        })
    }


    changePassword(data) {
        return new Promise((resolve, reject) => {
            userModel.findOne({ userId: data.userId }, { password: 1 }).then((userData) => {
                if (userData) {
                    return new Promise((resolve, reject) => {
                        bcrypt.compare(data.oldPassword.toString(), userData.password, (err, isMatch) => {
                            if (err)
                                reject(err);
                            resolve(isMatch)
                        })
                    })
                } else {
                    reject({ code: 500, msg: 'unauthorized action.' })
                }
            })
                .then((equal) => {
                    if (equal) {
                        return true
                    } else {
                        reject({ code: 400, msg: 'No Password matched' });
                    }
                })
                .then((matched) => {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err)
                            reject({ code: 500, msg: 'something went wrong.' })
                        bcrypt.hash(data.newPassword, salt, null, (err, hash) => {
                            if (err)
                                reject({ code: 500, msg: 'something went wrong.' })

                            data.newPassword = hash;
                            userModel.findOneAndUpdate({ userId: data.userId }, { password: data.newPassword }).then((data) => {
                                resolve(null);
                            }).catch((err) => {
                                reject({ code: 500, msg: err });
                            })
                        });
                    });

                })
                .catch((err) => {
                    reject({ code: 500, msg: err });
                })
        })

    }
    codeVerification(data){
        return new Promise((resolve,reject)=>{
        userModel.findOne({email:data.email},{verificationCode:1}).then((code)=>{
            if(data.code===code.verificationCode){
                userModel.findOneAndUpdate({email:data.email},{verified:true}).then((ok)=>{
                    console.log(ok);
                    resolve('ok')
                })
            }else{
                reject({code:401,msg:'invalid code.'})
            }
        })
        })
    }

    forgetPassword(data){
        return new Promise((resolve,reject)=>{
            async.waterfall([
                function (done) {
                  
        
                        var token = Math.floor(Math.random() * (9999 - 1000) + 1000);
                        done(null, token);
                    
                },
                function (token, done) {
                    userModel.findOne({ email: data.email }, function (err, user) {
                        if (!user) {
                            reject({ code: 403, 'msg': 'No account with that email address exists.' });
        
                        }
        
                       
                                userModel.findOneAndUpdate({ email: data.email }, { $set: { resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000 } }, function (err, obj) {
                                    done(err, token, user);
                                })
                      
                    });
                },
                function (token, user, done) {
                   
                       
                       let text= 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                            'Please click on the following link:\n\n' +
                           '<a href='+ process.env.DASHBOARD_URL + 'forgetpassword.html?t='+btoa(token) +'&e='+btoa(data.email)+ '>click here</a>\n\n' +
                            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                   
            mail.forget_mail([data.email], text)
            resolve('email is sent')
        
                }
            ], function (err) {
                console.log(err)
                if (err) reject({ code: 500, msg: 'something went wrong.' })
            });
        })
    }
}



export default new UserController();