var fs = require("fs");
const { contextBridge } = require('electron')
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

contextBridge.exposeInMainWorld('context', {
    desktop: true,
    doThing: () => ipcRenderer.send('do-a-thing'),
    accountTest:(username,password,platform) => ipcRenderer.send("accountTest",username,password,platform),
    login:(username,password) => ipcRenderer.send("login",username,password),
    dialog:(message) => ipcRenderer.send("dialog-message",message),
    changePage:(page) => ipcRenderer.send("change-page",page),
    kdzwyNext:() => ipcRenderer.send("kdzwy_next"),
    initAccountSet:() => ipcRenderer.send("init_account_set"),
    dataImport: (companyIds) => ipcRenderer.send("data_import",companyIds)
});

//显示或者隐藏登录错误信息，登录成功显示下一步
ipcRenderer.on("login_msg",function (event,action){
    if(action === "success"){
        document.getElementById("show_hide_msg").style.visibility = "hidden";
    }else if(action === "error"){
        document.getElementById("show_hide_msg").style.visibility = "visible";
    }
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
        html = html + `<div class="checkbox"><label><input type="checkbox" name="account_set" value="${item.companyId}" class="form-check-input">${item.companyName}</label></div>`;
    }
    let span = document.getElementById("s_account_set_checkbox");
    span.innerHTML = span.innerHTML + html;
});