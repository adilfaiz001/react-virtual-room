const express = require('express');
const fs = require('fs');
const multer = require('multer');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const rn = require('random-number');

const SignupWorker = require('./util/SignupWorker');
const LoginWorker = require('./util/LoginWorker');
const connection_config = require('./connection');
const message = require('./res_messages');

const router = express.Router();
const connection = mysql.createPool(connection_config);
const secretKey = connection_config.secretKey;


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const createToken = (user) => {
    console.log('User ' + user);
    return jwt.sign(user, secretKey, {expiresIn: '60d'});
}


router.post('/signup', (req, res, next) => {
    console.log(req.body);
    connection.getConnection((error, tempConnection) => {
        if(!!error) {
            console.log('connection error');
            let response = {error: 1, message: message.db.error};
            res.status(504).json(response);
            tempConnection.release();
        } else {
            console.log('connected');
            
            let first_name = req.body.first_name;
            let last_name = req.body.last_name;
            let email = req.body.email;
            let username = req.body.username;
            let passwordFromUser = req.body.password;
 

            if(username == undefined || username == null || username == "" )
            {
              tempConnection.release();
              response={error:1, message: message.phone.error}
              status = 400; 
              res.json(response); 
        
            } else if(passwordFromUser == undefined || passwordFromUser == null || passwordFromUser == "" || passwordFromUser.length < 8){
                tempConnection.release();
                response={error:1, message: message.password.error.length}
                status = 400; 
                res.json(response);
            } else if (email == undefined || email == null || email == "" || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
              tempConnection.release();
              response={error:1, message: message.email.error.valid}
              status = 400; 
              res.json(response); 
        
            } else {
                let salt = bcrypt.genSaltSync(10);
                let passwordToSave = bcrypt.hashSync(passwordFromUser, salt);
                let createdOn = new Date().getTime();

                let status = 200;

                let u_id = generateUserId();
                let emailVerificationKey = generateRandomNumber();
                let is_emailVerify = false;
                let val;
                let response = {};

                console.log(u_id + "\n" + emailVerificationKey );
                tempConnection.query("CALL create_new_user(?,?,?,?,?,?,?,?,?,@val)", [u_id, first_name, last_name, username, email, passwordToSave, salt, createdOn, emailVerificationKey]);
                tempConnection.query("select @val as message", (err, rows, fields) => {
                    tempConnection.release();
                    
                    if (!err) {
                        console.log('The solution is :' + rows[0].message);
                        if( rows[0].message == -1)
                            response = {error: 1, message: message.signup.error.username};

                        else if(rows[0].message == -2)
                            response = {error: 1, message: message.signup.error.email};
                        
                        else {
                            /*
                            SignupWorker.SendVerificationEmail = ({
                                "firstName": first_name,
                                "lastName": last_name,
                                "email": email,
                                "key": emailVerificationKey
                            }).then((_res) => {
                                if(_res.success === 1) {
                                    response = { success: 1, data: {uid : rows[0].uid}, message: message.signup.success}
                                } else {
                                    response = {error : 1, message: _res.error}
                                }
                            }).catch((err) => {
                                console.log("ERROR:" + err);
                            });
                            */
                           response = { success: 1, data: {user_id : rows[0].message}, message: message.signup.success}
                        }
                    } else {
                        console.log(err);
                    }
                    res.status(status).json(response);
                });
            }
        }
    });
});



