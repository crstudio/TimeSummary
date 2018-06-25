$(function () {
    $("#switchDetailType").on({
        "click": function () {
            popup.switchDetailType();
        }
    });
    $("#settingbtn").on({
        "click": function () {
            chrome.runtime.openOptionsPage();
        }
    });
    
});

var popup = {
    isToday: true, //展示类型 true：今天、false：总共
    switchDetailType: function () {
        $("#detail").animate({
            left: this.isToday ? "-280px" : "0"
        }, 'normal');
        this.isToday = !this.isToday;
    },

}

