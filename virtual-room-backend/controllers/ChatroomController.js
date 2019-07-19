const mongoose = require('mongoose');
const Chatroom = require('../models/ChatroomSchema');
const ChatroomInbox = require('../models/ChatroomInboxSchema');

exports.CreateNewRoom = (params) => {
    // console.log(params);

    return new Promise((resolve, reject) => {
        console.log("Creating Chatroom " + params.roomname + " by the user " + params.username);

        Chatroom.find({
            'chatroomName' : params.roomname
        }, (err, rows) => {
            if(rows.length !== 0 ) {
                console.log("ROOM EXISTS");
                resolve({
                    "state": 0,
                    "message": "ROOM EXISTS"
                });
            } else {
                let newRoom = new Chatroom({
                    chatroomId: params.chatroomId,
                    chatroomName: params.roomname,
                    createdOn: params.createdOn,
                    creatorUsername: params.username,
                    isActive: true
                });

                let members = new Array();
                members.push(params.username);

                let activeMembers = new Array();
                activeMembers.push(params.username);
                
                newRoom.members = members;
                newRoom.activeMembers = activeMembers;

                let newRoomInbox = new ChatroomInbox({
                    chatroomId: params.chatroomId,
                    chatroomName: params.roomname,
                });

                let message = new Array();
                message.push({
                    author: params.message.author,
                    body: params.message.body,
                    timestamp: params.message.timestamp
                });

                newRoomInbox.members = members;
                newRoomInbox.message = message;

                newRoom.save((err, chatroom) => {
                    if(err) {
                        resolve({
                            "state": 0,
                            "message": err
                        });
                    } else {
                        console.log("Room Created");
                        newRoomInbox.save((err, chatroomInbox) => {
                            if(err) {
                                resolve({
                                    "state": 0,
                                    "message": err
                                });
                            } else {
                                console.log("Chatroom Inbox Created");
                                resolve({
                                    "state": 1,
                                    "message": "Room Created Successfully"
                                });
                            }
                        });
                    }
                });
            }
        });
    });
}


exports.JoinRoom = (params) => { 
    // console.log(params);
    return new Promise((resolve, reject) => {
        Chatroom.find({
            'chatroomName' : params.roomname
        }, (err, rows) => {
            console.log(rows);

            if (rows.length !== 0) {
                
                let chatroomId = rows[0].chatroomId;
                let members = rows[0].members;
                let activeMembers = rows[0].activeMembers;

                if(!(members.includes(params.username))) {
                    members.push(params.username);
                    activeMembers.push(params.username);
                } else {
                    resolve({
                        "state": 1,
                        "message": "USER ALREADY JOINED"
                    })
                }

                Chatroom.update({chatroomId: chatroomId}, { members: members, activeMembers: activeMembers }, (err, room) => {
                    if(err) {
                        resolve({
                            "state": 0,
                            "message": err
                        });
                    } else {
                        ChatroomInbox.find({
                            'chatroomId': chatroomId
                        },(err, inbox) => {
                            if(err) {
                                resolve({
                                    "state": 0,
                                    "message": err
                                });
                            } else {
                                console.log(inbox);

                                let message = inbox[0].message;
                                let tempMsg = {
                                    author: params.username,
                                    body: `${params.username} joined room ${params.roomname}`,
                                    timestamp: new Date().toDateString
                                }
                                message.push(tempMsg);

                                ChatroomInbox.update(
                                    {chatroomId: chatroomId},
                                    {
                                        members: members,
                                        message: message
                                    },
                                    (err, doc) =>{
                                        if(err) {
                                            resolve({
                                                "state": 0,
                                                "message": err
                                            });
                                        } else {
                                            console.log("ROOM JOINED AND CHATINBOX UPDATED")
                                            resolve({
                                                "state": 1,
                                                "message": "ROOM AVAILABLE"
                                            });
                                        }
                                    }
                                );
                            }
                        });
                    }
                });
            } else {
                resolve({
                    "state": 0,
                    "message": "NO ROOM"
                });
            }
        });
    });
}


exports.BroadcastMessage = (params) => {
    // console.log(params);

    return new Promise((resolve, reject) => {
        ChatroomInbox.findOneAndUpdate(
            {chatroomName: params.roomname},
            {$push: {message:{
                author: params.message.username,
                body: params.message.message,
                postedOn: params.message.postedOn
            }}},
            {'new': true},
            (err, info) => {
                console.log(info);
                if(err) {
                    resolve({
                        "state":0,
                        "message": err
                    });
                } else {
                    resolve({
                        "state": 1,
                        "message": "CHAT UPDATED"
                    });
                }
            }
        );
    });
}


exports.GetRoomList = () => {

    return new Promise((resolve, reject) => {
        Chatroom.find(
            {
            'isActive' : true
            },
            {chatroomName: 1, members: 1, activeMembers: 1, creatorUsername: 1},
            (err, rows) => {
            if(rows.length !== 0) {
                // console.log('ROOMLIST NOT EMPTY');
                // console.log(rows);
                // console.log(rows);
                resolve({
                    'roomlist': rows
                });
            } else {
                resolve({
                    'roomlist': 0
                });
            }
        });
    });
}

exports.LeaveRoom = (params) => {
    let username = params.username;
    let roomname = params.roomname;

    return new Promise((resolve, reject) => {
        Chatroom.find({'chatroomName': roomname},{activeMembers: 1}, (err, rows) => {
            console.log(rows);
            if(rows.length !== 0) {

                let _id = rows[0]._id;
                let chatroomId = rows[0].chatroomId;
                let activeMembers = rows[0].activeMembers;

                let index = activeMembers.indexOf(username);

                if(index > -1) {
                    activeMembers.splice(index, 1);
                    if(activeMembers.length == 0) {
                        Chatroom.findByIdAndRemove(_id,(err) => {
                            if(err) {
                                resolve({
                                    "state": 0,
                                    "message": err
                                });
                            } else {
                                resolve({
                                    "state": 1,
                                    "message": "ROOM DELETED"
                                });
                            }
                        })
                    } else {
                        Chatroom.findByIdAndUpdate({_id: _id},{$set: {activeMembers: activeMembers}}, {'new': true}, (err,row) => {
                            console.log("Row: " + row);
                            if(err) {
                                resolve({
                                    "state": 0,
                                    "message": err
                                });
                            } else {
                                resolve({
                                    "state": 1,
                                    "message": "USER LEFT"
                                });
                            }
                        });
                    }
                } else {
                    console.log(`${username} NOT PRESENT IN ACTIVE MEMBERS OF ${roomname}`);
                }

            }
        })
    })
}