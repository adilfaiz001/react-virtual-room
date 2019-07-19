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
      peer4: false
    }

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

      const enableCamera = () => {
        this.setState({
          isLocalCamera: true
        });
      }

      const setStream = (stream) => {
        this.setState({
          localStream: stream
        });
      }

      function handleSuccess(stream) {
        enableCamera();

        setStream(stream);

        const local_media = document.querySelector('#local-video');
        const videoTracks = stream.getVideoTracks();
        console.log('Got stream with constraints:', constraints);
        console.log(`Using video device: ${videoTracks[0].label}`);
        window.stream = stream;
        local_media.srcObject = stream;
      }

      function handleError(error) {
        if(error.name === 'ConstraintNotSatisfiedError') {
          let v = constraints.video;
          errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`);
        } else if (error.name === 'PermissionDeniedError') {
          errorMsg('Permissions have not been granted to use your camera and ' +
          'microphone, you need to allow the page access to your devices in ' +
          'order for the demo to work.');
        }
        errorMsg(`getUserMedia error: ${error.name}`, error);
      }

      function errorMsg(msg, error) {
        alert(msg);
        if (typeof error !== 'undefined') {
          console.error(error);
        }
      }

      async function init(e) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          handleSuccess(stream);
          // e.target.disabled = true;
        } catch (e) {
          handleError(e);
        }
      }

      if(!this.state.isLoaded) {
        this.setState({
          isLoaded: true
        }, (e) => {
            init(e);
        });
      }
      // window.addEventListener('load', (e) => init(e));


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


  CreateRoom = (username, roomname) => {
    let localStream = this.state.localStream;

    this.state.client.create({
      username : username,
      roomname: roomname,
      localStream: localStream
    }, (message) => {
      if(message) {
        alert(message);
      } else {
        this.setState({
          isChatTemplate: true,
          roomname: roomname
        });
    
        this.updateMessage(`created virtual room ${roomname}`, this.state.username, 2);
      }
    });


  }

  JoinRoom = (username, roomname) => {

    let localStream = this.state.localStream;

    return this.state.client.join({
        username : username,
        roomname: roomname,
        localStream: localStream
    },

    (response) => {
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

    },

    (username, numClients) => {

      // console.log("Response for joined: " + username, numClients);


      this.setState({
        isChatTemplate: true,
        isRemoteCamera: numClients - 1
      });

      this.newJoinMessage(username); 
    });
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