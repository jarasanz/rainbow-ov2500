let request = require('request');
request = request.defaults(
    {
        strictSSL: false,
        jar: true,
        followAllRedirects:true,
//        json: true,
    }
);

const OV2500 = "192.168.1.10";
const ovuser = "admin";
const ovpass = "switch";

///////////////////////////////////////////////////////////////////////////////
// Let's login in OV2500
function loginOV2500(IPaddress, userName, password, callback){
    
    let out = {error:0, info:""}
    let body_request = {"userName": userName, "password": password};
    
    let options = {
        url: 'https://'+IPaddress+'/api/login',
        json: true,
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
            console.log(error)
            console.log(response.statusCode);
            console.log(body);
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
        json: true,
    }
    request(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
//            console.log(body);
            out.error = response.statusCode
            out.info = body
            callback(out);
            
        }
        else {
            console.log(error)
            console.log(response.statusCode);
            console.log(body);
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
        json: true,
        body: body_request
    }
    request.post(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            out.error = response.statusCode
            out.info = body
            callback(out);
            
        }
        else {
            console.log(error)
            console.log(response.statusCode);
            console.log(body);
            out.error = error;
            out.info = response;
            callback(out)
        }
    });
};


///////////////////////////////////////////////////////////////////////////////
// Get the list of current users (Employee Account) in OV2500 Local DataBase
function getAllAccountList(IPaddress, callback){

    let out = {error:0, info:""}
    
    let options = {
        url: 'https://'+IPaddress+'/api/ham/userAccount/getAllAccountList',
        json: true,
    }
    request.get(options, function(error, response, body) {
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
function deleteAccount(IPaddress, userId, callback){

    let out = {error:0, info:""}
    let delAccountList = []
    delAccountList.push(userId);
    
    let body_request;
    body_request = delAccountList;

    
    let options = {
        url: 'https://'+IPaddress+'/api/ham/userAccount/deleteAccount',
        json: true,
        body: body_request
    }
    console.log(options);
    request.post(options, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body);
            out.error = response.statusCode
            out.info = body
            callback(out);
            
        }
        else {
            console.log("ERROR: ",error)
//            console.log("Estatus Code: ",response);
//            console.log("Body: ",body);
            out.error = error;
            out.info = response;
            callback(out)
        }
    });
};





let loginstatus
let newuser = {
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

newuser.Username = "usuario13";
newuser.Password = "usuario13";

//loginOV2500(OV2500, ovuser, ovpass, function(loginstatus){
//    if (loginstatus.info.message.includes("success")) {    
////        console.log(loginstatus.info);
//        
//        addUserOV2500LocalDB(OV2500, newuser, function(result){
//            console.log("Usuario añadido");
//            console.log(result);
//            logoutOV2500(OV2500, function(loginstatus){});
//        });             
//    };
//});

let userId;
loginOV2500(OV2500, ovuser, ovpass, function(loginstatus){
    if (loginstatus.info.message.includes("success")) {
        getAllAccountList(OV2500, function(result){
            console.log("Listado de usuarios:");
            for (i in result.info.data) {
                console.log(result.info.data[i]);
                if (result.info.data[i].username == newuser.Username){
                    console.log(result.info.data[i].id)
                    userId = result.info.data[i].id;
                        
                    deleteAccount(OV2500, userId, function(result){
                        console.log(result.info);
                        logoutOV2500(OV2500, function(loginstatus){});
                    });       
                }
                else{
                    console.log("User not in DataBase...")
                };
            };
        });
    }
});



//logoutOV2500("192.168.1.10", function(loginstatus){
//    console.log(loginstatus.error)
//});


//var body_request = {"userName": "admin", "password": "switch"};

//var options = {
//    strictSSL: false,
//    jar: true,
//    followAllRedirects:true,
//    url: 'https://192.168.1.10/api/login',
//    headers: {'Content-Type': 'application/json'},
//    json: true,
//    body: body_request
//};


//request.post(options, function(error, response, body) {
//    if (!error && response.statusCode == 200) {
//        console.log(body.message);
//    }
//    else {
//        console.log(error)
//        console.log(response.statusCode);
//        console.log(body);
//    }
//});


