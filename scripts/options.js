window.addEventListener("load", setBtn, false);

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
    //显示条数
    var showNum = localStorage.getItem("TMshowsitenum");
    showNum = showNum == null ? "15" : showNum;
    $("#showsitenum").val(showNum);
});

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

    chrome.extension.sendRequest({ greeting: "updatenum" }, function (response) {
    });
    alert("保存成功！");
}

//清除所有记录
function clearHistory() {
    if (confirm("是否确认清除所有记录?")) {
        localStorage.setItem("timesummary", "");    //网站时间json
        localStorage.setItem("tstotaltime", "");    //总时间
    }
    chrome.extension.sendRequest({ greeting: "clearhistory" }, function (response) {
    });
}

