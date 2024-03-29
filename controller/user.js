const userModel = require('../models/user');
const aliasModel = require('../models/alias');
const uuidv4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const cred = require('../config/const')
const uuidv3 = require('uuid/v3');
const mail = require('../services/mail');
// const {callbackify} = require ('util');
const async = require('async');
const btoa = require('btoa');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

let SALT_WORK_FACTOR = 10;

module.exports = {

    login: function(data) {
        let userObj;
        let token;
        return new Promise((resolve, reject) => {

            userModel.findOne({ email: data.email })
                .then((userData) => {
                    if (userData) {
                        if(!userData.verified){
                            reject({ code: 403, msg: 'Unable to Verify Account' });
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
                        reject({ code: 400, msg: 'Unable to Verify Account' });
                    }
                })
                .then((equal) => {
                    if (equal) {
                        return true
                    } else {
                        reject({ code: 400, msg: 'Unable to Verify Account' });
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
    }, 

    register: function(data) {
        return new Promise((resolve, reject) => {
            userModel.findOne({ email: data.email }).then((user) => {
                console.log(user)
                if (user) {
                    reject({ code: 500, msg: 'err' });
                } else {
                    let newUser = new userModel();
                    newUser.userId = uuidv4();
                    newUser.email = data.email;
                    newUser.password = data.password;
                    newUser.verificationCode = Math.floor(100000 + Math.random() * 900000);
                    newUser.save((err, savedUser) => {
                        if (err) {
                            reject({ code: 500, msg: err });
                        } else {
                            console.log("New User:"+newUser);
                            console.log("Saved User:"+savedUser);
                            mail.email_sender([data.email], newUser.verificationCode);
                            resolve(savedUser);
                        }
                    })
                }
            })

        })
    }, 

    changePassword: function(data) {
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

    }, 

    codeVerification: function(data){
        return new Promise((resolve,reject)=>{
            userModel.findOne({email:data.email},{verificationCode:1}).then((code)=>{
                if(data.code===code.verificationCode){
                    stripe.customers.create({email: data.email, balance: 900})
                    .then(res => res.id)
                    .then(customerId => {
                      userModel.findOneAndUpdate({email:data.email},{verified:true, customerId: customerId}).then((ok)=>{
                          console.log(ok);
                          mail.send_welcome(data.email);
                          resolve('ok')
                      })
                    })
                }else{
                    reject({code:401,msg:'invalid code.'})
                }
            })
        })
    }, 

    resetPasswordTokenVerification: function(data) {
      return new Promise((resolve, reject) => {
        userModel.findOne({ 
          email: data.email, 
          resetPasswordExpires: { 
            $gt: Date.now() 
          } 
        }, 
        (err, obj) => {
          if (err){
            reject({code: 500, msg: 'something went wrong'});
          }
          else {
            if (obj == null) {
              reject({code: 403, msg: 'Password reset token is invalid or has expired.'});
            } else {
              userModel.findOne({email: data.email}, (err, obj) => {
                if (err) reject({code: 500, msg: 'something went wrong.'})
                else {
                  if (obj.resetPasswordToken === data.token) {
                    resolve('ok')
                  } else {
                    reject({code: 500, msg: 'Link Expired'})
                  }
                }
              })
            }
          }
        })
      })
    }, 

    resendCode(data){
        return new Promise((resolve,reject)=>{
            userModel.findOne({email:data.email})
                    .then((code)=>{
                        console.log("CODE:"+code.verificationCode)
                        mail.email_sender([data.email], code.verificationCode);
                        resolve('ok');
                    })
                    .catch(err => {
                        reject({code:401,msg:'invalid code.'})
                    })
        })
    }, 

    forgetPassword: function(data){
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
                    let html = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.<br><br>Please click on the following link:<br><br><a clicktracking=off href='+ process.env.DASHBOARD_URL + '/forgetpassword.html?t='+btoa(token) +'&e='+btoa(data.email)+ '>click here</a><br><br><span style="opacity:0.4">Do nothing and your password will remain unchanged.</span><br><br><span style="opacity:0.4">If you DID NOT request this, there may be an attacker trying to gain access. Change your password immediately and reply to this message to let us know.</span>'   
                    // let text= 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        // 'Please click on the following link:\n\n' +
                        // '<a click href='+ process.env.DASHBOARD_URL + '/forgetpassword.html?t='+btoa(token) +'&e='+btoa(data.email)+ '>click here</a>\n\n' +
                        // 'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    mail.forget_mail([data.email], html)
                    resolve('email is sent')
                }
            ], function (err) {
                console.log(err)
                if (err) reject({ code: 500, msg: 'something went wrong.' })
            });
        })
    }, 

    forgotPassword: function(data){
      return new Promise((resolve,reject)=>{
          async.waterfall([
              function (done) {
                  var token = Math.floor(Math.random() * (999999 - 100000) + 1000);
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
                // resetPasswordToken send to email
                let html = `<font size="+2">Reset Password Token: <mark>${token}</mark></font>`
                // let html = `You are receiving this because you (or someone else) have requested the reset of the password for your account.<br><br>Please click on the following link:<br><br><a clicktracking=off href="${process.env.DASHBOARD_URL}/forgot-password-set?t=${btoa(token)}&e=${btoa(data.email)}">click here</a><br><br><span style="opacity:0.4">Do nothing and your password will remain unchanged.</span><br><br><span style="opacity:0.4">If you DID NOT request this, there may be an attacker trying to gain access. Change your password immediately and reply to this message to let us know.</span>`
                // mail.forget_mail([data.email], html)
                mail.forget_mail([data.email], html)
                resolve('email is sent')
              }
          ], function (err) {
              console.log(err)
              if (err) reject({ code: 500, msg: 'something went wrong.' })
          });
      })
    }, 

    resetPasswordChange: function(data) {
        return new Promise((resolve, reject) => {
            if (data.password) {
                userModel.findOne({ 
                        email: data.email, 
                        resetPasswordExpires: { 
                            $gt: Date.now() 
                        } 
                    }, 
                    (err, obj) => {
                    if (err){
                        reject({ code: 500, msg: 'something went wrong' });
                    }
                    else {
                        if (obj == null) {
                            reject({ code: 403, msg: 'Password reset token is invalid or has expired.' });
                        } else {
                            userModel.findOne({ email: data.email }, (err, obj) => {
                                if (err) reject({ code: 500, msg: 'something went wrong.' })
                                else {
                                    if(obj.resetPasswordToken === data.token){
                                        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                                            if (err)
                                                reject({ code: 500, msg: 'something went wrong.' })
                                            bcrypt.hash(data.password, salt, null, (err, hash) => {
                                                if (err)
                                                    reject({ code: 500, msg: 'something went wrong.' });
                                                userModel.findOneAndUpdate({email: data.email}, { $set: { password: hash, resetPasswordToken: null}}, (err, obj) => {
                                                    if(err){
                                                        reject({ code: 500, msg: "something went wrong."})
                                                    }else{
                                                        resolve("Password Changed.")
                                                    }
                                                })
                                                
                                            });
                                        });
                                    } else{
                                        reject({ code: 500, msg: 'Link Expired' })
                                    }
                                }
                            })
                        }
                    }
                })
            } else {
                reject({ code: 422, msg: 'new password is required.' })
            }
        })    
    }, 

    resetPasswordChangeNoResetPasswordToken: function(data) {
      return new Promise((resolve, reject) => {
          if (data.password) {
            userModel.findOne({ email: data.email }, (err, obj) => {
              if (err) reject({ code: 500, msg: 'something went wrong.' })
              else {
                bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
                  if (err)
                    reject({ code: 500, msg: 'something went wrong.' })
                  bcrypt.hash(data.password, salt, null, (err, hash) => {
                    if (err)
                      reject({ code: 500, msg: 'something went wrong.' });
                    userModel.findOneAndUpdate({email: data.email}, { $set: { password: hash, resetPasswordToken: null}}, (err, obj) => {
                      if(err){
                        reject({ code: 500, msg: "something went wrong."})
                      }else{
                        resolve("Password Changed.")
                      }
                    })
                  });
                });
              }
            })        
        } else {
          reject({ code: 422, msg: 'new password is required.' })
        }
      })    
  }, 

    getUser: async function(data) {
        const res = await userModel.findOne({userId: data.userId});
        return res;
    }, 

    getUsers: function(data){
        return new Promise((resolve, reject) => {
            userModel.aggregate([
                {
                    $sort: {
                        "created": -1
                    }
                }
            ]).then((users) => {
                if (users.length<1) {
                    reject({ code: 500, msg: 'err' });
                } else {
                    resolve(users)
                }
            })

        })
    }, 

    changeUserPremium: async function(data) {
      // params.userId not making it to here, something with app.js is wrong, go thru body instead
      const res = await userModel.findOneAndUpdate({customerId: data.customerId}, {premium: data.premium});

      return res;
    }, 

}

//   codeVerificationNoWelcome: function(data){
//     return new Promise((resolve,reject)=>{
//         userModel.findOne({email:data.email},{verificationCode:1}).then((code)=>{
//             if(data.code===code.verificationCode){
//                 var token = Math.floor(Math.random() * (9999 - 1000) + 1000);
//                 userModel.findOneAndUpdate({email: data.email}, {resetPasswordToken: token, resetPasswordExpires: Date.now() + 3600000}).then((ok)=>{
//                     console.log(ok);
//                     resolve('ok')
//                 })
//             } else{
//                 reject({code:401,msg:'invalid code.'})
//             }
//         })
//     })
// }, 