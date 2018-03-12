let async = require("async");

let serie = [{"uno":1, "i":11},{"dos":2, "i":22},{"tres":3, "i":33}];
let a = false;

//async.detect(serie, function(item, callback){
//        
//        if (item.i == 44) {
//            callback(null, true);
//        }

//    }, 
//    function(err, result){
//        
//        
//        console.log("Estoy aquí");
//        a = true;
//        console.log(err);
//        console.log(result);
//        if (result) {
//            console.log("true");
//        }
//        else {
//            console.log("false");
//        }
//    
//    }

//);
//console.log("a:",a)

async.each(serie, function(item, callback){
        if (item.i == 44) {
            a = true;
            callback(null, a);
        };
    }, 
    function(err, a){
    
        if (a) { console.log (a)}
    
    }
);
console.log(a)

