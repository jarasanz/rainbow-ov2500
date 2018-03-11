const password_min_length = 6;
const user_min_lenght = 6;
const OV2500 = "192.168.1.10";
const ovuser = "admin";
const ovpass = "switch";
const timeout_user = 1*60*1000 //miliseconds

// Load the password generator
let genpasswd = require('human-password');

// Load the SDK
let RainbowSDK = require('rainbow-node-sdk');

// Define Rainbow configuration
let options = {
    "rainbow": {
        "host": "openrainbow.com",     
    },
    "credentials": {
        "login": "rainbow.daneel@gmail.com",
        "password": "Daneel666_!"
    },
    //App identifier
    "application": {
        "appID": "",
        "appSecret": "",
    },
    // Logs options
    "logs": {
        "enableConsoleLogs": false,
        "enableFileLogs": false,
        "file": {
            "path": '/var/log/rainbowsdk',
            "level": 'debug'
        }
    },
    // IM options
    "im": {
        "sendReadReceipt": true
    }
};

// Load request module for REST communication with OV2500
// and configure the default options for REST
let request = require('request');
request = request.defaults(
    {
        strictSSL: false,
        jar: true,
        followAllRedirects:true,
        json: true
    }
);

///////////////////////////////////////////////////////////////////////////////
// Let's login in OV2500
function loginOV2500(IPaddress, userName, password, callback){
    
    let out = {error:0, info:""}
    let body_request = {"userName": userName, "password": password};
    
    let options = {
        url: 'https://'+IPaddress+'/api/login',
        body: body_request
    }
    request.post(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
//            console.log(body);
            out.error = 200
            out.info = body
            callback(out);
            
        }
        else {
//            console.log(error)
//            console.log(response.statusCode);
//            console.log(body);
            out.error = error;
            out.info = response;
            callback(out)
        }
    });
};

///////////////////////////////////////////////////////////////////////////////
// Let's logout from OV2500
function logoutOV2500(IPaddress, callback){
    
    let out = {error:0, info:""}
    
    let options = {
        url: 'https://'+IPaddress+'/api/logout',
    }
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
//            console.log(body);
            out.error = response.statusCode
            out.info = body
            callback(out);
            
        }
        else {
//            console.log(error)
//            console.log(response.statusCode);
//            console.log(body);
            out.error = error;
            out.info = response;
            callback(out)
        }
    });
};

///////////////////////////////////////////////////////////////////////////////
// Let's add a user (Employee Account) to OV2500 Local DataBase
function addUserOV2500LocalDB(IPaddress, user, callback){

    let out = {error:0, info:""}
    let body_request = {
        password: user.Password,
        repeat: user.Password,
        username: user.Username
    };
    
    let options = {
        url: 'https://'+IPaddress+'/api/ham/userAccount/addUser',
        body: body_request
    }
    request.post(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
//            console.log(body);
            out.error = response.statusCode
            out.info = body
            callback(out);
            
        }
        else {
//            console.log(error)
//            console.log(response.statusCode);
//            console.log(body);
            out.error = error;
            out.info = response;
            callback(out)
        }
    });
};

///////////////////////////////////////////////////////////////////////////////
// Let's add a user (Employee Account) to OV2500 Local DataBase
// Will do LOGIN + ADDUSER + LOGOUT
function addUser(newuser, callback){

    let loginstatus;
    let OVmsg = "";
    loginOV2500(OV2500, ovuser, ovpass, function(loginstatus){
        if (loginstatus.info.message.includes("success")) {
            
//            console.log(loginstatus.info);        
            addUserOV2500LocalDB(OV2500, newuser, function(result){
                logoutOV2500(OV2500, function(loginstatus){
//                console.log(loginstatus)
                });
                callback(result);
                
            });
        }
    });
};


///////////////////////////////////////////////////////////////////////////////
// Reset user object
function resetNewUser(newuser, callback){
    newuser = {
        userreceivedcount: 0,
        Username: "",
        Password: "",
        Telephone: "",
        Email: "",
        ARP: "",
        PolicyList: "",
        FullName: "",
        Department: "",
        Position: "",
        Description: "",
    };
    callback(newuser);
};


// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// Start the SDK
rainbowSDK.start();

let newuser = {
    userreceivedcount: 0,
    Username: "",
    Password: "",
    Telephone: "",
    Email: "",
    ARP: "",
    PolicyList: "",
    FullName: "",
    Department: "",
    Position: "",
    Description: "",
};

