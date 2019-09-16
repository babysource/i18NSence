var component = "";

chrome.browserAction.onClicked.addListener(function () {
    component = prompt("请输入组件名称：", component);
    if (component != null && component != "") {
        chrome.tabs.captureVisibleTab(null, {
            "format": "png"
        }, function (snapshot) {
            chrome.tabs.create({
                "url": "http://wyther.gitee.io/i18nscene/"
            }, function (tab) {
                chrome.tabs.executeScript(tab.id, {
                    file: "./script/jMagic.js"
                }, function () {
                    chrome.tabs.executeScript(tab.id, {
                        file: "./script/jMagic.graphic.js"
                    }, function () {
                        chrome.tabs.executeScript(tab.id, {
                            file: "foreground.js"
                        }, function () {
                            chrome.tabs.sendMessage(tab.id, {
                                action: "MARKER",
                                result: snapshot,
                                output: component
                            });
                        });
                    });
                });
            });
        });
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "SAVEAS") {
        chrome.downloads.download({
            url: request.result.data,
            saveAs: true,
            filename: request.result.path,
            conflictAction: "overwrite"
        });
    }
});