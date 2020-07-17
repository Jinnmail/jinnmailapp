var mongoose = require('mongoose');

const aliasSchema = mongoose.Schema({
    aliasId: {
        type: String,
        required: true,
        unique: true
    },
    userId: {
        type: String,
        required: true
    },
    alias: {
        type: String,
        unique: true,
        lowercase: true,
        required: [true, 'alias field is Required']
    },
    refferedUrl: {
        type: String,
        lowercase: true,
        required: false
    },
    status: {
        type: Boolean,
        default: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    mailCount:{
        type: Number
    },
    type:{
        type: String,
        lowercase:true
    }
});

aliasSchema.post('deleteOne', async function(doc){
  const user = await userModel.findOneAndUpdate({userId: doc.userId}, {$inc: {aliasesCount: -1}});
  console.log(user);
});

aliasSchema.post('save', async function(doc){
  const user = await userModel.findOneAndUpdate({userId: doc.userId}, {$inc: {aliasesCount: 1}});
  console.log(user)
});

module.exports = mongoose.model('alias', aliasSchema);
