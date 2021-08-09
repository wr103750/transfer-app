$(function (){
    $("#b_login").click(function (){
        window.context.login($("#i_username").val(),$("#i_password").val());
    });
});