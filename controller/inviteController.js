var inviteModel = require('../models/invite.js');

/**
 * inviteController.js
 *
 * @description :: Server-side logic for managing invites.
 */
module.exports = {

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
    create: function (req, res) {
        var invite = new inviteModel({
			userId : req.body.userId,
			email : req.body.email

        });

        invite.save(function (err, invite) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating invite',
                    error: err
                });
            }
            return res.status(201).json(invite);
        });
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
