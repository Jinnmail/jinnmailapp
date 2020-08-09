var mongoose = require('mongoose');

const receiverSchema = mongoose.Schema({
  aliasId: {
    type: String,
    required: true
  },
  receivers: [String]
});

module.exports = mongoose.model('receiver', receiverSchema);