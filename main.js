const { app, BrowserWindow, autoUpdater } = require('electron');
const { Menu, MenuItem, dialog } = require('electron');
const ipcMain = require('electron').ipcMain;
const { Notification } = require('electron');
const http_ningmengyun = require('./js/http_ningmengyun.js');
const http_kdzwy = require('./js/http_kdzwy.js');
const http_suiyue = require("./js/http_suiyue");
const data = require("./js/data.js");
const util = require("./js/util");
const Store = require("electron-store");
// 在文件头部引入 Node.js 中的 path 模块
const path = require('path');

// 修改现有的 createWindow() 函数
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 700,
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
      //nodeIntegration:true
    }
  });
  data.current_window = win;
  win.loadFile('./html/login.html');
  let content = win.webContents;
  //自动升级
  const server = "https://app-3t684beam-wr103750.vercel.app/";
  const url = `${server}/update/${process.platform}/${app.getVersion()}`
  console.log("url:",url);

/*  autoUpdater.setFeedURL({ url });
  autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
    const dialogOpts = {
      type: 'info',
      buttons: ['Restart', 'Later'],
      title: 'Application Update',
      message: process.platform === 'win32' ? releaseNotes : releaseName,
      detail: 'A new version has been downloaded. Restart the application to apply the updates.'
    }
  
    dialog.showMessageBox(dialogOpts).then((returnValue) => {
      if (returnValue.response === 0) autoUpdater.quitAndInstall()
    })
  });
  autoUpdater.checkForUpdates();*/

  //菜单
  const menu = new Menu()
  menu.append(new MenuItem({
    label: '菜单',
    submenu: [{
      label: "调试",
      accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'F12',
      click: () => {
        content.openDevTools();
      }
    }]
  }));
  Menu.setApplicationMenu(menu);

  //页面切换
  ipcMain.on("change-page", function (event, page) {
    win.loadFile(page);
  });
  ipcMain.on("init-remember", function (event) {
    let store = new Store();
    if (store.get("remember")) {
      event.reply("init-response", store.get("username"), store.get("password"));
    }
  });
  //登录
  ipcMain.on("login", function (event, username, password, remember) {
    http_suiyue.login(username, password, win, event, remember);
  });
  //显示当前登录用户
  ipcMain.on("username-request",function(event){
    content.send("show_username",data.loginInfo.data.name);
  });
  //第三方账务平台账号测试
  ipcMain.on("accountTest", function (event, username, password, platform) {
    if (platform === 'nmy') {
      http_ningmengyun.login(username, password);
    } else if (platform === 'kd') {
      http_kdzwy.login(username, password, win, event);
    }
  });
  //金碟账无忧测试成功后下一步
  ipcMain.on("kdzwy_next", function (event) {
    win.loadFile("html/zwy_config.html");
  });
  //金碟账无忧页面加载完成之后初始化账套数据
  ipcMain.on("init_account_set", function (event) {
    http_kdzwy.nodecustomer(event);
  });
  //金碟账无忧数据导入
  ipcMain.on("data_import", function (event, companys, accountingStandard, taxType) {
    win.loadFile("html/zwy_result.html");
    data.accountingStandard = accountingStandard;
    data.taxType = taxType;
    data.current_step = 0;
    data.account_num = companys.length;
    http_kdzwy.dataImport(event, companys);
  });
  //继续导账
  ipcMain.on("continue_import", function (event) {
    win.loadFile("./html/index.html");
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

ipcMain.on("dialog-message", function (event, arg) {
  dialog.showMessageBox(data.current_window, { title: "标题", message: arg });
});