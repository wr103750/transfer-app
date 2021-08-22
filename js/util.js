let data = require("./data");
function parseCookie(cookie){
    var cookArray = [];
    cookie.forEach(item=>{
        var arr = item.split(';');
        cookArray.push(arr[0]);
    });
    var cookieString = cookArray.join(';');
    return cookieString;
}
function calPercent(){
    data.current_step++;
    //计算总步数
    let total_step = ((2*5)+7)*data.account_num;
    let percent = Math.round((data.current_step/total_step)*100);
    if(percent > 100){
        percent = 100;
    }
    return percent;
}
module.exports = {parseCookie,calPercent}
