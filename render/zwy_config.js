$(function(){
    //请求获取当前登录用户
    window.context.usernameRequest();
    let companyData = new Array();
    //账套数据初始化
    $("#s_account_set_checkbox").on("companyEvent",function (){
        $.each($("input[name=account_set]"),function (index,val){
           companyData.push({
               companyId:$(val).val(),
               companyName:$(val).attr("data-company-name"),
               accountDate:$(val).attr("data-account-date"),
               taxType:$(val).attr("data-tax-type")});
        });
    });
    //页面加载完之后再加载账套数据
    window.context.initAccountSet();
    //上一步
    $("#b_config_prev").click(function(){
        window.context.changePage("html/index.html");
    });
    //导入
    $("#b_data_import").click(function(){
        let companys = [];
        $.each($("input[name=account_set]:checked"),function(index,val){
            let info = {
                companyId:$(val).val(),
                companyName:$(val).attr("data-company-name"),
                accountDate:$(val).attr("data-account-date"),
                taxType:$(val).attr("data-tax-type")
            }
            companys.push(info);
        });
        if(companys.length == 0){
            window.context.dialog("请先选择账套");
            return;
        }
        let accountingStandard = $("input[name=accounting_standard]:checked").val();
        console.info(accountingStandard);
        let taxType = $("input[name=tax_type]:checked").val();
        window.context.dataImport(companys,accountingStandard,taxType);
    });
    //搜索
    $('#i_account_set_search').bind('input propertychange', function() {
        let keyword = $("#i_account_set_search").val();
        let html = "";
        for(let item of companyData) {
            if(item.companyName.search(keyword) != -1) {
                html = html + `<div class="checkbox"><label><input type="checkbox" name="account_set" value="${item.companyId}" class="form-check-input" 
                data-account-date="${item.accountDate}" data-company-name="${item.companyName}" data-tax-type="${item.taxType}">${item.companyName}</label></div>`;
            }
        }
        let span = document.getElementById("s_account_set_checkbox");
        span.innerHTML = html;
    });
});