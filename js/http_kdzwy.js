const https = require("https");
const http = require("http");
const iconv = require("iconv-lite");
const querystring = require('querystring');
const data = require("./data");
const util = require('./util');
const {dialog} = require("electron");
const config = require("../config.js");
/**
 * 金碟帐无忧接口调用
 */
exports.login = function (username, password, win, event) {
    var cookie;
    let post_option = {
        hostname: 'www.kdzwy.com',
        port: 443,
        path: '/bs/guanjia/login?username=' + username + '&password=' + password + '&captcha=&encode=1&checkCaptcha=false&redirectUri=https%3A%2F%2Fgj.kdzwy.com',
        method: 'POST'
    };
    post_option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };
    let post_req = https.request(post_option, function (res) {
        cookie = res.headers['set-cookie'];
        redirect(util.parseCookie(cookie), event);
    });
    post_req.write('');
    post_req.end();
}
/**
 * 金碟账无忧登录重定向
 */
function redirect(reqCookie, event) {
    let post_option = {
        hostname: 'vip4.kdzwy.com',
        port: 443,
        path: '/guanjia/user/login/redirect?username=13040847220&userId=1059355&redirectUri=https://gj.kdzwy.com&from=19980646',
        method: 'GET'
    };
    post_option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: reqCookie
    };
    let post_req = https.request(post_option, function (res) {
        data.kd_login_redirect_cookie = util.parseCookie(res.headers['set-cookie']);//保存登录重定向后的cookie信息
        //重定向之后显示下一步按钮
        if (data.kd_login_redirect_cookie) {
            event.reply("connect_msg", "success");
        } else {
            event.reply("connect_msg", "error");
        }
    });
    post_req.write('');
    post_req.end();
}
//账套列表
exports.nodecustomer = function (event) {
    let resCookie;
    let post_option = {
        hostname: 'vip4.kdzwy.com',
        port: 443,
        path: '/guanjia/acctflow/nodecustomer?nodeId=20232&page=1&limit=100&orderProperty=acctCreateDate&orderDirection=desc&condition2=at_Create',
        method: 'GET'
    };
    post_option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: data.kd_login_redirect_cookie
    };
    let post_req = https.request(post_option, function (res) {
        resCookie = res.headers['set-cookie'];
        let rawData = '';
        res.on('data', function (buffer) {
            rawData = rawData + buffer;
        });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                event.reply("show_kd_account_set", parsedData);
            } catch (e) {
                console.error(e.message);
            }
        });
    });
    post_req.write('');
    post_req.end();
}

//循环导入所有账套的数据
exports.dataImport = function(event,companys){
    importOne(event,companys,0);
}

//导入单个套账数据
function importOne(event,companys,index){
    let promise = new Promise((resolve,reject) => {
        try{
            getAccountUrl(event,companys,index,resolve,reject);
        }catch(e){
            log.error(e);
        }
    });
    promise.then((data) =>{
        importOne(event,companys,data);
    },(error)=>{
        log.error(error);
    })
}

//获取账套url
function getAccountUrl(event,companys,index,resolve,reject) {
    let option = {
        hostname: 'vip4.kdzwy.com',
        port: 443,
        path: '/guanjia/customer/accounturl?companyId=' + companys[index].companyId,
        method: 'GET'
    }
    option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: data.kd_login_redirect_cookie
    };
    let req = https.request(option, function (res) {
        let resCookie = util.parseCookie(res.headers['set-cookie']);
        let rawData = '';
        res.on('data', function (buffer) {
            rawData = rawData + buffer;
        });
        res.on('end', () => {
            try {
                const parsedData = JSON.parse(rawData);
                entryAccount(resCookie, parsedData.data, event,companys,index,resolve,reject);
            } catch (e) {
                console.error(e.message);
            }
        });
    });
    req.write('');
    req.end();
}
//进入账套
function entryAccount(reqCookie, url, event,companys,index,resolve,reject) {
    let option = { port: 34 };
    option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: reqCookie
    }
    https.get(url, option, (res) => {
        let location = res.headers['location'];
        data.kd_current_account_cookie = util.parseCookie(res.headers['set-cookie']);
        accountRedirect(location,event,companys,index,resolve,reject);
        res.on('data', (d) => {
            process.stdout.write(d);
        });

    }).on('error', (e) => {
        console.error(e);
    });
}
//账套重定向
function accountRedirect(url, event,companys,index,resolve,reject) {
    let option = { port: 34 };
    option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: data.kd_current_account_cookie
    }
    https.get(url, option, (res) => {
        let cookie = util.parseCookie(res.headers['set-cookie']);
        //data.kd_current_account_cookie = data.kd_current_account_cookie + ";" + cookie;
        loadAccountInfo(event,companys,index,resolve,reject);
        res.on('data', (d) => {
            process.stdout.write(d);
        });
    }).on('error',(e) => {
        console.error(e);
    });
}
//获取账套信息
function loadAccountInfo(event,companys,index,resolve,reject){
    let option = { port: 34 };
    option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: data.kd_current_account_cookie
    }
    https.get("https://vip4.kdzwy.com:34/default.jsp", option, (res) => {
        let rawData = '';
        res.on('data', (d) => {
            rawData = rawData + d;
        });
        res.on('end',()=>{
            let arr = rawData.match(/PERIOD: "\d{6}" , \/\/启用期间/g);
            let period = arr[0].substr(9,6);
            dialog.showMessageBox(data.current_window,{message:period,title:"账套信息"});
            saveAccountSet(event,companys,index,period,resolve,reject);
        });
    }).on('error',(e) => {
        console.error(e);
    });
}
//导入账套
function saveAccountSet(event,companys,index,period,resolve,reject){
    let option = {
        port:8358,
        hostname: 'localhost',
        path: '/kdTransfer/accountSet',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }};
    let company = companys[index];
    let body = {
        companyName:company.companyName,
        accountDate:company.accountDate,
        period:period,
        taxType:company.taxType,
        accountingStandard:"1",
        createUser:"10001"
    };
    let http_req = http.request(option,(res) => {
        let rawData = '';
        res.on('data',(d) => {
            rawData = rawData + d;
        });
        res.on('end',()=>{
            console.info("account set result:",rawData.toString());
            //调用岁月云导入账套
            //loadVoucher(event,companys,index,resolve,reject);
        });
    }).on('error',(e) => {
        console.error(e);
    });
    http_req.write(JSON.stringify(body));
    http_req.end();
}
//查询凭证列表
function loadVoucher(event,companys,index,resolve,reject){
    let option = { port: 34 };
    option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: data.kd_current_account_cookie
    }
    console.log("loadVoucher use cookie:",data.kd_current_account_cookie);
    let url = "https://vip4.kdzwy.com:34/gl/voucher?m=findList&fromPeriod=200001&toPeriod=202201&_search=false&nd=1628771931403&rows=100&page=1&sidx=date&sord=asc";
    https.get(url, option, (res) => {
        let rawData = '';
        res.on('data', (d) => {
            //process.stdout.write(d);
            rawData = rawData + d;
        });
        res.on('end',()=>{
            if(index < companys.length-1){
                resolve(index + 1);
            }
        });
    }).on('error',(e) => {
        console.error(e);
    });
}