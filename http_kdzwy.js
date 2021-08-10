const https = require("https");
const iconv = require("iconv-lite");
const querystring = require('querystring');
let util = require('./util')
/**
 * 金碟帐无忧接口调用
 */
exports.login = function (username,password){
    var cookie;
    let post_option = {
        hostname: 'www.kdzwy.com',
        port: 443,
        path: '/bs/guanjia/login?username=' + username + '&password=' + password + '&captcha=&encode=1&checkCaptcha=false&redirectUri=https%3A%2F%2Fgj.kdzwy.com',
        method: 'POST'
    };
    post_option.headers = {
        'Content-Type' : 'application/x-www-form-urlencoded'
    };
    let post_req = https.request(post_option,function (res){
        cookie = res.headers['set-cookie'];
        console.log(cookie);
        redirect(util.parseCookie(cookie));
    });
    post_req.write('');
    post_req.end();
}
function redirect(reqCookie){
    let resCookie;
    let post_option = {
        hostname: 'vip4.kdzwy.com',
        port: 443,
        path: '/guanjia/user/login/redirect?username=13040847220&userId=1059355&redirectUri=https://gj.kdzwy.com&from=19980646',
        method: 'GET'
    };
    post_option.headers = {
        'Content-Type' : 'application/x-www-form-urlencoded',
        Cookie : reqCookie
    };
    let post_req = https.request(post_option,function (res){
        resCookie = res.headers['set-cookie'];
        console.log(resCookie);
        nodecustomer(util.parseCookie(resCookie));
    });
    post_req.write('');
    post_req.end();
}
//账套列表
function nodecustomer(reqCookie){
    let resCookie;
    let post_option = {
        hostname: 'vip4.kdzwy.com',
        port: 443,
        path: '/guanjia/acctflow/nodecustomer?nodeId=20232&page=1&limit=10&orderProperty=acctCreateDate&orderDirection=desc&condition2=at_Create',
        method: 'GET'
    };
    post_option.headers = {
        'Content-Type' : 'application/x-www-form-urlencoded',
        Cookie : reqCookie
    };
    let post_req = https.request(post_option,function (res){
        resCookie = res.headers['set-cookie'];
        console.log(resCookie);
        res.on('data',function (buffer){
            console.log(buffer.toString());
        })
    });
    post_req.write('');
    post_req.end();
}