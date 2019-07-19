import React, { Component } from "react";
import ReactDOM from 'react-dom'
import PropTypes from "prop-types";
import { connect } from "react-redux";
import $ from 'jquery';

import { logoutUser } from "../../actions/authActions";
import './style/Dashboard.css';
import image from "./components/style/images/image.png";

import AuthNavbar from "./components/AuthNavbar";
import RemoteCamera from "./components/RemoteCamera";
import ChatTemplate from "./components/ChatTemplate";
import AvailableRooms from "./components/AvailableRooms";

import socket from './socket';
import 'webrtc-adapter';

import conference from './conference';
import getMediaElement from './getMediaElement';
import { getUserMedia } from './RTCPeerConnection-v1.5.js';
import io from 'socket.io-client';

class Dashboard extends Component {

  constructor() {
    super();
    this.state = {
      isLoaded:false,
      dashboard: false,
      username: null,
      isChatTemplate: false,
      isLocalCamera: false,
      isRemoteCamera: 0,
      client: socket(),
      roomname: null,
      messages: [],
      localStream: null,
      rooms: [],
      //temp solution
      peers: [false, false, false, false], //boolean
      peer1: false,
      peer2: false,
      peer3: false,
      peer4: false,
      //new socket solution states
      userToken: null
    }

    this.config = {};
    this.conferenceUI = null;

    this.CreateRoom = this.CreateRoom.bind(this);
    this.JoinRoom = this.JoinRoom.bind(this);
    this.updateMessage = this.updateMessage.bind(this);
    this.newJoinMessage = this.newJoinMessage.bind(this);

  }

