const io = require('socket.io-client');

let isChannelReady = false;
let isInitiator = false;
let isOfferInitiator = false;
let isStarted = false;

let pc={};
let remoteStream={};

let username;
let roomname;
let localStream;

let client;    // message sent to client and send to join in response
let sender;      // message sent by join to the client and receive message from client


/**
 * ====================================================//
 * STUN Server for development 
 * ====================================================//
 */
// let pcConfig = {
//     'iceServers': [
//         {
//             'urls' : [
//                 'stun:stun.l.google.com:19302',
//                 'stun:stun1.l.google.com:19302',
//                 'stun:stun2.l.google.com:19302',
//                 'stun:stun.l.google.com:19302?transport=udp'
//             ]
//         }
//     ]
// };

// let pcConfig = {
//     'iceServers': [
//         {
//             'urls' : 'stun:turn.virtualroom.thelattice.org:3478'
//         },
//         {
//             'urls' : 'turn:turn.virtualroom.thelattice.org:3478',
//             'username' : 'lattice',
//             'credential' : 'sangath'
//         }
//     ]
// };

// let pcConfig = { 
//     'iceServers': [
//         {
//             'urls': [
//                 'stun:stun.l.google.com:19302',
//                 'stun:stun1.l.google.com:19302',
//                 'stun:stun2.l.google.com:19302',
//                 'stun:stun.l.google.com:19302?transport=udp',
//             ]
//         }
//     ]
// };

let pcConfig = {
    'iceServers' : 
    // [
    //     {
    //         'urls': [
    //             'stun:webrtcweb.com:7788', // coTURN
    //             'stun:webrtcweb.com:7788?transport=udp', // coTURN
    //         ],
    //         'username': 'muazkh',
    //         'credential': 'muazkh'
    //     },
    //     {
    //         'urls': [
    //             'turn:webrtcweb.com:7788', // coTURN 7788+8877
    //             'turn:webrtcweb.com:4455?transport=udp', // restund udp

    //             'turn:webrtcweb.com:8877?transport=udp', // coTURN udp
    //             'turn:webrtcweb.com:8877?transport=tcp', // coTURN tcp
    //         ],
    //         'username': 'muazkh',
    //         'credential': 'muazkh'
    //     },
        // {
        //     'urls': [
        //         'stun:stun.l.google.com:19302',
        //         'stun:stun1.l.google.com:19302',
        //         'stun:stun2.l.google.com:19302',
        //         'stun:stun.l.google.com:19302?transport=udp',
        //     ]
        // }
    // ]

    [
        {
            'urls' : [
                'turn:turn.virtualroom.thelattice.org:4455',
                'turn:turn.virtualroom.thelattice.org:4455?transport=udp'
            ],
            'username' : 'sagar',
            'credential' : 'sagar12345'

        },
        {
            'urls': [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun.l.google.com:19302?transport=udp',
            ]
        }
    ]
};

// { iceServers: [stun:stun.l.google.com:19302, stun:stun1.l.google.com:19302, stun:stun2.l.google.com:19302, stun:stun3.l.google.com:19302, stun:stun4.l.google.com:19302], iceTransportPolicy: all, bundlePolicy: max-bundle, rtcpMuxPolicy: require, iceCandidatePoolSize: 0, sdpSemantics: "plan-b" }, 

//=====================================================//


let sdpConstraints = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
};

let constraints = {
    video: true,
    audio: true
};

//=====================================================//
let rooms = []
//-----------------------------------------------------//

let remoteVideo = {};
let localVideo;

