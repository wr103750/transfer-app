const http = require("http");
const crypto = require('crypto');
const data = require("./data");
const config = require("../config.js");
exports.login = function (username,password,win,event){
    let post_option = {
        hostname: config.conf.whty_suiyue_hostname,
        port: config.conf.whty_suiyue_port,
        path: config.conf.whty_suiyue_login_path,
        method: 'POST'
    };
    let md5pwd = crypto.createHash("md5").update(password).digest("hex")
    let urlParams = new URLSearchParams({
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
                //win.loadFile("./html/index.html")
            }
        });
    });
    post_req.write(urlParams.toString());
    post_req.end();
}