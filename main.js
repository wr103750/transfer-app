const { app, BrowserWindow } = require('electron')
const { Menu, MenuItem,dialog} = require('electron')
const ipcMain = require('electron').ipcMain;
const { Notification } = require('electron')
const http_ningmengyun = require('./http_ningmengyun.js')
const http_kdzwy = require('./http_kdzwy')
// 在文件头部引入 Node.js 中的 path 模块
const path = require('path')
var http = require('http');
var fs = require('fs');
var url = require('url');

// 修改现有的 createWindow() 函数
function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
  let content = win.webContents;

  //菜单
  const menu = new Menu()
  menu.append(new MenuItem({
    label: '菜单',
    submenu: [{
      label:"调试",
      accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'F12',
      click: () => {
        content.openDevTools();
      }
    }]
  }));
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
  const NOTIFICATION_TITLE = 'Basic Notification'
  const NOTIFICATION_BODY = 'Notification from the Main process'
  function showNotification () {
    new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY }).show()
  }

})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("dialog-message",function (event,arg){
  dialog.showMessageBox({title:"标题",message:arg});
});
ipcMain.on("accountTest",function (event,username,password,platform){
  console.info("username:" + username);
  console.info("password:" + password);
  if(platform === 'nmy'){
    http_ningmengyun.login(username,password);
  }else if(platform === 'kd'){
    http_kdzwy.login(username,password);
  }
});