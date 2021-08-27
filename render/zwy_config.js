$(function(){
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
});