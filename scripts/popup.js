var timeJson;
var timeOrder = true;
var totalTime = 0;
var jsonCustomerSiteName;       //用户自定义网站名
var timeType = 1;       //时间类型：0总、1今天

$(function () {
    //获取自定义网站json
    var csnTemp = localStorage.getItem("timesummaryCSN");
    jsonCustomerSiteName = csnTemp == null || csnTemp == "" ? {} : JSON.parse(csnTemp);
    setHtml();
    //时间排序
    $("#timeorder,#ratioorder").click(function () {
        timeOrder = !timeOrder;
        setHtml();
    });
    $(".switchbtn").click(function () {
        if (timeType == 1) {
            timeType = 0;
            $("#switchtoday").removeClass("switchchecked");
            $("#switchtotal").addClass("switchchecked");
            $("#switchbtnfont").attr("title", "查看总数据");
        }
        else {
            timeType = 1;
            $("#switchtotal").removeClass("switchchecked");
            $("#switchtoday").addClass("switchchecked");
            $("#switchbtnfont").attr("title", "查看今天数据");
        }
        setHtml();
    });
});
//从localStorage中读取数据
function getDataFromStorage() {
    var timeDateStorage;
    if (timeType == 0) {        //总数据
        timeDateStorage = localStorage.getItem("timesummary");
    }
    else {      //今天的数据
        timeDateStorage = localStorage.getItem("timesummary_today");
    }

    if (timeDateStorage == null || timeDateStorage == "") {
        if (timeType == 0) {
            timeJson = [];
            localStorage.setItem("timesummary", JSON.stringify(timeJson));
        } else {
            timeJson = { "date": "", "site": [] };
            localStorage.setItem("timesummary_today", JSON.stringify(timeJson));
        }
    } else {
        if (timeType == 0) {
            timeJson = JSON.parse(timeDateStorage);
        } else {
            timeJson = JSON.parse(timeDateStorage).site;
        }
        timeJson = jsonSort(timeJson, 'timevalue', timeOrder);
    }
}
//展示界面
function setHtml() {
    var isnewtab = localStorage.getItem("tsnewtabcheck");
    var showSiteNum = localStorage.getItem("TMshowsitenum");
    var htmlDataInfo = "";
    var sitename = "";
    var sitedomain = "";
    var timeofsite = "";
    var siteLength = 0;
    var ratio = 0;
    var ratioHtml = "";

    var isShowRatio = localStorage.getItem("showratio");
    var isShowDefaultName = localStorage.getItem("showdefaultname");
    if (isShowRatio != "0") {
        if (timeType == 0) {
            totalTime = localStorage.getItem("tstotaltime");
        } else {
            totalTime = localStorage.getItem("tstotaltime_today");
        }
    } else {
        $(".tdratio").hide();
        $("body").css("width", "240px");
    }
    $(".trsitedata").remove();  //先清空
    getDataFromStorage();

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
    }
    else {
        siteLength = timeJson.length;
    }
    for (var i = 0; i < siteLength; i++) {
        timeofsite = secondToCommonTime(timeJson[i].timevalue);
        if (isShowRatio != "0") {
            ratio = Math.round(timeJson[i].timevalue / totalTime * 1000) / 10.0;
            ratioHtml = "<td class='tdratio'><span>" + ratio + "%</span></td>";
        }
        sitedomain = timeJson[i].sitedomain;
        if (jsonCustomerSiteName.hasOwnProperty(sitedomain) && jsonCustomerSiteName[sitedomain].sitename != "") {   //如果重命名过，则显示重命名
            sitename = jsonCustomerSiteName[sitedomain].sitename;
        } else if (isShowDefaultName != "0") { //显示默认网站名
            if (sitejson[sitedomain] != undefined) { //如果sitejson中包含了该网址，则显示sitejson中的名称
                sitename = sitejson[sitedomain];
            } else {
                var isHadReapeatSite = false;
                for (var j = 0; j < repeatSiteUrl.length; j++) {
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
        htmlDataInfo += "<tr class='trsitedata'><td class='tdsite'><span class='showname'><span class='spansitename' title='" + sitedomain + "'>" + sitename + "</span><span class='imgupdatenamebtn' title='修改备注' ></span></span><span class='editspan'><input class='inputsitename' value='" + sitename + "' /><span class='imgupdatename' title='确定修改' ></span></span></td><td class='tdtime'><span>" + timeofsite + "</span></td>" + ratioHtml + "</tr>";
    }
    $("#divDataInfo").append(htmlDataInfo);
    //网站名称每一行
    $(".trsitedata").bind({
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
    $(".imgupdatenamebtn").bind({
        "click": function () {
            event.stopPropagation();
            event.preventDefault();
            $(".spansitename").show();  //其他行的网站名称显示
            $(this).parent().hide();        //网站名（class='showname'）隐藏
            $(this).parent().siblings(".editspan").show();      //修改网站（class='editspan'）名显示
        }
    });
    //确定修改按钮
    $(".imgupdatename").bind({
        "click": function () {
            if ($(this).parent().prev().children('.spansitename').attr("title") != "") {
                updateSiteName($(this).parent().prev().children('.spansitename').attr("title"), $(this).prev().val());

            } else {
                updateSiteName($(this).parent().prev().children('.spansitename').html(), $(this).prev().val());
            }
        }
    });
    //点击网站名直接访问网站
    if (isnewtab == 1) {
        $(".spansitename").bind({
            "click": function () {
                openNewTab("http://" + $(this).attr("title"));
            }
        });
    }
}
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
//更新自定义网站名
function updateSiteName(sitedomain, sitename) {
    if (jsonCustomerSiteName.hasOwnProperty(sitedomain)) {
        jsonCustomerSiteName[sitedomain].sitename = sitename;
    } else {
        jsonCustomerSiteName[sitedomain] = { "sitename": sitename, "show": "1" };
    }
    localStorage.setItem("timesummaryCSN", JSON.stringify(jsonCustomerSiteName));
    setHtml();
}
//监听事件
chrome.extension.onRequest.addListener(
  function (request, sender, sendResponse) {
      if (request.greeting == "clearhistory") {
          setHtml();
      }
  });

function openNewTab(openUrl) {
    chrome.tabs.create({ url: openUrl }, function () { });
}