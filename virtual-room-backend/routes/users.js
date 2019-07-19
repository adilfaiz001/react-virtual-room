const express = require('express');
const bodyParser = require('body-parser');
const rn = require('random-number');
const jwt = require('jsonwebtoken');
const bcrypt = require('crypto');
//-------------------------------------------------------//

const connection_config = require('./connection');
const secretKey = connection_config.secretKey;

//-------------------------------------------------------//

const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended: true}));

//-------------------------------------------------------//


router.use((req, res, next) => {
    let token = req.headers['x-access-token'];

    if(token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if(err) {
                return res.json({ error: 1, message: message.token.error.auth });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.status(403).send({
            success: false,
            message: message.token.error.empty
        });
    }
});


/***
 * ======================================================================================================================================
 * SOCKET CODE 
 * ======================================================================================================================================
 */

module.exports = router;