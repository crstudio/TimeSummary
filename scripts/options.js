window.addEventListener("load", setBtn, false);
var csnTemp;
var jsonCustomerSiteName;
$(function () {
    if (localStorage.getItem("showdefaultname") == "0") {   //显示默认网站名
        $("#checkshowname").attr("checked", false);
    } else {
        localStorage.setItem("showdefaultname", "1");
    }
    if (localStorage.getItem("showratio") == "0") { //显示时间占比
        $("#checkshowratio").attr("checked", false);
    }
    else {
        localStorage.setItem("checkshowratio", "1");
    }
    if (localStorage.getItem("tsnewtabcheck") == "0") {         //点击网站名直接访问网站
        $("#checknewtab").attr("checked", false);
    }
    else {
        localStorage.setItem("tsnewtabcheck", "1");
    }
    if (localStorage.getItem("tstopmsg") == "-1" || localStorage.getItem("tstopmsg") == "" || localStorage.getItem("tstopmsg") == null) {         //排行榜消息提醒时间
        $("#checktopmsg").attr("checked", false);
        $("#topmsgtimepicker").hide();
    }
    else {
        $("#topmsgtime").val(localStorage.getItem("tstopmsg"));
        $("#topmsgtimepicker").show();
    }
    //显示条数
    var showNum = localStorage.getItem("TMshowsitenum");
    showNum = showNum == null ? "15" : showNum;
    $("#showsitenum").val(showNum);
    csnTemp = localStorage.getItem("timesummaryCSN");
    jsonCustomerSiteName = csnTemp == null || csnTemp == "" ? {} : JSON.parse(csnTemp);
    setSiteList();

    $("#checktopmsg").change(function () {
        if ($("#checktopmsg").is(':checked')) {
            $("#topmsgtimepicker").show();
        } else {
            $("#topmsgtimepicker").hide();
        }
    });
});

function setSiteList() {
    let siteData = JSON.parse(localStorage.getItem("timesummary"));
    siteData = jsonSort(siteData, 'timevalue', true);
    let siteListHtml = "";
    let defaultSiteName = "";       //默认网站名
    let customSiteName = "";    //自定义网站名
    let siteCount = siteData.length > 100 ? 100 : siteData.length;      //显示网站个数
    for (var i = 0; i < siteCount; i++) {
        defaultSiteName = sitejson[siteData[i].sitedomain] != undefined ? sitejson[siteData[i].sitedomain] : "";
        if (jsonCustomerSiteName.hasOwnProperty(siteData[i].sitedomain) && jsonCustomerSiteName[siteData[i].sitedomain].sitename != "") {   //如果重命名过，则显示重命名
            customSiteName = jsonCustomerSiteName[siteData[i].sitedomain].sitename;
        } else {
            customSiteName = "";
        }
        siteListHtml += "<tr><td id='sitename" + i + "' class='sitename' title='" + siteData[i].sitedomain + "'>" + siteData[i].sitedomain + "</td><td title='" + defaultSiteName + "'>" + defaultSiteName + "</td><td><input id='input" + i + "' class='custominput' autocomplete='off' value='" + customSiteName + "' /></td><td class='savebtn'><button id='sitesavebtn" + i + "' class='sitesavebtn' type='button'>保存</button></td></tr>";
    }
    $("#sitelist").append(siteListHtml);
    $(".sitesavebtn").click(function (event) {
        updateSiteName(event.target.id.replace('sitesavebtn', ''));
    });
}

function setBtn() {
    document.getElementById("btnsave").onclick = function () {
        saveOptions();
    }
    document.getElementById("btnclearhistory").onclick = function () {
        clearHistory();
    }
}

function saveOptions() {
    var showSiteNum = document.getElementById("showsitenum").value;
    localStorage.setItem("TMshowsitenum", showSiteNum);

    if ($("#checkshowname").is(':checked')) {  //是否显示占比
        localStorage.setItem("showdefaultname", "1");
    } else {
        localStorage.setItem("showdefaultname", "0");
    }

    if ($("#checkshowratio").is(':checked')) {  //是否显示占比
        localStorage.setItem("showratio", "1");
    } else {
        localStorage.setItem("showratio", "0");
    }

    if ($("#checknewtab").is(':checked')) {      //点击网站名直接访问网站
        localStorage.setItem("tsnewtabcheck", "1");
    } else {
        localStorage.setItem("tsnewtabcheck", "0");
    }

    if ($("#checktopmsg").is(':checked')) {      //排行榜消息提醒时间
        localStorage.setItem("tstopmsg", $("#topmsgtime").val());
    } else {
        localStorage.setItem("tstopmsg", "-1");
    }

    chrome.extension.sendRequest({ greeting: "updatenum" }, function (response) {
    });
    alert("保存成功！");
}

//清除所有记录
function clearHistory() {
    if (confirm("是否确认清除所有记录?")) {
        localStorage.setItem("timesummary", "");    //网站时间json
        localStorage.setItem("tstotaltime", "");    //总时间
        localStorage.setItem("timesummary_today", "");    //今天网站时间json
        localStorage.setItem("tstotaltime_today", "");    //今天总时间
        localStorage.setItem("timesummaryCSN", "");    //自定义网站名
    }
    chrome.extension.sendRequest({ greeting: "clearhistory" }, function (response) {
    });
}

//更新自定义网站名
function updateSiteName(order) {
    let sitename = $("#input" + order).val();
    let sitedomain = $("#sitename" + order).html();
    if (jsonCustomerSiteName.hasOwnProperty(sitedomain)) {
        jsonCustomerSiteName[sitedomain].sitename = sitename;
    } else {
        jsonCustomerSiteName[sitedomain] = { "sitename": sitename, "show": "1" };
    }
    localStorage.setItem("timesummaryCSN", JSON.stringify(jsonCustomerSiteName));
}