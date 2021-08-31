# 账无忧导账工具技术文档
## 1.技术和框架
账无忧导账工具使用electron构建，采用nodejs、html、js作为开发语言。
项目结构说明：
- 静态页面，主要包括html、css、image、javascript，和传统的前端技术相同。
- Nodejs代码，包括main.js入口文件和其他按模块划分的node.js代码，用于处理后台业务逻辑。
- preload.js，也是采用node.js编写，但是比较特殊，electron应用在加载静态页面的时候，同时也加载preload.js，用于前端页面和后台通信，比如：前端提交了表单数据，需要将数据传送到后台处理；或者后台将处理的结果返回给前端页面展示。

## 2.业务和逻辑
代码文件说明：  
html/login.html 登录岁月会计云页面  
html/index.html 选择要导入的第三方财务软件  
html/zwy_config.html 选择账无忧账套和配置  
Html/zwy_result.html 账无忧导入结果  
Js/data.js 用于存储一些全局变量数据  
Js/http_kdzwy.js从账无忧抓取数据的主要业务逻辑  
Js/http_ningmengyun.js   从柠檬云抓取数据的主要业务逻辑（本期先不做柠檬云的）  
Js/util.js 业务用到的工具类

业务流程：

配置：
```
exports.conf = {
    whty_url_account_set:"http://127.0.0.1:8358/kdTransfer/accountSet",
    whty_suiyue_hostname:"124.71.194.238",
    whty_suiyue_port:31100,
    whty_suiyue_login_path:"/api/auth/jwt/token"
}
```

whty_suiyue_hostname为岁月云实际的地址或者域名，提测或者上线注意修改。

## 3.编译和打包
从gitlab下载代码后
下载依赖包：npm install
本地运行调试：npm start
安装打包工具，注意不要把打包工具和其他无关的包加到项目依赖中，否则会引起打出来的包文件过大
npm install electron-packager
打包： npm run electron-packager
在项目根目录会生成最终的可运行文件acc-import-win32-x64，将此文件夹压缩为zip格式即可发布使用。
## 4.客户端升级配置
要实现客户端的自动或者手动升级，需要搭建升级服务器，有多种可选方案，当前采用的是Hazel ，部署到云端，不需要自己搭建升级服务器。
### 4.1.升级代码配置
参考：https://www.electronjs.org/docs/tutorial/updates#deploying-an-update-server
本地开发调试需要将升级相关的代码注释掉，只有打包的时候才打开升级的代码。
```
const { app, autoUpdater } = require('electron')
const server = <your-deployment-url>
const url = `${server}/update/${process.platform}/${app.getVersion()}`
autoUpdater.setFeedURL({ url })
```

### 4.2.electron-release-server
这是一个开源的electron更新服务，可以通过本地部署的方式为electron提供升级服务，优点是代码不需要托管到github，缺点是需要部署在自己的服务器上。
项目地址：https://github.com/ArekSredzki/electron-release-server
注意，通过npm install安装的时候，会因为网络原因，安装失败，我试了很多次都没有成功，后来是安装购买了翻墙软件，npm install才成功的。
### 4.3.Hazel 
这种方式是将升级服务部署到云端，应用的源码需要上传到github，并且授权给云端服务器，当应用的源码有更新时，云端服务器可以拿到这些更新并且推送给客户端应用。
项目地址：https://github.com/vercel/hazel
# 参考文档
- 官方：https://www.electronjs.org/docs
- w3cschool:https://www.w3cschool.cn/electronmanual/
- 腾讯课堂1：https://ke.qq.com/course/455645?taid=4035126070014941
- 腾讯课堂2：https://ke.qq.com/course/467628
- 慕课网：https://www.imooc.com/learn/1198
- 腾讯云文档：https://cloud.tencent.com/developer/doc/1070