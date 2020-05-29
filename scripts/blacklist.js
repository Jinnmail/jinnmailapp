var mongoose = require('mongoose');
const dotenv = require("dotenv").config()
const logger = require('heroku-logger')
var {GoogleSpreadsheet} = require('google-spreadsheet');
const blacklistModel = require('../models/blacklist');

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
    // long string is name of google sheet in url
    var doc = new GoogleSpreadsheet('1i6aygkpp2HA-uDGwravQ-HwPQzj9_gf62WmXMRgbxoI');
    // var doc = new GoogleSpreadsheet('1FPnsQK-oKV8R1kNIZO_sal-Kcbtg5N848bXwtLPqmoI');

    const creds = {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, 
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/gm, '\n')
    }

    await doc.useServiceAccountAuth(creds);

    await doc.loadInfo();

    const sheet = doc.sheetsByIndex[0];

    const rows = await sheet.getRows();

    for(var i=0; i < rows.length; i++) { 
        const blacklistFound = await blacklistModel.findOne({localPart: rows[i].LocalPart, domain: rows[i].Domain});
        if (!blacklistFound) {
            let blacklist = new blacklistModel();
            blacklist.localPart = rows[i].LocalPart;
            blacklist.domain = rows[i].Domain;
            const saved = await blacklist.save();
            logger.info(`${saved.localPart}${saved.domain}`)
        }
    }

    console.log("blacklist complete")
    process.exit()
}

main() 