  componentDidMount() {
      /**
       * =========================================================================================================================
       * Getting Local Camera permission and adding it to video tag.
       * =========================================================================================================================
       */
      const constraints = window.constraints = {
        audio: true,
        video: true
      };
    
      this.config = {
        // via: https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs
        openSocket: function(config) {
            var SIGNALING_SERVER = 'http://localhost:8080/';
            // var SIGNALING_SERVER = 'https://api.virtualroom.thelattice.org/';
            // var SIGNALING_SERVER = 'https://socketio-over-nodejs2.herokuapp.com:443/';

            console.log("OpenSocket");
            config.channel = this.channel;
            // console.log(config.channel);
            var sender = Math.round(Math.random() * 999999999) + 999999999;

            io.connect(SIGNALING_SERVER).emit('new-channel', {
                channel: config.channel,
                sender: sender
            });
            console.log(config.channel);

            var socket = io.connect(SIGNALING_SERVER + config.channel);
            socket.channel = config.channel;

            console.log(socket);
            socket.on('connect', function () {
                console.log("socket connect");
                if (config.callback) config.callback(socket);
            });

            socket.send = function (message) {
              console.log(message);
                socket.emit('message', {
                    sender: sender,
                    data: message
                });
            };

            socket.on('message', config.onmessage);
        },
        onRemoteStream: function(media) {
            var mediaElement = getMediaElement(media.video, {
                // width: (videosContainer.clientWidth / 2) - 50,
                buttons: ['mute-audio', 'mute-video', 'full-screen', 'volume-slider']
            });
            mediaElement.id = media.stream.streamid;
            // videosContainer.appendChild(mediaElement);
        },
        onRemoteStreamEnded: function(stream, video) {
            if (video.parentNode && video.parentNode.parentNode && video.parentNode.parentNode.parentNode) {
                video.parentNode.parentNode.parentNode.removeChild(video.parentNode.parentNode);
            }
        },
        onRoomFound: function(room) {
            var alreadyExist = document.querySelector('button[data-broadcaster="' + room.broadcaster + '"]');
            if (alreadyExist) return;

            // if (typeof roomsList === 'undefined') roomsList = document.body;

            var tr = document.createElement('tr');
            tr.innerHTML = '<td><strong>' + room.roomName + '</strong> shared a conferencing room with you!</td>' +
                '<td><button class="join">Join</button></td>';
            // roomsList.appendChild(tr);

            var joinRoomButton = tr.querySelector('.join');
            joinRoomButton.setAttribute('data-broadcaster', room.broadcaster);
            joinRoomButton.setAttribute('data-roomToken', room.roomToken);
            joinRoomButton.onclick = function() {
                this.disabled = true;

                var broadcaster = this.getAttribute('data-broadcaster');
                var roomToken = this.getAttribute('data-roomToken');
                this.captureUserMedia(function() {
                    this.conferenceUI.joinRoom({
                        roomToken: roomToken,
                        joinUser: broadcaster
                    });
                }, function() {
                    joinRoomButton.disabled = false;
                });
            };
        },
        onRoomClosed: function(room) {
            var joinButton = document.querySelector('button[data-roomToken="' + room.roomToken + '"]');
            if (joinButton) {
                // joinButton.parentNode === <li>
                // joinButton.parentNode.parentNode === <td>
                // joinButton.parentNode.parentNode.parentNode === <tr>
                // joinButton.parentNode.parentNode.parentNode.parentNode === <table>
                joinButton.parentNode.parentNode.parentNode.parentNode.removeChild(joinButton.parentNode.parentNode.parentNode);
            }
        },
        onReady: function() {
            console.log('now you can open or join rooms');
        },
        onRemoteVideo: function() {
            var video;
            console.log("Setting Remote Tag in dashboard");
            if (!this.state.peer1) {
                this.setState({
                    peer1: true
                }, () => {
                    console.log("Setting Remote Video Tag 1");
                    video = document.querySelector('#remote-video-1');
                });
            } else if (!this.state.peer2) {
                this.setState({
                    peer2: true
                }, () => {
                    console.log("Setting Remote Video Tag 2");
                    video = document.querySelector('#remote-video-2');
                });
            } else if (!this.state.peer3) {
                this.setState({
                    peer3: true
                }, () => {
                    console.log("Setting Remote Video Tag 3");
                    video = document.querySelector('#remote-video-3');
                });
            } else if (!this.state.peer4) {
                this.setState({
                    peer4: true
                }, () => {
                    console.log("Setting Remote Video Tag 4");
                    video = document.querySelector('#remote-video-4');
                });
            }
            return video;
        }
      };


      //=======================================================================================================================//

      /**
       * =======================================================================================================================
       * Socket events for the users
       * =======================================================================================================================
       */
       
      this.state.client.receiveMessage((message, username) => {
        this.receiveMessage(message, username);
      });

      this.state.client.receiveJoin((response) => {
        console.log("New User Joining");
        console.log("Setting Remote Tag in dashboard");
        if (!this.state.peer1) {
            this.setState({
                peer1: true
            }, () => {
                console.log("Setting Remote Video Tag 1");
                let remoteVideo = document.querySelector('#remote-video-1');
                this.state.client.setRemoteVideo(remoteVideo);
            });
        } else if (!this.state.peer2) {
            this.setState({
                peer2: true
            }, () => {
                console.log("Setting Remote Video Tag 2");
                let remoteVideo = document.querySelector('#remote-video-2');
                this.state.client.setRemoteVideo(remoteVideo);
            });
        } else if (!this.state.peer3) {
            this.setState({
                peer3: true
            }, () => {
                console.log("Setting Remote Video Tag 3");
                let remoteVideo = document.querySelector('#remote-video-3');
                this.state.client.setRemoteVideo(remoteVideo);
            });
        } else if (!this.state.peer4) {
            this.setState({
                peer4: true
            }, () => {
                console.log("Setting Remote Video Tag 4");
                let remoteVideo = document.querySelector('#remote-video-4');
                this.state.client.setRemoteVideo(remoteVideo);
            });
        }
      });

      this.state.client.newJoinMessage((username) => {
        this.newJoinMessage(username);
      });
  }

  setUpConferenceUI = () => {
    return new Promise((resolve, reject) => {
      this.config.channel = this.state.roomname;
      this.conferenceUI = conference(this.config);
      resolve();
    })
  }

