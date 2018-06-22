let timeJson;
let timeOrder = true;
let totalTime = 0;
let jsonCustomerSiteName;       //用户自定义网站名
let timeType = 1;       //时间类型：0总、1今天

$(function () {
    //获取自定义网站json
    let csnTemp = localStorage.getItem("timesummaryCSN");
    jsonCustomerSiteName = csnTemp == null || csnTemp == "" ? {} : JSON.parse(csnTemp);
    setHtml();
    //时间排序
    $("#timeorder,#ratioorder").click(function () {
        timeOrder = !timeOrder;
        setHtml();
    });
    $(".switchbtn").on({
        "click": function () {
            if (timeType == 1) {
                timeType = 0;
                $($(this).children().get(0)).animate({ left: '-28px' }, 'normal');
                $($(this).children().get(1)).animate({ left: '0' }, 'normal');
            } else {
                timeType = 1;
                $($(this).children().get(1)).animate({ left: '28px' }, 'normal');
                $($(this).children().get(0)).animate({ left: '0' }, 'normal');
            }
            setHtml();
        },
        "mouseover": function () {
            $(".switchbtnfont").css("background-color", "#c9d8e3");
        },
        "mouseout": function () {
            $(".switchbtnfont").css("background-color", "#B0C4DE");
        }
    });
});
//从localStorage中读取数据
function getDataFromStorage() {
    let timeDateStorage;
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
    let datainfoid = timeType == 1 ? "divperdaydatainfo" : "divtotaldatainfo";
    let showSiteNum = localStorage.getItem("TMshowsitenum");
    let sitename = "";      //显示的网站名
    let sitedomain = "";        //显示的域名
    let timeofsite = "";        //显示的时间
    let siteCount = 0;     //显示条数
    let ratio = 0;
    let ratioHtml = "";
    let isShowRatio = localStorage.getItem("showratio");
    let dataInfoHtml = "";
    if (isShowRatio != "0") {
        if (timeType == 0) {
            totalTime = localStorage.getItem("tstotaltime");
        } else {
            totalTime = localStorage.getItem("tstotaltime_today");
        }
    } else {
        $(".spanratio").hide();
        $("body").css("width", "240px");
    }
    getDataFromStorage();
    if (timeJson.length == 0) {
        $("#divtitle").hide();
        $("#" + datainfoid).html("您还没有访问过任何网站！").show(); 
        if (timeType == 1) {
            $("#divperdaydatainfo").animate({ left: '0' }, 'normal');
            $("#divtotaldatainfo").animate({ left: '300px' }, 'normal').hide();
        } else {
            $("#divperdaydatainfo").animate({ left: '-300px' }, 'normal').hide();
            $("#divtotaldatainfo").animate({ left: '0' }, 'normal');
        }
        return;
    } else {
        $("#" + (timeType == 1 ? "divperdaydatainfo" : "divtotaldatainfo")).show();
    }
    if (showSiteNum == null || showSiteNum == 0) {
        showSiteNum = 15;
        localStorage.setItem("TMshowsitenum", "15");
    }
    siteCount = showSiteNum < timeJson.length ? showSiteNum : timeJson.length;
    for (let i = 0; i < siteCount; i++) {
        timeofsite = secondToCommonTime(timeJson[i].timevalue);
        if (isShowRatio != "0") {
            ratio = Math.round(timeJson[i].timevalue / totalTime * 1000) / 10.0;
            ratioHtml = "<span class='spanratio'>" + ratio + "%</span>";
        }
        sitedomain = timeJson[i].sitedomain;
        sitename = getSiteName(sitedomain);
        dataInfoHtml += "<li><span class='spanname'><span class='spansitename' title='" + sitedomain + "'>" + sitename + "</span><span class='imgupdatenamebtn' title='修改备注' ></span></span><span class='editspan'><input class='inputsitename' value='" + sitename + "' /><span class='imgupdatename' title='确定修改' ></span></span><span class='spantime'>" + timeofsite + "</span>" + ratioHtml + "</li>";
    }
    $("#" + datainfoid).html(dataInfoHtml);
    if (timeType == 1) {
        $("#divperdaydatainfo").animate({ left: '0' }, 'normal');
        $("#divtotaldatainfo").animate({ left: '300px' }, 'normal');
    } else {
        $("#divperdaydatainfo").animate({ left: '-300px' }, 'normal');
        $("#divtotaldatainfo").animate({ left: '0' }, 'normal');
    }
    //点击网站名直接访问网站
    if (localStorage.getItem("tsnewtabcheck") == 1) {
        $(".spansitename").bind({
            "click": function () {
                openNewTab("http://" + $(this).attr("title"));
            }
        });
    }
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

