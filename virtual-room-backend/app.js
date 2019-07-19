/***
 * 
 */

//====================================================================//
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

//=====================================================================//


const index = require('./routes/index');
const login = require('./routes/login');
const users = require('./routes/users');

const db = require('./mongodb');


//=====================================================================//

const app = express();
// const server = require('http').Server(app);
// const io = require('socket.io')(server);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pub');

app.use(logger('dev'));
app.use(bodyParser.json({limit:'5mb'}));
app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/images'));

app.use(cors());

app.use('/', index);
app.use('/api/login', login);
// app.use('/api/', users);




app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    // res.render('error');
});

module.exports = app;