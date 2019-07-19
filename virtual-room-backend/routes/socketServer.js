// // https://www.webrtc-experiment.com/

// var fs = require('fs');

// // don't forget to use your own keys!
// var options = {
//     // key: fs.readFileSync('fake-keys/privatekey.pem'),
//     // cert: fs.readFileSync('fake-keys/certificate.pem')
//     key: fs.readFileSync('/etc/letsencrypt/live/webrtcweb.com/privkey.pem'),
//     cert: fs.readFileSync('/etc/letsencrypt/live/webrtcweb.com/fullchain.pem')
// };

// // HTTPs server
// var app = require('https').createServer(options, function(request, response) {
//     response.writeHead(200, {
//         'Content-Type': 'text/html'
//     });
//     var link = 'https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs';
//     response.write('<title>socketio-over-nodejs</title><h1><a href="'+ link + '">socketio-over-nodejs</a></h1><pre>var socket = io.connect("https://webrtcweb.com:9559/");</pre>');
//     response.end();
// });


// socket.io goes below

// var io = require('socket.io').listen(app, {
//     log: true,
//     origins: '*:*'
// });
const io = require('socket.io')();

// io.set('transports', [
//     // 'websocket',
//     'xhr-polling',
//     'jsonp-polling'
// ]);

var channels = {};

io.sockets.on('connection', function (socket) {
    console.log("Socket Opened");
    console.log(channels);
    var initiatorChannel = '';
    console.log(io.isConnected);
    if (!io.isConnected) {
        io.isConnected = true;
    }

    socket.on('new-channel', function (data) {
        console.log(channels);
        if (!channels[data.channel]) {
            initiatorChannel = data.channel;
        }
        console.log(data);
        channels = {
            "data.channel" :data.channel
        }
        // channels.data.channel = data.channel;
        console.log(channels);
        onNewNamespace(data.channel, data.sender);
    });

    socket.on('presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
    });

    socket.on('disconnect', function (channel) {
        if (initiatorChannel) {
            delete channels[initiatorChannel];
        }
    });
});

function onNewNamespace(channel, sender) {
    console.log()
    io.of('/' + channel).on('connection', function (socket) {
        console.log("Socket namespace connection");
        console.log(socket.id);
        var username;
        console.log(io.isConnected);
        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            console.log(data.sender, sender);
            if (data.sender == sender) {
                if(!username) username = data.data.sender;
                console.log(data);
                socket.broadcast.emit('message', data.data);
            }
        });
        
        socket.on('disconnect', function() {
            if(username) {
                socket.broadcast.emit('user-left', username);
                username = null;
            }
        });
    });
}

// run app

// app.listen(process.env.PORT || 9559);

// process.on('unhandledRejection', (reason, promise) => {
//   process.exit(1);
// });

// console.log('Please open SSL URL: https://localhost:'+(process.env.PORT || 9559)+'/');

module.exports = io;