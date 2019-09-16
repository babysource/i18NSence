chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "MARKER") {
        var baseImage = new Image();
        var i18nSence = jMagic.Fn.id("i18nSence");
        var clipImage = jMagic.Fn.id("clipImage");
        if (i18nSence != null && clipImage != null) {
            var docSize = jMagic.Util.getDocSize();
            if (docSize != null) {
                jMagic.Util.setElemSize(i18nSence, {
                    w: (clipImage.width = docSize.webW),
                    h: (clipImage.height = docSize.webH)
                });
            }
            // 捕获图片
            var grabImage = jMagic.Fn.id("grabImage");
            if (grabImage != null) {
                grabImage.src = request.result;
                baseImage.src = request.result;
            }
            // 区域截图
            var clipSynth = clipImage.getContext("2d");
            if (clipSynth != null) {
                var drawPanel = jMagic.Fn.id("drawPanel");
                if (drawPanel != null) {
                    var graphic = new jMagic.Graphic(drawPanel);
                    if (graphic != null) {
                        jMagic.Fx.drag(document.body, {
                            down: function (e) {
                                e.o = null;
                                e.m = jMagic.Util.getMouse(e.e);
                            },
                            move: function (e) {
                                if (e.m && (e.p = jMagic.Util.getMouse(e.e)) && (
                                    Math.abs(e.p.x - e.m.x) > 6 && Math.abs(e.p.y - e.m.y) > 6
                                )) {
                                    if (e.o == null) {
                                        clipSynth.drawImage(baseImage, 0, 0, clipImage.width, clipImage.height);
                                        // 创建标注
                                        e.o = graphic.createRect({
                                            thick: 3,
                                            stuff: "#FF0000",
                                            alpha: {
                                                fill: 0
                                            }
                                        });
                                    }
                                    e.o.point = {
                                        x: (e.m.x + e.p.x) / 2,
                                        y: (e.m.y + e.p.y) / 2
                                    };
                                    e.o.extra = {
                                        x: (e.m.x - e.p.x) / 2,
                                        y: (e.m.y - e.p.y) / 2
                                    };
                                    e.o.paint();
                                }
                            },
                            stop: function (e) {
                                if (e.m && e.o) {
                                    e.o.title = prompt("请输入多语言键值：", "");
                                    if (jMagic.Match.isEmpty(e.o.title)) {
                                        e.o.erase();
                                    } else {
                                        e.o.paint();
                                        // 图像合成
                                        var coord = {
                                            w: Math.abs(e.o.extra.x) * 2,
                                            h: Math.abs(e.o.extra.y) * 2,
                                            x: e.o.point.x - Math.abs(e.o.extra.x),
                                            y: e.o.point.y - Math.abs(e.o.extra.y)
                                        };
                                        clipSynth.beginPath();
                                        clipSynth.rect(coord.x, coord.y, coord.w, coord.h);
                                        clipSynth.strokeStyle = "red";
                                        clipSynth.lineWidth = 3;
                                        clipSynth.stroke();
                                        chrome.runtime.sendMessage({
                                            action: "SAVEAS",
                                            result: {
                                                data: clipImage.toDataURL("image/png"),
                                                path: request.output + "/" + e.o.title + ".png"
                                            }
                                        });
                                    }
                                }
                            }
                        }).start();
                    }
                }
            }
        }
    }
});