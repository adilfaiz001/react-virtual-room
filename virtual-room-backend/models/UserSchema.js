var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
  user_details: {
    user_id: { type: String, required: true, unique: true },
    first_name: String,
    last_name: String,
    username: { type: String, required: true, unique: true },
    email : String
  },

  user_master : { 
      user_id : { type: String, required: true, unique: true },
      password : String,
      salt : String,
      isEmailVerified : { type: Boolean, default: false},
      emailVerificationKey : String,
      createdOn : String,
      updatedOn: { type: String, default: null }
  }
});

var User = mongoose.model("users", userSchema);


module.exports = User;