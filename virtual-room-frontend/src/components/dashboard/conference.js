// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

// This library is known as multi-user connectivity wrapper!
// It handles connectivity tasks to make sure two or more users can interconnect!
import { RTCPeerConnection } from './RTCPeerConnection-v1.5.js';

export default function(config) {
    console.log("Conference Script");
    var self = {
        userToken: uniqueToken()
    };
    var channels = '--', isbroadcaster;
    var isGetNewRoom = true;
    var sockets = [];
    var defaultSocket = { };

    function openDefaultSocket(callback) {
        console.log("Conference Default Socket");
        console.log("User Token:",self.userToken);

        defaultSocket = config.openSocket({
            userToken: self.userToken,
            onmessage: onDefaultSocketResponse,
            callback: function(socket) {
                // console.log(socket);
                defaultSocket = socket;
                // console.log(defaultSocket);
                console.log("socket callback",defaultSocket);
                callback();
            }
        });
    }

    function onDefaultSocketResponse(response) {
        console.log("Default Socket Response :"+response);

        if (response.userToken == self.userToken) return;

        if (isGetNewRoom && response.roomToken && response.broadcaster) {
            console.log("Get New Room");
            config.onRoomFound(response);
        }

        if (response.newParticipant && self.joinedARoom && self.broadcasterid == response.userToken) {
            console.log("on New Participent");
            onNewParticipant(response.newParticipant);
        }

        if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
            channels += response.userToken + '--';
            openSubSocket({
                isofferer: true,
                channel: response.channel || response.userToken
            });
        }

        // to make sure room is unlisted if owner leaves        
        if (response.left && config.onRoomClosed) {
            config.onRoomClosed(response);
        }
    }

    function openSubSocket(_config) {
        console.log("Debugging in openSubSocket");
        console.log(_config);
        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function() {
                if (isofferer && !peer) initPeer();
                sockets[sockets.length] = socket;
            }
        };

        socketConfig.callback = function(_socket) {
            console.log("socketConfig Callback");
            socket = _socket;
            this.onopen();

            if(_config.callback) {
                _config.callback();
            }
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            gotstream,
            video,
            inner = { },
            peer;

        var peerConfig = {
            attachStream: config.attachStream,
            onICE: function(candidate) {
                socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onRemoteStream: function(stream) {
                if (!stream) return;
                video = config.onRemoteVideo();
                // try {
                //     video.setAttributeNode(document.createAttribute('autoplay'));
                //     video.setAttributeNode(document.createAttribute('playsinline'));
                //     video.setAttributeNode(document.createAttribute('controls'));
                // } catch (e) {
                //     video.setAttribute('autoplay', true);
                //     video.setAttribute('playsinline', true);
                //     video.setAttribute('controls', true);
                // }

                video.srcObject = stream;

                _config.stream = stream;
                onRemoteStreamStartsFlowing();
            },
            onRemoteStreamEnded: function(stream) {
                if (config.onRemoteStreamEnded)
                    config.onRemoteStreamEnded(stream, video);
            }
        };

        function initPeer(offerSDP) {
            if (!offerSDP) {
                console.log("!Offer");
                peerConfig.onOfferSDP = sendsdp;
            } else {
                console.log("Offer");
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
            }

            peer = RTCPeerConnection(peerConfig);
        }
        
        function afterRemoteStreamStartedFlowing() {
            gotstream = true;

            if (config.onRemoteStream)
                config.onRemoteStream({
                    video: video,
                    stream: _config.stream
                });

            if (isbroadcaster && channels.split('--').length > 3) {
                /* broadcasting newly connected participant for video-conferencing! */
                defaultSocket.send({
                    newParticipant: socket.channel,
                    userToken: self.userToken
                });
            }
        }

        function onRemoteStreamStartsFlowing() {
            if(navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i)) {
                // if mobile device
                return afterRemoteStreamStartedFlowing();
            }
            
            if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
                afterRemoteStreamStartedFlowing();
            } else setTimeout(onRemoteStreamStartsFlowing, 50);
        }

        function sendsdp(sdp) {
            socket.send({
                userToken: self.userToken,
                sdp: JSON.stringify(sdp)
            });
        }

        function socketResponse(response) {

            if (response.userToken == self.userToken) return;
            if (response.sdp) {
                inner.sdp = JSON.parse(response.sdp);
                selfInvoker();
            }

            if (response.candidate && !gotstream) {
                if (!peer) console.error('missed an ice', response.candidate);
                else
                    console.log(response.candidate.sdpMLineIndex);
                    console.log(response.candidate.candidate);

                    peer.addICE({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
            }

            if (response.left) {
                if (peer && peer.peer) {
                    peer.peer.close();
                    peer.peer = null;
                }
            }
        }

        var invokedOnce = false;

        function selfInvoker() {
            console.log("Self Invoker");

            if (invokedOnce) return;

            invokedOnce = true;

            if (isofferer) peer.addAnswerSDP(inner.sdp);
            else initPeer(inner.sdp);
        }
    }

    function leave() {
        var length = sockets.length;
        for (var i = 0; i < length; i++) {
            var socket = sockets[i];
            if (socket) {
                socket.send({
                    left: true,
                    userToken: self.userToken
                });
                delete sockets[i];
            }
        }

        // if owner leaves; try to remove his room from all other users side
        if (isbroadcaster) {
            defaultSocket.send({
                left: true,
                userToken: self.userToken,
                roomToken: self.roomToken
            });
        }

        if (config.attachStream) {
            if('stop' in config.attachStream) {
                config.attachStream.stop();
            }
            else {
                config.attachStream.getTracks().forEach(function(track) {
                    track.stop();
                });
            }
        }
    }
    
    window.addEventListener('beforeunload', function () {
        leave();
    }, false);

    window.addEventListener('keyup', function (e) {
        if (e.keyCode == 116)
            leave();
    }, false);

    function startBroadcasting() {
        console.log("broadcasting");
        console.log(defaultSocket);
        defaultSocket && defaultSocket.send({
            roomToken: self.roomToken,
            roomName: self.roomName,
            broadcaster: self.userToken
        });
        setTimeout(startBroadcasting, 1000);
    }

    function onNewParticipant(channel) {
        if (!channel || channels.indexOf(channel) != -1 || channel == self.userToken) return;
        channels += channel + '--';

        console.log("New Participant");

        var new_channel = uniqueToken();
        openSubSocket({
            channel: new_channel
        });

        defaultSocket.send({
            participant: true,
            userToken: self.userToken,
            joinUser: channel,
            channel: new_channel
        });
    }

    function uniqueToken() {
        var s4 = function() {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    openDefaultSocket(config.onReady || function() {});

    return {
        createRoom: function(_config) {
            console.log("creating new room");

            self.roomName = _config.roomName;
            self.roomToken = uniqueToken();
            // self.roomToken = _config.roomName;

            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function(_config) {

            console.log("Join Room");
            console.log("Room Token: "+_config.roomToken);
            console.log("join User: "+_config.joinUser);

            self.roomToken = _config.roomToken;
            isGetNewRoom = false;

            self.joinedARoom = true;
            self.broadcasterid = _config.joinUser;

            openSubSocket({
                channel: self.userToken,
                callback: function() {
                    defaultSocket.send({
                        participant: true,
                        userToken: self.userToken,
                        joinUser: _config.joinUser
                    });
                }
            });
        },
        leaveRoom: leave
    };
};
