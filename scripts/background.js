var isAdded = false;
var timeJson;
var isUpdateSiteName = false;
var timeDateStorage;

//从localStorage中读取数据
getDataFromStorage();
function getDataFromStorage() {
    timeDateStorage = localStorage.getItem("timesummary");
    if (timeDateStorage == null || timeDateStorage == "") {
        timeJson = [];
        localStorage.setItem("timesummary", JSON.stringify(timeJson));
    } else {
        timeJson = JSON.parse(timeDateStorage);
    }
}

window.setInterval(function () {    //获取当前路径
    chrome.tabs.getSelected(null, function (tab) {
        var sitedomain = urlToDomain(tab.url);
        sitedomain = getSingleUrl(sitedomain);
        if (sitedomain != "") {
            addTimeToTotal();
            addTimeToSite(sitedomain);
        }
    });
}, 1000);

function addTimeToSite(sitedomain) {
    for (var i = 0; i < timeJson.length; i++) {
        if (timeJson[i].sitedomain == sitedomain) {
            timeJson[i].timevalue += 1;
            isAdded = true;
            break;
        }
    }
    if (!isAdded) {
        var arr = { "sitename": "", "sitedomain": sitedomain, "timevalue": 1 }
        timeJson.push(arr);
    }

    if (!isUpdateSiteName) {    //如果重命名了网址，则不用+1s，需从localStorage再次读最新数据
        localStorage.setItem("timesummary", JSON.stringify(timeJson));
    } else {
        getDataFromStorage();
        isUpdateSiteName = false;
    }
    isAdded = false;
}
//记录总时间
function addTimeToTotal() {
    var totalTime = parseInt(localStorage.getItem("tstotaltime"));
    if (totalTime == 0 || totalTime == null || isNaN(totalTime)) {
        totalTime = 1;
        for (var i = 0; i < timeJson.length; i++) {
            totalTime += timeJson[i].timevalue;
        }
    } else {
        totalTime++;
    }
    localStorage.setItem("tstotaltime", totalTime);
}

//把网址变成domain
function urlToDomain(str) {
    var siteDomain = "";
    if (isSiteUrl(str)) {
        var pattern = /^(?:(\w+):\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?(\/[^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/;
        siteDomain = pattern.exec(str)[4];
        siteDomain = siteDomain.replace("www.", "");
    }
    return siteDomain;
}

//判断字符串是否为网址
function isSiteUrl(url) {
    var urlpattern = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    var objExp = new RegExp(urlpattern);
    return objExp.test(url);
}

//监听消息
chrome.extension.onRequest.addListener(
  function (request, sender, sendResponse) {
      if (request.greeting == "clearhistory") { //清空历史消息
          timeJson = [];
      }
      if (request.greeting == "updatesitename") {   //修改网址名称消息
          isUpdateSiteName = true;
      }
  });


function getSingleUrl(stieurl) {
    var singleUrl = stieurl;
    for (var i = 0; i < repeatSiteUrl.length; i++) {
        if (stieurl.indexOf(repeatSiteUrl[i]) >= 0) {
            singleUrl = repeatSiteUrl[i];
            break;
        }
    }
    return singleUrl;
}

