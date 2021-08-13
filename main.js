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
    width: 1000,
    height: 700,
    frame:true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
      //nodeIntegration:true
    }
  });
  data.current_window = win;
  win.loadFile('./html/login.html');
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
  });
  //金碟账无忧页面加载完成之后初始化账套数据
  ipcMain.on("init_account_set",function(event){
    http_kdzwy.nodecustomer(event);
  });
  //金碟账无忧数据导入
  ipcMain.on("data_import",function(event,companyIds ){
    console.info(companyIds);
    http_kdzwy.dataImport(event,companyIds);
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