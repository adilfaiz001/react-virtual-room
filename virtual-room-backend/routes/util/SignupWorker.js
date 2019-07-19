/**
 * Signup Utility functions
 * 
 */

const config = require('../connection');
const sendgrid = require('sendgrid')(config.sendgridKey);

exports.SendVerificationEmail = (params) => {
    let username = params.username;
    let firstName = params.firstName;
    let lastName = params.lastName;
    let email = params.email;
    let verificationKey = params.key;

    return new Promise((resolve, reject) => {
        console.log("Returning Promise");
        const request = sendgrid.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: {
                personalizations: [
                    {
                        to: email,
                        subject: "Lattice Virtual Room Email Verification"
                    }
                ],
                from : {
                    email: 'adil.faiz@thelattice.in'
                },
                content: [
                    {
                        type: 'text/html',
                        value: "Welcome to the Lattice Video chat room service, your signup details are:<br/><br/> 1. Name : " 
                                + firstName +" "+ lastName + "<br/> 2. username : " 
                                +  username  + "<br/>Please click on the link to verify your email account "
                                + "<br><br><a href = '"+connection_config.approval_link+"api/login/approval/" + userID +"/"+ verification_key +"'>click here</a> to approve the user"
                    }
                ]
            }
        });
    
        sendgrid.API(request, (error, response) => {
            if(response.statusCode == 202) {
                console.log('email sent successfully');
                let sysDate = new Date().getTime();
                console.log(response.statusCode);
                resolve({
                    "success": 1,
                    "message": "Email Sent"
                });
            } else {
                console.log('Problem in sending the mail', response.statusCode);
                resolve({
                    "error": 1,
                    "message": "Problem sending email"
                });
            }
        });
    });
 }