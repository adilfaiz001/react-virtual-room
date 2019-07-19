const io = require('socket.io-client');
// const RTCPeerConnection = require('./RTCPeerConnection-v1.5');


let isChannelReady = false;
let isInitiator = false;
let isOfferInitiator = false;
let isStarted = false;

let pc;
let remoteStream;

let username;
let roomname;
let localStream;

let receiver_id;

let sockets = [];


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
                'turn:turn.virtualroom.thelattice.org:4455?transport=udp',
                'turn:turn.virtualroom.thelattice.org:5544?transport=tcp'
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
    optional: [],
    mandatory: {
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
    }
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
        remoteVideo = remoteVideoTag;
        console.log(remoteVideo);
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
    
            cb();

            isInitiator = true;
        });

        socket.on('room-error', (message) => {
            console.log(message);
            cb(message);
        });
    }
    
    function join(params, cb1, cb2) {

        username = params.username;
        roomname = params.roomname;
        localStream = params.localStream;

        socket.emit('join_room', username, roomname, (response) => {
            
        });

        socket.on('joined', (roomname, username, join_id) => {
            console.log(username + ' Joined: ' + roomname);

            isChannelReady = true;
            isOfferInitiator = true;

            // isOfferInitiator = true;
            // cb2(username, numClients);
            
            // console.log(clientsInRoom);
            // let clientsId = Object.keys(clientsInRoom.sockets);
            
            // let index = clientsId.indexOf(joinId);
            // clientsId.splice(index,1);
            
            // console.log(clientsId);
            // console.log(joinId);
            // console.log(numClients);

            // receiver_id = join_id; 

            cb1(true);
            cb2(username);



            StartRTCPeerConnection();

        });
    }

    function receiveJoin(cb) {
        socket.on('receiveJoin', function() {
            console.log("receiving remote join stream");
            cb(true);
        });
    }

    function checkforPeers(callback) {
        socket.on('join', function(roomname) {
            callback(roomname);
        });
    }

    socket.on('join', function (roomname, join_id){
        console.log('Another peer made a request to join room ' + roomname + "by the join_id " + join_id);

        receiver_id = join_id;

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


    function StartRTCPeerConnection() {

        
        console.log('Initiator: ' + isInitiator);
        console.log('Started: ' + isStarted);
        console.log('Channel Ready: ' + isChannelReady);
        console.log("Local Stream: " + localStream);
        console.log("OfferInitiator: " + isOfferInitiator);

        if(!isStarted && typeof localStream !== 'undefined' && isChannelReady ) {
            console.log("Creating Peer Connection");

            try {
                pc = new RTCPeerConnection(pcConfig);
                pc.onicecandidate = handleIceCandidate;
                pc.onaddstream = handleRemoteStreamAdded;
                pc.onremovestream = handleRemoteStreamRemoved;
                console.log('Created RTCPeerConnnection: '+ pc);

            } catch(e) {
                console.log('Failed to create PeerConnection, exception: ' + e.message);
                alert('Cannot create RTCPeerConnection object.');
                return;
            }
            pc.addStream(localStream);
            console.log("Local Stream added to RTCPeerConnection : " + pc);

            isStarted = true;

            if (isOfferInitiator) {
               StartCall();
            }
        }        
    }

    let checker = 0;

    function handleIceCandidate(event) {
        if(!receiver_id) {
            console.log("Receiver")
            console.log('icecandidate event: ', event);
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                    },
                    roomname);
            } else {
                console.log('End of candidates.');
            }
        } else {
            console.log("Sender");
            console.log('icecandidate event: ', event);
            if (event.candidate) {
                sendMessage({
                    type: 'candidate',
                    label: event.candidate.sdpMLineIndex,
                    id: event.candidate.sdpMid,
                    candidate: event.candidate.candidate
                    },
                    roomname , receiver_id);
            } else {
                console.log('End of candidates.');
            }
        }

    }

    function handleRemoteStreamAdded(event) {
        // console.log("Client: "+client);
        console.log('Remote stream added.');
        remoteStream = event.stream;
        console.log("Remote Stream:"+remoteStream);
        remoteVideo.srcObject = remoteStream;
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
        console.log("Starting call to peers");

        // pc.createOffer((sessionDescription) => {
        //     pc.setLocalDescription(sessionDescription);
        //     console.log("Setting local desscription in offerer", sessionDescription);
        //     sendMessage(sessionDescription, roomname);
        // }, handleCreateOfferError);

        pc.createOffer(sdpConstraints).then(function(sessionDescription) {
            pc.setLocalDescription(sessionDescription).then(function() {
                sendMessage(sessionDescription, roomname);
                console.log("Settling Local description");
            })
        },handleCreateOfferError);

        console.log("Offer Sent.")
    }
    
    /**
     * ====================================================
     * Start Answer to the offer created by remote peer
     * ====================================================
     */
    
    function StartAnswer(sdp) {
        console.log('Sending answer to peer.');
        // pc.createAnswer((sessionDescription) => {
        //     pc.setLocalDescription(sessionDescription);
        //     console.log("Setting local desscription in answerer", sessionDescription);
        //     sendMessage(sessionDescription, roomname, receiver_id);
        // },onCreateSessionDescriptionError);

        pc.setRemoteDescription(new RTCSessionDescription(sdp)).then(function(){
            pc.createAnswer(sdpConstraints).then(function(sessionDescription) {
                pc.setLocalDescription(sessionDescription).then(function() {
                    sendMessage(sessionDescription, roomname, receiver_id);
                    console.log("Set local description and reply to offer with answer:",sessionDescription)
                })
            })
        })
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


    function sendMessage(message, roomname, receiver) {
        if(!receiver) {
            console.log('Client sending message: ', message);
            socket.emit('message', message, roomname);
        } else {
            console.log('Client sending message with receiver: ', message);
            socket.emit('message', message, roomname, receiver);
        }
    }
      
    // This client receives a message
    socket.on('message', function(message) {        // offer received by ReceiveClient from SendClient and answer send back to the SendClient.
        
        console.log("Message receive ",message.type);

        if (message.type === 'offer') {
            if (!isOfferInitiator && !isStarted) {
                StartRTCPeerConnection();
            }
            // pc.setRemoteDescription(new RTCSessionDescription(message));
            StartAnswer(message);

        } else if (message.type === 'answer' && isStarted) {
            pc.setRemoteDescription(new RTCSessionDescription(message));

        } else if (message.type === 'candidate' && isStarted) {

            var candidate = new RTCIceCandidate({
            sdpMLineIndex: message.label,
            candidate: message.candidate
            });
            pc.addIceCandidate(candidate);
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