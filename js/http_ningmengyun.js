var https = require("https");
var iconv = require("iconv-lite");
var querystring = require('querystring');
var util = require('./util')
exports.login = function (username,password){
    var cookie;
    //登录
    let loginUrl = "https://api.ningmengyun.com/api/login.ashx?userName=18520830014&passWord=610535";
    https.get(loginUrl, function (res) {
        var datas = [];
        var size = 0;
        cookie = res.headers["set-cookie"];
        console.info("cookie:",cookie);
        res.on('data', function (data) {
            datas.push(data);
            size += data.length;
        });
        res.on("end", function () {
            var buff = Buffer.concat(datas, size);
            var result = iconv.decode(buff, "utf-8");//转码//var result = buff.toString();//不需要转编码,直接tostring
            console.log(result);
            getVoucherList(util.parseCookie(cookie));
        });
    }).on("error", function (err) {
        console.log(err);
    });
}

//获取凭证
function getVoucherList(cookie){
    let post_option = {
        hostname: 'j3.ningmengyun.com',
        port: 443,
        path: '/Voucher/Services/GetVoucherList.ashx?appasid=GKC67',
        method: 'POST'
    };
    let post_data = querystring.stringify({
        PageNumber:1,
        PageSize:20,
        StartP:7,
        EndP:7,
        NoApproved:0,
        sortColumn:'V_NUM'
    });
    post_option.headers = {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length' : post_data.length,
        Cookie : cookie
    };
    let post_req = https.request(post_option,function (res){
        res.on('data',function (buffer){
            console.log(buffer.toString());
        })
    });
    post_req.write(post_data);
    post_req.end();
}