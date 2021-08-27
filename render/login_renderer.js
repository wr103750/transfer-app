$(function (){
    $("#b_login").click(function (){
        let remember = $("#i_remember").is(":checked");
        console.info(remember);
        window.context.login($("#i_username").val(),$("#i_password").val(),remember);
    });
    //获取保存的账号密码（如果有)
    window.context.initRemember();
});
