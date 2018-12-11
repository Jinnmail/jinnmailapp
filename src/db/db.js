let mongoose = require('mongoose')
import cred from '../config/const'
import logger from '../utils/logger'

class Mongoose {
    constructor() {
        mongoose.connect(process.env.DB_HOST, {
            auth: {
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
            },
            useNewUrlParser: true,
            //these parameters will change in production 

            autoIndex: false, // Don't build indexes
            reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
            reconnectInterval: 500, // Reconnect every 500ms
            poolSize: 10, // Maintain up to 10 socket connections
            // If not connected, return errors immediately rather than waiting for reconnect
            bufferMaxEntries: 0,
            connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        }

        );
        return mongoose
    }
}

module.exports = new Mongoose()