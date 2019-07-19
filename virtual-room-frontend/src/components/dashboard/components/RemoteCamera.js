import React, { Component } from "react";
import "./style/RemoteCamera.css";
import image from "./style/images/image.png";

class RemoteCamera extends Component {
    constructor() {
        super();
        this.state = {
            remoteVideoId : 0
        }
    }
    render() {
        // console.log(this.props.peers);
        return (
            <div>
                <h6 className="ui center aligned header">Remote Cameras</h6>
                <div id="remote-videos" className="ui stackable grid">
                    <div id="remote-video-div-1" className="four wide column">
                        {
                            !(this.props.peers[0]) ? 
                                <img className="ui centered medium image" src={image} alt=""/>    
                                :
                                <video id="remote-video-1" className="ui medium image" autoPlay playsInline/>
                        }
                    </div>

                    <div id="remote-video-2" className="four wide column">
                        {
                                !(this.props.peers[1]) ? 
                                    <img className="ui centered medium image" src={image} alt=""/>    
                                    :
                                    <video id="remote-video-2" className="ui medium image" autoPlay playsInline/>
                        }
                    </div>

                    <div id="remote-video-3" className="four wide column">
                        {
                            !(this.props.peers[2]) ? 
                                <img className="ui centered medium image" src={image} alt=""/>    
                                :
                                <video id="remote-video-3" className="ui medium image" autoPlay playsInline/>
                        }
                    </div>

                    <div id="remote-video-4" className="four wide column">
                        {
                            !(this.props.peers[3]) ? 
                                <img className="ui centered medium image" src={image} alt=""/>    
                                :
                                <video id="remote-video-4" className="ui medium image" autoPlay playsInline/>
                        }
                    </div>

                </div>
            </div>
        );
    }
}

export default RemoteCamera;