rainbowSDK.events.on('rainbow_onmessagereceived', function(message) {
    // test if the message comes from a bubble of from a conversation with one participant
    let sendToJid;
    let msg = "";
    let formatted_msg={"type": "text/markdown", "message": msg}
    
    if(message.type == "groupchat") {
        // Send the answer to the bubble
        //messageSent = rainbowSDK.im.sendMessageToBubbleJid('The message answer 1', message.fromBubbleJid);
        // Send the answer to the user directly
        //messageSent = rainbowSDK.im.sendMessageToJid('The message answer 2', message.fromJid.split("/")[1]);
        
        // ALWAYS send the message to user directly
        sendToJid = message.fromJid.split("/")[1];

//        console.log(message.fromBubbleJid);
//        console.log(message.fromJid);
//        console.log(message.content);
    }
    else {
        // send the answer to the user directly otherwise
        //messageSent = rainbowSDK.im.sendMessageToJid('The message answer', message.fromJid);
        
        // ALWAYS send the message to user directly
        sendToJid = message.fromJid;

//        console.log(message.fromBubbleJid);
//        console.log(message.fromJid);
//        console.log(message.content);
    }
    
    switch (message.content.slice(0,2)) {
        case "c:":
        case "C:":
            // received Cancel operation
            msg = "Ok, canceling adding a user for WLAN access."
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
            resetNewUser(newuser, function(newuser){});
            break;
        case "u:":
        case "U:":
            // received the Username
            // Check username length
            if (message.content.length < user_min_lenght) {
                msg = "Username too short... should be at least " + user_min_lenght + " characters.";
                messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid);
                break;
            }
            if (newuser.userreceivedcount == 0){
                newuser.Username = message.content.split(":")[1];
                newuser.userreceivedcount++;
                msg = "Ok, I've the UserName: **" + newuser.Username + "**.";
                messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", {"type": "text/markdown", "message": msg});
                // Start a timer 
//                setTimeout(resetNewUser(newuser, function(newuser){
//                    msg = "Add user process **timeout**. `Operation Cancelled.`";
//                    formatted_msg.message = msg;
//                    messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
//                }), timeout_user);
                setTimeout(function(){
                    msg = "Add user process **timeout**. `Operation Cancelled.`";
                    formatted_msg.message = msg;
                    messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);                
                    resetNewUser(newuser, function(newuser){});
                }, timeout_user);
            }
            else {
                msg = "The user is **" + newuser.Username + "**. Now I need the password `(p:<password>/p:w/p:s)` . Or If want to cancel send me `c:` `(h: for help)`, or just forget it... **time heals almost everything...**";
                formatted_msg.message = msg;
                messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
                newuser.userreceivedcount++
            }
            break;
        
        case "h:":
        case "H:":
            // Help
            msg = "I can add a new user in OV2500 for WLAN 802.1x SSID. You can send me the `UserName with u:<username> (u:user1)`, then the `password with p:<password> (p:password1)` , or just let me generate a password for you with `p:w` (weak password, suited for you, humans), or `p:s` (strong password, mainly dedicated to positronic robots, like me, or paranoid humans)";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
            break;
            
        case "p:":
        case "P:":
            // received the Password
            if (newuser.Username == "") {
                msg = "Need to know the Username first... please use `u:<username>`, so I can receive it.";
                formatted_msg.message = msg;
                messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
                break;
            }
            if (message.content.length == 3){
                // generate the password
                if (message.content.endsWith("w")){
                    newuser.Password = genpasswd();
                }
                else if (message.content.endsWith("s")) {
                    newuser.Password = genpasswd({
                        couples: 5,
                        digits: 4,
                        randomUpper: true,
                        numberPosition: 'random'});
                }
                else {
                    msg = "I'd like to say that I didn't express myself clearly, but taking into account I'm a robot with a positronic brain, probably it's your fault... If you want me to generate a password, options are `p:w` or `p:s`";
                    formatted_msg.message = msg;
                    messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
                    break;
                }
            }
            else if (message.content.split(":")[1].length < password_min_length) {
                msg = "Password too short... should be at least " + password_min_length + " characters";
                messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid);
                break;
            }
            else {
                // Password defined by user
                newuser.Password = message.content.split(":")[1];
                msg = "Ok, now I've user and password, will add the user in UPAM...";
                formatted_msg.message = msg;
                messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
            }

            // call addUser function
            addUser(newuser, function(result){
                switch (result.info.errorCode){
                    case 0:
                        // Everything OK
                        OVmsg = result.info.translated.resultTranslated;
                        msg = "The user **" + newuser.Username + "**, with password **" + newuser.Password + "**, has been successfully added to OV2500-UPAM, use can now access to SSID with 802.1X TOP security.";
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
                        msg = "**UPAM info:** `" + OVmsg + "`";
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
                        resetNewUser(newuser, function(newuser){});
                        break;
                    case -1:
                        // Something went wrong
                        OVmsg = result.info.errorMessageTranslated;
                        msg = "Add user `**FAILED**`..."
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
                        msg = "**UPAM info:** `" + OVmsg + "`";
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, sendToJid, "en", formatted_msg);
                        resetNewUser(newuser, function(newuser){});
                        break;
                }
            });
            break;
    };
});

