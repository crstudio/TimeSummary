var timeJson;
var showSiteNum = localStorage.getItem("TMshowsitenum");
var timeOrder = true;
var totalTime = 0;

$(function () {
    //时间排序
    $("#timeorder").click(function () {
        timeOrder = !timeOrder;
        setHtml();
    });
});

//从localStorage中读取数据
function getDataFromStorage() {
    var timeDateStorage = localStorage.getItem("timesummary");
    if (timeDateStorage == null || timeDateStorage == "") {
        timeJson = [];
        localStorage.setItem("timesummary", JSON.stringify(timeJson));
    } else {
        timeJson = JSON.parse(timeDateStorage);
        timeJson = jsonSort(timeJson, 'timevalue', timeOrder);
    }
}

//json排序
function jsonSort(array, field, reverse) {
    //数组长度小于2 或 没有指定排序字段 或 不是json格式数据
    if (array.length < 2 || !field || typeof array[0] !== "object") return array;
    //数字类型排序
    if (typeof array[0][field] === "number") {
        array.sort(function (x, y) { return x[field] - y[field] });
    }
    //字符串类型排序
    if (typeof array[0][field] === "string") {
        array.sort(function (x, y) { return x[field].localeCompare(y[field]) });
    }
    //倒序
    if (reverse) {
        array.reverse();
    }
    return array;
}

function setHtml() {
    var isShowRatio = localStorage.getItem("showratio");
    var isShowDefaultName = localStorage.getItem("showdefaultname");

    if (isShowRatio != "0") {
        totalTime = localStorage.getItem("tstotaltime");
    } else {
        $(".tdratio").hide();
        $("body").css("width", "240px");
    }
    $(".trsitedata").remove();  //先清空
    getDataFromStorage();
    var htmlDataInfo = "";
    var sitename = "";
    var sitedomain = "";
    var timeofsite = "";
    var siteLength = 0;
    var ratio = 0;
    var ratioHtml = "";
    if (timeJson.length == 0) {
        $("#divDataInfo").html("您还没有访问过任何网站！");
        return;
    }

    if (showSiteNum == null || showSiteNum == 0) {
        showSiteNum = 15;
        localStorage.setItem("TMshowsitenum", "15");
    }
    if (showSiteNum < timeJson.length) {
        siteLength = showSiteNum;
    } else {
        siteLength = timeJson.length;
    } 
    for (var i = 0; i < siteLength; i++) {
        timeofsite = secondToCommonTime(timeJson[i].timevalue);
        if (isShowRatio != "0") {
            ratio = Math.round(timeJson[i].timevalue / totalTime * 1000) / 10.0;
            ratioHtml = "<td class='tdratio'><span>" + ratio + "%</span></td>";
        }
        sitedomain = timeJson[i].sitedomain;
        if (timeJson[i].sitename != "") {   //如果重命名过，则显示重命名
            sitename = timeJson[i].sitename;
        } else if (isShowDefaultName != "0") { //显示默认网站名
            if (sitejson[sitedomain] != undefined) { //如果sitejson中包含了该网址，则显示sitejson中的名称
                sitename = sitejson[sitedomain];
            } else {
                var isHadReapeatSite = false;
                for (var j= 0;j < repeatSiteUrl.length;j++) {
                    if (sitedomain.indexOf(repeatSiteUrl[j]) >= 0) {
                        sitename = repeatSiteUrl[j];
                        isHadReapeatSite = true;
                        break;
                    }
                }
                if (!isHadReapeatSite) {
                    sitename = timeJson[i].sitedomain;
                }
            }
        } else {
            sitename = timeJson[i].sitedomain;
        } 
        htmlDataInfo += "<tr class='trsitedata'><td class='tdsite'><span class='spansitename' title='" + sitedomain + "'>" + sitename + "</span><span class='imgupdatenamebtn' title='修改备注' ></span><input class='inputsitename' style='display:none;' value='" + sitename + "' /><span class='imgupdatename' title='确定修改' ></span></td><td class='tdtime'><span>" + timeofsite + "</span></td>" + ratioHtml + "</tr>";
      
    }
    $("#divDataInfo").append(htmlDataInfo);
    //网站名称每一行
    $(".trsitedata").on({
        "mouseover": function () {
            $(this).addClass("hovertr");
            if ($(this).find(".imgupdatename").is(":hidden")) {
                $(this).find(".imgupdatenamebtn").css("display", "inline-block");
            }
        },
        "mouseout": function () {
            $(this).removeClass("hovertr");
            $(this).find(".imgupdatenamebtn").hide();
        }
    });
    //修改按钮
    $(".imgupdatenamebtn").on({
        "click": function () {
            event.stopPropagation();
            event.preventDefault();
            $(".spansitename").show();  //网站名称显示
            $(".inputsitename,.imgupdatename").hide();
            $(this).hide();
            $(this).prev().hide();
            $(this).next().show();
            $(this).next().next().css("display", "inline-block");
        }
    });
    //确定修改按钮
    $(".imgupdatename").on({
        "click": function () {
            if ($(this).prevAll(".spansitename").attr("title") != "") {
                updateSiteName($(this).prevAll(".spansitename").attr("title"), $(this).prev().val());
            } else {
                updateSiteName($(this).prevAll(".spansitename").html(), $(this).prev().val());
            }
        }
    });
}

window.addEventListener("load", setHtml, false);

//把秒转换为对应的秒分时
function secondToCommonTime(s) {
    if (s < 60) {
        return s + "s";
    } else if (s / 60 < 60) {
        return Math.ceil(s / 60) + "min";
    } else {
        return Math.ceil(s / 3600) + "h";
    }
}

function updateSiteName(sitedomain, sitename) {
    getDataFromStorage();   //更新前先读取一下最新的数据
    for (var i = 0; i < timeJson.length; i++) {
        if (timeJson[i].sitedomain == sitedomain) {
            if (sitename != sitedomain) {
                timeJson[i].sitename = sitename;
                localStorage.setItem("timesummary", JSON.stringify(timeJson));
                chrome.extension.sendRequest({ greeting: "updatesitename" }, function (response) {
                });
                break;
            }
        }
    }

    setHtml();
}

chrome.extension.onRequest.addListener(
  function (request, sender, sendResponse) {
      if (request.greeting == "clearhistory") {
          setHtml();
      } else if (request.greeting == "updatenum") {
          showSiteNum = localStorage.getItem("TMshowsitenum");
      }
  });

window.onerror = fnErrorTrap;
function fnErrorTrap(e) {
    alert(e);
}