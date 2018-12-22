import userModel from '../models/user';
import uuidv4 from 'uuid/v4';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt-nodejs';
import cred from '../config/const'
import uuidv3 from 'uuid/v3';
import * as mail from '../services/mail';
import { callbackify } from 'util';

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
                    newUser.save((err, savedUser) => {
                        if (err) {
                            reject({ code: 500, msg: err });
                        } else {
                            mail.email_sender([data.email]);
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
}

export default new UserController();