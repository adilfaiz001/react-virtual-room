import React, { Component } from "react";

class ChatContent extends Component {
    render() {
        let message = this.props.message;
        return (
            <div className="chat-messages">
                <p>{message.username}</p>
                <p>{message.message}</p>
                <p>{message.postedOn}</p>
            </div>
        )
    }
}

export default ChatContent;