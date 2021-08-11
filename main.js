const { app, BrowserWindow } = require('electron');
const { Menu, MenuItem,dialog} = require('electron');
const ipcMain = require('electron').ipcMain;
const { Notification } = require('electron');
const http_ningmengyun = require('./js/http_ningmengyun.js');
const http_kdzwy = require('./js/http_kdzwy.js');
const http_suiyue = require("./js/http_suiyue");
const data = require("./js/data.js");
const util = require("./js/util")
// 在文件头部引入 Node.js 中的 path 模块
const path = require('path');

// 修改现有的 createWindow() 函数
function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
      //nodeIntegration:true
    }
  });

  win.loadFile('./html/login.html');
  let content = win.webContents;
  content.executeJavaScript()

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

  //页面切换
  ipcMain.on("change-page",function (event,page){
    win.loadFile(page);
  });
  //登录
  ipcMain.on("login",function(event,username,password){
    http_suiyue.login(username,password,win,event);
  });
  //第三方账务平台账号测试
  ipcMain.on("accountTest",function (event,username,password,platform){
    if(platform === 'nmy'){
      http_ningmengyun.login(username,password);
    }else if(platform === 'kd'){
      http_kdzwy.login(username,password,win,event);
    }
  });
  //金碟账无忧测试成功后下一步
  ipcMain.on("kdzwy_next",function(event){
    win.loadFile("html/zwy_config.html");
    http_kdzwy.nodecustomer(util.parseCookie(data.kd_login_redirect_cookie),event);
  });
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  });
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("dialog-message",function (event,arg){
  dialog.showMessageBox({title:"标题",message:arg});
});