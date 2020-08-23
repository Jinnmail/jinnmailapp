var mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
    aliasId: {
      type: String, 
      required: true
    }, 
    name: {
      type: String, 
      required: true
    }, 
    receivers: [String]
});

module.exports = mongoose.model('group', groupSchema);