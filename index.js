const password_min_length = 6;
const user_min_lenght = 6;
const badpassword_limit_1 = 3; // How many times the user enters a bad password
const badpassword_limit_2 = 6;

// **************** ANONYMIZE START *******************
const rainbowLoginUser = "fake_rainbow_account@gmail.com";
const rainbowLoginPass = "fake_rainbow_password";
const rainbowappID = "rainbowappID_provided_by_Rainbow";
const rainbowappSecret = "rainbowappSecret_provided_by_Rainbow";
const origin_number = "plivio_origin_phone";
const plivoauthID = "plivoauthID_provided_by_Plivio";
const plivoauthToken = "plivoauthToken_provided_by_Plivio";
const emailUser = "mail.account@gmail.com";
const emailPass = "mail_password";
//
const OV2500 = "192.168.1.15";
const ovport = "443";
const ovuser = "admin";
const ovpass = "switch";
//

// **************** ANONYMIZE END *******************

const timeout_user = 1*60*1000 //miliseconds

// rainbowUser status
const NEW_TRANSACTION = 1;
const USERNAME_RECEIVED = 2;


// Load async... the Salvation module in Node.js
let asyn = require('async');

// Load the password generator
let genpasswd = require('human-password');

// Load the Rainbow SDK
let RainbowSDK = require('rainbow-node-sdk');

// Define Rainbow configuration
let options = {
    "rainbow": {
        "host": "openrainbow.com",     
    },
    "credentials": {
        "login": rainbowLoginUser,
        "password": rainbowLoginPass
    },
    //App identifier
    "application": {
        "appID": rainbowappID,
        "appSecret": rainbowappSecret,
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

// Load Plivio SMS API module
let phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance()
        , PNT = require('google-libphonenumber').PhoneNumberType;
let plivo = require('plivo');
let plivoClient = new plivo.Client(plivoauthID, plivoauthToken);

// Load email module
let nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});


// Load got module for REST communication with OV2500
// and configure the default options for REST
//const got = require('got');
//const {CookieJar} = require('tough-cookie');
//let cookieJar = new CookieJar();
//let restclient = got.extend(
//    {
//        rejectUnauthorized: false,
//        cookieJar: cookieJar
//    }
//);


// Load request module for REST communication with OV2500
// and configure the default options for REST
let restclient = require('request');
restclient = restclient.defaults(
    {
        strictSSL: false,
        jar: true,
        followAllRedirects:true,
        json: true
    }
);




