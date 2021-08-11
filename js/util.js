function parseCookie(cookie){
    var cookArray = [];
    cookie.forEach(item=>{
        var arr = item.split(';');
        cookArray.push(arr[0]);
    });
    var cookieString = cookArray.join(';');
    return cookieString;
}
module.exports = {parseCookie}