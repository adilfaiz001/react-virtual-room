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

/**
 * ========================================================
 * Database Controllers
 * ========================================================
 */
const SignupController = require('../controllers/UserController');
const LoginController = require('../controllers/UserController');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

const createToken = (user) => {
    console.log('User ' + user);
    return jwt.sign(user, secretKey, {expiresIn: '60d'});
}


router.post('/signup', (req, res, next) => {
    // console.log(req.body);

    let first_name = req.body.first_name;
    let last_name = req.body.last_name;
    let email = req.body.email;
    let username = req.body.username;
    let passwordFromUser = req.body.password;

    let response = {};

    if(username == undefined || username == null || username == "" )
    {
        response={error:1, message: message.phone.error}
        status = 400; 
        res.json(response); 

    } else if(passwordFromUser == undefined || passwordFromUser == null || passwordFromUser == "" || passwordFromUser.length < 8){
        response={error:1, message: message.password.error.length}
        status = 400; 
        res.json(response);
    } else if (email == undefined || email == null || email == "" || !(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        response={error:1, message: message.email.error.valid}
        status = 400; 
        res.json(response); 
    } else {
        let salt = bcrypt.genSaltSync(10);
        let passwordToSave = bcrypt.hashSync(passwordFromUser, salt);
        let createdOn = new Date().getTime();

        let status = 200;

        let user_id = generateUserId();
        let emailVerificationKey = generateRandomNumber();

        SignupController.CreateNewUser({
            user_id,
            first_name,
            last_name,
            username,
            email,
            passwordToSave,
            salt,
            createdOn,
            emailVerificationKey
        }).then((_res) => {
            // console.log(_res);
            if(_res.state === 1){
                response={success:1, message: _res.message}
            } else {
                if(_res.message === 'username') {
                    response={ error:1, message: message.signup.error.username }
                } else if(_res.message === 'email') {
                    response={ error:1, message: message.signup.error.email }
                }
            }
            res.json(response);
        });
        
    }
});



router.post('/login', (req, res, next) => {
    let loginParams = req.body.loginParams;
    let passwordEnteredByUser = req.body.password;

    let status = 200;

    if(loginParams == undefined || loginParams == null || loginParams == "")
    {
        response = {error: 1, message: message.login.error.params };
        status = 400;
        res.json(response);
    } else if(passwordEnteredByUser == undefined || passwordEnteredByUser == null || passwordEnteredByUser == "" || passwordEnteredByUser.length < 8)
    {
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

        if ( email != null) {
            LoginController.AuthenticateUserByEmail({
                email,
                passwordEnteredByUser
            }).then((_res) => {
                if (_res.state == 1) {
                    response={success:1, data:_res.data, message:message.login.success};
                } else {
                    if(_res.data == 'WRONG PASSWORD') {
                        response={error:1, message: message.login.error}
                    } else if(_res.data == 'NO USER') {
                        response={error:1, message: message.user.error}
                    }
                }

                res.status(status).json(response);
            });
        } else if ( username != null) {
            LoginController.AuthenticateUserByUsername({
                username,
                passwordEnteredByUser
            }).then((_res) => {
                console.log(_res);
                if (_res.state == 1) {
                    response={success:1, data:_res.data, message:message.login.success};
                } else {
                    if(_res.data == 'WRONG PASSWORD') {
                        response={error:1, message: message.login.error}
                    } else if(_res.data == 'NO USER') {
                        response={error:1, message: message.user.error}
                    }
                }
                res.status(status).json(response);
            });
        }
    }

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

//---------------------------------------------------------------------------------------------------------------------//

module.exports = router;