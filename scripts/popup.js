$(function () {
    popup.setDetail();
    $("#title").on({
        "click": function () {
            // alert("");
        }
    });
    $("#switchDetailType").on({
        "click": function () {
            popup.switchBtnMouseEvent("click");
        },
        "mouseover": function () {
            popup.switchBtnMouseEvent("over");
        },
        "mouseout": function () {
            popup.switchBtnMouseEvent("out");
        },
    });
    $("#settingbtn").on({
        "click": function () {
            chrome.runtime.openOptionsPage();
        }
    });
    $(".sitedetailcolumn").on({
        "click": function () {
            if (tsCommonJS.getStorage("tsnewtabcheck") == 1) {
                chrome.tabs.create({
                    url: "http://" + $(this).attr("title")
                }, function () {});
            }
        }
    });

});

var popup = {
    isToday: true, //展示类型 true：今天、false：总共
    // “今/总”按钮鼠标事件
    switchBtnMouseEvent: function (type) {
        let btnSelected = this.isToday ? "spanTotal" : "spanToday";
        let btnUnSelected = this.isToday ? "spanToday" : "spanTotal";
        switch (type) {
            case "click": //切换按钮点击事件
                $("#" + btnUnSelected).css("color", "#a00");
                $("#" + btnSelected).css("color", "#ffffff");
                $("#detail").animate({
                    left: this.isToday ? "-280px" : "0"
                }, 'normal');
                $("#switchSlider").animate({
                    left: this.isToday ? "22.5px" : "0"
                }, 'normal');
                this.isToday = !this.isToday;
                this.setDetail();
                break;
            case "over": //切换按钮鼠标移入事件
                $("#switchSlider").css("background", "#a00");
                $("#" + btnSelected).css("color", "#a00");
                break;
            case "out": //切换按钮鼠标移除事件
                $("#switchSlider").css("background", "");
                $("#" + btnSelected).css("color", "#000000");
                break;
            default:
                break;
        }
    },
    setDetail: function () {
        let nameTotalTime = ""; //总时间localstorage名称
        let nameDetail = ""; //详情localstorage名称
        let nameDetailHtml = ""; //列表容器ID
        if (this.isToday) {
            nameTotalTime = "tstotaltime";
            nameDetail = "timesummary";
            nameDetailHtml = "detailleft";
        } else {
            nameTotalTime = "tstotaltime_today";
            nameDetail = "timesummary_today";
            nameDetailHtml = "detailright";
        }
        let showNum = tsCommonJS.getShowNum(); //显示网址数
        let totalTime = tsCommonJS.getStorageJson(nameTotalTime); //总时间
        let detailJson = tsCommonJS.getStorageJson(nameDetail); //获取数据
        detailJson = this.isToday ? detailJson : detailJson.site;
        detailJson = tsCommonJS.jsonSort(detailJson, 'timevalue', true); //排序
        showNum = showNum < detailJson.length ? showNum : detailJson.length;
        $("#" + nameDetailHtml).html('');
        for (let i = 0; i < showNum; i++) {
            let displaySiteName = tsCommonJS.getSiteName(detailJson[i].sitedomain);
            let displaySiteTime = tsCommonJS.secondToCommonTime(detailJson[i].timevalue);
            let ratio = Math.round(detailJson[i].timevalue / totalTime * 1000) / 10.0;
            $("#" + nameDetailHtml).append('<ul class="sitedetailul"><li class="sitecolumn sitedetailcolumn" title="' + detailJson[i].sitedomain + '">' + displaySiteName + '</li><li class="timecolumn">' + displaySiteTime + '</li><li class="ratiocolumn">' + ratio + '%</li></ul>');
        }
    }
}