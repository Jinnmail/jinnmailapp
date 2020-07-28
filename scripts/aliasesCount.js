var mongoose = require('mongoose');
const dotenv = require("dotenv").config()
const userModel = require('../models/user');
const aliasModel = require('../models/alias');
const { findOneAndUpdate, translateAliases } = require('../models/user');

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
  users = await userModel.find({});

  for (var i=0; i < users.length; i++) {
      const userAliases = await aliasModel.find({userId: users[i].userId, type: 'alias'});
      const res = await users[i].update({aliasesCount: userAliases.length});
  }

  console.log("aliasesCount complete")
  process.exit()
}

main() 