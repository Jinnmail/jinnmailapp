var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var inviteSchema = new Schema({
	'userId' : {type: String, required: true},
	'email' : {type: String, required: true}
});

module.exports = mongoose.model('invite', inviteSchema);
