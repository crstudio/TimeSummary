$(function () {
    $("[local-data-html]").each(function () {
        $(this).html(tsCommonJS.getLocalText(this.getAttribute("local-data-html")));
    });
    $("[local-data-val]").each(function () {
        $(this).val(tsCommonJS.getLocalText(this.getAttribute("local-data-val")));
    });
    $("[local-data-title]").each(function () {
        $(this).attr("title", tsCommonJS.getLocalText(this.getAttribute("local-data-title")));
    });
});

var tsCommonJS = {
    //当前语言
    lang: chrome.i18n.getMessage('lang'),
    //读取localstorage中的数据
    getStorage: function (name) {
        return localStorage.getItem(name);
    },
    // 读取localstorage中的数据转为json
    getStorageJson: function (name) {
        let storageJson;
        let storageData = localStorage.getItem(name);
        if (storageData !== "" && storageData != null) {
            storageJson = JSON.parse(storageData);
        } else {
            switch (name) {
                case "timesummary":
                    storageJson = [];
                    localStorage.setItem("timesummary", JSON.stringify(storageJson));
                    break;
                case "timesummary_today":
                    storageJson = {
                        "date": "",
                        "site": []
                    };
                    localStorage.setItem("timesummary_today", JSON.stringify(storageJson));
                    break;
                default:
                    storageJson = {};
                    break;
            }
        }
        return storageJson;
    },
    // 把秒转换为对应的秒分时
    secondToCommonTime: function (s) {
        if (s < 60) {
            return s + "s";
        } else if (s / 60 < 60) {
            return Math.ceil(s / 60) + "m";
        } else {
            return Math.ceil(s / 3600) + "h";
        }
    },
    // JSON排序
    jsonSort: function (array, field, reverse) {
        if (array.length < 2 || !field || typeof array[0] !== "object") return array;
        if (typeof array[0][field] === "number") {
            array.sort(function (x, y) {
                return x[field] - y[field]
            });
        }
        if (typeof array[0][field] === "string") {
            array.sort(function (x, y) {
                return x[field].localeCompare(y[field])
            });
        }
        if (reverse) {
            array.reverse();
        }
        return array;
    },
    //获取网站名
    getSiteName: function (sitedomain) {
        let sitename = "";
        let customNameJson = this.getStorageJson("timesummaryCSN"); //自定义网站名
        if (customNameJson.hasOwnProperty(sitedomain) && customNameJson[sitedomain].sitename != "") { //如果自定义过，则显示自定义网站名
            sitename = customNameJson[sitedomain].sitename;
        } else if (this.getStorage("showdefaultname") !== "0") { //如果显示系统默认网站名
            if (sitejson[sitedomain] != undefined && sitejson[sitedomain][tsCommonJS.lang] != undefined && sitejson[sitedomain][tsCommonJS.lang] != "") { //如果sitejson中包含了该网址，则显示sitejson中的名称
                sitename = sitejson[sitedomain][tsCommonJS.lang];
            } else {
                let isHadReapeatSite = false;
                for (let j = 0; j < repeatSiteUrl.length; j++) {
                    if (sitedomain.indexOf(repeatSiteUrl[j]) >= 0) {
                        sitename = repeatSiteUrl[j];
                        isHadReapeatSite = true;
                        break;
                    }
                }
                if (!isHadReapeatSite) {
                    return sitedomain;
                }
            }
        } else { //显示网址
            sitename = sitedomain;
        }
        return sitename;
    },
    //获取显示网址数
    getShowNum: function () {
        let showNum = this.getStorage("TMshowsitenum");
        if (showNum === null || showNum === 0) {
            showNum = 10;
            localStorage.setItem("TMshowsitenum", "10");
        }
        return showNum;
    },
    //获取多语言文本
    getLocalText: function (key) {
        let text = chrome.i18n.getMessage(key);
        if (text) {
            return text;
        } else {
            return "";
        }
    }
};




function getDateStr() {
    var dateStr = "";
    var d = new Date();
    dateStr += d.getFullYear();
    dateStr += (d.getMonth() + 1) >= 10 ? d.getMonth() + 1 : "0" + (d.getMonth() + 1);
    dateStr += d.getDate();
    return dateStr;
}
//获取当前时间
function getTimeStr() {
    var myDate = new Date();
    var h = myDate.getHours(); //获取当前小时数(0-23)
    var m = myDate.getMinutes(); //获取当前分钟数(0-59)
    var s = myDate.getSeconds();
    return (h > 10 ? h : "0" + h) + ":" + (m > 10 ? m : "0" + m) + ":" + (s > 10 ? s : "0" + s);
}