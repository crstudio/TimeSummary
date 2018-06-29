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
    var h = myDate.getHours();       //获取当前小时数(0-23)
    var m = myDate.getMinutes();     //获取当前分钟数(0-59)
    var s = myDate.getSeconds();
    return (h > 10 ? h : "0" + h) + ":" + (m > 10 ? m : "0" + m) + ":" + (s > 10 ? s : "0" + s);
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
//根据域名获取网站名
function getSiteName(sitedomain) {
    var sitename = "";
    var csnTemp = localStorage.getItem("timesummaryCSN");
    jsonCustomerSiteName = csnTemp == null || csnTemp == "" ? {} : JSON.parse(csnTemp);
    if (jsonCustomerSiteName.hasOwnProperty(sitedomain) && jsonCustomerSiteName[sitedomain].sitename != "") {   //如果重命名过，则显示重命名
        sitename = jsonCustomerSiteName[sitedomain].sitename;
    } else if (localStorage.getItem("showdefaultname") != "0") {        //显示提供的默认网站名
        if (sitejson[sitedomain] != undefined) {        //如果sitejson中包含了该网址，则显示sitejson中的名称
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
                return sitedomain;
            }
        }
    } else {
        return sitedomain;
    }
    return sitename;
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