const mailModel = require('../models/mailDetails');
const request = require('request');

class MailController{
    getDetails(data){
        // console.log("DATA: "+JSON.stringify(data))
        return new Promise((resolve, reject) => {
            // console.log("DATA: "+typeof(data.uid))
            mailModel.find({"alias":data.uid})
                .then( result => {
                    resolve(result)
                })
                .catch(err=>{
                    reject({ code: 500, msg: err })
                })
        })
    }
    getInboxDetails(data){
        // data = JSON.parse(data);
        return new Promise((resolve, reject) => {
            let url = `https://jinnmail.com/api/users/${data.wid}/mailboxes/${data.mid}`;
            let options = {
                method: 'get',
                json: true,
                url: url
            };
            request(options, (err, res, body) => {
                if (err) { console.log(err); }
                let result = {};
                result.unseen = body.unseen;
                console.log(`${JSON.stringify(data)}-${typeof(data.wid)}-${data["wid"]}`)
                let link = `https://jinnmail.com/api/users/${data.wid}/mailboxes/${data.mid}/messages`;
                let option = {
                    method: 'get',
                    json: true,
                    url: link
                };
                request(option, (err, res, doc) => {
                    if (err) { console.log(err); }
                    console.log(doc)
                    if(doc.results.length>0)
                    {
                        result.count = doc.results.length;
                        result.mostRecent = doc.results[0].from.address;
                    }
                    else
                    {
                        result.count = 0;
                        result.mostRecent = "None";
                    }
                    console.log(result);
                    resolve(result)
                })
            })
        })
    }

    getOutboxDetails(data){
        // data = JSON.parse(data);
        return new Promise((resolve, reject) => {
            let url = `https://jinnmail.com/api/users/${data.wid}/mailboxes/${data.mid}`;
            let options = {
                method: 'get',
                json: true,
                url: url
            };
            request(options, (err, res, body) => {
                if (err) { console.log(err); }
                let result = {};
                result.unseen = body.unseen;
                console.log(`${JSON.stringify(data)}-${typeof(data.wid)}-${data["wid"]}`)
                let link = `https://jinnmail.com/api/users/${data.wid}/mailboxes/${data.mid}/messages`;
                let option = {
                    method: 'get',
                    json: true,
                    url: link
                };
                request(option, (err, res, doc) => {
                    if (err) { console.log(err); }
                    console.log(doc)
                    if(doc.results.length>0)
                    {
                        result.count = doc.results.length;
                        result.mostRecent = doc.results[0].to[0].address;
                    }
                    else
                    {
                        result.count = 0;
                        result.mostRecent = "None";
                    }
                    console.log(result);
                    resolve(result)
                })
            })
        })
    }
}

module.exports = new MailController();