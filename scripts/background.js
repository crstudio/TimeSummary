let timeJson;
let timeJsonToday;
let timeDateStorage;        //总共
let timeDateStorageToday;       //今天

//从localStorage中读取数据
getDataFromStorage();

function getDataFromStorage() {
    //获取总数据
    timeDateStorage = localStorage.getItem("timesummary");
    if (timeDateStorage == null || timeDateStorage === "") {
        timeJson = [];
        localStorage.setItem("timesummary", JSON.stringify(timeJson));
    } else {
        timeJson = JSON.parse(timeDateStorage);
    }
    //获取今天数据
    timeDateStorageToday = localStorage.getItem("timesummary_today");
    let todayStr = getDateStr();
    if (timeDateStorageToday == null || timeDateStorageToday === "") {
        timeJsonToday = {"date": "" + todayStr + "", "site": []};
        localStorage.setItem("timesummary_today", JSON.stringify(timeJsonToday));
        localStorage.setItem("tstotaltime_today", 0);
    } else {
        timeJsonToday = JSON.parse(timeDateStorageToday);
        if (timeJsonToday.date !== todayStr) {
            timeJsonToday = {"date": "" + todayStr + "", "site": []};
            localStorage.setItem("timesummary_today", JSON.stringify(timeJsonToday));
            localStorage.setItem("tstotaltime_today", 0);
        }
    }
}

window.setInterval(function () {    //获取当前路径
    chrome.tabs.getSelected(null, function (tab) {
        let sitedomain = urlToDomain(tab.url);
        sitedomain = getSingleUrl(sitedomain);
        if (sitedomain !== "") {
            let todayStr = getDateStr();
            if (timeJsonToday.date !== todayStr) {
                timeJsonToday = {"date": "" + todayStr + "", "site": []};
                localStorage.setItem("timesummary_today", JSON.stringify(timeJsonToday));
                localStorage.setItem("tstotaltime_today", 0);
            }
            addTimeToTotal();
            addTimeToSite(sitedomain);
        }
    });
    if (localStorage.getItem("tstopmsg") != null && localStorage.getItem("tstopmsg") !== "" && getTimeStr() === localStorage.getItem("tstopmsg") + ":00") {
        notifyMe();
    }
}, 1000);

function addTimeToSite(sitedomain) {
    let isAdded = false;
    let isAddedToday = false;
    //总数据
    for (let i = 0; i < timeJson.length; i++) {
        if (timeJson[i].sitedomain === sitedomain) {
            timeJson[i].timevalue += 1;
            isAdded = true;
            break;
        }
    }
    if (!isAdded) {
        let arr = {"sitedomain": sitedomain, "timevalue": 1}
        timeJson.push(arr);
    }
    //今天数据
    for (let i = 0; i < timeJsonToday.site.length; i++) {
        if (timeJsonToday.site[i].sitedomain === sitedomain) {
            timeJsonToday.site[i].timevalue += 1;
            isAddedToday = true;
            break;
        }
    }
    if (!isAddedToday) {
        let arr = {"sitedomain": sitedomain, "timevalue": 1}
        timeJsonToday.site.push(arr);
    }

    localStorage.setItem("timesummary", JSON.stringify(timeJson));
    localStorage.setItem("timesummary_today", JSON.stringify(timeJsonToday));

    isAdded = false;
    isAddedToday = false;
}

//记录总时间
function addTimeToTotal() {
    let totalTime = parseInt(localStorage.getItem("tstotaltime"));
    if (totalTime === 0 || totalTime == null || isNaN(totalTime)) {
        totalTime = 1;
        for (let i = 0; i < timeJson.length; i++) {
            totalTime += timeJson[i].timevalue;
        }
    } else {
        totalTime++;
    }
    localStorage.setItem("tstotaltime", totalTime);

    let totalTimeToday = parseInt(localStorage.getItem("tstotaltime_today"));
    if (totalTimeToday === 0 || totalTimeToday == null || isNaN(totalTimeToday)) {
        totalTimeToday = 1;
    } else {
        totalTimeToday++;
    }
    localStorage.setItem("tstotaltime_today", totalTimeToday);
}

//把网址变成domain
function urlToDomain(str) {
    let siteDomain = "";
    if (isSiteUrl(str)) {
        let pattern = /^(?:(\w+):\/\/)?(?:(\w+):?(\w+)?@)?([^:\/\?#]+)(?::(\d+))?(\/[^\?#]+)?(?:\?([^#]+))?(?:#(\w+))?/;
        siteDomain = pattern.exec(str)[4];
        siteDomain = siteDomain.replace("www.", "");
    }
    return siteDomain;
}

//判断字符串是否为网址
function isSiteUrl(url) {
    let urlpattern = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    let objExp = new RegExp(urlpattern);
    return objExp.test(url);
}

//监听消息
chrome.extension.onRequest.addListener(
    function (request, sender, sendResponse) {
        if (request.greeting === "clearhistory") { //清空历史消息
            timeJson = [];
            timeJsonToday = {};
            totalTime = 0;
            totalTimeToday = 0;
            getDataFromStorage();
        }
    });

function getSingleUrl(stieurl) {
    let singleUrl = stieurl;
    for (let i = 0; i < repeatSiteUrl.length; i++) {
        if (stieurl.indexOf(repeatSiteUrl[i]) >= 0) {
            singleUrl = repeatSiteUrl[i];
            break;
        }
    }
    return singleUrl;
}

//排行提醒
function notifyMe() {
    if (!Notification) {
        alert('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    } else {
        let timeJsonTodayTemp = jsonSort(timeJsonToday.site, 'timevalue', true);
        let top1 = getSiteName(timeJsonTodayTemp[0].sitedomain) + "-" + secondToCommonTime(timeJsonTodayTemp[0].timevalue);
        let top2 = getSiteName(timeJsonTodayTemp[1].sitedomain) + "-" + secondToCommonTime(timeJsonTodayTemp[1].timevalue);
        let top3 = getSiteName(timeJsonTodayTemp[2].sitedomain) + "-" + secondToCommonTime(timeJsonTodayTemp[2].timevalue);
        let topnotify = chrome.notifications.create(null, {
            type: 'list',
            iconUrl: 'images/icon_128.png',
            title: '时间脚印-今日浏览排行',
            message: "",
            items: [{title: "Top1：", message: top1}, {title: "Top2：", message: top2}, {title: "Top3：", message: top3}]
        });
    }
}

