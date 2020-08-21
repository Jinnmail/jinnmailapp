var mongoose = require('mongoose');
const userModel = require('../models/user');
const dotenv = require("dotenv").config();

console.log(process.env.DB_HOST);
mongoose.connect(process.env.DB_HOST, {
    auth: {
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    },
    useUnifiedTopology: true, 
    useNewUrlParser: true
});

var db = mongoose.connection

async function main() {
  users = await userModel.updateMany({}, {$set: {premium: true, invites: 5}});
  console.log("premiums and invites complete")
  process.exit()
}

main() 