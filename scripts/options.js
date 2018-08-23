$(function () {
    opt.init();
    $("#btnSave").on({
        "click": function () {
            opt.saveOptions();
        }
    });
    $("#btnClearHistory").on({
        "click": function () {
            opt.clearHistory();
        }
    });
});
var opt = {
    //自定义网站命名Json
    jsonCustomerSiteName: "",
    //初始化
    init: function () {
        if (tsCommonJS.getStorage("showdefaultname") == "0") { //显示默认网站名
            $("#checkshowname").attr("checked", false);
        } else {
            localStorage.setItem("showdefaultname", "1");
        }
        if (tsCommonJS.getStorage("tstopmsg") == "-1" || tsCommonJS.getStorage("tstopmsg") == "" || tsCommonJS.getStorage("tstopmsg") == null) { //排行榜消息提醒时间
            $("#checktopmsg").attr("checked", false);
            $("#topmsgtimepicker").hide();
        } else {
            $("#topmsgtime").val(tsCommonJS.getStorage("tstopmsg"));
            $("#topmsgtimepicker").show();
        }
        //显示条数
        var showNum = tsCommonJS.getStorage("TMshowsitenum");
        showNum = showNum == null ? "10" : showNum;
        $("#showsitenum").val(showNum);
        jsonCustomerSiteName = tsCommonJS.getStorageJson("timesummaryCSN");
        opt.initSiteList();

        $("#checktopmsg").change(function () {
            if ($("#checktopmsg").is(':checked')) {
                $("#topmsgtimepicker").show();
            } else {
                $("#topmsgtimepicker").hide();
            }
        });
    },
    //保存
    saveOptions: function () {
        var showSiteNum = $("#showsitenum").val();
        localStorage.setItem("TMshowsitenum", showSiteNum);

        if ($("#checkshowname").is(':checked')) { //是否显示备注名
            localStorage.setItem("showdefaultname", "1");
        } else {
            localStorage.setItem("showdefaultname", "0");
        }
        if ($("#checktopmsg").is(':checked')) { //排行榜消息提醒时间
            localStorage.setItem("tstopmsg", $("#topmsgtime").val());
        } else {
            localStorage.setItem("tstopmsg", "-1");
        }
        chrome.extension.sendRequest({
            greeting: "updatenum"
        }, function (response) {});
        alert("保存成功！");
    },
    //清除记录
    clearHistory: function () {
        if (confirm("是否确认清除所有记录？")) {
            localStorage.setItem("timesummary", ""); //网站时间json
            localStorage.setItem("tstotaltime", ""); //总时间
            localStorage.setItem("timesummary_today", ""); //今天网站时间json
            localStorage.setItem("tstotaltime_today", ""); //今天总时间
            localStorage.setItem("timesummaryCSN", ""); //自定义网站名
            opt.initSiteList(); //重新加载网站列表
            alert("清除完成！");
        }
        chrome.extension.sendRequest({
            greeting: "clearhistory"
        }, function (response) {});
    },
    //构造网站列表
    initSiteList: function () {
        let siteData = tsCommonJS.getStorageJson("timesummary");
        siteData = tsCommonJS.jsonSort(siteData, 'timevalue', true);
        let siteListHtml = "";
        let defaultSiteName = ""; //默认网站名
        let customSiteName = ""; //自定义网站名
        let siteCount = siteData.length > 100 ? 100 : siteData.length; //显示网站个数
        for (var i = 0; i < siteCount; i++) {
            defaultSiteName = sitejson[siteData[i].sitedomain] != undefined && sitejson[siteData[i].sitedomain][tsCommonJS.lang] != undefined && sitejson[siteData[i].sitedomain][tsCommonJS.lang] != "" ? sitejson[siteData[i].sitedomain][tsCommonJS.lang] : "";
            if (jsonCustomerSiteName.hasOwnProperty(siteData[i].sitedomain) && jsonCustomerSiteName[siteData[i].sitedomain].sitename != "") { //如果重命名过，则显示重命名
                customSiteName = jsonCustomerSiteName[siteData[i].sitedomain].sitename;
            } else {
                customSiteName = "";
            }
            siteListHtml += "<tr><td id='sitename" + i + "' class='sitename' title='" + siteData[i].sitedomain + "'>" + siteData[i].sitedomain + "</td><td title='" + defaultSiteName + "'>" + defaultSiteName + "</td><td><input id='input" + i + "' class='custominput' autocomplete='off' value='" + customSiteName + "' /></td><td class='savebtn'><button id='sitesavebtn" + i + "' class='sitesavebtn' type='button'>" + tsCommonJS.getLocalText("save") + "</button></td></tr>";
        }
        $("#sitelist").append(siteListHtml);
        $(".sitesavebtn").click(function (event) {
            opt.updateSiteName(event.target.id.replace('sitesavebtn', ''));
        });
    },
    //自定义网站名
    updateSiteName: function (order) {
        let sitename = $("#input" + order).val();
        let sitedomain = $("#sitename" + order).html();
        if (jsonCustomerSiteName.hasOwnProperty(sitedomain)) {
            jsonCustomerSiteName[sitedomain].sitename = sitename;
        } else {
            jsonCustomerSiteName[sitedomain] = {
                "sitename": sitename,
                "show": "1"
            };
        }
        localStorage.setItem("timesummaryCSN", JSON.stringify(jsonCustomerSiteName));
    }
};