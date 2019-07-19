import React, { Component } from "react";
import "./style/Chatroom.css";

class Chatroom extends Component {
    render() {
        return (
            <div className="ui form">
                <div className="fields">
                    <div className="field">
                        <label>Username</label>
                        <input type="text" placeholder="Username" id="username" name="username" />
                    </div>
                    <div className="field">
                        <label>Room</label>
                        <input type="text" placeholder="Room" id="roomname" name="roomname" />
                    </div>
                </div>
                <br/>
                <div className="ui buttons">
                    <div id="create-btn" className="ui submit orange button">
                        Create Room
                    </div>
                    <div className="or">or</div>
                    <div id="join-btn" className="ui submit green button">
                        Join Room
                    </div>
                </div>
            </div>
        );
    }
}

export default Chatroom;