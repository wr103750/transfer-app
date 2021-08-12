$(function(){
    //页面加载完之后再加载账套数据
    window.context.initAccountSet();
    //上一步
    $("#b_config_prev").click(function(){
        window.context.changePage("html/index.html");
    });
    //导入
    $("#b_data_import").click(function(){
        let companyIds = [];
        $.each($("input[name=account_set]:checked"),function(index,val){
            companyIds.push($(val).val());
        });
        window.context.dataImport(companyIds);
    });
});