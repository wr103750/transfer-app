/*
const NOTIFICATION_TITLE = 'Title';
const NOTIFICATION_BODY = 'Notification from the Renderer process. Click to log to console.';
const CLICK_MESSAGE = 'Notification clicked';
new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick = () => console.log(CLICK_MESSAGE);
*/
$(function(){
    $("#b_ceshi_kd").click(function (){
        //密码明文加密
        let password = $("#i_password").val();
        let username = $("#i_username").val();
        let encrypt = encodeURIComponent(encryptByDES(password, username));
        console.info(encrypt);
        window.context.accountTest(username,encrypt,"kd");
    });
    $("#b_prev").click(function (){
        window.context.changePage("login.html");
    });
    let soft_company = $("#soft_company");
    soft_company.change(companyChange);
    let soft_product = $("#soft_product");
    soft_product.change(productChange);
    soft_company.change();
});
window.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#b_dialog").onclick=function (){
        window.context.dialog("弹窗");
    }
})

//软件公司选择下拉框
function companyChange() {
    let first = document.getElementById("soft_company");
    let second = document.getElementById("soft_product");
    second.options.length = 0; // 清除second下拉框的所有内容
    if (first.selectedIndex === 0) {
        second.options.add(new Option("金碟账无忧V5.0", "01",true,true));
        second.options.add(new Option("金碟账无忧V1.0", "02",false,false));
    }

    if (first.selectedIndex === 1) {
        second.options.add(new Option("柠檬云财务", "11", false, true));  // 默认选中区
    }
    $("#soft_product").trigger("change");
}
//软件产品选择下拉框
function productChange(){
    let second = document.getElementById("soft_product");
    let index = second.selectedIndex;
    $(".c_parameter_area").hide();
    if(second.options[index].value === '01'){
        $("#span_kd_login").show();
    }
}