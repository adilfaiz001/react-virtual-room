const io = require('socket.io')();

const ChatroomController = require('../controllers/ChatroomController');

let rooms = {};
let userId = {};

io.sockets.on('connection', function (socket){
    console.log("User Socket Id: "+ socket.id);
    

    function log() {
        var array = ['Message from server:'];
        array.push.apply(array, arguments);
        socket.emit('log', array);
    }

    socket.on('create_room', (roomname, username) => {
        log('Received request to create room ' + roomname + ' from user: ' + username);
        console.log('Received request to create room ' + roomname + ' from user: ' + username);

        ChatroomController.CreateNewRoom({
            chatroomId: generateChatroomId(),
            roomname,
            username,
            createdOn: new Date().toDateString(),
            message: {
                author: username,
                body: `${username} created chatroom ${roomname}`,
                timestamp: new Date().toDateString()
            }
        }).then((_res) => {

            if(_res.state == 1) {
                socket.join(roomname);
        
                // var clientsInRoom = io.sockets.adapter.rooms[roomname];
                // var numClients = clientsInRoom ? Object.keys(clientsInRoom.sockets).length : 0;
                // log('Room ' + roomname + ' now has ' + numClients + ' client(s)');
        
                socket.emit('created');
                log('Room Creation on server complete');

            } else {
                console.log("ERROR OCCURRED: " + _res.message);
                let message = _res.message;
                log("Room Creation Error " + roomname)
                socket.emit("room-error", message);
            }
        });
    });


    socket.on('join_room', (username, roomname) => {

        ChatroomController.JoinRoom({
            roomname,
            username
        }).then((_res) => {
            if(_res.state == 1) {
                io.to(roomname).emit('join', roomname, socket.id);
                
                socket.join(roomname);

                socket.emit('joined', roomname, username );


            } else {
                socket.emit("error",_res.message);
            }
        });
    });

    socket.on('requestSender', function(client, sender) {
        console.log("Sender: "+ sender);
        console.log("Client: "+ client);
        socket.broadcast.to(client).emit('receiveJoin');
    })

    socket.on('message', (message, roomname, receiver_id) => {
        log("Client Said: " + message + " from " + roomname);

        if(!receiver_id) {
            socket.broadcast.to(roomname).emit('message', message);
        } else {
            socket.broadcast.to(receiver_id).emit('message', message);
        }




        // io.to(roomname).emit('message', message);
    });


    socket.on("roomlist", () => {
        // console.log("Get room list");
        ChatroomController.GetRoomList().then((_res) => {
            if (_res.roomlist !== 0) {
                socket.emit('roomlist', _res.roomlist);
            } 
        });
    });



    /**
     * =========================================================================================================================
     * CHAT SOCKET
     * =========================================================================================================================
     */

     socket.on('onMessage', (message, username, roomname) => {
        log("Client Said: " + message + " from " + username + " in " + roomname);

        ChatroomController.BroadcastMessage({
            username,
            roomname,
            message
        }).then(_res => {
            if( _res.state == 1) {
                socket.broadcast.to(roomname).emit('receiveMessage', message, username, roomname);
            } else {
                let err = _res.message
                socket.emit("error-message", err);
            }
        });

     });

     socket.on('leave', (username, roomname) => {
        //write controller promise for removing from active users and update live rooms users;
        console.log(`USER ${username} LEAVING ${roomname}`);

        ChatroomController.LeaveRoom({
            username,
            roomname
        }).then((_res) => {
            if(_res.state == 1) {
                console.log("Controller Response: " + _res);
                socket.broadcast.to(roomname).emit('user-leave', username, roomname);
                socket.emit('left');
                socket.leave(roomname);
            } else {
                socket.emit('error');
            }

        })
     });
});

/**
 * ==============================================================================================================================
 * UTIL FUNCTIONS
 * ==============================================================================================================================
 */

function generateChatroomId() {
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

//--------------------------------------------------------------------------------------------------------------------------------------------//

module.exports = io;