///////////////////////////////////////////////////////////////////////////////
// Let's login in OV2500
function loginOV2500(IPaddress, port, userName, password, callback){
    
    let out = {error:0, info:""}
    let loginUser = {"userName": userName, "password": password};
    let url = 'https://'+IPaddress+':'+port+'/api/login';
    
//    (async () => {
//        try {
//            let response = await restclient.post(url, {json:loginUser});
//            out.error = response.statusCode;
//            out.info = JSON.parse(response.body);
//            callback(out);
//            
//        } catch (error) {
//            console.log("**********");
//            console.log("ERROR !!!")
//            console.log(error);
//            out.error = error;
//            out.info = error.HTTPError;
//            callback(out);
//        }

//    }) ();
    
    let options = {
        url: url,
        body: loginUser
    }
    console.log("REST call to OV Login API...");
    restclient.post(options, function(error, response, body) {
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
function logoutOV2500(IPaddress, port, callback){
    
    let out = {error:0, info:""}
    let url = 'https://'+IPaddress+':'+port+'/api/logout';
    
//    // got
//    (async () => {
//        try {
//            let response = await restclient.get(url);
//            out.error = response.statusCode;
//            out.info = JSON.parse(response.body);
//            callback(out);
//            
//        } catch (error) {
//            console.log("**********");
//            console.log("ERROR !!!")
//            console.log(error);
//            out.error = error;
//            out.info = error.HTTPError;
//            callback(out);
//        }

//    }) ();
    
    //request 
    let options = {
        url: url,
    }
    
    restclient.get(options, function(error, response, body) {
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
function addUserOV2500LocalDB(IPaddress, port, user, callback){

    let out = {error:0, info:""}
    let bodyRequest = {
        password: user.password,
        repeat: user.password,
        username: user.username
    };
    let url = 'https://'+IPaddress+':'+port+'/api/ham/userAccount/addUser';
    
//    // got
//    (async () => {
//        try {
//            let response = await restclient.post(url, {json: bodyRequest});
//            out.error = response.statusCode;
//            out.info = JSON.parse(response.body);
//            callback(out);
//            
//        } catch (error) {
//            console.log("**********");
//            console.log("ERROR !!!")
//            console.log(error);        
//            out.error = error;
//            out.info = error.HTTPError;
//            callback(out);
//        }

//    }) ();

    // request
    let options = {
        url: url,
        body: bodyRequest
    }    
    restclient.post(options, function(error, response, body) {
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
// Get the list of current users (Employee Account) in OV2500 Local DataBase
function getAllAccountList(IPaddress, port, callback){

    let out = {error:0, info:""}
    let url = 'https://'+IPaddress+':'+port+'/api/ham/userAccount/getAllAccountList';
    
    // got
//    (async () => {
//        try {
//            let response = await restclient.get(url);
//            out.error = response.statusCode;
//            out.info = JSON.parse(response.body);
//            callback(out);
//            
//        } catch (error) {
//            console.log("**********");
//            console.log("ERROR !!!")
//            console.log(error);        
//            out.error = error;
//            out.info = error.HTTPError;
//            callback(out);
//        }

//    }) ();
    
    // request
    let options = {
        url: url,
    }    
    restclient.get(options, function(error, response, body) {
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
// Let's remove a user (Employee Account) from OV2500 Local DataBase
function deleteAccount(IPaddress, port, userId, callback){

    let out = {error:0, info:""}
    let delAccountList = []
    delAccountList.push(userId);
   
    let url = 'https://'+IPaddress+':'+port+'/api/ham/userAccount/deleteAccount';
    let bodyRequest;
    bodyRequest = delAccountList;
    
    // got
//    (async () => {
//        try {
//            let response = await restclient.post(url, {json: bodyRequest});
//            out.error = response.statusCode;
//            out.info = JSON.parse(response.body);
//            callback(out);
//            
//        } catch (error) {
//            console.log("**********");
//            console.log("ERROR !!!")
//            console.log(error);        
//            out.error = error;
//            out.info = error.HTTPError;
//            callback(out);
//        }

//    }) ();
    
    // request
    let options = {
        url: url,
        body: bodyRequest
    }
    restclient.post(options, function(error, response, body) {
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
function addUser(OVuser, callback){

    let loginstatus;

    loginOV2500(OV2500, ovport, ovuser, ovpass, function(loginstatus){
        if (loginstatus.info.message.includes("success")) {
            
//            console.log(loginstatus.info);        
            addUserOV2500LocalDB(OV2500, ovport, OVuser, function(result){
                logoutOV2500(OV2500, ovport, function(loginstatus){
//                console.log(loginstatus)
                });
                callback(result);
                
            });
        }
    });
};


///////////////////////////////////////////////////////////////////////////////
// Let's delete a user (Employee Account) from OV2500 Local DataBase
// Will do LOGIN + LISTUSERS + DELUSER + LOGOUT
function delUser(userId, callback){

    let loginstatus;
    
    loginOV2500(OV2500, ovport, ovuser, ovpass, function(loginstatus){
        if (loginstatus.info.message.includes("success")) {
            deleteAccount(OV2500, ovport, userId, function(result){
//                console.log(result.info);
                logoutOV2500(OV2500, ovport, function(loginstatus){
                    callback(result);
                });
            });
        };
    });
};


///////////////////////////////////////////////////////////////////////////////
// Let's search the user (Employee Account) in OV2500 Local DataBase
// Will do LOGIN + LISTUSERS + (find user) + LOGOUT
// callback with userId or false if not found
function findAccount(OVuser, callback){

    let loginstatus;
    let userId = false;
    let i = 0;
    let userListLength = 0;
    
    console.log("Entering findAccount...");
    loginOV2500(OV2500, ovport, ovuser, ovpass, function(loginstatus){
//        console.log("**********");
//        console.log("loginstatus:", loginstatus);
        if (loginstatus.info.message.includes("success")) {
            getAllAccountList(OV2500, ovport, function(result){
//                console.log(result.info.data);
                logoutOV2500(OV2500, ovport, function(loginstatus){
                    asyn.detect(result.info.data, function(item, callback){
                            if (item.username.includes(OVuser.username)) {
                                userId = item.id;
                            }
                            callback(null,true);
                        },
                        function(err, result){
                            
                        }
                    );
                    callback(userId);
                });
            });
        };
    });
};

///////////////////////////////////////////////////////////////////////////////
// Reset user object
function resetNewUser(OVuser){
    OVuser = {
        userreceivedcount: 0,
        badpasswordscount: 0,
        username: "",
        password: "",
        Telephone: "",
        Email: "",
        ARP: "",
        PolicyList: "",
        FullName: "",
        Department: "",
        Position: "",
        Description: "",
    };
    return OVuser;
};


///////////////////////////////////////////////////////////////////////////////
// Instantiate a new Rainbow User to store the STATUS along the transaction
function newRainbowUser(sendToJid){
    rainbowUser = {
        id: sendToJid,
        status: NEW_TRANSACTION,
        OVuser: {},
    };
    return rainbowUser
};


///////////////////////////////////////////////////////////////////////////////
// Clear Rainbow User
function clearRainbowUser(){
    rainbowUser = {
        id: "",
        status: NEW_TRANSACTION,
        OVuser: {},
    };
    return rainbowUser
};


///////////////////////////////////////////////////////////////////////////////
// Removes a Rainbow User from the list of Users with a Past
function removeRainbowUser(rainbowUsers, rainbowUser){
    
    let j = -1;
    j = rainbowUsers.findIndex(function(element, index, array){
        if (element.id == rainbowUser.id) {
            // Found in this element
            return true
        }
        else {
            // This element is not, let's move on
            return false
        }
    });
    if (j != -1) {
        rainbowUsers.splice(j,1);
    }
    return rainbowUsers;
}


///////////////////////////////////////////////////////////////////////////////
// Updates a Rainbow User with information about the OV users
function updateRainbowUser(rainbowUsers, rainbowUser){
    
    let j = -1;
    j = rainbowUsers.findIndex(function(element, index, array){
        if (element.id == rainbowUser.id) {
            // Found in this element
            return true
        }
        else {
            // This element is not, let's move on
            return false
        }
    });
    if (j != -1) {
        rainbowUsers[j] = rainbowUser;
    }
    return rainbowUsers;
}


//*****************************************************************************
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// MAIN


// Instantiate the SDK
let rainbowSDK = new RainbowSDK(options);

// Start the SDK
rainbowSDK.start();

let OVuser = {
    userreceivedcount: 0,
    badpasswordscount: 0,
    username: "",
    password: "",
    Telephone: "",
    Email: "",
    ARP: "",
    PolicyList: "",
    FullName: "",
    Department: "",
    Position: "",
    Description: "",
};
let cronos; // variable for setTimeout()
let userId;

let rainbowUsers = [];
let rainbowUser = {};




rainbowSDK.events.on('rainbow_onmessagereceived', function(message) {
    // test if the message comes from a bubble of from a conversation with one participant
    let sendToJid;
    let msg = "";
    let formatted_msg = {"type": "text/markdown", "message": msg};
    
    console.log(message);
    
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
    
    console.log(sendToJid);
    // Check if the user has a PAST (aka STATUS)
    let j = -1;
    j = rainbowUsers.findIndex(function(element, index, array){
        if (element.id == sendToJid) {
            // User has a past
            console.log("User with PAST");
            return true
        }
        else {
            // User is new or is starting a new conversation
            return false
        }
    });
    
    if (j == -1) {
        // NEW user or NEW transaction
        rainbowUser = newRainbowUser(sendToJid);
        console.log("New Transaction...")
    }
    else {
        rainbowUser = rainbowUsers[j];
        console.log("Recovering STATUS for user...", rainbowUser.id)
    }
    
    
    switch (message.content.slice(0,2)) {
    
        default:
            
                    
            //help
            msg = "I can add users to OmniVista for WLAN 802.1x authentication. Just send me one of the followin options:";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            msg = "**- u:username** for sending me the username (u:Psychohistory).";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            msg = "**- p:password** for sending me the password, once I have the username (p:Psycopassword).";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            msg = "**- p:w** I will generate a weak password for you, suited for human brains.";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            msg = "**- p:s** I will generate a strong password for you, suited for positronic robots, like me, or paranoid humans.";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            msg = "**- m:mobile** I will generate a weak password and send user credentials by SMS to user.";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            msg = "**- d:username** I will delete the user account from OmniVista database.>";
//            msg = "I can add a new user in OV2500 for WLAN 802.1x SSID. You can send me the `UserName with u:<username> (u:user1)`, then the `password with p:<password> (p:password1)` , or just let me generate a password for you with `p:w` (weak password, suited for you, humans), or `p:s` (strong password, mainly dedicated to positronic robots, like me, or paranoid humans).";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);

            break;
    
    
        case "c:":
        case "C:":
            // received Cancel operation
            
            if (rainbowUser.status == USERNAME_RECEIVED){
                // Let's cancel
                msg = "Ok, canceling adding a user for WLAN access."
                formatted_msg.message = msg;
                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                
                rainbowUsers = removeRainbowUser(rainbowUsers, rainbowUser);
                
            }
            else {
                // nothing to cancel...
                msg = "There is nothing to cancel..."
                formatted_msg.message = msg;
                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                
            }

            break;
            
        case "u:":
        case "U:":
            // received the username
            console.log("New username received...")
            // Check the STATUS of the rainbow user and see if it's a NEW Transaction
            if (rainbowUser.status == USERNAME_RECEIVED){
                // pretty rare... the USERNAME was already received... OLD Transaction
                msg = "The user is **" + rainbowUser.OVuser.username + "**. Now I need the password `(p:<password>/p:w/p:s)` . Or if you want to cancel, send me `c:` `(h: for help)`, or just forget it... **time heals almost everything...**";
                formatted_msg.message = msg;
                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                
            }
            else {
                // NEW TRANSACTION
                
                // Check username length
                if (message.content.length < user_min_lenght) {
                    msg = "Username too short... should be at least " + user_min_lenght + " characters.";
                    formatted_msg.message = msg;
                    messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                    rainbowUser = clearRainbowUser();
                    
                    break;
                }
                else {
                    // NEW TRANSACTION and VALID USERNAME
                    OVuser = resetNewUser(OVuser);
                    OVuser.username = message.content.split(":")[1];
                    console.log("New Transaction and VALID username...");
                    findAccount(OVuser, function(userId){
                        if (userId != false){
                            // User in OV
//                            console.log("User in OV");
                            msg = "UserName: **" + OVuser.username + "**, already exists in OV2500. **Cancelling**... `Please use other username`.";
                            formatted_msg.message = msg;
                            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                            OVuser = resetNewUser(OVuser);
                            rainbowUser = clearRainbowUser();
                            
                        }
                        else {
                            // User NOT in OV
//                            console.log("User not in OV")
                            msg = "Ok, I've the UserName: **" + OVuser.username + "**. Now I need the password...";
                            formatted_msg.message = msg;
                            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                            rainbowUser.status = USERNAME_RECEIVED;
                            rainbowUser.OVuser = OVuser;
                            rainbowUsers.push(rainbowUser);
                            
                            // START TIMEOUT
                            // start time to forget the last user introduced, if no password is provided in timeout_user
                            cronos = setTimeout(function(rainbowUsers, rainbowUser){
//                                console.log("Timeout.");
//                                console.log("RainbowUsers:", rainbowUsers);
//                                console.log("RainbowUser:", rainbowUser);
                                msg = "********************************"
                                formatted_msg.message = msg;
                                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                                msg = "Add user process **timeout**. **`Operation Cancelled.`**";
                                formatted_msg.message = msg;
                                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                                rainbowUser.OVuser = resetNewUser(rainbowUser.OVuser);
                                
                                console.log("Timeout for: ", rainbowUser.id);
                                console.log("Clearing information about Rainbow user STATUS...")
                                rainbowUsers = removeRainbowUser(rainbowUsers, rainbowUser);
                                rainbowUser = clearRainbowUser();
                                
                                
                            }, timeout_user, rainbowUsers, rainbowUser);
                            
                        }
                    });
                }
            }
            break;

        case "h:":
        case "H:":
            // Help
            msg = "I can add a new user in OV2500 for WLAN 802.1x SSID. You can send me the `UserName with u:<username> (u:user1)`, then the `password with p:<password> (p:password1)` , or just let me generate a password for you with `p:w` (weak password, suited for you, humans), or `p:s` (strong password, mainly dedicated to positronic robots, like me, or paranoid humans).";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            msg = "With **m:mobile** I will add the user the OmniVista and send an SMS with the credentials `m:<mobile> (m:+346XXXXXXXX)`";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            msg = "I can also delete users, send the Username with `d:<username> (d:user12)`";
            formatted_msg.message = msg;
            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            
            break;
            
        case "p:":
        case "P:":
            // received the password
            
            if (rainbowUser.status == USERNAME_RECEIVED){
                // Ok, perfect!!! I have the username

                if (message.content.length == 3){
                // Daneel to generate the password
                    if (message.content.endsWith("w")){
                        rainbowUser.OVuser.password = genpasswd({
                            couples: 3,
                            digits: 2,
                            randomUpper: false,
                            numberPosition: 'end'});
                    }
                    else if (message.content.endsWith("s")) {
                        rainbowUser.OVuser.password = genpasswd({
                            couples: 5,
                            digits: 4,
                            randomUpper: true,
                            numberPosition: 'random'});
                    }
                    else {
                        msg = "I'd like to say that I didn't express myself clearly, but taking into account I'm a robot with a positronic brain, probably it's your fault... If you want me to generate a password, options are `p:w` or `p:s`";
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                        break;
                    }
                }
                else if (message.content.split(":")[1].length < password_min_length) {
                    // Password defined by user... but too short
                    msg = "Password too short... should be at least **" + password_min_length + "** characters";
                    formatted_msg.message = msg;
                    messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                    break;
                }
                else {
                // Password defined by user
                    rainbowUser.OVuser.password = message.content.split(":")[1];
                    msg = "Ok, now I have user and password, will add the user in UPAM...";
                    formatted_msg.message = msg;
                    messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                }
                
                
            }
            else {
                // Hmmmm, password received... but need USERNAME FIRST !!!
                if (rainbowUser.OVuser.badpasswordscount < badpassword_limit_1){
                    // If user sends some passwords without username, let's advice
                    msg = "Need to know the username first... please use `u:<username>` before sending the password, so I can receive the username, and continue...";
                    formatted_msg.message = msg;
                    messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                    rainbowUser.OVuser.badpasswordscount++;
                }
                else if (OVuser.badpasswordscount < badpassword_limit_2){
                    msg = "Probably it's a good idea to review the Help... Just enter `h: for help`";
                    formatted_msg.message = msg;
                    messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                    rainbowUser.OVuser.badpasswordscount++;
                }
                else {
                    msg = "As a positronic robot, I, sincerelly, can't understand you... Why not using the help? (`h: for help`)";
                    formatted_msg.message = msg;
                    messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                    rainbowUser.OVuser.badpasswordscount++;
                }
                rainbowUsers = updateRainbowUser(rainbowUsers, rainbowUser)
                break;
                
                
            };
            
            // call addUser function
            
            // Clear the timeout
            clearTimeout(cronos);
            
            // Add the user to OV2500-UPAM
            addUser(rainbowUser.OVuser, function(result){
                switch (result.info.errorCode){
                    case 0:
                        // Everything OK
                        console.log("UPAM Employee User Added: ",result);
                        if (result.info.errorCode == 0){
//                            OVmsg = result.info.result;
                            OVmsg = result.info.translated.resultTranslated;
                        }
                        else {
                            OVmsg = result.info.translated.resultTranslated;
                        }
                        
                        msg = "The user **" + rainbowUser.OVuser.username + "**, with password **" + rainbowUser.OVuser.password + "**, has been successfully added to OV2500-UPAM, user can now safely access to SSID with 802.1X security.";
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                        msg = "**UPAM info:** `" + OVmsg + "`";
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                        
                        rainbowUsers = removeRainbowUser(rainbowUsers, rainbowUser);
                        rainbowUser = clearRainbowUser();
                        
                        break;
                    case -1:
                        // Something went wrong
                        OVmsg = result.info.errorMessageTranslated;
                        msg = "Add user `**FAILED**`..."
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                        msg = "**UPAM info:** `" + OVmsg + "`";
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                        
                        rainbowUsers = removeRainbowUser(rainbowUsers, rainbowUser);
                        rainbowUser = clearRainbowUser();
                        
                        break;
                }
            });
            break;
            
        case "d:":
        case "D:":
            // Delete user
            if (message.content.length < 2){
                // just received d: or D:
                msg = "Need the username to delete... Please use `d:<username>` (d:user1)";
                formatted_msg.message = msg;
                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
            }
            else {
                // Could be a valid userName
                OVuser.username = message.content.split(":")[1];
                                
                findAccount(OVuser, function(userId){
//                    console.log("userId:",userId);
                    if (userId != false){
                        // User in OV
//                        console.log("User in OV");
                        delUser(userId, function(result){
                            console.log("UPAM Delete Employee User:", result);
//                            if (result.info.errorCode == 0){ // for use with OV2500 Enterprise
                            if ( result.info.statusCode == 0 || result.info.errorCode == 0 ){ //for user with OV-Cirrus
                                // User deleted
                                OVmsg = result.info.translated.resultTranslated;
                                msg = "User **" + OVuser.username + ", successfully deleted** in OV2500 DataBase.";
                                formatted_msg.message = msg;
                                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                                msg = "**UPAM info:** `" + OVmsg + "`";
                                formatted_msg.message = msg;
                                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                            }
                            else {
                                // Some error... probably a race condition
                                // someone could delete the user in OV2500 before use
                                msg = "Upps... it seems someone else deleted the user...";
                                formatted_msg.message = msg;
                                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                            };
                        });
                    }
                    else {
//                        console.log("User not in OV")
                        msg = "User **" + OVuser.username + "**, not in OV2500 DataBase... Could not generate Entropy from Entropy...";
                        formatted_msg.message = msg;
                        messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                    }
                });
            };
//            OVuser = resetNewUser(OVuser);
            break;
            
        case "m:":
        case "M:":
            // mobile phone provided
                console.log("Mobile option received...");
                console.log("Received:"+message.content);
                // Check mobile phone length
                try {
                    let mobile = phoneUtil.parse(message.content.split(":")[1]);
                    console.log("Phone Number recieved:" + phoneUtil.format(mobile));
                    console.log("isValidNumber:"+phoneUtil.isValidNumber(mobile));
                    console.log("getNumberType:"+phoneUtil.getNumberType(mobile));
                    console.log("Prueba:"+((phoneUtil.isValidNumber(mobile)) && (phoneUtil.getNumberType(mobile) == PNT.MOBILE)));
                    if ( (phoneUtil.isValidNumber(mobile)) && (phoneUtil.getNumberType(mobile) == PNT.MOBILE) ) {
                    
                        // NEW TRANSACTION and VALID mobile phone
                        console.log("Valid mobile phone!");
                        OVuser = resetNewUser(OVuser);
                        OVuser.username = message.content.split(":")[1].split("+")[1];
                        console.log("OVuser.username:" + OVuser.username);
                        findAccount(OVuser, function(userId){
                            if (userId != false){
                                // User in OV
                                console.log("User in OV. Cancelling...");
                                msg = "UserName: **" + OVuser.username + "**, already exists in OV2500. **Cancelling**... `Please use other mobile number`.";
                                formatted_msg.message = msg;
                                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                                OVuser = resetNewUser(OVuser);
                                rainbowUser = clearRainbowUser();
                            
                            }
                            else {
                                // User NOT in OV
                                console.log("User not in OV, so create a new user from mobile phone")

                                rainbowUser.status = USERNAME_RECEIVED;
                                rainbowUser.OVuser = OVuser;
                                console.log("rainbowUser.OVuser:" + rainbowUser.OVuser);
                            
                                // Generating a WEAK password
                                rainbowUser.OVuser.password = genpasswd({
                                    couples: 3,
                                    digits: 2,
                                    randomUpper: false,
                                    numberPosition: 'end'});
                                
                                rainbowUsers.push(rainbowUser);
                            
                                // Add the user to OV2500-UPAM
                                addUser(rainbowUser.OVuser, function(result){
                                    switch (result.info.errorCode){
                                        case 0:
                                            // Everything OK
                                            console.log("UPAM Employee User Added: ",result);
                                            if (result.info.errorCode == 0){
//                                              OVmsg = result.info.result;
                                                OVmsg = result.info.translated.resultTranslated;
                                            }
                                            else {
                                              OVmsg = result.info.translated.resultTranslated;
                                            }
                            
                                        
                                            // sending SMS with credentials
                                            let sms = "Username:" + rainbowUser.OVuser.username + "\nPassword:" + rainbowUser.OVuser.password;
                                            plivoClient.messages.create(
                                                origin_number, //Source number
                                                OVuser.username, //Destination number
                                                sms // message
                                            ).then(function(message_created) {
                                                console.log("SMS sent to mobile " + rainbowUser.OVuser.username)
                                                console.log(message_created)
                                            
                                                msg = "The user **" + rainbowUser.OVuser.username + "**, has been successfully added to OV2500-UPAM, user can now safely access to SSID with 802.1X security. User will receive the credentials via SMS";
                                                formatted_msg.message = msg;
                                                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                                        
                                                msg = "**UPAM info:** `" + OVmsg + "`";
                                                formatted_msg.message = msg;
                                                messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                        
                                                rainbowUsers = removeRainbowUser(rainbowUsers, rainbowUser);
                                                rainbowUser = clearRainbowUser();
                                            
                                            });
                            
                                            break;
                                        case -1:
                                            // Something went wrong
                                            OVmsg = result.info.errorMessageTranslated;
                                            msg = "Add user `**FAILED**`..."
                                            formatted_msg.message = msg;
                                            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                                            msg = "**UPAM info:** `" + OVmsg + "`";
                                            formatted_msg.message = msg;
                                            messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                        
                                            rainbowUsers = removeRainbowUser(rainbowUsers, rainbowUser);
                                            rainbowUser = clearRainbowUser();
                        
                                            break;
                                    }
                                });
                            }
                        });
                    } 
                } catch(error) {
                
                    console(error);
                    console.log("Not a valid mobile phone received... quit.");
                    
                    msg = "Not a valid mobile phone. Please use E.164 format (+18XXXXXXXXX, +346ZZZZZZZZ, etc.)";
                    formatted_msg.message = msg;
                    messageSent = rainbowSDK.im.sendMessageToJid(msg, rainbowUser.id, "en", formatted_msg);
                    rainbowUser = clearRainbowUser();
                    
                    break;
                }
            break;  

            
        case "a:":
        case "A:":
            // email address provided
            
    };
});

