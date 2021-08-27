//岁月会计云登录用户信息
exports.loginInfo = {};
//金碟账无忧登录重定向的cookie信息
exports.kd_login_redirect_cookie = '';
//当前切换的账套cookie
exports.kd_current_account_cookie = '';
exports.current_window = null;
//账套配置

exports.accountingStandard = "1";
exports.taxType = "1";
exports.asId = 0;

//导入进度数据
exports.account_num = 0;//账套数量
exports.current_step = 0;//当前步数
exports.import_stage = 9;//导入过程一共分为多少阶段