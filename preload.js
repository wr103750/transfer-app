var fs = require("fs");
const { contextBridge } = require('electron')
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

contextBridge.exposeInMainWorld('context', {
    desktop: true,
    doThing: () => ipcRenderer.send('do-a-thing'),
    accountTest:(username,password,platform) => ipcRenderer.send("accountTest",username,password,platform),
    initRemember:() => ipcRenderer.send("init-remember"),
    login:(username,password,remember) => ipcRenderer.send("login",username,password,remember),
    usernameRequest:()=> ipcRenderer.send("username-request"),
    dialog:(message) => ipcRenderer.send("dialog-message",message),
    changePage:(page) => ipcRenderer.send("change-page",page),
    kdzwyNext:() => ipcRenderer.send("kdzwy_next"),
    initAccountSet:() => ipcRenderer.send("init_account_set"),
    dataImport: (companys,accountingStandard,taxType) => ipcRenderer.send("data_import",companys,accountingStandard,taxType),
    continueImport:() => ipcRenderer.send("continue_import")
});

//填充保存的账号密码
ipcRenderer.on("init-response",function(event,username,password){
    document.querySelector("#i_username").value=username;
    document.querySelector("#i_password").value=password;
    document.querySelector("#i_remember").checked="checked";
});

//显示或者隐藏登录错误信息，登录成功显示下一步
ipcRenderer.on("login_msg",function (event,action){
    if(action === "success"){
        document.getElementById("show_hide_msg").style.visibility = "hidden";
    }else if(action === "error"){
        document.getElementById("show_hide_msg").style.visibility = "visible";
    }
});

//显示当前登录的岁月用户
ipcRenderer.on("show_username",function(event,username){
   document.querySelector("#p_username").innerHTML="操作人:" + username;
});

//显示或者隐藏连接成功错误信息
ipcRenderer.on("connect_msg",function(event,action){
    if(action === "success"){
        document.getElementById("success_msg").style.visibility = "visible";
        document.getElementById("error_msg").style.visibility = "hidden";
        document.getElementById("b_next").style.visibility = "visible";
    }else if(action === "error"){
        document.getElementById("success_msg").style.visibility = "hidden";
        document.getElementById("error_msg").style.visibility = "visible";
        document.getElementById("b_next").style.visibility = "hidden";
    }
});

//金碟账无忧显示账套列表
ipcRenderer.on("show_kd_account_set",function(event,data){
    let items = data.data.items;
    let html = "";
    for(let item of items){
        html = html + `<div class="checkbox"><label><input type="checkbox" name="account_set" value="${item.companyId}" class="form-check-input" 
        data-account-date="${item.accountDate}" data-company-name="${item.companyName}" data-tax-type="${item.taxType}">${item.companyName}</label></div>`;

        window.global.accountData = {
            companyId:item.companyId,
            companyName:item.companyName,
            accountDate:item.accountDate,
            taxType:item.taxType
        };
/*        window.context.accountData = {
            companyId:item.companyId,
            companyName:item.companyName,
            accountDate:item.accountDate,
            taxType:item.taxType
        };*/
    }
    let span = document.getElementById("s_account_set_checkbox");
    span.innerHTML = span.innerHTML + html;
    let companyEvent = new Event("companyEvent");
    span.dispatchEvent(companyEvent);
});

ipcRenderer.on("update_percent",function(event,percent){
    document.querySelector(".progress-bar-success").style.width=percent + "%";
    document.querySelector("#percent-text").innerHTML=(percent + "%完成");
    if(percent === 100){
        document.querySelector("#success-info").style.display = "block";
    }
});