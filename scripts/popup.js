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
        let detailJson = tsCommonJS.getStorageJson('timesummary');
        detailJson = jsonSort(detailJson, 'timevalue', true);
        for (let i = 0; i < 15; i++) {
            $("#detailleft").append('<ul><li class="sitecolumn">' + detailJson[i].sitedomain+ '</li><li class="timecolumn">' + detailJson[i].timevalue + '</li><li class="ratiocolumn">10%</li></ul>');
        }
    }
}