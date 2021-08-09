const NOTIFICATION_TITLE = 'Title'
const NOTIFICATION_BODY = 'Notification from the Renderer process. Click to log to console.'
const CLICK_MESSAGE = 'Notification clicked'

new Notification(NOTIFICATION_TITLE, { body: NOTIFICATION_BODY }).onclick = () => console.log(CLICK_MESSAGE)

$(function(){
    $("#b_ceshi_kd").click(function (){
        window.context.accountTest($("#i_username").val(),$("#i_password").val(),"kd");
    });
    $("#b_ceshi_nmy").click(function (){
        window.context.accountTest($("#i_username").val(),$("#i_password").val(),"nmy");
    });
    $("#b_prev").click(function (){
        window.context.changePage("login.html");
    });
});
window.addEventListener('DOMContentLoaded', () => {
    document.querySelector("#b_dialog").onclick=function (){
        window.context.dialog("弹窗");
    }
})