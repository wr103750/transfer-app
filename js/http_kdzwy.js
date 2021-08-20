const https = require("https");
const http = require("http");
const iconv = require("iconv-lite");
const querystring = require('querystring');
const data = require("./data");
const util = require('./util');
const { dialog } = require("electron");
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
        path: '/guanjia/acctflow/nodecustomer?nodeId=20232&page=1&limit=10000&orderProperty=acctCreateDate&orderDirection=desc&condition2=at_Create',
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
exports.dataImport = function (event, companys) {
    //importOne(event,companys,0);
    let promise;
    for (let company of companys) {
        promise = importOne(company)
        .then(getAccountUrl)
        .then(entryAccount)
        .then(accountRedirect)
        .then(loadAccountInfo)
        .then(saveAccountSet)
        .then(loadAllAccInit)
        .then(loadVoucher)
        .then(accoutVoucher);
    }
}

//导入单个套账数据,空方法
function importOne(company) {
    let promise = new Promise((resolve, reject) => {
        try {
            resolve(company);
        } catch (e) {
            console.error(e);
        }
    });
    return promise;
}

//获取账套url
function getAccountUrl(company) {
    let promise = new Promise((resolve, reject) => {
        let option = {
            hostname: 'vip4.kdzwy.com',
            port: 443,
            path: '/guanjia/customer/accounturl?companyId=' + company.companyId,
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
                    resolve([resCookie, parsedData.data, company]);
                    //entryAccount(resCookie, parsedData.data, event,companys,index,resolve,reject);
                } catch (e) {
                    console.error(e.message);
                }
            });
        });
        req.write('');
        req.end();
    });
    return promise;
}
//进入账套
function entryAccount(arr) {
    let reqCookie = arr[0];
    let url = arr[1];
    let company = arr[2];
    let promise = new Promise((resolve, reject) => {
        let option = { port: 34 };
        option.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: reqCookie
        }
        https.get(url, option, (res) => {
            let location = res.headers['location'];
            data.kd_current_account_cookie = util.parseCookie(res.headers['set-cookie']);
            resolve([location, company]);
            //accountRedirect(location,event,companys,index,resolve,reject);
            res.on('data', (d) => {
                process.stdout.write(d);
            });

        }).on('entryAccount error', (e) => {
            console.error(e);
        });
    });
    return promise;
}
//账套重定向
function accountRedirect(arr) {
    let url = arr[0];
    let company = arr[1];
    let promise = new Promise((resolve, reject) => {
        let option = { port: 34 };
        option.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: data.kd_current_account_cookie
        }
        https.get(url, option, (res) => {
            let cookie = util.parseCookie(res.headers['set-cookie']);
            //loadAccountInfo(event,companys,index,resolve,reject);
            resolve(company);
            res.on('data', (d) => {
                process.stdout.write(d);
            });
        }).on('error', (e) => {
            console.error(e);
        });
    });
    return promise;
}
//获取账套信息
function loadAccountInfo(company) {
    let promise = new Promise((resolve, reject) => {
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
            res.on('end', () => {
                let arr = rawData.match(/PERIOD: "\d{6}" , \/\/启用期间/g);
                let period = arr[0].substr(9, 6);
                dialog.showMessageBox(data.current_window, { message: period, title: "账套信息" });
                resolve([company, period]);
                //saveAccountSet(event,companys,index,period,resolve,reject);
            });
        }).on('error', (e) => {
            console.error(e);
        });
    });
    return promise;
}
//导入账套
function saveAccountSet(arr) {
    let company = arr[0];
    let period = arr[1];
    let promise = new Promise((resolve, reject) => {
        let option = {
            port: 8358,
            hostname: 'localhost',
            path: '/kdTransfer/accountSet',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        //let company = companys[index];
        let body = {
            companyName: company.companyName,
            accountDate: company.accountDate,
            period: period,
            taxType: data.taxType,
            accountingStandard: data.accountingStandard,
            createUser: "10001"
        };
        let http_req = http.request(option, (res) => {
            let rawData = '';
            res.on('data', (d) => {
                rawData = rawData + d;
            });
            res.on('end', () => {
                console.info("account set result:", rawData.toString());
                let result = JSON.parse(rawData);
                data.asId = result.data;
                resolve();
                //调用岁月云导入账套
                //loadVoucher(event,companys,index,resolve,reject);
            });
        }).on('error', (e) => {
            console.error(e);
        });
        http_req.write(JSON.stringify(body));
        http_req.end();
    });
    return promise;
}
//查询5种科目期初余额
function loadAllAccInit(){
    let promise;
    for(let i=1;i<=5;i++){
        if(promise == null){
            promise = loadAccInit(i).then(accountInitial);
        }else{
            promise = promise.then(() => {
                return loadAccInit(i).then(accountInitial);
            });
        }
    }
}
//查询期初余额
function loadAccInit(num){
    let promise = new Promise((resolve,reject) => {
        let option = {port:34};
        option.headers ={
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: data.kd_current_account_cookie
        }
        let url = `https://vip4.kdzwy.com:34/gl/balance/query?m=queryBalance&classId=${num}&currency=RMB`;
        https.get(url,option,(res) => {
            let rawData = '';
            res.on('data',(d) => {
                rawData = rawData + d;
            });
            res.on('end',() => {
                let objData = JSON.parse(rawData);
                resolve(objData.data.items);
            });
        });
    });
    return promise;
}
//导入期初余额
function accountInitial(items) {
    let promise = new Promise((resolve, reject) => {
        let option = {
            port: 8358,
            hostname: 'localhost',
            path: '/kdTransfer/accountInitial',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        let body = {
            items:items,
            asId:data.asId,
            createUser:data.loginInfo.data.id
        };
        let http_req = http.request(option, (res) => {
            let rawData = '';
            res.on('data', (d) => {
                rawData = rawData + d;
            });
            res.on('end', () => {
                console.info("accountInitial result:", rawData.toString());
                resolve();
            });
        }).on('error', (e) => {
            console.error(e);
        });
        http_req.write(JSON.stringify(body));
        http_req.end();
    });
    return promise;
}
//查询凭证列表
function loadVoucher() {
    let promise = new Promise((resolve,reject) => {
        let option = { port: 34 };
        option.headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: data.kd_current_account_cookie
        }
        let url = "https://vip4.kdzwy.com:34/gl/voucher?m=findList&fromPeriod=200001&toPeriod=202201&_search=false&nd=1628771931403&rows=100&page=1&sidx=date&sord=asc";
        https.get(url, option, (res) => {
            let rawData = '';
            res.on('data', (d) => {
                //process.stdout.write(d);
                rawData = rawData + d;
            });
            res.on('end', () => {
                let objData = JSON.parse(rawData);
                resolve(objData.rows);
            });
        }).on('error', (e) => {
            console.error(e);
        });
    });
    return promise;
}

//导入凭证
function accoutVoucher(rows) {
    let promise = new Promise((resolve, reject) => {
        let option = {
            port: 8358,
            hostname: 'localhost',
            path: '/kdTransfer/accoutVoucher',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        let body = {
            items:items,
            asId:data.asId,
            createUser:data.loginInfo.data.id
        };
        let http_req = http.request(option, (res) => {
            let rawData = '';
            res.on('data', (d) => {
                rawData = rawData + d;
            });
            res.on('end', () => {
                console.info("accoutVoucher result:", rawData.toString());
                resolve();
            });
        }).on('error', (e) => {
            console.error(e);
        });
        http_req.write(JSON.stringify(body));
        http_req.end();
    });
    return promise;
}