  setupNewRoomButtonClickHandler = () => {
    this.setUpConferenceUI().then(() => {
      var conferenceUI = this.conferenceUI;
      var config = this.config;
      var roomname = this.state.roomname;
      this.captureUserMedia(function() {
          conferenceUI.createRoom({
              roomName: roomname
          });
      }, function() {
          // btnSetupNewRoom.disabled = document.getElementById('conference-name').disabled = false;
      });

    })
  };

  captureUserMedia = (callback, failure_callback) => {

    var video;
    var attachStream;
    console.log(this.config);

    this.setState({
      isLocalCamera: true
    },() => {
      video = document.querySelector('#local-video');

      // console.log(video);

      getUserMedia({
          video: video,
          onsuccess: function(stream) {
              attachStream = stream;
              // console.log(this.config);
              // var mediaElement = getMediaElement(video, {
              //     // width: (videosContainer.clientWidth / 2) - 50,
              //     buttons: ['mute-audio', 'mute-video', 'full-screen', 'volume-slider']
              // });
              // mediaElement.toggle('mute-audio');
              // videosContainer.appendChild(mediaElement);
  
              callback && callback();
          },
          onerror: function() {
              alert('unable to get access to your webcam');
              callback && callback();
          }
      });

      setTimeout(() => {
        this.config.attachStream = attachStream;
      },1000);

    });

    console.log(this.config);

    // video.muted = true;
    // video.volume = 0;

    // try {
    //     video.setAttributeNode(document.createAttribute('autoplay'));
    //     video.setAttributeNode(document.createAttribute('playsinline'));
    //     video.setAttributeNode(document.createAttribute('controls'));
    // } catch (e) {
    //     video.setAttribute('autoplay', true);
    //     video.setAttribute('playsinline', true);
    //     video.setAttribute('controls', true);
    // }

  };

  

  CreateRoom = (username, roomname) => {
    // console.log(this.config);
    // this.config.channel = this.state.roomname;
    // this.conferenceUI = conference(this.config);
    this.setupNewRoomButtonClickHandler();
  }

  JoinRoom = (username, roomname) => {

    this.setUpConferenceUI();

    let conferenceUI = this.conferenceUI;

    // this.captureUserMedia(function() {
    //   conferenceUI.joinRoom({
    //     roomToken: roomname,
    //     joinUser: username
    //   }, function() {

    //   });
    // })
  }

  handleUsername = (username) => {
    // console.log(username.target.value);
    this.setState({
      username: username.target.value
    });
  }

  handleRoomname = (roomname) => {
    // console.log(roomname.target.value);
    this.setState({
      roomname: roomname.target.value
    });
  }

  /**
   * ====================================================================================================================================
   * MESSAGE CHAT HANDLERS
   * ====================================================================================================================================
   */

  receiveMessage = (message, username) => {
    let ChatHistory = this.state.messages;
    ChatHistory.push(message);

    this.setState({
      messages: ChatHistory
    });
  }

  handleMessagePacket = (message, username, type) => {
    let d = new Date();
    return {
      type: type,
      username: username,
      message: message,
      postedOn: `${d.getHours()}:${d.getMinutes()}`
    }
  }

  updateMessage = (message, username, type=1) => {
    let ChatHistory = this.state.messages;
    let messagePacket = this.handleMessagePacket(message, username, type);
    ChatHistory.push(messagePacket);

    this.setState({
      messages : ChatHistory
    });

    this.state.client.onMessage(messagePacket, this.state.username, this.state.roomname);
  }

  newJoinMessage = (username) => {
    let ChatHistory = this.state.messages;
    let messagePacket = this.handleMessagePacket('joined this room', username, 2)
    ChatHistory.push(messagePacket);

    this.setState({
      messages : ChatHistory
    });
  }

  handleMessage = (message) => {
      this.updateMessage(message, this.state.username);
  }

