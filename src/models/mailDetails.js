let mongoose =  require('../db/db')

const mailSchema = mongoose.Schema({
    alias: {
        type: String,
        required: true
    },
    wildduckId: {
        type: String
    },
    inboxId: {
        type: String
    },
    sentId: {
        type: String
    }
});

const mail = mongoose.model('mail', mailSchema);

module.exports = mail;

