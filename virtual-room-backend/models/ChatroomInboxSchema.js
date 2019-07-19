var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ChatroomInbox = new Schema({
    chatroomId: {type: String, required: true, unique: true },
    chatroomName: {type: String, required: true },
    members: { type: Array },
    message: [{ 
        author: String,
        body: String,
        timestamp: String,
    }]
});

var Inbox = mongoose.model("user-inbox", ChatroomInbox);

module.exports = Inbox;