var inviteModel = require('../models/invite.js');
const userModel = require('../models/user.js');
const mail = require('../services/mail.js');
const { nextTick } = require('async');
var createError = require('http-errors');

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

        var invite = new inviteModel({
          userId : userId,
          email : email, 
          inviteCode: inviteCode
        });

        const user = await userModel.findOne({userId: userId});
        const userInviteCount = await inviteModel.find({userId: userId}).countDocuments();

        // const x = await user.updateOne({$inc: {invites: -1}})

        if (user.invites > 0) {
          await user.updateOne({$inc: {invites: -1}})
          invite.save(function (err, invite) {
              if (err) {
                  return res.status(500).json({
                      message: 'Error when creating invite',
                      error: err
                  });
              }

              var msg = {
                  to: email, 
                  from: "Mail Delivery Subsystem <mailer-daemon@jinnmail.com>", 
                  subject: "You've GOT a Jinn-For-Life Invite", 
                  cc: '',  
                  messageBody: `Go to <a clicktracking=off href="${process.env.DASHBOARD_URL}/redeem-invite">Redeem</a> and enter your invite code to get free Jinnmail for Life <br /><br /><h2>${inviteCode}</h2><br><br><br><br>Any issues? Reply here or email help${process.env.JM_EMAIL_DOMAIN}.`, 
                  attachments: []
              }
              mail.send_mail(msg);

              return res.status(201).json(invite);
          });
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
    }
};