router.post('/login', (req, res, next) => {
    connection.getConnection((error, tempConnection) => {
        if(!!error) {
            console.log("connection error");
            let response = {error: 1, message: message.db.error};
            res.status(504).json(response);
            tempConnection.release();
        } else {
            console.log("connected");
            let response = {};
            
            console.log(req.body);

            let loginParams = req.body.loginParams;
            let passwordEnteredByUser = req.body.password;

            let status = 200;

            if(loginParams == undefined || loginParams == null || loginParams == "")
            {
                tempConnection.release();
                response = {error: 1, message: message.login.error.params };
                status = 400;
                res.json(response);
            } else if(passwordEnteredByUser == undefined || passwordEnteredByUser == null || passwordEnteredByUser == "" || passwordEnteredByUser.length < 8)
            {
              tempConnection.release();
              response={error:1, message: message.password.error.length}
              status = 400; 
              res.json(response); 
      
            } else {
                let email = null;
                let username = null;

                if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(loginParams)) {
                    email = loginParams;
                } else {
                    username = loginParams;
                }

                if ( email == null) {
                    tempConnection.query("select um.user_id, um.u_id, first_name, last_name, user_password, salt from user_master um left join user_details ud on um.user_id = ud.user_id where username = ?;", [username], (error, rows, fields) => {
                        if(!error) {
                            console.log('solution username:', rows, rows.length);
                            if(rows.length == 1) {
                                let userLogin = {};

                                userLogin.u_id = rows[0].u_id;

                                let salt = rows[0].salt;
                                
                                if(bcrypt.hashSync(passwordEnteredByUser, salt) === rows[0].user_password) {

                                    let tokendata = {};
                                    tokendata.u_id = rows[0].u_id;
                                    tokendata.first_name = rows[0].first_name;
                                    tokendata.last_name = rows[0].last_name;
                                    // console.log(userLogin);

                                    userLogin.token = createToken(tokendata);
                                    response = { success: 1, data: userLogin, message: message.login.success};
                                     
                                }

                            } else {
                                response = {error: 1, message: message.user.error}
                            }
                        } else {
                            console.log(error);
                        }
                        tempConnection.release();
                        res.status(status).json(response);
                    });
                } else if ( username == null) {

                    tempConnection.query("select um.user_id, um.u_id, first_name, last_name, user_password, salt from user_master um left join user_details ud on um.user_id = ud.user_id where email = ?;", [email], (error, rows, fields) => {
                        if(!error) {

                            console.log('solution email:', rows, rows.length);
                            if(rows.length == 1) {
                                let userLogin = {};
                                userLogin.u_id = rows[0].u_id;
                                
                                let salt = rows[0].salt;
                                
                                if(bcrypt.hashSync(passwordEnteredByUser, salt) === rows[0].user_password) {
                                    console.log("Here");

                                    let tokendata = {};
                                    tokendata.u_id = rows[0].u_id;
                                    tokendata.first_name = rows[0].first_name;
                                    tokendata.last_name = rows[0].last_name;
                                    userLogin.token = createToken(tokendata);

                                    console.log(userLogin);

                                    response = { success: 1, data: userLogin, message: message.login.success};
                                     
                                }

                            } else {
                                response = {error: 1, message: message.user.error}
                            }
                        } else {
                            console.log(error);
                        }
                        tempConnection.release();
                        res.status(status).json(response);
                    });
                }
            }
        }
    });
});

//==============================================================================================================//
//------------------------------------------UTILITY FUNCTION----------------------------------------------------//
function generateRandomNumber(){
    var options = {
        min:  1000,
        max:  999999
      , integer: true
        }
    return(rn(options));
}


function generateUserId() {
    var userId = "";
    var date = new Date();

    var min  = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();
    var sec  = (date.getSeconds() < 10 ? "0" : "") + date.getSeconds();
    var mon = ((date.getMonth() + 1) < 10 ? "0" : "") + (date.getMonth() + 1);
    var day  = (date.getDate() < 10 ? "0" : "") + date.getDate();

    var dateOrder = [ mon, day, min, sec ];

        // GEN 8 RANDOM HEX
        for(var i=0 ; i<8 ; i++){
            userId = userId + Math.floor(Math.random()*16).toString(16); 
        }
        // GEN 2 DEFINED DATE
        for(var i=0 ; i<2 ; i++){
            userId = userId + dateOrder[Math.floor(Math.random()*2)].toString(); 
        }
        // GEN 8 RANDOM HEX
        for(var i=0 ; i<8 ; i++){
            userId = userId + Math.floor(Math.random()*16).toString(16); 
        }
        // GEN 2 DEFINED DATE
        for(var i=0 ; i<2 ; i++){
            userId = userId + dateOrder[Math.floor(Math.random()*2 + 2)].toString(); 
        }

    // if(){

    // } else {
        return userId;
    //}
}

















module.exports = router;