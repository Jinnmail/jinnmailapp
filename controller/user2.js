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

    register: async function(req, res) {
      const data = req.body;
      const user = await userModel.findOne({email: data.email});
      if (user) {
        mail.email_sender([data.email], user.verificationCode);
        return res.status(201).json(user);
      } else {
        let newUser = new userModel();
        newUser.userId = uuidv4();
        newUser.email = data.email;
        newUser.password = data.password;
        newUser.verificationCode = Math.floor(100000 + Math.random() * 900000);
        const savedUser = await newUser.save();
        if (savedUser === newUser) {
          mail.email_sender([data.email], newUser.verificationCode);
          return res.status(201).json(savedUser);
        } else {
          return res.status(500).json({
            message: 'Error when creating user',
            error: createError(500, 'failed to create new user')
          });
        }
      }
    }

}
