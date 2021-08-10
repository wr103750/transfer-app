var fs = require("fs");
const { contextBridge } = require('electron')
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;
const replaceText = (selector, text) => {
const element = document.getElementById(selector)
if (element) element.innerText = text
}



contextBridge.exposeInMainWorld('context', {
    desktop: true,
    doThing: () => ipcRenderer.send('do-a-thing'),
    accountTest:(username,password,platform) => ipcRenderer.send("accountTest",username,password,platform),
    login:(username,password) => ipcRenderer.send("login",username,password),
    dialog:(message) => ipcRenderer.send("dialog-message",message),
    changePage:(page) => ipcRenderer.send("change-page",page)
})

//显示或者隐藏错误信息
ipcRenderer.on("show_hide_msg",function (event,selector,action){
    document.getElementById(selector).style.visibility = action;
});