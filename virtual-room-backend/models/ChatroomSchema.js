var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatroomSchema = new Schema({
    chatroomId: { type: String, required: true, unique: true },
    chatroomName: { type: String, required: true },
    createdOn: String,
    creatorUsername: { type: String, required: true },
    members: {type: Array },
    activeMembers: {type: Array},
    isActive: {type: Boolean, default: false }
});

var Chatroom = mongoose.model("chatrooms", ChatroomSchema);

module.exports = Chatroom;