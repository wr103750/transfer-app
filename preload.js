var fs = require("fs");
const { contextBridge } = require('electron')
const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;
const replaceText = (selector, text) => {
const element = document.getElementById(selector)
if (element) element.innerText = text
}

window.addEventListener('DOMContentLoaded', () => {
    document.getElementById("b_dialog").onclick=function (){
        ipcRenderer.send("dialog-message","弹窗");
    }
})

contextBridge.exposeInMainWorld('context', {
    desktop: true,
    doThing: () => ipcRenderer.send('do-a-thing'),
    accountTest:(username,password,platform) => ipcRenderer.send("accountTest",username,password,platform)
})
ipcRenderer.on('asynchronous-reply', function(event, arg) {
    console.log(arg); // prints "pong"
});