export default function () {
    const socket = io.connect('https://api.virtualroom.thelattice.org');
    // const socket = io.connect('http://localhost:5000');

    function setRemoteVideo(remoteVideoTag) {
        remoteVideo[client] = remoteVideoTag;
        console.log(remoteVideo[client]);
        // console.log(client);
    }


    function create(params, cb) {
        
        username = params.username;
        roomname = params.roomname;
        localStream = params.localStream;

        // console.log("Attempting to create a room: " + roomname);

        socket.emit('create_room', roomname, username,  function(data) {
            // console.log(data);
        });

        socket.on('created', (roomname, id) => {
            // console.log('Created Room: ' + roomname);
            // console.log('Socket Id: '+ id);

            // rooms.push(roomname);
            cb();

            isInitiator = true;
        });

        socket.on('room-error', (message) => {
            console.log(message);
            cb(message);
        });
    }
    
    function join(params, cb1, cb2) {
        // console.log("Attempting to join room: " + roomname);

        username = params.username;
        roomname = params.roomname;
        localStream = params.localStream;

        socket.emit('join_room', username, roomname, (response) => {
            
        });

        socket.on('joined', (roomname, username, numClients, clientsInRoom, joinId) => {
            console.log(username + ' Joined: ' + roomname);
            isChannelReady = true;
            isOfferInitiator = true;
            cb2(username, numClients);
            
            console.log(clientsInRoom);
            let clientsId = Object.keys(clientsInRoom.sockets);
            
            let index = clientsId.indexOf(joinId);
            clientsId.splice(index,1);
            
            console.log(clientsId);
            console.log(joinId);
            console.log(numClients);

            /**
             * Logic
             * Use incoming user socket id as creating number of rtcpeerconnection
             */
            // for(var user=0; user<(numClients-1); user++){
            //     console.log("Starting RTCPeerConnection with user : "+(user+1));
            //     console.log("Emiting to client to set video tag");
                
            //     console.log("Sending to client: "+ clientsId[user] + " from sender: " + joinId);

            //     socket.emit('requestSender', clientsId[user], joinId);
            //     StartRTCPeerConnection(clientsId[user], joinId);
            //     cb1(true);
            //     console.log("Ending loop with user : "+(user+1));
            // }

            (async (clientsId) => {
                for (let user = 0; user < (numClients-1); user++) {
                    console.log("Starting RTCPeerConnection with user : "+(user+1));
                    console.log("Emiting to client to set video tag");
                    
                    console.log("Sending to client: "+ clientsId[user] + " from sender: " + joinId);

                    socket.emit('requestSender', clientsId[user], joinId);
                    /**
                     * Wait for rtc connection for one user to complete create and send offer and commplete setting rtc for one user then move to next user in loop, make loop blocking until one user completes.
                     */
                    StartRTCPeerConnection(clientsId[user], joinId);
                    cb1(true);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    console.log("Ending loop with user : "+(user+1));
                }
            })(clientsId);
        });
    }

    function receiveJoin(cb) {
        socket.on('receiveJoin', function(Client, Sender) {
            sender = Sender;
            client = Client;
            cb(true);
        });
    }

    function checkforPeers(callback) {
        socket.on('join', function(roomname) {
            callback(roomname);
        });
    }

    socket.on('join', function (roomname){
        console.log('Another peer made a request to join room ' + roomname);
        // console.log('This peer is the initiator of room ' + roomname + '!');
        isOfferInitiator = false;
        isStarted = false;
        isChannelReady = true;
    });

    socket.on('log', function(array) {
        console.log.apply(console, array);
    });

    /**
     * ==================================================================================================================================//
     * Creating RTCPeerConnection for local Peer
     * ==================================================================================================================================//
     */


    function StartRTCPeerConnection(clientId, joinId) {

        client = clientId;    // remote client, remote user 
        sender = joinId;        // user joining to the room, local user

        
        console.log("Starting RTCPeerConnection for connection : Sender-"+sender+" Client-"+client);
        console.log('Initiator: ' + isInitiator);
        console.log('Started: ' + isStarted);
        console.log('Channel Ready: ' + isChannelReady);
        console.log("Local Stream: " + localStream);
        console.log("OfferInitiator: " + isOfferInitiator);

        if(!isStarted && typeof localStream !== 'undefined' && isChannelReady ) {
            console.log("Creating Peer Connection");

            try {
                pc[client] = new RTCPeerConnection(pcConfig);
                pc[client].onicecandidate = handleIceCandidate;
                pc[client].onaddstream = handleRemoteStreamAdded;
                pc[client].onremovestream = handleRemoteStreamRemoved;
                console.log('Created RTCPeerConnnection: '+ pc[client]);

            } catch(e) {
                console.log('Failed to create PeerConnection, exception: ' + e.message);
                alert('Cannot create RTCPeerConnection object.');
                return;
            }
            pc[client].addStream(localStream);
            console.log("Local Stream added to RTCPeerConnection : " + pc[client]);

            isStarted = true;
            // console.log("isStarted: "+ isStarted);
            console.log(pc);
            if (isOfferInitiator) {
               StartCall();
            }
        }        
    }

    function handleIceCandidate(event) {
        console.log("Client: "+client);
        console.log('icecandidate event: ', event);
        if (event.candidate) {
            sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
            }, roomname, client, sender);
        } else {
            console.log('End of candidates.');
        }
    }

    function handleRemoteStreamAdded(event) {
        console.log("Client: "+client);
        console.log('Remote stream added.');
        remoteStream[client] = event.stream;
        console.log(sender);
        console.log(remoteVideo[client]);
        remoteVideo[client].srcObject = remoteStream[client];

        isStarted = false;
    }

    function handleRemoteStreamRemoved(event) {
        console.log('Remote stream removed. Event: ', event);
    }

    /**
     * =====================================================
     * Starting Call to Remote Peer
     * 1. Create Offer 
     * 2. Set Local Session Description for Remote Peer and send it using sendMessage to all user in room.  
     * ======================================================
     */
    
    function StartCall() {
        console.log('Sending offer to peer: '+client);
        console.log(pc);
        pc[client].createOffer(setLocalAndSendMessage, handleCreateOfferError);
        console.log("Offer Sent.")
    }
    
    /**
     * ====================================================
     * Start Answer to the offer created by remote peer
     * ====================================================
     */
    
    function StartAnswer() {
        console.log('Sending answer to peer.');
        pc[client].createAnswer().then(
          setLocalAndSendMessage,
          onCreateSessionDescriptionError
        );
    }

    function setLocalAndSendMessage(sessionDescription) {
        console.log("Set Local Message for client: " + client);
        pc[client].setLocalDescription(sessionDescription);
        console.log('setLocalAndSendMessage sending message', sessionDescription);
        // console.log('ClientId: '+ client);
        // console.log('sender Id: '+ sender);
        sendMessage(sessionDescription, roomname, client, sender);
    }

    function handleCreateOfferError(event) {
        console.log('createOffer() error: ', event);
    }

    function onCreateSessionDescriptionError(error) {
        console.log('Failed to create session description: ' + error.toString());
    }

    //===================================================================================================================================//

    /**
     * ==================================================================================================================================//
     * Sending Message to Signaling Server 
     * ==================================================================================================================================//
     */


    function sendMessage(message, roomname, client, sender) {
        console.log("Client: "+ client);
        console.log('Client sending message: ', message);
        socket.emit('message', message, roomname, client, sender);
    }
      
    // This client receives a message
    socket.on('message', function(message, ToSendClient, ReceiveClient) {        // offer received by ReceiveClient from SendClient and answer send back to the SendClient.
        console.log('Client received message:', message);
        console.log('Sender: '+ ReceiveClient);
        if (message === 'got user media') {
            // console.log("Got Media Stream");
        } else if (message.type === 'offer') {
            if (!isOfferInitiator && !isStarted) {
                console.log("Receive offer from client-"+ToSendClient+" and sending answer from "+ReceiveClient);
                StartRTCPeerConnection(ToSendClient, ReceiveClient);
            }
            pc[client].setRemoteDescription(new RTCSessionDescription(message));
            StartAnswer();
        } else if (message.type === 'answer' && isStarted) {
            console.log("Receive answer from client- "+ToSendClient);
            console.log("Local client- "+ReceiveClient);
            console.log(pc);
            pc[client].setRemoteDescription(new RTCSessionDescription(message));
        } else if (message.type === 'candidate' && isStarted) {
            var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
            });
            pc[client].addIceCandidate(candidate);
        }
    });

    //==================================================================================================================================//


    /**
     * =================================================================================================================================//
     * CHAT TEMPLATE
     * =================================================================================================================================//
     */

    function newJoinMessage(cb) {
        socket.on('newJoin', (username) => {
            cb(username);
        });
    }

    function onMessage(message,username,roomname) {
        // console.log(message, username, roomname);
        socket.emit('onMessage', message, username, roomname);
    }

    function receiveMessage(cb) {
        socket.on('receiveMessage', (message, username) => {
            cb(message, username);
        })
    }

    //===================================================================================================================================//




    function leave(roomname, cb) {
        socket.emit('leave_room', roomname, cb)
    }



    return {
        create,
        join,
        leave,
        checkforPeers,
        setRemoteVideo,
        newJoinMessage,
        onMessage,
        receiveMessage,
        receiveJoin
    }
}