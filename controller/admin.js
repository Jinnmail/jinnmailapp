import adminModel from '../models/admin'
import Alias from '../models/alias'
import User from '../models/user'
import bcrypt from 'bcrypt-nodejs'
import uuidv4 from 'uuid-v4'
import jwt from 'jsonwebtoken'
import request from "request"

class AdminController{
    getAdmin(data){
        // console.log("JWT:"+process.env.JWT_SECRET)
        return new Promise((resolve, reject) => {
            adminModel.findOne({}).then((adminData) => {
                if(!adminData)
                {
                    reject({ code: 500 , msg: 'err'})
                }
                else
                {
                    // console.log(data.username+"***"+data.password)
                    // console.log(adminData.username+"---"+adminData.password)
                    if(data.username === adminData.username)
                    {
                        bcrypt.compare(data.password, adminData.password, function(err, res) {
                            console.log("Password: "+res)
                            if(res)
                            {
                                let payload = { subject: adminData.username }
                                let token = jwt.sign(payload, process.env.JWT_SECRET)
                                resolve({token})
                            }
                            else
                                resolve(undefined);
                        });
                    }else
                    {
                        resolve(undefined);
                    }
                }
            })
        })
    }

    getUser(data)
    {
        return new Promise((resolve, reject) => {
            // console.log(data.uid)
            User.aggregate([
                {
                    $match: {
                        "userId": data.uid
                    }
                },
                { 
                    $lookup: {
                        "from": "aliases",
                        "localField": "userId",
                        "foreignField": "userId",
                        "as": "aliases"
                    }
                },
                {
                    $sort:{
                        // "created":-1,
                        "aliases.created":-1
                    }
                }
            ]).then(result => {
                // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                // console.log(JSON.stringify(result[0].aliases))
                resolve(result);
                // console.log(val[0].user[0].email);
            }).catch((err) => {
                reject({ code: 500, msg: err });
            });
        })
    }

    getAlias(data)
    {
        return new Promise((resolve, reject) => {
            Alias.aggregate([
                {
                    $match: {
                        "aliasId": data.aid
                    }
                },
                { 
                    $lookup: {
                        "from": "users",
                        "localField": "userId",
                        "foreignField": "userId",
                        "as": "user"
                    }
                },
                {
                    $unwind: "$user"
                }
            ]).then(result => {
                // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                // console.log(JSON.stringify(result[0].aliases))
                resolve(result);
                // console.log(val[0].user[0].email);
            }).catch((err) => {
                reject({ code: 500, msg: err });
            });
        })
    }

    getSearched(data)
    {
        return new Promise((resolve, reject) => {
            if(data.key === "aliasId")
            {
                Alias.aggregate([
                    {
                        $match: {
                            "aliasId": data.value
                        }
                    },
                    { 
                        $lookup: {
                            "from": "users",
                            "localField": "userId",
                            "foreignField": "userId",
                            "as": "user"
                        }
                    },
                    {
                        $unwind: "$user"
                    }
                ]).then(result => {
                    // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                    // console.log(JSON.stringify(result[0].aliases))
                    resolve(result);
                    // console.log(val[0].user[0].email);
                }).catch((err) => {
                    reject({ code: 500, msg: err });
                });
            }
            else if(data.key === "alias")
            {
                Alias.aggregate([
                    {
                        $match: {
                            "alias": data.value
                        }
                    },
                    { 
                        $lookup: {
                            "from": "users",
                            "localField": "userId",
                            "foreignField": "userId",
                            "as": "user"
                        }
                    },
                    {
                        $unwind: "$user"
                    }
                ]).then(result => {
                    // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                    // console.log(JSON.stringify(result[0].aliases))
                    resolve(result);
                    // console.log(val[0].user[0].email);
                }).catch((err) => {
                    reject({ code: 500, msg: err });
                });
            }
            else if(data.key === "email")
            {
                User.aggregate([
                    {
                        $match: {
                            "email": data.value
                        }
                    },
                    { 
                        $lookup: {
                            "from": "aliases",
                            "localField": "userId",
                            "foreignField": "userId",
                            "as": "aliases"
                        }
                    },
                    {
                        $sort:{
                            // "created":-1,
                            "aliases.created":-1
                        }
                    }
                ]).then(result => {
                    // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                    // console.log(JSON.stringify(result[0].aliases))
                    resolve(result);
                    // console.log(val[0].user[0].email);
                }).catch((err) => {
                    reject({ code: 500, msg: err });
                });
            }
            else
            {
                User.aggregate([
                    {
                        $match: {
                            "userId": data.value
                        }
                    },
                    { 
                        $lookup: {
                            "from": "aliases",
                            "localField": "userId",
                            "foreignField": "userId",
                            "as": "aliases"
                        }
                    },
                    {
                        $sort:{
                            // "created":-1,
                            "aliases.created":-1
                        }
                    }
                ]).then(result => {
                    // console.log("Result is: "+ (result)?JSON.stringify(result):"0");  
                    // console.log(JSON.stringify(result[0].aliases))
                    resolve(result);
                    // console.log(val[0].user[0].email);
                }).catch((err) => {
                    reject({ code: 500, msg: err });
                });
            }
            // resolve(data)
        }) 
    }
}
export default new AdminController(); 