  onLogoutClick = e => {
    e.preventDefault();
    this.props.logoutUser();

    this.state.localStream.getTracks().forEach( (track) => {
      track.stop();
    });
  };

  render() {
    // const { user } = this.props.auth;
    // console.log(this.props.auth.user.first_name)

    return (
      <div>
        {
          this.props.auth.isAuthenticated ? 
            <AuthNavbar user = {this.props.auth.user.first_name}
            logout = {this.onLogoutClick} /> 
            :
            console.log()
        }
        <div className="container">
            <div className="ui two column stackable grid">
                <div className="column">
                    <div className="ui segment">
                        {
                          this.state.isChatTemplate ? 
                            <ChatTemplate room={this.state.roomname}
                                          username={this.state.username}
                                          message={this.state.messages}
                                          OnSelectMessage={e => this.handleMessage(e)} /> 
                            :
                            <div className="ui form">
                              <div className="fields">
                                  <div className="field">
                                      <label>Username</label>
                                      <input type="text" placeholder="Username" id="username" name="username" onInput={(e) => this.handleUsername(e)}/>
                                  </div>
                                  <div className="field">
                                      <label>Room</label>
                                      <input type="text" placeholder="Room" id="roomname" name="roomname" onInput={(e) => this.handleRoomname(e)} />
                                  </div>
                              </div>
                              <br/>
                              <div className="ui buttons">
                                  <div id="create-btn" className="ui submit orange button" onClick={() => this.CreateRoom(this.state.username,this.state.roomname)}>
                                      Create Room
                                  </div>
                                  <div className="or">or</div>
                                  <div id="join-btn" className="ui submit green button" onClick={() => this.JoinRoom(this.state.username,this.state.roomname)}>
                                      Join Room
                                  </div>
                              </div>
                          </div>
                        }
                    </div>
                </div>
                <div className="column">
                    <div className="ui segment">
                      <div className="ui column local-camera-grid">
                      {
                        !this.state.isLocalCamera ? 
                          <img id="local-image" className="ui medium image"  src={image} alt="" />
                          :
                          <video id="local-video" className="ui medium image" autoPlay playsInline controls={true}/>
                      }
                          <h6 className="ui center aligned header" style={{margin:0}}> 
                            Local Camera
                          </h6>
                      </div>
                    </div>
                </div>
            </div>

            <div className="ui one column stackable grid">
              <div className="column">
                  <div className="ui segment"> 
                    <div>
                        <h6 className="ui center aligned header">Remote Cameras</h6>
                        <div id="remote-videos" className="ui stackable grid">
                            <div id="remote-video-div-1" className="four wide column">
                                {
                                    !(this.state.peer1) ? 
                                        <img className="ui centered medium image" src={image} alt=""/>    
                                        :
                                        <video id="remote-video-1" className="ui medium image" autoPlay playsInline controls={true}/>
                                }
                            </div>

                            <div id="remote-video-div-2" className="four wide column">
                                {
                                        !(this.state.peer2) ? 
                                            <img className="ui centered medium image" src={image} alt=""/>    
                                            :
                                            <video id="remote-video-2" className="ui medium image" autoPlay playsInline controls={true}/>
                                }
                            </div>

                            <div id="remote-video-div-3" className="four wide column">
                                {
                                    !(this.state.peer3) ? 
                                        <img className="ui centered medium image" src={image} alt=""/>    
                                        :
                                        <video id="remote-video-3" className="ui medium image" autoPlay playsInline controls={true}/>
                                }
                            </div>

                            <div id="remote-video-div-4" className="four wide column">
                                {
                                    !(this.state.peer4) ? 
                                        <img className="ui centered medium image" src={image} alt=""/>    
                                        :
                                        <video id="remote-video-4" className="ui medium image" autoPlay playsInline controls={true}/>
                                }
                            </div>

                        </div>
                    </div>
                  </div>
              </div>
            </div>
        </div>
      </div>
    ); 
  }
}

Dashboard.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(
  mapStateToProps,
  { logoutUser }
)(Dashboard);