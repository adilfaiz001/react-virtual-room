/**
 * 
 */


 module.exports = {

    db : {
        success : "DB connected",
        error : "Unable to connect to the DB. Try again"
    },
    username : {
        success : "username available",
        error : "username is already used."
    },
    password : {
        success : "Password changed",
        error : {
            length :    "Password needs be to 8 characters in length.",
            empty :     "Please enter your password.",
            incorrect:  "Sorry old password is incorrect."
        }
    },
    email : {
        success : "Email is correct",
        error : {
            valid :  "Please enter a valid email address",
            empty : "Please enter your email address"
        }

    },
    user : {
        success : "User with this mobile exits",
        error : "This mobile number is not registered. Do you want to create a new account?"
    },
    signup : {
        success : "Thank you for registering, your account will be activated shortly.",
        error : {
                phone : "This mobile number is already registered",
                email : "This e-mail ID is already registered"
        }
    },
    login : {
        success : "Login Successfully",
        error : "Wrong Password"
    }
 }