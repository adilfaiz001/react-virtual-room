import React, { Component } from "react";
import './style/ChatTemplate.css';

class ChatTemplate extends Component {
    constructor() {
        super();
        this.state ={
            messages : [],
            InputMessage : null
        };
        this.setMessage = this.setMessage.bind(this);
    }

    componentDidMount() {
        this.scrollToBottom();
    }

    componentDidUpdate() {
        this.scrollToBottom();
    }

    handleSender = () => {
        if(this.refs.messageInput.value !== '') {
            this.props.OnSelectMessage(this.state.InputMessage);
            this.refs.messageInput.value = '';
            this.setState({
                InputMessage: ''
            });
            this.scrollToBottom();
        }
    }

    handleKeySender = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            this.handleSender();
        }
    }

    setMessage = (message) => {
        this.setState({
            InputMessage: message
        });
    }

    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({behavior: "smooth"});
    }

    render() {
        // console.log(this.props.room);
        let message = this.props.message;
        let username = this.props.username;
        // console.log(this.props.username);
        return (
            <div className="chat-template">
                <h3 className="ui blue header">Room ID -> <strong>{this.props.room}</strong></h3>
                <hr/>
                <div className="ui-form">
                    <div className="ui field">
                        <textarea id="post-message" name="post-message" rows="1" onInput={(e) => this.setMessage(e.target.value)} onKeyDown={(e) => this.handleKeySender(e)} ref="messageInput"></textarea>
                    </div>
                    <div id="post-btn" className="ui primary submit button" onClick={e => this.handleSender()}>Send</div>
                </div>

                <div id="chat-content" className="ui feed" style={{height:"150px",overflowY:"scroll"}}>
                    <ul>
                        {
                            message.map(function(msg, index){
                                if(msg.type === 1) {
                                    return <li key={ index }>
                                                {
                                                    (msg.username === username) ?
                                                        <div id="left-box">
                                                            <p><span id="username">{msg.username}</span></p>
                                                            <div id="message-box"><p id="message">{msg.message}</p><p id="date">{msg.postedOn}</p></div>
                                                        </div>
                                                        :
                                                        <div id="right-box">
                                                            <p id="username"><span>{msg.username}</span></p>
                                                            <div id="message-box"><p id="message">{msg.message}</p><p id="date">{msg.postedOn}</p></div>
                                                        </div>
                                                }
                                            </li>;
                                }
                                else {
                                    return <li key={index}>
                                        <p id="type-2">{msg.username} {msg.message}</p>
                                    </li>
                                }
                            })
                        }
                        </ul>
                        <div style={{float:"left", clear:"both"}}
                            ref={(el) => {this.messagesEnd = el;}}></div>   
                </div>
            </div>
        );
    }

}

export default ChatTemplate;