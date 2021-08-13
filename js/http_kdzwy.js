const https = require("https");
const iconv = require("iconv-lite");
const querystring = require('querystring');
const data = require("./data");
let util = require('./util');
const {dialog} = require("electron");
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
exports.dataImport = function(event,companyIds){
    exports.importOne(event,companyIds,0);
}

//导入单个套账数据
exports.importOne = function(event,companyIds,index){
    let promise = new Promise((resolve,reject) => {
        try{
            exports.getAccountUrl(event,companyIds,index,resolve,reject);
        }catch(e){
            log.error(e);
        }
    });
    promise.then((data) =>{
        exports.importOne(event,companyIds,data);
    },(error)=>{
        log.error(error);
    })
}

//获取账套url
exports.getAccountUrl = function (event,companyIds,index,resolve,reject) {
    let option = {
        hostname: 'vip4.kdzwy.com',
        port: 443,
        path: '/guanjia/customer/accounturl?companyId=' + companyIds[index],
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
                exports.entryAccount(resCookie, parsedData.data, event,companyIds,index,resolve,reject);
            } catch (e) {
                console.error(e.message);
            }
        });
    });
    req.write('');
    req.end();
}
//进入账套
exports.entryAccount = function (reqCookie, url, event,companyIds,index,resolve,reject) {
    let option = { port: 34 };
    option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: reqCookie
    }
    https.get(url, option, (res) => {
        let location = res.headers['location'];
        data.kd_current_account_cookie = util.parseCookie(res.headers['set-cookie']);
        exports.accountRedirect(location,event,companyIds,index,resolve,reject);
        res.on('data', (d) => {
            process.stdout.write(d);
        });

    }).on('error', (e) => {
        console.error(e);
    });
}
//账套重定向
exports.accountRedirect = function (url, event,companyIds,index,resolve,reject) {
    let option = { port: 34 };
    option.headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: data.kd_current_account_cookie
    }
    https.get(url, option, (res) => {
        let cookie = util.parseCookie(res.headers['set-cookie']);
        //data.kd_current_account_cookie = data.kd_current_account_cookie + ";" + cookie;
        exports.loadVoucher(event,companyIds,index,resolve,reject);
        res.on('data', (d) => {
            process.stdout.write(d);
        });
    }).on('error',(e) => {
        console.error(e);
    });
}
//查询凭证列表
exports.loadVoucher = function(event,companyIds,index,resolve,reject){
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
            dialog.showMessageBox(data.current_window,{message:rawData.toString(),title:"从金碟账无忧导出的数据，导入到岁月会计云还未实现"});
            if(index < companyIds.length-1){
                resolve(index + 1);
            }
        });
    }).on('error',(e) => {
        console.error(e);
    });
}