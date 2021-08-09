const http = require("http");
let querystring = require('querystring');
exports.login = function (username,password,win){
    let post_option = {
        hostname: '116.63.222.203',
        port: 18001,
        path: '/api/auth/jwt/token',
        method: 'POST'
    };
    let post_data = querystring.stringify({
        username:"15802732168",
        password:"df10ef8509dc176d733d59549e7dbfaf"
    });
    post_option.headers = {
        'Content-Type' : 'application/x-www-form-urlencoded'
    };
    let post_req = http.request(post_option,function (res){
        res.on('data',function (buffer){
            console.log(buffer.toString());
            let body = buffer.toString();
            let bodyObj = JSON.parse(body);
            if(!bodyObj.success){
                console.log(bodyObj.message);
            }else {
                win.loadFile("index.html")
            }
        })
    });
    post_req.write(post_data);
    post_req.end();
}