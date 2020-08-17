var mongoose = require('mongoose');
const dotenv = require("dotenv").config()
const logger = require('heroku-logger')
const uuidv4 = require('uuid/v4');

mongoose.connect(process.env.DB_HOST, {
    auth: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    useUnifiedTopology: true, 
    useNewUrlParser: true
});

var db = mongoose.connection

db.on('error', () => {
     console.error('Error occured in db connection');
});

db.on('open', () => {
    console.log('DB Connection established successfully');
});

async function main() {
    try {
       const res = await db.dropDatabase();
    } catch(e) {
        console.log(e);
    }

    console.log("drop database complete")
    process.exit()
}

main() 


