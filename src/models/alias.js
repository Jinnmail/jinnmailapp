import mongoose from '../db/db'

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

const alias = mongoose.model('alias', aliasSchema);

export default alias;

