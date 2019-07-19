const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const connection_config = require('../routes/connection');
let secretKey = connection_config.secretKey;

let mongoose = require('mongoose');
let User = require('../models/UserSchema');


exports.CreateNewUser = (params) => {
    // console.log(params);

    return new Promise((resolve, reject) => {
        console.log("Creating User with details - ");

        User.find({
            'user_details.username': params.username
        }, (err, rows) => {
            if(rows.length !== 0) {
                console.log("USER EXISTS");
                resolve({
                    "state": 0,
                    "message": "username" 
                });
            }
            else {
                User.find({
                    'user_details.email': params.email
                }, (err, rows) => {
                    if(rows.length !== 0) {
                        console.log("USER EXISTS");
                        resolve({
                            "state": 0,
                            "message": "email" 
                        });
                    } else {
                        let newUser = new User({
                            user_details : {
                                user_id: params.user_id,
                                first_name: params.first_name,
                                last_name: params.last_name,
                                username: params.username,
                                email: params.email
                            },
                            user_master: {
                                user_id: params.user_id,
                                password: params.passwordToSave,
                                salt: params.salt,
                                emailVerificationKey: params.emailVerificationKey,
                                createdOn: params.createdOn,
                            }
                        });
                
                        newUser.save((err, newUser) => {
                            if(err) {
                                resolve({
                                    "state": 0,
                                    "message": err
                                });
                            } else {
                                console.log("User Added");
                                resolve({
                                    "state": 1,
                                    "message": "User Successfully Added"
                                });
                            }
                        });
                    }

                });
            }
        });
    });
}


exports.AuthenticateUserByEmail = (params) => {
    console.log("Authenticating User By Email");
    return new Promise((resolve,reject) => {
        let email = params.email;
        let passwordEnteredByUser = params.passwordEnteredByUser;

        User.find({
            "user_details.email": email
        }, (err, rows) => {
            if(rows.length == 1) {
                user_details = rows[0].user_details;
                user_master = rows[0].user_master;

                let userLogin = {};
                userLogin.user_id = user_details.user_id;

                let salt = user_master.salt;

                if(bcrypt.hashSync(passwordEnteredByUser, salt) === user_master.password) {
                    let tokendata = {};
                    tokendata.user_id = user_details.user_id;
                    tokendata.username = user_details.username;
                    tokendata.first_name = user_details.first_name;
                    tokendata.last_name = user_details.last_name;

                    userLogin.token = createToken(tokendata);
                    resolve({
                        "state": 1,
                        "data": userLogin,
                    });
                } else {
                    resolve({
                        "state":0,
                        "data": "WRONG PASSWORD"
                    });
                }
            } else {
                resolve({
                    "state": 0,
                    "data": "NO USER"
                });
            }
        });
    });
}

exports.AuthenticateUserByUsername = (params) => {
    console.log("Authenticating User By Username");
    return new Promise((resolve,reject) => {
        let username = params.username;
        let passwordEnteredByUser = params.passwordEnteredByUser;

        User.find({
            "user_details.username": username
        }, (err, rows) => {
            user_details = rows[0].user_details;
            user_master = rows[0].user_master;

            if(rows.length == 1) {
                let userLogin = {};
                userLogin.user_id = user_details.user_id;

                let salt = user_master.salt;

                if(bcrypt.hashSync(passwordEnteredByUser, salt) === user_master.password) {
                    let tokendata = {};
                    tokendata.user_id = user_details.user_id;
                    tokendata.username = user_details.username;
                    tokendata.first_name = user_details.first_name;
                    tokendata.last_name = user_details.last_name;

                    userLogin.token = createToken(tokendata);
                    resolve({
                        "state": 1,
                        "data": userLogin,
                    });
                } else {
                    resolve({
                        "state":0,
                        "data": "WRONG PASSWORD"
                    });
                }
            } else {
                resolve({
                    "state": 0,
                    "data": "NO USER"
                });
            }
        });
    });
}

const createToken = (user) => {
    console.log('User ' + user);
    return jwt.sign(user, secretKey, {expiresIn: '60d'});
}



// let newUser = new User({
//     user_details : {
//         user_id: 'ldjkshfdflhdjsferwrhdsjfh',
//         first_name: 'Adil',
//         last_name: 'Faiz',
//         username: 'adilfaiz0001',
//         email : 'adilfaiz001@gmail.com'
//     },

//     user_master : {
//         user_id : 'ldjkshfdflhdjsferwrhdsjfh',
//         password : 'ewyuhewjdnbsmrekhjfmvxc ',
//         salt : '4567890',
//         isEmailVerified : true,
//         emailVerificationKey : 'dvfsdfdg',
//         createdOn : '5556656',
//         updatedOn: '556665'
//     }
// });


// let cb = function(err) {
//     if(!err){
//         console.log("Connection Opened")
//     } else {
//         console.log("Connection Opened Failed");
//     }
// };

// mongoose.connect("mongodb+srv://admin:98939605@virtual-room-cluster-bwkf0.gcp.mongodb.net/chatroom",cb);
// con = mongoose.connection;

// newUser.save((err, newUser) => {
//     if(err) throw err;
//     console.log("User saved successfully");
// });