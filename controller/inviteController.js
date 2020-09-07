var inviteModel = require('../models/invite.js');
const userModel = require('../models/user.js');
const mail = require('../services/mail.js');
const { nextTick } = require('async');
var createError = require('http-errors');
const uuidv4 = require('uuid/v4');
const { send_mail } = require('../services/mail.js');

/**
 * inviteController.js
 *
 * @description :: Server-side logic for managing invites.
 */
module.exports = {

    /**
     * inviteController.userList()
     */
    userList: async function (req, res) {
      const userInvites = await inviteModel.find({userId: req.params.userId});

      return res.json(userInvites);
  },

    /**
     * inviteController.list()
     */
    list: function (req, res) {
        inviteModel.find(function (err, invites) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting invite.',
                    error: err
                });
            }
            return res.json(invites);
        });
    },

    /**
     * inviteController.show()
     */
    show: function (req, res) {
        var id = req.params.id;
        inviteModel.findOne({_id: id}, function (err, invite) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting invite.',
                    error: err
                });
            }
            if (!invite) {
                return res.status(404).json({
                    message: 'No such invite'
                });
            }
            return res.json(invite);
        });
    },

    /**
     * inviteController.create()
     */
    create: async function (req, res) {
      const userId = req.body.userId
      const email = req.body.email; 
      const inviteCode = Math.floor(100000 + Math.random() * 900000);

      var msg = {
        to: email, 
        from: "Mail Delivery Subsystem <mailer-daemon@jinnmail.com>", 
        subject: "You've GOT a Jinn-For-Life Invite", 
        cc: '',  
        messageBody: `Go to <a clicktracking=off href="${process.env.DASHBOARD_URL}/redeem-invite?e=${Buffer.from(email).toString('base64')}">Redeem</a> and enter your invite code to get free Jinnmail for Life <br /><br /><h2>${inviteCode}</h2><br><br><br><br>Any issues? Reply here or email help${process.env.JM_EMAIL_DOMAIN}.`, 
        attachments: []
      }

      const user = await userModel.findOne({userId: userId});

      const existingInvite = await inviteModel.findOne({userId: userId, email: email});
      if (existingInvite) { // resend the email don't decrement invites
        await existingInvite.updateOne({inviteCode: inviteCode})
        mail.send_mail(msg);
        const tempPassword = new Array(12).fill().map(() => String.fromCharCode(Math.random()*86+40)).join("") + Math.floor(Math.random() * 11) + 'j';
        const invitedUser = await userModel.findOne({email: email});
        invitedUser.password = tempPassword;
        const res = await invitedUser.save();
        mail.send_welcome(email, tempPassword);
        return res.status(201).json(existingInvite);
      } 

      if (user.invites > 0) { 
        var invite = new inviteModel({
          userId : userId,
          email : email, 
          inviteCode: inviteCode
        });
        await user.updateOne({$inc: {invites: -1}})
        const savedInvite = await invite.save();
        if (savedInvite === invite) {
          mail.send_mail(msg);
          return res.status(201).json(invite);
        } else {
          return res.status(500).json({
            message: 'Error when creating invite',
            error: err
          });  
        }
      } else {
        return res.status(500).json({
          message: 'Error when creating invite',
          error: createError(500, 'Max number of invites exceeded')
        });
      }
    },

    /**
     * inviteController.update()
     */
    update: function (req, res) {
        var id = req.params.id;
        inviteModel.findOne({_id: id}, function (err, invite) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting invite',
                    error: err
                });
            }
            if (!invite) {
                return res.status(404).json({
                    message: 'No such invite'
                });
            }

            invite.userId = req.body.userId ? req.body.userId : invite.userId;
			      invite.email = req.body.email ? req.body.email : invite.email;
			
            invite.save(function (err, invite) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating invite.',
                        error: err
                    });
                }

                return res.json(invite);
            });
        });
    },

    /**
     * inviteController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;
        inviteModel.findByIdAndRemove(id, function (err, invite) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the invite.',
                    error: err
                });
            }
            return res.status(204).json();
        });
    }, 

    /**
     * inviteController.redeem()
     */
    redeem: async function (req, res) {
      const email = req.body.email;
      const inviteCode = req.body.inviteCode;

      const invite = await inviteModel.findOne({email: email, inviteCode: inviteCode});
      if (invite) {
        const tempPassword = new Array(12).fill().map(() => String.fromCharCode(Math.random()*86+40)).join("") + Math.floor(Math.random() * 11) + 'j';
        const user = await userModel.findOne({email: email})
        if (user) {
          // mail.email_sender([email], user.verificationCode);
          return res.status(201).json(user);
        } else {
          let newUser = new userModel();
          newUser.userId = uuidv4();
          newUser.email = email;
          newUser.password = tempPassword;
          newUser.verificationCode = Math.floor(100000 + Math.random() * 900000);
          newUser.verified = true;
          newUser.premium = true;
          newUser.invites = 0;
          const savedUser = await newUser.save();
          if (savedUser === newUser) {
            mail.send_welcome(email, tempPassword)
            return res.status(201).json(savedUser);
          } else {
            return res.status(500).json({
              message: 'Error when redeeming invite', 
              error: createError(500, 'failed to create new user')
            }) 
          }
        }
      } else {
        return res.status(500).json({
          message: 'Error when redeeming invite',
          error: createError(500, 'invite does not exists')
        });
      }
    }
};
