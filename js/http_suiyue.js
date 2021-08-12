const http = require("http");
let crypto = require('crypto');
let querystring = require('querystring');
const data = require("./data");
exports.login = function (username,password,win,event){
    let post_option = {
        hostname: '116.63.222.203',
        port: 18001,
        path: '/api/auth/jwt/token',
        method: 'POST'
    };
    let md5pwd = crypto.createHash("md5").update(password).digest("hex")
    let post_data = querystring.stringify({
        username:username,
        password:md5pwd
    });
    post_option.headers = {
        'Content-Type' : 'application/x-www-form-urlencoded'
    };
    let post_req = http.request(post_option,function (res){
        let rawData = '';
        res.on('data',function (buffer){
            rawData = rawData + buffer;
        });
        res.on('end',function(){
            data.loginInfo = JSON.parse(rawData);
            console.log("suiyue login info:",data.loginInfo);
            if(data.loginInfo.success){
                event.reply("login_msg","success");
                win.loadFile("./html/index.html");
            }else {
                event.reply("login_msg","error");
                win.loadFile("./html/index.html")
            }
        });
    });
    post_req.write(post_data);
    post_req.end();
}