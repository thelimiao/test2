/*
 combined files : 

 hy/widgets/suitableimage
 hy/widgets/multiellipsis
 hy/widgets/sslog
 hy/widgets/simpletip
 hy/widgets/ghostscroll
 hy/ss-overlay
 hy/share
 hy/exception
 hy/datafunc
 hy/feeditem
 hy/widgets/scrollmaster2
 hy/horiflow
 hy/widgets/tinyshow
 hy/widgets/taguploader/uploader
 hy/widgets/taguploader/tagger
 hy/widgets/placeholder
 hy/widgets/taguploader/taguploader
 hy/widgets/pagination
 hy/detail
 hy/item
 hy/views
 hy/router
 hy/widgets/limitbox
 hy/widgets/taguploader/aitagger
 hy/aixiu
 hy/noaixiu
 hy/fyb
 hy/userbar
 hy/sitenav
 hy/init

 */
KISSY.add('hy/widgets/suitableimage',function(S, DOM, Node) {
    var $, SuitableImage, defaultConfig;
    $ = Node.all;
    defaultConfig = {
        wrapperEl: null,
        image: null,
        width: null,
        height: null,
        cover: true,
        contain: false,
        lazyload: true,
        position: "center",
        relative: false,
        showDura: 0.5,
        showFunc: "easeBoth",
        loadingPic: null,
        autoResize: true
    };
    SuitableImage = (function() {
        function SuitableImage(config) {
            var height, width, wrapperEl,
                _this = this;
            if (typeof config === "string") {
                config = {
                    wrapperEl: config
                };
            } else if (config.length != null) {
                config = {
                    wrapperEl: config
                };
            }
            this.config = S.merge(defaultConfig, config);
            wrapperEl = this.config.wrapperEl = $(this.config.wrapperEl);
            if (this.config.image == null) {
                this.config.image = wrapperEl.attr('data-ks-simage') || wrapperEl.attr('data-image') || wrapperEl.one('img') && wrapperEl.one('img').attr('src');
            }
            if (this.config.image == null) {
                return;
            }
            this.width = width = !this.config.width ? wrapperEl.width() : this.config.width;
            this.height = height = !this.config.height ? wrapperEl.height() : this.config.height;
            if (!this.config.lazyload) {
                $(wrapperEl).append(DOM.create("<div style=\"width:100%;height:100%;background:url(" + this.config.image + ");\"></div>"));
            } else {
                if (this.config.loadingPic) {
                    wrapperEl.css("background", "url(" + this.config.loadingPic + ") center no-repeat");
                }
                this.pic = new Image();
                $(this.pic).css("opacity", 0);
                this.pic.onload = function() {
                    return _this._load.call(_this, _this.pic, width, height);
                };
                this.src = this.pic.src = this.config.image;
                this._size(this.pic, width, height);
            }
            if (this.config.autoResize && (this.config.cover || this.config.contain)) {
                $(window).on("resize", function() {
                    var s_height, s_width;
                    _this.width = s_width = !_this.config.width ? wrapperEl.width() : _this.config.width;
                    _this.height = s_height = !_this.config.height ? wrapperEl.height() : _this.config.height;
                    if (!(s_width === width && s_height === height)) {
                        return _this.resize(s_width, s_height);
                    }
                });
            }
        }

        SuitableImage.prototype._load = function(pic, width, height) {
            var inner;
            if (this.config.cover || this.config.contain) {
                inner = this._size(pic, width, height);
            } else {
                inner = DOM.create("<div style=\"width:100%;height:100%;background:url(" + pic.src + ");\"></div>");
                $(inner).css("opacity", 0);
            }
            this.config.wrapperEl.css("background", "none");
            this.release();
            return $(inner).appendTo(this.config.wrapperEl).animate({
                'opacity': 1
            }, this.config.showDura, this.config.showFunc);
        };

        SuitableImage.prototype._size = function(pic, width, height) {
            var inner;
            if (!pic.width || !pic.height) {
                return;
            }
            inner = null;
            if (document.body.style.backgroundSize != null) {
                inner = DOM.create("<span class='suitable-image-div' style='display: block'></span>");
                $(inner).css({
                    "background": "url(" + pic.src + ") " + (this.config.position ? this.config.position : "center") + " no-repeat",
                    "background-size": this.config.contain ? "contain" : "cover",
                    "width": "100%",
                    "height": "100%",
                    "opacity": 0,
                    "position": "absolute",
                    "top": 0,
                    "left": 0
                });
            } else {
                inner = this._sizeForLoser(pic, width, height);
            }
            return inner;
        };

        SuitableImage.prototype._sizeForLoser = function(pic, width, height) {
            var isBottom, isCenterH, isCenterV, isRight, left, picHeight, picWidth, s_height, s_left, s_top, s_width, scale, top, _ref;
            if (!pic.width || !pic.height) {
                return;
            }
            _ref = [pic.width, pic.height], picWidth = _ref[0], picHeight = _ref[1];
            scale = width / picWidth;
            if (picHeight * scale >= height && !this.config.contain) {
                s_width = width;
                s_height = picHeight * scale;
                s_top = (s_height - height) / 2;
            } else {
                s_height = height;
                s_width = height / picHeight * picWidth;
                s_left = (s_width - width) / 2;
            }
            isCenterH = this.config.position.indexOf("center") === 0;
            isCenterV = this.config.position.indexOf("center") >= 3 || (isCenterH && this.config.position.length === 6);
            isBottom = this.config.position.indexOf("bottom") >= 0;
            isRight = this.config.position.indexOf("right") >= 0;
            top = s_top && !this.config.contain ? -s_top : (isCenterH ? (height - s_height) / 2 : isBottom ? height - s_height : 0);
            left = s_left && !this.config.contain ? -s_left : (isCenterV ? (width - s_width) / 2 : isRight ? width - s_width : 0);
            this.config.wrapperEl.css("overflow", "hidden");
            $(pic).css({
                top: top,
                left: left,
                width: s_width,
                height: s_height,
                position: this.config.relative ? "relative" : "absolute",
                opacity: 0,
                display: 'block',
                zoom: 1
            });
            return pic;
        };

        SuitableImage.prototype.resize = function(width, height) {
            if (this.config.cover || this.config.contain) {
                this._sizeForLoser(this.pic, width, height);
            }
            return this;
        };

        SuitableImage.prototype.release = function() {};

        return SuitableImage;

    })();
    S.namespace("Util");
    return S.Util.suitableImage = SuitableImage;
}, {
    requires: ['dom', 'node']
});


/*
 @fileoverview 支持多行的文本截断
 @desc 一般用于过长内容隐藏并加省略号等自定义后缀，支持主流浏览器(IE6&+...)
 @author 筱谷<xiaogu.gxb@taobao.com>
 */

/*
 使用前提：
 1. 元素已经插入文档流；
 2. 元素不能设置隐藏

 注意事项：
 1. 参数 height 包括 padding，对应 KISSY 的 innerHeight
 2. 内联(inline)元素必需在参数(config.height)或属性(data-ks-height)中指定高度；
 3. 建议先写 CSS overflow: hidden，否则在 IE 下会有高度读取不正确的 bug

 使用栗子：
 <div id="J_Main"><span id="J_Inner">这是很长的多行字符这是很长的多行字符</span></div>

 KISSY.use "multiellipsis", (S, ME)->
 ME "#J_Inner",
 ...   : ...

 或者：
 KISSY.use "multiellipsis", (S, ME)->
 ME "#J_Main",
 child : "#J_Inner"
 ...   : ...

 默认配置
 Config =
 height      : 0       # 可选、自定义 inner 高度，优先读取 data-ks-height 属性
 interval    : 5       # 间隔，一般越大速度越快，但精度降低，优先读取 data-ks-interval
 endHTML     : "..."   # 省略字符，注意此处如有浮动相对定位等样式可能影响高度判断，优先读取 data-ks-endhtml
 exact       : false   # 当 interval 过大的可强制精确度，一般可设为 false，优先读取 data-ks-exact
 child       : ""      # 子元素选择器字符串：鉴于 text() 的特殊性，上面允许设置为 text node 的上一层元素，然后这里裁剪子元素；优先读取 data-ks-child
 keepLine    : false   # 是否保留换行，优先读取 data-ks-keepline
 setTitle    : false   # 是否将 title 属性设置为原文本，优先读取 data-ks-settitle
 */
KISSY.add('hy/widgets/multiellipsis',function(S, Node) {
    var $, Config, multiEllipsis, _ellipsis;
    $ = Node.all;
    if (!window.getComputedStyle) {
        window.getComputedStyle = function(el, pseudo) {
            this.el = el;
            this.getPropertyValue = function(prop) {
                var re;
                re = /(\-([a-z]){1})/g;
                if (prop === 'float') {
                    prop = 'styleFloat';
                }
                if (re.test(prop)) {
                    prop = prop.replace(re, function() {});
                    return arguments[2].toUpperCase();
                }
                if (el.currentStyle[prop]) {
                    return el.currentStyle[prop];
                } else {
                    return null;
                }
            };
            return this;
        };
    }
    Config = {
        height: 0,
        interval: 5,
        endHTML: "...",
        exact: false,
        child: "",
        keepLine: false,
        setTitle: false
    };
    multiEllipsis = function(el, config) {
        var els, _i, _len, _results;
        config = S.merge(Config, config);
        els = $(el);
        if (!els || !els.length) {
            return;
        }
        _results = [];
        for (_i = 0, _len = els.length; _i < _len; _i++) {
            el = els[_i];
            _results.push(_ellipsis(el, config));
        }
        return _results;
    };
    _ellipsis = function(el, config) {
        var end, len, style, sub, text, textEl;
        el = $(el);
        config = {
            height: el.attr("data-ks-height") || config.height || el.innerHeight(),
            interval: el.attr("data-ks-interval") || config.interval,
            endHTML: el.attr("data-ks-endhtml") || config.endHTML,
            exact: el.attr("data-ks-exact") || config.exact,
            child: el.attr("data-ks-child") || config.child,
            keepLine: el.attr("data-ks-keepline") || config.keepLine,
            setTitle: el.attr("data-ks-settitle") || config.setTitle
        };
        if (config.child) {
            textEl = el.one(config.child);
        } else {
            textEl = el;
        }
        config.text = textEl.attr("data-ks-text") || el.attr("data-ks-text") || textEl.text();
        style = window.getComputedStyle(el[0]);
        if (style.display === "inline") {
            el.css('overflow', 'visible');
            el.scrollHeightFunc = el.innerHeight;
        } else {
            el.scrollHeightFunc = function() {
                return el[0].scrollHeight;
            };
        }
        if (!config.keepLine) {
            config.text = config.text.replace(/[\r\n]/ig, "");
        }
        el.show();
        if (el.scrollHeightFunc() <= config.height) {
            return;
        }
        text = config.text;
        end = config.endHTML;
        len = text.length;
        textEl.html(text + end);
        while (el.scrollHeightFunc() > config.height && len >= 0) {
            text = text.substring(0, len - config.interval);
            len -= config.interval;
            textEl.html(text + end);
        }
        if (config.exact) {
            sub = 0;
            while (el.scrollHeightFunc() <= config.height && sub < config.text.length - len) {
                text = config.text.substring(0, len + sub++);
                textEl.html(text + end);
            }
            textEl.html(config.text.substring(0, len + sub - 2) + end);
        }
        if (config.setTitle) {
            textEl.attr('title', config.text);
        }
        if (el.scrollHeightFunc() > config.height) {
            return S.log("Failed");
        }
    };
    S.namespace("Util");
    return S.Util.multiellipsis = multiEllipsis;
}, {
    requires: ['node']
});

KISSY.add('hy/widgets/sslog',function(S, UA, DOM) {
    var SSlog;
    SSlog = function() {
        if (location.href.indexOf("?ks-debug") === -1) {
            return function() {};
        }
        if ((typeof console === "undefined" || console === null) || UA.mobile) {
            this.el = DOM.create("<div id='SS_log'><p></p></div>");
            DOM.css(this.el, {
                position: 'absolute',
                top: 10,
                left: 10,
                width: 160,
                height: "90%",
                'z-index': 99999,
                'overflow-y': 'scroll',
                opacity: 0.5,
                background: '#000',
                color: '#fff',
                'font-size': '10px',
                'line-height': '12px'
            });
            DOM.append(this.el, 'body');
            this.log = function() {
                var txt;
                txt = DOM.create('<p></p>');
                txt.innerHTML = [].slice.call(arguments).join(', ');
                return DOM.prepend(txt, '#SS_log');
            };
            window.console = {};
            window.console.log = this.log;
            return this.log;
        } else {
            return function() {
                return console.log([].slice.call(arguments).join(' '));
            };
        }
    };
    return SSlog();
}, {
    requires: ['ua', 'dom']
});

KISSY.add('hy/widgets/simpletip',function(S) {
    var $, DOM, SimpleTip;
    $ = S.all;
    DOM = S.DOM;
    return SimpleTip = (function() {
        function SimpleTip(el, text, pos, type) {
            var containerEl, tipEl, w_height, w_width,
                _this = this;
            this.el = el;
            this.text = text;
            this.pos = pos;
            this.type = type;
            if (!this.el) {
                return;
            }
            this.el = $(this.el);
            if (this.el.data("simpletip")) {
                return;
            }
            if ((this.pos != null) && this.pos !== 1) {
                this.pos = 0;
            }
            this.el.data("simpletip", true);
            this.el.data("simpletip", true);
            this.tipEl = tipEl = $(DOM.create("<div class=\"ss-simpletip-wrapper\"><span class=\"ss-simpletip-container\"><span class=\"ss-simpletip-icon\"></span><span class=\"ss-simpletip-content\">" + this.text + "</span><span class=\"ss-simpletip-close\">&times;</span></span></div>"));
            this.containerEl = containerEl = tipEl.one(".ss-simpletip-container");
            tipEl.on("click", function() {
                return _this.close();
            });
            $('body').on("mousewheel", function() {
                $('body').detach("mousewheel");
                return _this.close();
            });
            tipEl.appendTo('body');
            w_height = tipEl.height();
            w_width = tipEl.width();
            switch (this.type) {
                case "error":
                    tipEl.one(".ss-simpletip-icon").addClass("ss-simpletip-error");
                    break;
                case "warning":
                    tipEl.one(".ss-simpletip-icon").addClass("ss-simpletip-warning");
            }
            this.setPos(w_height, w_width);
            setTimeout(function() {
                return _this.close();
            }, 4000);
        }

        SimpleTip.prototype.setPos = function(i_height, i_width) {
            var left, top;
            this.el = $(this.el);
            if (this.pos) {
                top = this.el.offset().top + this.el.height() + 10;
            } else {
                top = this.el.offset().top - i_height - 10;
            }
            left = this.el.offset().left + this.el.width() / 2 - i_width / 2;
            if ((left + i_width) > DOM.viewportWidth()) {
                return this.tipEl.css({
                    opacity: 1,
                    top: top,
                    right: 0
                });
            } else {
                return this.tipEl.css({
                    opacity: 1,
                    top: top,
                    left: left
                });
            }
        };

        SimpleTip.prototype.close = function() {
            var error;
            this.tipEl.remove().empty();
            try {
                delete this;
            } catch (_error) {
                error = _error;
            }
            return this.el.data("simpletip", false);
        };

        return SimpleTip;

    })();
});

KISSY.add('hy/widgets/ghostscroll',function(S) {
    var $, GhostScroll, defaultConfig, tpl;
    $ = S.all;
    defaultConfig = {
        el: null,
        delay: 500,
        cancelBubble: true,
        offset: ['right', 0]
    };
    tpl = "<div class=\"ss-ghostscroll-wrapper\"><span class=\"ss-ghostscroll-thumb\"></span></div>";
    return GhostScroll = (function() {
        function GhostScroll(config) {
            var el, offset, pos, scrollEl, thumbEl;
            this.config = config;
            this.el = el = $(this.config.el);
            if (!el) {
                return;
            }
            this.isMac = false;
            this.config = S.merge(defaultConfig, this.config);
            this.scrollEl = scrollEl = $(S.DOM.create(tpl));
            this.thumbEl = thumbEl = scrollEl.one(".ss-ghostscroll-thumb");
            this.conHeight = this.calContainerHeight(el);
            this.conWidth = this.calContainerWidth(el) - 14;
            this.wrapperEl = $(this.wrapEl());
            this.resetHeight();
            this.bindReset();
            if (offset = this.config.offset) {
                pos = offset[0];
                scrollEl.css(pos, offset[1]);
            }
        }

        GhostScroll.prototype.wrapEl = function() {
            var content, wrapperEl;
            content = this.el.html();
            wrapperEl = S.DOM.create("<div class=\"ss-ghostscroll-ghost\" style=\"width:" + this.conWidth + "px;height:" + this.conHeight + "px\">" + content + "</div>");
            this.el.html("").append(wrapperEl);
            return wrapperEl;
        };

        GhostScroll.prototype.calRealHeight = function(el) {
            if (!$(el)) {
                el = this.el;
            }
            return el[0].scrollHeight;
        };

        GhostScroll.prototype.calContainerHeight = function(el) {
            if (!$(el)) {
                el = this.el;
            }
            return el.height();
        };

        GhostScroll.prototype.calContainerWidth = function(el) {
            if (!$(el)) {
                el = this.el;
            }
            return el.width();
        };

        GhostScroll.prototype.calThumbHeight = function() {
            this.thumbHeight = this.conHeight / this.realHeight * this.conHeight;
            return this.thumbEl.css({
                "height": this.thumbHeight
            });
        };

        GhostScroll.prototype.calTop = function() {
            return this.wrapperEl.scrollTop() / this.realHeight * this.conHeight;
        };

        GhostScroll.prototype.resetHeight = function() {
            this.realHeight = this.calRealHeight(this.wrapperEl);
            this.thumbHeight = this.calThumbHeight();
            if (this.realHeight <= this.conHeight) {
                this.el.addClass("ss-ghostscroll-invail");
                this.invail = true;
            } else {
                this.el.removeClass("ss-ghostscroll-invail");
                this.invail = false;
            }
            if (!this.isBind) {
                this.bindEvents();
                this.scrollEl.appendTo(this.el);
                this.scrollEl.hide();
                return this.isBind = true;
            }
        };

        GhostScroll.prototype.bindReset = function() {
            var _this = this;
            return this.wrapperEl.all("img").on("load", function() {
                return _this.resetHeight();
            });
        };

        GhostScroll.prototype.bindEvents = function() {
            var checkLeave, inEl, inThumb, isBind, mouseDown, mouseUp, timer, _top,
                _this = this;
            if (this.isMac) {
                this.wrapperEl.css({
                    "overflow-x": "hidden",
                    "overflow-y": "scroll"
                });
                return this.wrapperEl.on("mousewheel", function(ev) {
                    return ev.stopPropagation();
                });
            } else {
                this.wrapperEl.on("scroll", function() {
                    return _this.thumbEl.css({
                        top: _this.calTop()
                    });
                });
                timer = null;
                inEl = false;
                inThumb = false;
                mouseDown = false;
                isBind = false;
                checkLeave = function() {
                    if (!inThumb && !inEl && !mouseDown) {
                        isBind = false;
                        _this.releaseScroll();
                        _this.el.detach("mousemove");
                        return _this.wrapperEl.css("overflow-y", "hidden");
                    }
                };
                this.el.on("mouseenter", function() {
                    if (_this.invail) {
                        return;
                    }
                    clearTimeout(timer);
                    inEl = true;
                    if (isBind) {
                        return;
                    }
                    return timer = setTimeout(function() {
                        isBind = true;
                        return _this.bindScroll(_this.scrollEl, _this.wrapperEl);
                    }, _this.config.delay);
                });
                this.el.on("mouseleave", function() {
                    clearTimeout(timer);
                    inEl = false;
                    return S.later(function() {
                        return checkLeave();
                    }, _this.config.delay);
                });
                this.thumbEl.on("mouseenter", function(ev) {
                    return inThumb = true;
                });
                this.thumbEl.on("mouseleave", function(ev) {
                    inThumb = false;
                    return S.later(function() {
                        return checkLeave();
                    }, _this.config.delay);
                });
                _top = 0;
                this.thumbEl.on("mousedown", function(ev) {
                    ev.halt();
                    _top = ev.pageY;
                    mouseDown = true;
                    $('body').on("mouseup", function() {
                        return mouseUp();
                    });
                    return $('body').on("mousemove", function(ev) {
                        ev.halt();
                        if (typeof getSelection === "function") {
                            getSelection().removeAllRanges();
                        }
                        _this.wrapperEl.scrollTop(_this.wrapperEl.scrollTop() + (ev.pageY - _top) * 2);
                        return _top = ev.pageY;
                    });
                });
                mouseUp = function() {
                    mouseDown = false;
                    return $('body').detach("mouseup mousemove");
                };
                return this.el.on("mouseup", function() {
                    return mouseUp();
                });
            }
        };

        GhostScroll.prototype.bindScroll = function(scrollEl, wrapperEl) {
            var _this = this;
            if (!scrollEl) {
                scrollEl = this.scrollEl;
            }
            if (!wrapperEl) {
                wrapperEl = this.wrapperEl;
            }
            scrollEl.show();
            return wrapperEl.on("mousewheel", function(ev) {
                ev.halt();
                return wrapperEl.scrollTop(wrapperEl.scrollTop() - (ev.wheelDelta ? ev.wheelDelta : ev.detail * -120));
            });
        };

        GhostScroll.prototype.releaseScroll = function() {
            if (this.isMac) {
                this.wrapperEl.css({
                    "overflow": "hidden"
                });
            } else {
                this.scrollEl.hide();
            }
            return this.wrapperEl.detach("mousewheel");
        };

        return GhostScroll;

    })();
});

KISSY.add('hy/ss-overlay',function(S, DOM, Node, Anim, Event, UA) {
    var $, Overlay;
    $ = S.all;
    window.Overlay = Overlay = {
        overlayTypes: ["#J_WrapperOverlay", "#J_ContainerOverlay", "#J_DetailOverlay", "#J_ItemOverlay", "#J_CenterOverlay"],
        translateTypes: function(oType) {
            _overlay;
            var _overlay;
            if (typeof oType === "number") {
                _overlay = this.overlayTypes[oType];
            } else if (typeof oType === "string") {
                _overlay = oType;
            } else {
                _overlay = "#" + $(oType).attr("id");
            }
            return _overlay;
        },
        showOverlayWith: function(ins, oType, contentEl, closeBtn, animate) {
            var classO, idStr, isIE, wrapper, _overlay;
            idStr = this.translateTypes(oType);
            if ($(idStr) || $(idStr).length !== 0) {
                $(idStr).remove();
            }
            switch (idStr = idStr.replace("#", "")) {
                case "J_WrapperOverlay":
                    classO = "wrapper-overlay";
                    wrapper = true;
                    break;
                case "J_ContainerOverlay":
                    classO = "container-overlay";
                    break;
                case "J_DetailOverlay":
                    classO = "detail-overlay";
                    break;
                case "J_ItemOverlay":
                    classO = "item-overlay";
                    break;
                case "J_CenterOverlay":
                    classO = "center-overlay";
            }
            _overlay = $(DOM.create("<div class=\"overlay " + classO + "\" id=\"" + idStr + "\" style=\"z-index: 1500\"><div class=\"J_Lightbox\"></div>\n</div>"));
            _overlay.appendTo(wrapper ? $('#J_Wrapper') : $("#J_Container"));
            if (UA.ie <= 8) {
                isIE = true;
            }
            if (isIE) {
                animate = false;
            }
            _overlay.children(".active-overlay").remove();
            _overlay.append(contentEl);
            if ((animate == null) || animate === true) {
                _overlay.css({
                    'opacity': 0,
                    'display': 'block'
                });
                _overlay.animate({
                    'opacity': 1
                }, 0.2, "easeNone");
            } else {
                _overlay.css({
                    'display': 'block'
                });
            }
            _overlay.prop('instant', ins);
            return _overlay;
        },
        closeOverlay: function(oType, animate) {
            var ins, _overlay;
            if (oType != null) {
                _overlay = this.translateTypes(oType);
            } else {
                _overlay = Node.all('.overlay');
            }
            if ((animate == null) || animate === true) {
                Anim(_overlay, {
                    'opacity': 0
                }, 0.2, "easeNone", function() {
                    DOM.css(_overlay, {
                        'opacity': 0,
                        'display': 'none'
                    });
                    return $(_overlay).remove().empty();
                }).run();
            } else {
                DOM.css(_overlay, {
                    'opacity': 0,
                    'display': 'none'
                });
                $(_overlay).remove().empty();
            }
            ins = $(_overlay).prop('instant');
            return ins && (typeof ins.destroy === "function" ? ins.destroy() : void 0);
        }
    };
    Event.delegate(".wrapper", "click", "a.close", function(ev) {
        var overlay;
        if (overlay = $(ev.target).parent(".overlay")) {
            return Overlay.closeOverlay(overlay, true);
        }
    });
    return Overlay;
}, {
    requires: ["dom", "node", "anim", "event", "ua"]
});

KISSY.add('hy/share',function(S, Overlay) {
    var $, DOM, Share;
    $ = S.all;
    DOM = S.DOM;
    return Share = (function() {
        function Share(config) {
            this.config = config;
            config = this.config;
            if (config.url == null) {
                config.url = location.href;
            }
            if (config.title == null) {
                config.title = document.title;
            }
            if (config.relateUid == null) {
                config.relateUid = 3180401381;
            }
            if (config.appKey == null) {
                config.appKey = "";
            }
            if (config.pic == null) {
                config.pic = "";
            }
            if (config.name == null) {
                config.name = "";
            }
            if (config.text == null) {
                config.text = "";
            }
            config.content = "#淘宝后院# " + config.title + " " + config.name + " " + config.text;
            this.sinaURL = "http://service.weibo.com/share/share.php?title=" + (encodeURIComponent(config.content + " " + SELLER_SINA_WEIBO_NICK)) + "&url=" + (encodeURIComponent(config.url)) + "&appkey=" + config.appKey + "&pic=" + (encodeURIComponent(config.pic)) + "&ralateUid=" + config.relateUid;
            this.doubanURL = "http://shuo.douban.com/!service/share?image=" + (encodeURIComponent(config.pic)) + "&href=" + (encodeURIComponent(config.url)) + "&name=" + (encodeURIComponent(config.title)) + "&text=" + (encodeURIComponent(config.content + " " + SELLER_DOUBAN_NICK));
            this.qzoneURL = "http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?summary=" + (encodeURIComponent(config.content)) + "&url=" + (encodeURIComponent(config.url)) + "&site=" + (encodeURIComponent('淘宝后院')) + "&pics=" + (encodeURIComponent(config.pic)) + "&title=" + config.title;
            if (config.show || (config.show == null)) {
                this.init();
                this.show();
            }
        }

        Share.prototype.init = function() {
            var shareTpl;
            shareTpl = "<div class=\"overlay-share\">\n<a href=\"javascript:void(0)\" class=\"share-close\"></a>\n<p class=\"share-tip\">分享到：</p>\n<p class=\"share-btns\">\n<a href=\"" + this.sinaURL + "\" class=\"share-btn sina\" target=\"_blank\"></a>\n<a href=\"" + this.doubanURL + "\" class=\"share-btn douban\" target=\"_blank\"></a>\n</p>\n</div>";
            this.shareEl = $(DOM.create(shareTpl));
            return this.shareEl.one(".share-close").on("click", function() {
                return Overlay.closeOverlay("#J_CenterOverlay", false);
            });
        };

        Share.prototype.show = function() {
            return Overlay.showOverlayWith(this, "#J_CenterOverlay", this.shareEl, false, false);
        };

        return Share;

    })();
}, {
    requires: ["hy/ss-overlay"]
});

KISSY.add('hy/exception',function(S, Tip) {
    var $, DOM, Exception;
    $ = S.all;
    DOM = S.DOM;
    return Exception = {
        layer: $(DOM.create("<div class=\"freeze-layer\"></div>")),
        checkLogin: function(callback) {
            if (location.href.indexOf("http://wiki.ued.taobao.net/") === 0) {
                return true;
            }
            if ((typeof LOGIN_USER_ID === "undefined" || LOGIN_USER_ID === null) || LOGIN_USER_ID === null || !this.checkTaoLogin()) {
                this.showLogin();
                return false;
            }
            return true;
        },
        checkTaoLogin: function() {
            var gc, nick, tracknick;
            gc = S.Cookie.get;
            tracknick = gc('tracknick');
            nick = (gc('_nk_')) || tracknick;
            return !!(gc('_l_g_') && nick || gc('ck1') && tracknick);
        },
        checkVip: function(needLevel) {
            if ((typeof LOGIN_USER_ID === "undefined" || LOGIN_USER_ID === null) || LOGIN_USER_ID === null) {
                this.showLogin();
                return false;
            }
            if ((typeof VIP_LEVEL === "undefined" || VIP_LEVEL === null) || VIP_LEVEL === null || VIP_LEVEL < needLevel) {
                return false;
            }
            return true;
        },
        checkHasBuy: function() {
            if ((typeof LOGIN_USER_ID === "undefined" || LOGIN_USER_ID === null) || LOGIN_USER_ID === null) {
                this.showLogin();
                return false;
            }
            if ((typeof HAS_BUY === "undefined" || HAS_BUY === null) || HAS_BUY === null || HAS_BUY === 0) {
                return false;
            }
            return true;
        },
        checkIsSaler: function() {
            if ((typeof LOGIN_USER_ID === "undefined" || LOGIN_USER_ID === null) || LOGIN_USER_ID === null) {
                this.showLogin();
                return false;
            }
            if ((typeof IS_SALER === "undefined" || IS_SALER === null) || IS_SALER === null || IS_SALER === 1) {
                return false;
            }
            return true;
        },
        likeCheck: function(el, pos) {
            if (!this.checkLogin()) {
                return false;
            }
            if (!this.checkVip(1)) {
                this.showError(el, "你的淘宝会员等级较低，还不能喜欢哦！", pos);
                return false;
            }
            return true;
        },
        showLogin: function() {
            var contentEl, tpl,
                _this = this;
            tpl = $('#J_LoginTPL').html();
            tpl = tpl.replace(/redirectURL=(.+?)"/im, "redirectURL=" + encodeURIComponent(LOGIN_PROXY_URL + '?' + encodeURIComponent(location.href)) + '"');
            contentEl = $(DOM.create(tpl));
            contentEl.appendTo(this.layer);
            this.showOverlay();
            contentEl.one(".login-close").on("click", function(e) {
                e.preventDefault();
                return _this.closeOverlay();
            });
            return false;
        },
        showError: function(el, text, pos) {
            return new Tip(el, text, pos, "error");
        },
        showTip: function(el, text, pos) {
            return new Tip(el, text, pos);
        },
        showWarning: function(el, text, pos) {
            return new Tip(el, text, pos, "warning");
        },
        showOverlay: function() {
            this.layer.appendTo('body');
            return this.layer.show();
        },
        closeOverlay: function() {
            this.layer.hide();
            return this.layer.empty().remove();
        }
    };
}, {
    requires: ["hy/widgets/simpletip"]
});

KISSY.add('hy/datafunc',function(S, Ajax, JSON, SSlog) {
    var dataFunc;
    return dataFunc = {
        isFetching: false,
        Feeds: {
            feeds: [],
            feedIDs: [],
            feedHashs: [],
            feedDetailItemIDs: []
        },

        /*
         * 通过类型获取对应的 Feed 数组.
         * @param  {Number} type Feed 类型
         * @return {Array}
         */
        getFeedsByType: function(type) {
            var feed, _i, _len, _ref, _results;
            _ref = this.Feeds.feeds;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                feed = _ref[_i];
                if (type === 0 || feed.type === type) {
                    _results.push(feed);
                }
            }
            return _results;
        },
        Filter: function(rawData, pageIndex, view, callBack) {
            var feed, index, isEnd, _feeds;
            this.isFetching = false;
            if (!rawData || !rawData.success) {
                callBack.call(view, pageIndex, [], true);
            }
            _feeds = (function() {
                var _i, _len, _ref, _results;
                _ref = rawData.feeds;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    feed = _ref[_i];
                    if (!feed.content) {
                        continue;
                    }
                    feed.type = parseInt(feed.type, 10);
                    feed.key = this.Feeds.feeds.length;
                    if ((index = S.indexOf(feed.feedId.toString(), this.Feeds.feedIDs)) < 0) {
                        this.Feeds.feeds.push(feed);
                        this.Feeds.feedIDs.push(feed.feedId.toString());
                        this.Feeds.feedDetailItemIDs.push(feed.itemId != null ? feed.itemId.toString() : null);
                        _results.push(feed);
                    } else {
                        _results.push(this.Feeds.feeds[index]);
                    }
                }
                return _results;
            }).call(this);
            isEnd = !rawData.hasNext;
            return callBack.call(view, pageIndex, _feeds, isEnd);
        },
        FetchData: function(paramsObj) {
            var data, err,
                _this = this;
            if (this.isFetching) {
                return;
            }
            this.isFetching = true;
            data = {
                'type': paramsObj.cata,
                'itemId': paramsObj.itemId,
                'limit': paramsObj.count,
                'page': paramsObj.pageIndex + 1
            };
            try {
                return Ajax.jsonp(FEED_DATA_AJAX_CONTENT_URL, data, function(data) {
                    return _this.Filter(data, paramsObj.pageIndex, paramsObj.view, paramsObj.callBack);
                });
            } catch (_error) {
                err = _error;
                throw new Error("Parse Data Failed");
                return this.isFetching = false;
            }
        }
    };
}, {
    requires: ["ajax", "json", "./widgets/sslog"]
});

KISSY.add('hy/feeditem',function(S, D, N, E, A, SSlog) {
    var $, FeedItem;
    $ = S.all;
    return FeedItem = function(feed) {
        var domEl, elStr, self;
        self = this;
        self.feed = feed;
        feed.feedItem = this;
        if (!feed) {
            throw new SSError("Empty Feed Content");
        }
        self.domEl = null;
        if (feed.FeedItem == null) {
            elStr = feed.content;
            self.domEl = domEl = $(D.create(elStr));
            feed.content = "";
        } else {
            self.domEl = feed.FeedItem.domEl;
        }
        self.setPos = function(pos) {
            D.css(self.domEl, {
                left: pos[0],
                top: pos[1]
            });
            return self.size = [D.width(self.domEl), D.height(self.domEl)];
        };
        self.setLoading = function() {
            return self.domEl.one(".feed-wrapper").append(D.create("<div class='feed-loading'></div>"));
        };
        self.removeLoading = function() {
            return self.domEl.one(".feed-loading").remove();
        };
        self.refreshCount = function(likeCount, commentCount, shareCount) {
            if (likeCount) {
                self.domEl.one(".like").html(likeCount);
            }
            if (commentCount) {
                self.domEl.one(".review").html(commentCount);
            }
            if (shareCount) {
                return self.domEl.one(".share").html(shareCount);
            }
        };
        return self;
    };
}, {
    requires: ["dom", "node", "event", "anim", "./widgets/sslog"]
});


/*
 # @fileOverview 横屏滚动处理模块.
 # @creator 筱谷<xiaogu.gxb@taobao.com>, 云谦<yunqian@taobao.com>.
 */
KISSY.add('hy/widgets/scrollmaster2',function(S, DOM, Event, Anim, UA) {
    var $, DOWN, EVENT_MOVE_END, EVENT_MOVE_START, LEFT, RIGHT, SPACE, UP;
    $ = S.all;
    LEFT = 37;
    UP = 38;
    RIGHT = 39;
    DOWN = 40;
    SPACE = 32;
    EVENT_MOVE_START = "start";
    EVENT_MOVE_END = "end";
    window.ScrollMaster2 = {
        config: {
            allowScroll: true,
            wheelFilter: null
        },
        isTouchPad: false,
        isMac: navigator.userAgent.indexOf("Macintosh; Intel Mac OS") > -1,
        touchPadCheckTimer: null,
        mousewheelCheckTimer: null,
        anim: null,
        currentStatus: null,
        init: function(el) {
            this.detachEvents();
            this.el = $(el);
            return this.bindEvents();
        },
        detachEvents: function() {
            var _ref;
            return (_ref = this.el) != null ? _ref.detach("mousewheel") : void 0;
        },
        bindEvents: function() {
            this.el.on("mousewheel", this.mouseWheelHandler, this);
            $(document).on("keydown", this.keydownHandler, this);
            $(window).on("resize", this.setMoveDist, this);
            if (UA.mobile || (navigator.userAgent.toLowerCase().indexOf("touch") >= 0)) {
                return DOM.addClass('body', ".ks-touch");
            }
        },
        keydownHandler: function(e) {
            if (e.target.nodeName === "INPUT") {
                return;
            }
            if (e.target.nodeName === "TEXTAREA") {
                return;
            }
            if (!this.moveDist) {
                this.setMoveDist();
            }
            switch (e.keyCode) {
                case LEFT:
                case UP:
                    e.preventDefault();
                    return this.move(this.moveDist, false);
                case RIGHT:
                case DOWN:
                case SPACE:
                    e.preventDefault();
                    return this.move(-this.moveDist, false);
            }
        },
        mouseWheelHandler: function(e) {
            var dist, tg, _base, _ref,
                _this = this;
            tg = e.target;
            if (typeof (_base = this.config).wheelFilter === "function" ? _base.wheelFilter(tg) : void 0) {
                return;
            }
            e.preventDefault();
            dist = e.wheelDelta ? e.wheelDelta * 2 : e.delta * 120;
            this.isTouchPad = !!this.touchPadCheckTimer || Math.abs(dist) % 120 !== 0;
            if (this.isTouchPad) {
                this.fireMoveStart();
                dist = dist / 12;
                if ((_ref = this.touchPadCheckTimer) != null) {
                    _ref.cancel();
                }
                this.touchPadCheckTimer = S.later(function() {
                    _this.isTouchPad = false;
                    _this.touchPadCheckTimer = null;
                    return _this.fireMoveEnd();
                }, 100, false, this);
                return this.move(dist, true);
            } else {
                dist = dist / 3;
                this.fireMoveStart();
                return this.move(dist, false);
            }
        },
        setMoveDist: function() {
            return this.moveDist = window.VIEWPORTWIDTH * 0.16;
        },
        move: function(dist, isMouseWheel) {
            var scrollLeft, t, _ref;
            if (!this.config.allowScroll) {
                return;
            }
            if (!dist) {
                return;
            }
            if (isMouseWheel) {
                return this.el[0].scrollLeft -= dist;
            } else {
                if ((_ref = this.anim) != null ? _ref.isRunning() : void 0) {
                    return;
                }
                scrollLeft = this.el[0].scrollLeft - dist * 5;
                t = Math.abs(dist) / 200;
                this.fireMoveStart();
                this.anim = new Anim(this.el, {
                    scrollLeft: scrollLeft
                }, t, "easeBoth");
                this.anim.on("complete", this.fireMoveEnd, this);
                return this.anim.run();
            }
        },
        fireMoveStart: function() {
            if (this.currentStatus === EVENT_MOVE_START) {
                return;
            }
            this.fire(EVENT_MOVE_START);
            return this.currentStatus = EVENT_MOVE_START;
        },
        fireMoveEnd: function() {
            if (this.currentStatus === EVENT_MOVE_END) {
                return;
            }
            this.fire(EVENT_MOVE_END);
            return this.currentStatus = EVENT_MOVE_END;
        }
    };
    return S.merge(ScrollMaster2, S.EventTarget);
}, {
    requires: ["dom", "event", "anim", "ua"]
});

KISSY.add('hy/horiflow',function(S, Event, DOM, SSlog, FeedItem, SuitImage, ScrollMaster2) {
    var $, HoriFlow, defaultConfig, viewData;
    $ = S.all;
    if (S.UA.mobile === "apple") {
        DOM.addStyleSheet(".wrapper .container .view,\n.detail-wrapper {\n  overflow-x: scroll;\n}");
    }
    defaultConfig = {
        wrapperEl: null,
        dataFunc: null,
        containerHeight: null,
        wrapperContainer: null,
        scrollEl: null,
        itemId: null,
        feedMargin: 14,
        beginLeft: '92%',
        feedWidth: 370,
        feedPerPage: 30,
        lazyLoadOffsetPage: 1,
        maxPage: FLOW_MAX_PAGE || 3,
        scrollType: 0,
        colors: ["#336", "#363", "#633", "#663", "#636", "#366"],
        colorIndex: 0
    };
    viewData = {
        feeds: [],
        feedIDs: {},
        pages: [],
        cols: [],
        colsMap: [],
        shouldReppend: [],
        shouldLoadAt: 0,
        lastFeedID: null,
        lastFeedPos: null
    };
    return HoriFlow = (function() {
        HoriFlow.prototype.fillPage = null;

        HoriFlow.prototype.left = 0;

        HoriFlow.prototype.isLoading = false;

        HoriFlow.prototype.isEnd = false;

        HoriFlow.prototype.isScrolling = false;

        function HoriFlow(config) {
            this.config = S.merge(defaultConfig, config);
            this.viewHeight = DOM.viewportHeight();
            if (!this.fillPage) {
                this.fillPage = {
                    pageIndex: null,
                    feedCount: 0
                };
            }
            if (!this.viewData) {
                this.viewData = S.clone(viewData);
            }
            this.viewData.lastFeedPos = [-(this.config.feedMargin + this.config.feedWidth), this.viewHeight, 0];
            if (this.config.beginLeft.toString().indexOf('%') >= 0) {
                this.config.beginLeft = parseInt(this.config.beginLeft, 10) / 100 * window.VIEWPORTWIDTH;
            }
            this.setLeft();
            this.initUI();
            this.bindEvents();
        }

        HoriFlow.prototype.initUI = function() {
            this.loadingEl = $('<span class="page-loading" alt="加载中"></span>');
            this.endEl = $('<span class="page-end" alt="已到达底部">卖家说，没有更多了哦 <a href="javascript:void(0)" class="J_FeedReturnBtn">返回</a></span>');
            this.flowFreezelayer = $('<div class="flow-freeze-layer"></div>');
            this.loadingEl.appendTo(this.config.wrapperContainer);
            this.endEl.appendTo(this.config.wrapperContainer);
            this.flowFreezelayer.appendTo(this.config.wrapperContainer);
            this.pageStartTplFunc = function(unix) {
                var date, day, month;
                date = new Date(unix);
                month = date.getMonth() + 1;
                day = date.getDate();
                return "<span class=\"flow-page-start\">\n  <span class=\"flow-page-month\"><span class=\"flow-page-text\">" + month + "</span>月</span>\n  <span class=\"flow-page-date\"><span class=\"flow-page-text\">" + day + "</span></span>\n</span>";
            };
            this.config.wrapperEl.css("marginLeft", this.config.beginLeft);
            return this.config.wrapperContainer.css({
                "height": this.config.containerHeight,
                "margin": ((this.config.wrapperEl.height() - this.config.containerHeight) / 2 < 10 ? 10 : (this.config.wrapperEl.height() - this.config.containerHeight) / 2) + "px 80px"
            });
        };

        HoriFlow.prototype.bindEvents = function() {
            $('a.J_FeedReturnBtn', this.endEl).on("click", this.scrollToleft, this);
            Event.on(this.config.scrollEl, 'scroll', S.throttle(this.scrollListener, 100, this));
            ScrollMaster2.on("start", function() {
                return this.flowFreezelayer.show();
            }, this);
            return ScrollMaster2.on("end", function() {
                return this.flowFreezelayer.hide();
            }, this);
        };

        HoriFlow.prototype.posFunc = function(feedItem) {
            var colKey, cols, i_height, rWidth, s_height, x, y, _left, _top, _width;
            cols = this.viewData.cols;
            i_height = DOM.height(feedItem.domEl);
            s_height = i_height + this.config.feedMargin + this.viewData.lastFeedPos[1] + 0;
            if (s_height > this.config.containerHeight) {
                colKey = (cols.push([])) - 1;
                cols[colKey].push(feedItem);
                _left = this.viewData.lastFeedPos[0] + (this.config.feedWidth + this.config.feedMargin);
                _top = i_height + this.config.feedMargin;
                x = _left;
                y = 0;
            } else {
                colKey = cols.length - 1;
                cols[colKey].push(feedItem);
                _left = this.viewData.lastFeedPos[0];
                _top = s_height;
                x = _left;
                y = this.viewData.lastFeedPos[1];
            }
            this.viewData.lastFeedPos = [_left, _top, colKey];
            feedItem.setPos([x, y], this.config.cata);
            _width = (colKey + 1) * (this.config.feedWidth + this.config.feedMargin) + (this.viewData.pages.length - 2) * 100 + 220;
            if (_width < (rWidth = VIEWPORTWIDTH - this.config.wrapperEl.offset().left)) {
                _width = rWidth;
            }
            return this.config.wrapperContainer.width(_width);
        };

        HoriFlow.prototype.renderPage = function(pageIndex) {
            if (pageIndex === void 0) {
                pageIndex = this.viewData.pages.length;
            }
            if (this.viewData.pages[pageIndex]) {
                return;
            }
            if (this.viewData.pages.length >= this.config.maxPage) {
                return this.setEnd();
            }
            this.setLoading();
            return this.config.dataFunc.FetchData({
                cata: this.config.cata,
                itemId: this.config.itemId,
                afterID: this.viewData.lastFeedID,
                pageIndex: pageIndex,
                view: this,
                callBack: this.addPage,
                count: this.config.feedPerPage + this.fillPage.feedCount
            });
        };

        HoriFlow.prototype.addPage = function(pageIndex, feeds, isEnd) {
            var feed, page, _i, _len;
            this.viewData.shouldLoadAt = this.viewData.lastFeedPos[0];
            SSlog("Next will load at: ", this.viewData.shouldLoadAt);
            ScrollMaster2.config.allowScroll = true;
            if (feeds[0]) {
                if (feeds[0].time) {
                    this.setPageStart(this.viewData.lastFeedPos[0], feeds[0].time);
                }
                page = this.viewData.pages[pageIndex] = [];
                for (_i = 0, _len = feeds.length; _i < _len; _i++) {
                    feed = feeds[_i];
                    this.addFeedToPage(feed, page, pageIndex);
                }
                this.viewData.lastFeedPos = [this.viewData.lastFeedPos[0] + 100, this.config.containerHeight, this.viewData.lastFeedPos[2]];
                this.config.wrapperContainer.width(this.config.wrapperContainer.width() + 100);
            }
            if (isEnd) {
                this.setEnd();
            }
            return this.hideLoading();
        };

        HoriFlow.prototype.addFeedToPage = function(feed, page, pageIndex) {
            var domEl, feedItem, _domEl;
            if (this.viewData.feedIDs[feed.feedId]) {
                return;
            }
            this.viewData.feedIDs[feed.feedId] = true;
            if (!feed.feedItem || !feed.feedItem.domEl) {
                feedItem = new FeedItem(feed);
            } else {
                feedItem = feed.feedItem;
                if (this.config.itemId) {
                    _domEl = $(feedItem.domEl);
                    feedItem.preParent = _domEl.parent();
                    feedItem.prePos = [_domEl.css("left"), _domEl.css("top")];
                    this.viewData.shouldReppend.push(feedItem);
                }
            }
            domEl = $(feedItem.domEl);
            domEl.appendTo(this.config.wrapperContainer);
            this.posFunc(feedItem);
            page.push(feedItem);
            this.viewData.feeds.push(feedItem);
            domEl.attr("data-page", pageIndex);
            domEl.one(".feed-wrapper").css("background-color", COLORS[this.config.colorIndex++ % 8] || this.config.colors[this.config.colorIndex++ % 6]);
            S.use("hy/widgets/multiellipsis", function(S, MultiE) {
                return domEl.all('.J_FeedTextL').each(function(el) {
                    return MultiE(el);
                });
            });
            return domEl.all('.ss-image-lazyload').each(function(item) {
                return new SuitImage(item);
            });
        };

        HoriFlow.prototype.renderCol = function(left, colKey, anim) {};

        HoriFlow.prototype.resize = function(containerHeight) {
            var feedItem, page, _i, _j, _len, _len1, _ref;
            this.config.containerHeight = containerHeight;
            this.viewData.cols = [];
            this.viewData.colsMap = [];
            this.viewData.lastFeedPos = [-(this.config.feedMargin + this.config.feedWidth), this.viewHeight, 0];
            this.config.wrapperContainer.css({
                "height": this.config.containerHeight,
                "margin": ((this.config.wrapperEl.height() - this.config.containerHeight) || 20) / 2 + "px 80px"
            });
            _ref = this.viewData.pages;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                page = _ref[_i];
                for (_j = 0, _len1 = page.length; _j < _len1; _j++) {
                    feedItem = page[_j];
                    this.posFunc(feedItem);
                }
            }
            if (this.isEnd) {
                return this.setEnd();
            }
        };

        HoriFlow.prototype.release = function() {
            var feedItem, _i, _len, _ref, _ref1, _results;
            if ((_ref = this.pageNav) != null) {
                _ref.destroy();
            }
            _ref1 = this.viewData.shouldReppend;
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
                feedItem = _ref1[_i];
                $(feedItem.domEl).css({
                    left: feedItem.prePos[0],
                    top: feedItem.prePos[1]
                });
                _results.push($(feedItem.preParent).append(feedItem.domEl));
            }
            return _results;
        };

        HoriFlow.prototype.viewFeeds = function() {
            var feedItem, feeds, left, maxColKey, minColKey, _colKey, _i, _j, _len, _ref;
            left = this.left;
            maxColKey = parseInt(left / (this.config.feedWidth + this.config.feedMargin), 10);
            minColKey = parseInt((left - window.VIEWPORTWIDTH) / (this.config.feedWidth + this.config.feedMargin), 10);
            if (maxColKey < 0) {
                maxColKey = 0;
            }
            if (minColKey < 0) {
                minColKey = 0;
            }
            feeds = [];
            for (_colKey = _i = minColKey; minColKey <= maxColKey ? _i <= maxColKey : _i >= maxColKey; _colKey = minColKey <= maxColKey ? ++_i : --_i) {
                if (!this.viewData.cols[_colKey]) {
                    continue;
                }
                _ref = this.viewData.cols[_colKey];
                for (_j = 0, _len = _ref.length; _j < _len; _j++) {
                    feedItem = _ref[_j];
                    feeds.push(feedItem);
                }
            }
            return feeds;
        };

        HoriFlow.prototype.setLoading = function() {
            var left;
            this.isLoading = true;
            left = this.viewData.lastFeedPos[0] + this.config.feedMargin + this.config.feedWidth;
            return this.loadingEl.css({
                'left': left,
                'display': 'block'
            });
        };

        HoriFlow.prototype.hideLoading = function() {
            this.isLoading = false;
            return this.loadingEl.css('display', 'none');
        };

        HoriFlow.prototype.setEnd = function() {
            var left, returnBtn;
            this.isEnd = true;
            left = this.viewData.cols.length * 385 + (this.viewData.pages.length > 1 ? this.viewData.pages.length - 1 : 0) * 104 + 10;
            this.endEl.css({
                'left': left,
                'display': 'inline-block'
            });
            if (this.viewData.feeds.length === 0 || (this.config.wrapperContainer.width() + this.config.beginLeft + 80 < window.VIEWPORTWIDTH)) {
                this.config.wrapperContainer.width(window.VIEWPORTWIDTH - this.config.beginLeft - 160);
            }
            returnBtn = this.endEl.one(".J_FeedReturnBtn");
            if (returnBtn.offset().left < window.VIEWPORTWIDTH) {
                return returnBtn.css('display', "none");
            }
        };

        HoriFlow.prototype.checkEnd = function(left) {
            if (left <= -this.viewData.shouldLoadAt && !this.isEnd) {
                return this.renderPage(this.viewData.pages.length);
            }
        };

        HoriFlow.prototype.setPageStart = function(left, unix) {
            var el;
            el = $(DOM.create(this.pageStartTplFunc(unix)));
            el.css({
                "left": left + this.config.feedWidth - 46
            });
            return el.appendTo(this.config.wrapperContainer);
        };

        HoriFlow.prototype.scrollToleft = function() {
            return this.config.scrollEl.animate({
                "scrollLeft": 0
            }, 0.5, "easeBoth");
        };

        HoriFlow.prototype.scrollListener = function() {
            this.setLeft();
            if (this.left >= this.viewData.shouldLoadAt && this.isLoading === false && this.isEnd === false) {
                return this.renderPage();
            }
        };

        HoriFlow.prototype.setLeft = function() {
            return this.left = this.config.scrollEl.scrollLeft() - this.config.beginLeft + window.VIEWPORTWIDTH;
        };

        return HoriFlow;

    })();
}, {
    requires: ["event", "dom", "./widgets/sslog", "./feeditem", "./widgets/suitableimage", "./widgets/scrollmaster2"]
});

var __hasProp = {}.hasOwnProperty;

KISSY.add('hy/widgets/tinyshow',function(S, DOM, Node, Anim, UA) {
    var $, TinyShow;
    $ = Node.all;
    return TinyShow = (function() {
        function TinyShow(config) {
            this.config = config;
            this.config.el = $(this.config.el);
            if (!this.config.el) {
                return;
            }
            this.config.src = this.config.src || this.config.el.attr("data-ks-ts-image") || this.config.el.attr("data-origin-url") || this.config.el.attr("data-original-url") || this.config.el.attr("src");
            if (!this.config.src) {
                return;
            }
            this.config.loadDelay = parseInt(this.config.loadDelay) || 0;
            this.bg = $(DOM.create("<div class=\"ss-tiny-show-bg\" title=\"点击关闭\"></div>"));
            this.loading = $(DOM.create("<div class=\"ss-tiny-show-loading\"></div>"));
            this.pic = $(DOM.create("<img class=\"ss-tiny-show-img\" title=\"滚轮调整大小\" />"));
            this.rawImg = new Image();
            this.percent = 100;
            this.isShow = false;
            this.init();
        }

        TinyShow.prototype.init = function() {
            var _this = this;
            this.pic.appendTo(this.bg);
            this.loading.appendTo(this.bg);
            this.bg.appendTo('body');
            this._bindEvents();
            return S.later(function() {
                if (!_this.rawImg) {
                    return;
                }
                _this.rawImg.src = _this.config.src;
                return _this._checkLoading();
            }, this.config.loadDelay);
        };

        TinyShow.prototype.show = function() {
            this.isShow = true;
            this.bg.css("left", 0);
            this.pic.css({
                "opacity": 0,
                "display": "inline-block"
            });
            Anim(this.pic, {
                opacity: 1
            }, 0.4, "easeOut").run();
            this._bindWheelEvent();
            this._bindClose();
            return this._bindDrag();
        };

        TinyShow.prototype.close = function() {
            this.isShow = false;
            this.pic.hide();
            this.bg.css("left", "-200%");
            this.bg.detach("click mouseleave mousewheel pinch pinchStart pinchEnd");
            return this.pic.detach("click touchstart touchmove touchend mousedown mousemove mouseup mouseleave");
        };

        TinyShow.prototype.destroy = function() {
            var key, value, _results;
            this.bg.remove().empty();
            _results = [];
            for (key in this) {
                if (!__hasProp.call(this, key)) continue;
                value = this[key];
                _results.push(this[key] = null);
            }
            return _results;
        };

        TinyShow.prototype._checkLoading = function() {
            if (!this.rawImg) {
                return;
            }
            if (this.rawImg.width && this.rawImg.complete) {
                return this._loadHandler();
            } else {
                return S.later(this._checkLoading, 100, false, this);
            }
        };

        TinyShow.prototype._setLoading = function() {};

        TinyShow.prototype._removeLoading = function() {
            return this.loading.remove();
        };

        TinyShow.prototype._bindEvents = function() {
            return this._bindClick();
        };

        TinyShow.prototype._bindClose = function() {
            var _this = this;
            this.pic.on("click", function(ev) {
                return ev.halt();
            });
            return this.bg.on("click", function() {
                return _this.close();
            });
        };

        TinyShow.prototype._bindClick = function() {
            var _this = this;
            return this.config.el.on('click', function() {
                return _this.show();
            });
        };

        TinyShow.prototype._loadHandler = function() {
            var tmp;
            this._removeLoading();
            this.pic.attr("src", this.rawImg.src);
            this.width = this.rawImg.width;
            this.height = this.rawImg.height;
            this.pic.offset({
                left: (DOM.viewportWidth() - this.width) / 2,
                top: (tmp = (DOM.viewportHeight() - this.height) / 2) < 0 ? 0 : tmp
            });
            if (this.isShow) {
                return this.pic.show();
            }
        };

        TinyShow.prototype._bindWheelEvent = function() {
            var last_percent, _percent,
                _this = this;
            _percent = this.percent;
            last_percent = this.percent;
            this.bg.on('mousewheel pinch', function(ev) {
                var left, plus;
                ev.halt();
                if (ev.scale) {
                    last_percent = _this.percent;
                    _this.percent = _percent * ev.scale;
                    plus = _this.percent - last_percent;
                } else {
                    plus = ev.delta > 0 ? 2 : -2;
                    _this.percent += plus;
                }
                if (_this.percent > 400) {
                    _this.percent = 400;
                }
                if (_this.percent < 10) {
                    _this.percent = 10;
                }
                left = _this.pic.offset().left;
                return _this.pic.css({
                    width: _this.percent / 100 * _this.width,
                    height: _this.percent / 100 * _this.height,
                    left: left - plus / 100 * _this.width / 2
                });
            });
            this.bg.on('pinchStart', function(ev) {
                ev.halt();
                _this.allowMove = false;
                return _percent = _this.percent;
            });
            return this.bg.on('pinchEnd', function(ev) {
                ev.halt();
                return _this.allowMove = true;
            });
        };

        TinyShow.prototype._bindDrag = function() {
            var draging, posX, posY, staX, staY, _ref, _ref1,
                _this = this;
            _ref = [null, null], posX = _ref[0], posY = _ref[1];
            _ref1 = [null, null], staX = _ref1[0], staY = _ref1[1];
            draging = false;
            this.pic.on("touchstart mousedown", function(ev) {
                var _ref2, _ref3, _ref4;
                draging = true;
                ev.preventDefault();
                ev = ev.originalEvent;
                _ref2 = [_this.pic.offset().left, _this.pic.offset().top], posX = _ref2[0], posY = _ref2[1];
                if (ev.touches) {
                    return _ref3 = [ev.touches[0].pageX, ev.touches[0].pageY], staX = _ref3[0], staY = _ref3[1], _ref3;
                } else {
                    return _ref4 = [ev.pageX || ev.clientX, ev.pageY || ev.clientY], staX = _ref4[0], staY = _ref4[1], _ref4;
                }
            });
            this.pic.on("touchmove mousemove", function(ev) {
                var endX, endY, movX, movY, _ref2, _ref3, _ref4;
                if (draging === false || _this.allowMove === false) {
                    return;
                }
                ev.preventDefault();
                ev = ev.originalEvent;
                if (ev.touches) {
                    _ref2 = [ev.touches[0].pageX, ev.touches[0].pageY], endX = _ref2[0], endY = _ref2[1];
                } else {
                    _ref3 = [ev.pageX || ev.clientX, ev.pageY || ev.clientY], endX = _ref3[0], endY = _ref3[1];
                }
                _ref4 = [endX - staX, endY - staY], movX = _ref4[0], movY = _ref4[1];
                return _this.pic.offset({
                    left: posX + movX,
                    top: posY + movY
                });
            });
            this.pic.on("mouseleave mouseup touchend", function() {
                draging = false;
                return _this.allowMove = true;
            });
            return this.bg.on("mouseleave", function() {
                return draging = false;
            });
        };

        return TinyShow;

    })();
}, {
    requires: ['dom', 'node', 'anim', "ua"]
});

var __hasProp = {}.hasOwnProperty;

KISSY.add('hy/widgets/taguploader/uploader',function(S, Node, DOM, Event, IO, JSON, UA) {
    var $, UploaderBase, defaultConfig, originalCharset, supportedFormData, _file, _query;
    $ = Node.all;
    supportedFormData = window.FormData ? true : false;
    originalCharset = document.charset;
    defaultConfig = {
        wrapperEl: null,
        dropperEl: null,
        inputEl: null,
        uploadUrl: "",
        uploadParams: {},
        timeout: 300,
        autoUpload: true,
        fileType: [],
        dropperFieldName: "upload_files[]",
        maxFile: 999
    };
    _query = {
        formEl: null,
        formData: null,
        inputEl: null,
        files: [],
        error_files: [],
        success_files: [],
        xhr: true,
        status: "prepare"
    };
    _file = {
        name: "",
        status: "",
        previewURL: "",
        fileObj: null,
        queryIndex: null
    };
    return UploaderBase = (function() {
        function UploaderBase(config) {
            this.config = S.merge(defaultConfig, config);
            this.wrapperEl = this.config.wrapperEl = $(this.config.wrapperEl);
            this.dropperEl = this.config.dropperEl = $(this.config.dropperEl);
            this.inputEl = this.config.inputEl = $(this.config.inputEl);
            if (!this.wrapperEl || !(this.dropperEl || this.inputEl)) {
                return;
            }
            if (!this.config.uploadUrl) {
                return;
            }
            this.inputElClone = this.inputEl.clone();
            this.queries = [];
            this.uploadQuery = [];
            this.resultQuery = [];
            this.successFiles = [];
            this.init();
        }

        UploaderBase.prototype.init = function() {
            S.mix(this, S.EventTarget);
            this._bindEvents();
            this.fire("init");
            return this.remainFile = this.config.maxFile;
        };

        UploaderBase.prototype.destroy = function() {
            var key, value, _results;
            this.dropperEl.detach("dragstart dragenter dragover dragleave dragend drop");
            _results = [];
            for (key in this) {
                if (!__hasProp.call(this, key)) continue;
                value = this[key];
                _results.push(this[key] = null);
            }
            return _results;
        };

        UploaderBase.prototype.upload = function(queryIndex, formEl, formData) {};

        UploaderBase.prototype._bindEvents = function() {
            if (this.inputEl) {
                this._bindInput(this.inputEl);
            }
            if (this.dropperEl) {
                return this._initDropper();
            }
        };

        UploaderBase.prototype._bindInput = function(inputEl) {
            return inputEl.on("change", this._addFilesHandler, this);
        };

        UploaderBase.prototype._initDropper = function() {
            var _this = this;
            this.dropperEl.on("dragstart dragenter dragover dragleave dragend", function(e) {
                return e.halt();
            });
            this.dropperEl.on("dragover", function() {
                return _this.dropperEl.addClass("taguploader-ondrop");
            });
            this.dropperEl.on("dragleave drop", function() {
                return _this.dropperEl.removeClass("taguploader-ondrop");
            });
            this.dropperEl.on("drop", this._dropHandler, this);
            return this.dropperName = this.dropperEl.attr("name") || this.config.dropperFieldName;
        };

        UploaderBase.prototype._initForm = function() {
            var form;
            form = document.createElement("form");
            S.mix(form, {
                "accept-charset": "utf-8",
                action: this.config.uploadUrl,
                enctype: 'multipart/form-data',
                encoding: 'multipart/form-data',
                method: "post",
                id: "J_TUForm_" + parseInt(Math.random() * 10000)
            });
            form.style.display = "none";
            form.enctype = 'multipart/form-data';
            document.body.appendChild(form);
            return form;
        };

        UploaderBase.prototype._changeHandler = function() {};

        UploaderBase.prototype._addFilesHandler = function(e) {
            var files, formData, formEl, inputEl, queryIndex, _files, _ref;
            if ((this.successFiles.length >= this.config.maxFile) || this.remainFile <= 0) {
                this._setWarning("exceed~max~file");
                return;
            }
            _files = (_ref = e.target) != null ? _ref.files : void 0;
            if (!_files && (e.value = "")) {
                return;
            }
            queryIndex = this._addQuery(e);
            files = this.queries[queryIndex]['files'];
            if (files.length === 0) {
                return;
            }
            if ((files.length > this.config.maxFile) || (files.length > this.remainFile)) {
                this._setWarning("exceed~max~file");
                return;
            }
            this.inputEl = inputEl = this.inputElClone.clone(true);
            inputEl.insertBefore(e.target);
            this._bindInput(inputEl);
            this.fire("files:add", {
                files: files
            });
            if (supportedFormData) {
                formData = this._initFormData(_files);
                this.queries[queryIndex]['formData'] = formData;
                $(e.target).remove();
                return this._uploadByXHR(queryIndex, formData);
            } else {
                formEl = this._initForm();
                formEl.appendChild(e.target);
                this.queries[queryIndex].formEl = formEl;
                return this._uploadByForm(queryIndex, formEl);
            }
        };

        UploaderBase.prototype._retryFileHandler = function(file) {
            var formData, oldFormEl, queryIndex, retryParams;
            file.status = "prepare";
            retryParams = [file];
            if (file.fileObj) {
                queryIndex = this._addQuery({
                    target: {
                        files: [file]
                    }
                });
                formData = this._initFormData([file]);
                return this._uploadByXHR(queryIndex, formData, retryParams);
            } else {
                oldFormEl = this.queries[file.queryIndex]['formEl'];
                queryIndex = this._addQuery({
                    value: file.name
                });
                return this._uploadByForm(queryIndex, oldFormEl, retryParams);
            }
        };

        UploaderBase.prototype._retryQueryHandler = function(query, onlyError) {
            var files, formData, queryIndex, retryParams;
            if (onlyError == null) {
                onlyError = true;
            }
            files = onlyError ? query.error_files : query.files;
            retryParams = files;
            queryIndex = this._addQuery({
                target: {
                    files: files
                }
            });
            formData = this._initFormData(files);
            return this._uploadByXHR(queryIndex, formData, retryParams);
        };

        UploaderBase.prototype._removeFileHandler = function(file) {
            var key;
            key = S.indexOf(file, this.successFiles);
            if (key >= 0) {
                this.successFiles.splice(key, 1);
                return this.remainFile++;
            }
        };

        UploaderBase.prototype._dropHandler = function(e) {
            var files, formData, queryIndex,
                _this = this;
            if (this.successFiles.length >= this.config.maxFile || this.remainFile <= 0) {
                this._setWarning("exceed~max~file");
                return;
            }
            e.halt();
            e = e.originalEvent;
            if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) {
                return;
            }
            files = e.dataTransfer.files;
            if ((files.length > this.config.maxFile) || (files.length > this.remainFile)) {
                this._setWarning("exceed~max~file");
                return;
            }
            files = S.filter(files, function(file) {
                return _this._checkType(file, true);
            });
            if (files.length === 0) {
                return;
            }
            queryIndex = this._addQuery({
                target: {
                    files: files
                }
            });
            formData = this._initFormData(files);
            this.queries[queryIndex]['formData'] = formData;
            this.fire("files:add", {
                files: this.queries[queryIndex]['files']
            });
            return this._uploadByXHR(queryIndex, formData);
        };

        UploaderBase.prototype._initFormData = function(files) {
            var file, formData, key, value, _i, _len, _ref;
            if (window.FormData) {
                formData = new FormData;
                for (_i = 0, _len = files.length; _i < _len; _i++) {
                    file = files[_i];
                    formData.append(this.dropperName, file, encodeURIComponent(file.name));
                }
                _ref = this.config.uploadParams;
                for (key in _ref) {
                    if (!__hasProp.call(_ref, key)) continue;
                    value = _ref[key];
                    formData.append(key, value);
                }
            } else {
                formData = this._initFormDataString(files);
            }
            return formData;
        };

        UploaderBase.prototype._initFormDataString = function(files) {
            var boundary, cr, data, file, key, value, _i, _len, _ref;
            boundary = "----TaobaoBackyardUploadFormBoundary" + (new Date).getTime();
            data = "";
            cr = "\r";
            for (_i = 0, _len = files.length; _i < _len; _i++) {
                file = files[_i];
                data += "--" + boundary + cr + "\nContent-Disposition: form-data; name=\"" + this.config.dropperFieldName + "\"; filename=\"" + (encodeURIComponent(file.name)) + "\"" + cr + "\nContent-Type: " + file.type + cr + "\n" + cr + "\n" + (file.getAsBinary()) + cr + "\n";
            }
            _ref = this.config.uploadParams;
            for (key in _ref) {
                if (!__hasProp.call(_ref, key)) continue;
                value = _ref[key];
                data += "--" + boundary + cr + "\nContent-Disposition: form-data; name=\"" + key + "\"" + cr + "\n" + cr + "\n" + value + cr + "\n";
            }
            return data += boundary + "--";
        };

        UploaderBase.prototype._addQuery = function(e) {
            var file, queryIndex, uploadFile, _i, _len, _ref;
            queryIndex = this.queries.push(S.clone(_query)) - 1;
            if (e.target.files) {
                _ref = e.target.files;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    file = _ref[_i];
                    uploadFile = {
                        name: file.name,
                        status: "prepare",
                        fileObj: file,
                        queryIndex: queryIndex,
                        previewURL: (window.URL && URL.createObjectURL(file)) || (window.webkitURL && webkitURL.createObjectURL(file)) || ""
                    };
                    if (this._checkType(uploadFile)) {
                        this.queries[queryIndex]['files'].push(uploadFile);
                    }
                }
            } else {
                uploadFile = {
                    name: e.target.value.replace(/^.+[\/\\]/im, ""),
                    status: "prepare",
                    fileObj: null,
                    queryIndex: queryIndex,
                    previewURL: null
                };
                if (this._checkType(uploadFile)) {
                    this.queries[queryIndex]['files'].push(uploadFile);
                }
            }
            return queryIndex;
        };

        UploaderBase.prototype._uploadByForm = function(queryIndex, formEl, retryParams) {
            var _this = this;
            return IO({
                url: this.config.uploadUrl,
                type: "post",
                contentType: 'multipart/form-data',
                form: "#" + formEl.id,
                data: this.config.uploadParams,
                timeout: this.config.timeout,
                dataType: "text",
                beforeSend: function(xhr) {
                    if (UA.ie <= 8) {
                        document.charset = "utf-8";
                    }
                    return _this._progressHandler.call(_this, queryIndex, xhr, retryParams);
                },
                complete: function(data, textStatus, xhr) {
                    if (UA.ie <= 8) {
                        document.charset = originalCharset;
                    }
                    return _this._uploadByFormHandler.call(_this, queryIndex, data, xhr, retryParams);
                }
            });
        };

        UploaderBase.prototype._uploadByXHR = function(queryIndex, formData, retryParams) {
            var _this = this;
            return IO({
                url: this.config.uploadUrl,
                type: "post",
                data: formData,
                timeout: this.config.timeout,
                contentType: false,
                processData: false,
                dataType: "text",
                beforeSend: function(xhr) {
                    return _this._progressHandler.call(_this, queryIndex, xhr, retryParams);
                },
                complete: function(data, textStatus, xhr) {
                    return _this._uploadByFormHandler.call(_this, queryIndex, data, xhr, retryParams);
                }
            });
        };

        UploaderBase.prototype._progressHandler = function(queryIndex, xhr, retryParams) {
            var _ref, _ref1,
                _this = this;
            return (_ref = xhr.getNativeXhr()) != null ? (_ref1 = _ref.upload) != null ? _ref1.addEventListener('progress', function(e) {
                var query, queryFiles;
                query = _this.queries[queryIndex];
                queryFiles = query.files;
                return _this.fire('progress', S.mix(e, {
                    xhr: xhr,
                    files: queryFiles,
                    retryParams: retryParams
                }));
            }) : void 0 : void 0;
        };

        UploaderBase.prototype._uploadByFormHandler = function(queryIndex, data, xhr, retryParams) {
            var count, file, query, queryFile, queryFiles, _i, _j, _len, _len1, _ref;
            data = this._parseJSON(data);
            query = this.queries[queryIndex];
            queryFiles = query.files;
            for (_i = 0, _len = queryFiles.length; _i < _len; _i++) {
                file = queryFiles[_i];
                file['status'] = "unknown";
            }
            this.fire("complete", {
                data: data,
                xhr: xhr,
                files: queryFiles,
                retryParams: retryParams
            });
            if (!data || !data.status || data.status === "0" || !data.data) {
                return this.fire("error allerror", {
                    data: data,
                    xhr: xhr,
                    files: queryFiles,
                    retryParams: retryParams
                });
            }
            if (data.data.url || data.data.message) {
                if (!data.data.url && !data.data.message) {
                    return this.fire("error allerror", {
                        data: data,
                        xhr: xhr,
                        files: queryFiles,
                        retryParams: retryParams
                    });
                }
                data.data = [data.data];
            }
            count = 0;
            _ref = data.data;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                file = _ref[_j];
                queryFile = (function() {
                    return S.filter(queryFiles, function(queryFile) {
                        return queryFile.name === file.name;
                    })[0];
                })();
                if (queryFile) {
                    S.mix(queryFile, file);
                    if (file.url) {
                        queryFile['status'] = "success";
                        query['success_files'].push(queryFile);
                        this.successFiles.push(queryFile);
                        count++;
                        this.remainFile--;
                    } else {
                        queryFile['status'] = "error";
                        query['error_files'].push(queryFile);
                    }
                }
            }
            if (count === queryFiles.length) {
                this.fire("success allsuccess", {
                    data: data,
                    xhr: xhr,
                    files: queryFiles,
                    retryParams: retryParams
                });
            } else {
                this.fire("success error someerror", {
                    data: data,
                    xhr: xhr,
                    files: queryFiles,
                    retryParams: retryParams
                });
            }
            this.fire("finish", {
                data: data,
                xhr: xhr,
                files: queryFiles,
                retryParams: retryParams
            });
            if (this.remainFile <= 0) {
                return this.fire("files:full");
            }
        };

        UploaderBase.prototype._parseJSON = function(data) {
            var error;
            try {
                if (typeof data === "string") {
                    data = data.replace(/<script.+<\/script>/im, "");
                    data = JSON.parse(data);
                }
                return data;
            } catch (_error) {
                error = _error;
                return null;
            }
        };

        UploaderBase.prototype._checkType = function(file, rawFile) {
            var regexp, _i, _j, _len, _len1, _ref, _ref1;
            if (this.config.fileType.length === 0) {
                return true;
            }
            if ((file.fileObj && file.fileObj.type) || (rawFile && rawFile.type)) {
                file = rawFile ? rawFile : file.fileObj;
                _ref = this.config.fileType;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    regexp = _ref[_i];
                    if ((new RegExp(regexp)).test(file.type)) {
                        return true;
                    }
                }
            } else {
                _ref1 = this.config.fileType;
                for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    regexp = _ref1[_j];
                    if ((new RegExp(regexp)).test(file.name)) {
                        return true;
                    }
                }
            }
            return false;
        };

        UploaderBase.prototype._setWarning = function(type) {
            return this.fire("message", {
                errorType: type
            });
        };

        return UploaderBase;

    })();
}, {
    requires: ["node", "dom", "event", "ajax", "json", "ua"]
});

var __hasProp = {}.hasOwnProperty;

KISSY.add('hy/widgets/taguploader/tagger',function(S, Node, Ajax, ComboBox, KScroll, Tip) {
    var $, Tagger, defaultConfig;
    $ = Node.all;
    defaultConfig = {
        itemThumbSelector: '.J_TUItemThumb',
        outterEl: '.J_TUOuter',
        wrapperEl: '.J_TagItemBox',
        panelItemTPL: ".J_TUTagItem",
        pointTPL: ".J_TUTagPoint",
        pointSelector: ".J_TUTagPoint",
        panelEl: ".J_TUPanel",
        panelSave: '.J_TUPanelSave',
        panelClose: '.J_TUPanelClose',
        itemListTPL: '.J_TUItemListTPL',
        userListTPL: '.J_TUUserListTPL',
        itemListAction: null,
        userListAction: null,
        maxPoint: 3
    };
    return Tagger = (function() {
        function Tagger(config) {
            var key, value, _ref,
                _this = this;
            this.config = config;
            this.noPointNum = 15;
            S.mix(this, S.EventTarget);
            this.config = S.merge(defaultConfig, this.config);
            _ref = this.config;
            for (key in _ref) {
                if (!__hasProp.call(_ref, key)) continue;
                value = _ref[key];
                this[key] = value;
            }
            this.outterEl = $(this.outterEl);
            this.wrapperEl = this.outterEl.one(this.wrapperEl);
            this.panelEl = this.outterEl.one(this.panelEl);
            this.pointTPL = this.outterEl.one(this.pointTPL);
            this.itemListTPL = this.outterEl.one(this.itemListTPL).outerHTML();
            this.panelItemTPL = $(this.panelItemTPL);
            if (!this.panelEl.parent()) {
                this.panelEl.appendTo(this.wrapperEl);
            }
            this.wrapperEl.delegate("click", '.J_TuTagMask', this._addPointHandler, this);
            this.wrapperEl.delegate('click', '.J_TTPDDel', this._delPoint, this);
            this.panelEl.delegate('click', this.panelSave, this._savePoint, this);
            this.panelEl.delegate('click', this.panelClose, this._closePanel, this);
            this.panelEl.delegate('click', '.J_TUPanelTabs', function(ev) {
                return _this.panelEl.toggleClass('tu-p-people');
            });
            this.panelEl.delegate('click', '.J_TUTagValue', this._setTag, this);
            this.panelEl.one('.J_PanelItemTag').on('valuechange', this._highlineTag, this);
            this.initComboBox();
        }

        Tagger.prototype.initKScroll = function() {
            return this.kScroll = new KScroll(this.wrapperEl, {
                prefix: "tu-scroll-",
                hotkey: true,
                bodydrag: true,
                allowArrow: false
            });
        };

        Tagger.prototype.initComboBox = function() {
            if (this.itemListAction) {
                return this.initItemList();
            }
        };

        Tagger.prototype.initItemList = function() {
            var comboBox, tpl,
                _this = this;
            tpl = this.itemListTPL;
            comboBox = new ComboBox({
                srcNode: this.panelEl.one('.tu-panel-title'),
                hasTrigger: false,
                maxItemCount: 5,
                menu: {
                    xclass: 'popupmenu',
                    prefixCls: 'tpitem-'
                },
                dataSource: new ComboBox.RemoteDataSource({
                    xhrCfg: {
                        url: this.itemListAction,
                        dataType: 'jsonp',
                        data: {
                            code: "utf-8"
                        }
                    },
                    paramName: "q",
                    cache: false,
                    parse: function(query, results) {
                        results.items.reverse();
                        results.items.push("");
                        results.items.reverse();
                        return results.items;
                    }
                }),
                format: function(query, results) {
                    var r, ret, _i, _len;
                    ret = [
                        {
                            disabled: true
                        }
                    ];
                    for (_i = 0, _len = results.length; _i < _len; _i++) {
                        r = results[_i];
                        if (r === "") {
                            continue;
                        }
                        ret.push({
                            textContent: r.title,
                            content: S.substitute(tpl, {
                                title: r.title,
                                pic: r.pic,
                                src: "src"
                            })
                        });
                    }
                    if (ret.length === 1 && ret[0].disabled) {
                        ret[0].content = "未找到相关宝贝，或近期内没有购买过宝贝";
                    } else {
                        ret[0].content = "输入宝贝名称或链接，搜索宝贝";
                    }
                    return ret;
                }
            });
            comboBox.render();
            comboBox.get('input').on('focus', function(ev) {
                if (ev.target.value === "") {
                    return comboBox.sendRequest(' ');
                }
            });
            comboBox.get('input').on('keypress', function(ev) {
                if (ev.keyCode === 13) {
                    return false;
                }
            });
            comboBox.get('input').on('change', function(ev) {
                _this.panelEl.pointEl.prop('itemVal', null);
                return _this.panelEl.all(_this.panelSave).addClass("disabled");
            });
            return comboBox.on('click', function(ev) {
                _this.panelEl.pointEl.prop('itemVal', ev.target.userConfig.value);
                return _this.panelEl.all(_this.panelSave).removeClass("disabled");
            });
        };

        Tagger.prototype.initUserList = function() {};

        Tagger.prototype.createTagList = function(list) {
            var itemStr, tag, tpl, _i, _len, _ref;
            this.itemTagList = list.item;
            this.itemTagListEl = this.panelEl.one('.J_TUItemTags');
            itemStr = "";
            tpl = "<li class=\"tu-panel-tags-tag\"><span class=\"tu-panel-tag-bd J_TUTagValue\">__tag__</span><span class=\"tu-panel-tag-ft\"></span></li>";
            _ref = this.itemTagList;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                tag = _ref[_i];
                itemStr += tpl.replace("__tag__", tag);
            }
            return this.itemTagListEl.append(itemStr);
        };

        Tagger.prototype._setTag = function(ev) {
            var input, tag, tagVal;
            tag = $(ev.target);
            tagVal = tag.text();
            input = tag.parent('.J_TUTagList').one('input');
            input.val(tagVal);
            return this._highlineTag({
                target: input
            });
        };

        Tagger.prototype._highlineTag = function(ev) {
            var input, item, list, val, _i, _len, _results;
            input = $(ev.target);
            val = input.val();
            if (!/^[\u3400-\u9FFFa-zA-Z`']+$/.test(val)) {
                input.val(val.replace(/[^\u3400-\u9FFFa-zA-Z]/ig, ''));
            }
            list = input.parent('.J_TUTagList').all('.J_TUTagValue');
            _results = [];
            for (_i = 0, _len = list.length; _i < _len; _i++) {
                item = list[_i];
                item = $(item);
                if (item.text() === val) {
                    _results.push(item.parent().addClass('selected'));
                } else {
                    _results.push(item.parent().removeClass('selected'));
                }
            }
            return _results;
        };

        Tagger.prototype._fetchPoint = function() {
            var items;
            items = this.wrapperEl.all(".J_FileItem");
            if (items.length === 0) {
                return;
            }
            return this.wrapperEl.all(".J_FileItem").each(function(item) {
                var file, _ref;
                file = item.prop('file');
                file.points = [];
                return (_ref = item.all(this.pointSelector)) != null ? _ref.each(function(point) {
                    var offset;
                    offset = this._calPos(item, point);
                    return file.points.push({
                        pos: offset,
                        content: point.prop("data-value")
                    });
                }, this) : void 0;
            }, this);
        };

        Tagger.prototype._hasPoint = function(title) {
            var hasThisPoint, parent, points, _ref;
            if (!this.currentItem) {
                return false;
            }
            parent = this.currentItem.hasClass("J_FileItem") ? this.currentItem : this.currentItem.parent(".J_FileItem");
            points = parent.all(this.pointSelector);
            if (points.length === 0) {
                return false;
            }
            hasThisPoint = false;
            if ((_ref = parent.all(this.pointSelector)) != null) {
                _ref.each(function(point) {
                    var content;
                    content = point.prop("data-value");
                    if (content && content['itemVal'].title === title) {
                        hasThisPoint = true;
                    }
                }, this);
            }
            return hasThisPoint;
        };

        Tagger.prototype._calPos = function(item, point) {
            var imgSrc, o_height, o_width, offset, originalImage, r_height, r_width, realImg, _ref, _ref1;
            realImg = item.one(this.itemThumbSelector);
            imgSrc = realImg[0].src;
            originalImage = new Image();
            originalImage.src = imgSrc;
            _ref = [realImg[0].width, realImg[0].height], r_width = _ref[0], r_height = _ref[1];
            _ref1 = [originalImage.width, originalImage.height], o_width = _ref1[0], o_height = _ref1[1];
            return offset = [(point.offset().left + point.width() / 2 - realImg.offset().left) / r_width * o_width, (point.offset().top + point.height() - realImg.offset().top) / r_height * o_height];
        };

        Tagger.prototype._outRange = function(evX, evY) {
            var element;
            element = document.elementFromPoint(evX, evY);
            if (!element) {
                return false;
            }
            element = $(element);
            if (element.hasClass('J_TuTagMask')) {
                return false;
            } else {
                return true;
            }
        };

        Tagger.prototype._addPointHandler = function(ev) {
            var left, parent, pointEl, top, _ref, _tmp;
            if (this.panelIsShowing) {
                return;
            }
            _tmp = $(ev.target);
            parent = _tmp.hasClass("J_FileItem") ? _tmp : _tmp.parent(".J_FileItem");
            this.currentItem = _tmp;
            if (parent.all(this.pointSelector).length >= this.maxPoint) {
                return;
            }
            if (this._outRange(ev.clientX, ev.clientY)) {
                return;
            }
            pointEl = this.pointTPL.clone(true);
            pointEl.appendTo(parent);
            pointEl.show();
            left = ev.clientX - pointEl.width() / 2;
            top = ev.clientY - pointEl.height();
            pointEl.offset({
                left: left,
                top: top
            });
            this._showPanel(pointEl, ev.clientX + 10, ev.clientY - 10);
            return (_ref = this.kScroll) != null ? _ref.set("step", 0) : void 0;
        };

        Tagger.prototype._showPanel = function(pointEl, left, top) {
            var val;
            this.panelIsShowing = true;
            this.panelEl.pointEl = pointEl;
            pointEl.addClass("activated");
            this.panelEl.show();
            this.panelEl.offset({
                left: left,
                top: this.wrapperEl.offset().top + 20
            });
            if (pointEl) {
                val = pointEl.prop('data-value');
            }
            if (val == null) {
                val = {};
            }
            this.panelEl.one('.J_PanelItemValue').val(val['itemVal'] || "");
            this.panelEl.one('.J_PanelItemTag').val(val['itamTag'] || "");
            this.panelEl.removeClass('tu-p-people');
            this.panelEl.all('li').removeClass('selected');
            this.panelEl.one(this.panelSave).addClass("disabled");
            return this.fire("panel:show");
        };

        Tagger.prototype._closePanel = function() {
            var val, _ref;
            this.panelIsShowing = false;
            this.panelEl.hide();
            val = this.panelEl.pointEl.prop("data-value");
            this.panelEl.pointEl.removeClass("activated");
            if (!val) {
                this._removePoint(this.panelEl.pointEl);
            }
            return (_ref = this.kScroll) != null ? _ref.set("step", 32) : void 0;
        };

        Tagger.prototype._removePoint = function(pointEl) {
            return pointEl != null ? pointEl.remove() : void 0;
        };

        Tagger.prototype._savePoint = function(ev) {
            var detailEl, el, pointEl, val;
            el = $(ev.target);
            if (el.hasClass('disabled')) {
                return;
            }
            val = {};
            pointEl = this.panelEl.pointEl;
            val['itemVal'] = pointEl.prop('itemVal');
            val['itemTag'] = this.panelEl.one('.J_PanelItemTag').val();
            if (this._hasPoint(val['itemVal'].title)) {
                new Tip(el, "该宝贝已经关联过啦！", 0, "error");
                return false;
            }
            if (val['itemVal'] || val['peopleVal']) {
                pointEl.prop('data-value', val);
                this.fire("item~value~change");
            } else {
                return false;
            }
            detailEl = pointEl.one('.J_TTPDetail');
            detailEl.html(S.substitute(detailEl.html(), {
                title: val['itemVal'].title || val['peopleVal'].title,
                pic: val['itemVal'].large_pic || val['peopleVal'].large_pic,
                price: val['itemVal'].price || "",
                tag: val['itemTag'] || val['peopleTag'] || "[无标签]",
                src: "src"
            }));
            return this._closePanel();
        };

        Tagger.prototype._delPoint = function(ev) {
            var pointEl;
            pointEl = $(ev.target).parent(this.pointSelector);
            return pointEl.empty().remove();
        };

        Tagger.prototype._addFileToPanelBox = function(file, key) {
            var itemEl, _ref;
            itemEl = this.panelItemTPL.clone(true);
            itemEl.addClass("J_FileItem");
            itemEl.prop('file', file);
            itemEl.appendTo(this.wrapperEl);
            itemEl.one(this.itemThumbSelector).attr('src', file.url);
            return (_ref = this.kScroll) != null ? _ref.resize() : void 0;
        };

        Tagger.prototype._addMaskToImg = function() {
            return this.wrapperEl.all(".J_FileItem").each(function(item) {
                var height, imgObj, itemEl, left, top, width;
                itemEl = item.one(".tu-tag-item-thumb");
                imgObj = itemEl.one(this.itemThumbSelector);
                height = imgObj.height() - this.noPointNum * 2;
                width = imgObj.width() - this.noPointNum * 2;
                top = (itemEl.height() - imgObj.height()) / 2 + this.noPointNum;
                left = (itemEl.width() - imgObj.width()) / 2 + this.noPointNum;
                return itemEl.one(".J_TuTagMask").css({
                    top: top,
                    left: left,
                    width: width,
                    height: height
                });
            }, this);
        };

        return Tagger;

    })();
}, {
    requires: ['node', 'ajax', "combobox", "gallery/kscroll/1.1/index", '../simpletip']
});

/**
 * @fileoverview 模拟placeholder,支持监听UI和程序修改input的value重置placeholder状态
 * @author shuke<shuke.cl@taobao.com>
 * @module placeholder
 **/
KISSY.add('hy/widgets/placeholder',function (S) {
    /**
     * @class 模拟placeholder
     * @cfg 配置参数:
     * node : //输入框节点 (required)
     * labelTmpl : '<label class="placeholder-text" style="display: none;line-height:1;position:absolute;left:0;top:0;">&nbsp;</label>' //label模板 (option)
     * region : { // 手动配置label的定位和宽高 (option)
        *        top:0,
        *        left:0,
        *        width:0,
        *        height:0
        * }
     * @method
     *     check : //重新触发placeholder检查自身状态
     */
    var isSupport = "placeholder" in document.createElement("input");
    var NodeList = S.NodeList;
    var DOM = S.DOM;
    var Event = S.Event ;
    //重写val()方法，增加valchange事件
    if (!isSupport && !NodeList.prototype.__val) {
        var __proto = NodeList.prototype;
        __proto.__val = __proto.val;
        S.mix(__proto, {
            val: function (val) {
                if (val === undefined) {
                    return this.__val()
                }
                var pre_val = this.val();
                this.__val(val);
                this.fire && this.fire('valchange', {
                    newVal: val,
                    preVal: pre_val
                });
                return this;
            }
        });
    }
    function Placeholder(){
        Placeholder.superclass.constructor.apply(this,arguments);
        this.initializer();
    }
    Placeholder.ATTRS = {
        node : {
            value : null
        },
        labelTmpl : {
            value : '<label class="placeholder-text" style="display: none;color:#9a9a9a;line-height:1.5;position:absolute;left:0;top:0;">&nbsp;</label>'
        },
        wapperTmpl : {
            value : '<span class="placeholder-wrap" style="position: relative;display:inline-block;zoom:1;"></span>'
        },
        region : {
            top:0,
            left:0,
            width:120,
            height:20
        }
    };
    S.extend(Placeholder , S.Base , {
        initializer : function (){
            this.node = this.get('node');
            if (!(this.node instanceof NodeList)) {
                this.node = S.one(this.node);
            }
            if (isSupport || !this.node.hasAttr('placeholder')) {
                return ;
            }
            this.renderUI();
            this.bindUI();
            this.check();
        },
        renderUI : function (){
            var wapper_node = S.one(DOM.create(this.get('wapperTmpl')));
            var input_node = this.node;
            var label_node = S.one(DOM.create(this.get('labelTmpl')));
            var input_id = input_node.attr('id');
            //没有id的输入框创建随机id
            if (input_id == '') {
                input_id = S.guid('J_K'+ new Date().getTime());
                input_node.attr('id', input_id);
            }
            label_node.attr('for',input_id);
            wapper_node.append(label_node);
            DOM.insertBefore(wapper_node , input_node);
            wapper_node.append(input_node);
            this.labelNode = label_node;
            this.wapperNode = wapper_node;
        },
        bindUI  : function () {
            this.node.on('valchange valuechange blur', function () {
                S.later(function (){
                    this.check()
                },0,false,this);
            }, this);
            this.node.on('focus', function () {
                this._hide();
            }, this);
        },
        /**
         * @description 计算placeholder的label的现实位置和宽度
         * @param {NodeList} node 输入框
         * @param {NodeList} label_node labelNode
         * @param {NodeList} wapper_node
         * @returns {Object} Region
         */
        getPos  : function (node, label_node,wapper_node) {
            var _w = node.width();
            var _left = parseInt(node.css('paddingLeft'),10)+2 +'px';
            var _top = (wapper_node.innerHeight() - label_node.innerHeight()) / 2 + 'px';
            var region = {
                left : _left,
                top  : _top,
                width: _w
            };
            return S.mix(region, this.get('region'));

        },
        /**
         * 检查自身状态
         * @return {undefined}
         */
        check   : function () {
            if (this.node.val() === '') {
                this._show();
                return;
            }
            this._hide();
        },
        _show   : function () {
            var label_node = this.labelNode;
            var region = this.getPos(this.node, label_node , this.wapperNode);
            label_node.show();
            label_node.css({
                "left" : region.left,
                "top"  : region.top,
                "width": region.width
            });
            label_node.html(this.node[0].attributes.placeholder.value);
        },
        _hide   : function () {
            this.labelNode.hide();
        }
    });
    return Placeholder;
}, {requires:['node','event' , 'base']});


var __hasProp = {}.hasOwnProperty;

KISSY.add('hy/widgets/taguploader/taguploader',function(S, Uploader, Tagger, Node, Ajax, KScroll, Placeholder) {
    var $, TagUploader, defaultConfig;
    $ = Node.all;
    defaultConfig = {
        wrapperEl: '.J_TUItemBox',
        inputEl: '.J_TUInputEl',
        dropperEl: '.J_TUDropper',
        uploadUrl: "",
        uploadParams: {},
        timeout: 300,
        autoUpload: true,
        dropperFieldName: "upload_files[]",
        fileType: [/image/i, ".jpeg", ".jpg", ".png", ".bmp"],
        maxFile: 50,
        outterEl: '.J_TUOuter',
        itemTPL: '.J_TUItem',
        itemThumbSelector: ".J_TUItemThumb",
        itemDelSelector: ".J_TUItemDel",
        saveSelector: ".J_TUSave",
        closeSelector: ".J_TUClose",
        submitSelector: ".J_TUSubmit",
        hasDescription: false,
        useTagger: false,
        taggerConfig: {}
    };
    return TagUploader = (function() {
        function TagUploader(config) {
            this.config = S.merge(defaultConfig, config);
            if (!this.config.uploadUrl) {
                return;
            }
            this.outterEl = this.config.outterEl = $(this.config.outterEl);
            this.wrapperEl = this.config.wrapperEl = this.outterEl.one(this.config.wrapperEl);
            this.inputEl = this.config.inputEl = this.outterEl.one(this.config.inputEl);
            this.dropperEl = this.config.dropperEl = this.outterEl.one(this.config.dropperEl);
            this.anotherInput = this.config.anotherInput = this.outterEl.one(this.config.anotherInput || '.J_TUAnotherInput');
            this.itemTPL = this.config.itemTPL = this.outterEl.one(this.config.itemTPL);
            if (!this.wrapperEl.length || !this.inputEl.length || !this.dropperEl.length) {
                return;
            }
            S.mix(this, S.EventTarget);
            this.uploader = new Uploader(this.config);
            this.outterEl.delegate("click", this.config.closeSelector, this.destroy, this);
            this.outterEl.delegate("click", this.config.saveSelector, this.close, this);
            this.outterEl.delegate("click", this.config.submitSelector, this.submit, this);
            if (this.config.itemDelSelector) {
                this.outterEl.delegate("click", this.config.itemDelSelector, this._delItemHandler, this);
            }
            if (this.config.hasDescription) {
                this.outterEl.delegate("keydown focusin focusout", ".J_TUItemDspt", this._setDescription, this);
            }
            this.uploader.on("files:add", this._addFileHandler, this);
            this.uploader.on("progress", this._progressHandler, this);
            this.uploader.on("finish", this._completeHandler, this);
            this.uploader.on("message", this._messageHandler, this);
            if (this.anotherInput) {
                this.originalInputPlace = this.inputEl.parent();
                this.on("files:add files:remove", this._checkInputPlace, this);
            }
        }

        TagUploader.prototype.init = function() {
            this.files = [];
            this.successFiles = [];
            this.fileID = 0;
            this.initKScroll();
            if (this.config.useTagger) {
                this.initTagger();
            }
            return this;
        };

        TagUploader.prototype.initPlaceholder = function(node) {
            if (!S.UA.ie || S.UA.ie > 8) {
                return;
            }
            return new Placeholder({
                node: node
            });
        };

        TagUploader.prototype.initKScroll = function() {
            return this.kScroll = new KScroll(this.wrapperEl, {
                prefix: "tu-scroll-",
                hotkey: true,
                bodydrag: true,
                allowArrow: false
            });
        };

        TagUploader.prototype.initTagger = function() {
            var _this = this;
            this.tagger = new Tagger(S.merge(this.config.taggerConfig, {
                outterEl: this.outterEl
            }));
            this.outterEl.all(this.config.saveSelector).hide();
            this.outterEl.all(this.config.submitSelector).hide();
            return this.outterEl.one('.J_ToTagBox').on("click", function(ev) {
                var file, _i, _len, _ref;
                _this.tagger.initKScroll();
                _this.outterEl.all(_this.config.saveSelector).show();
                _this.outterEl.all(_this.config.submitSelector).show();
                $(ev.target).hide();
                _this.wrapperEl.hide();
                if (_this.kScroll) {
                    _this.wrapperEl.parent().hide();
                }
                _this.fire("to~tag~box");
                _ref = _this.successFiles;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    file = _ref[_i];
                    _this.tagger._addFileToPanelBox(file);
                }
                _this.tagger._addMaskToImg();
                new Placeholder({
                    node: _this.tagger.panelEl.one('.J_PanelItemValue')
                });
                return new Placeholder({
                    node: _this.tagger.panelEl.one('.J_PanelItemTag')
                });
            });
        };

        TagUploader.prototype.show = function() {
            this.outterEl.show();
            this.fire("show", {
                files: this.files
            });
            return this;
        };

        TagUploader.prototype.close = function() {
            this.outterEl.hide();
            return this.fire("close", {
                files: this.files
            });
        };

        TagUploader.prototype.submit = function() {
            if (this.tagger) {
                this.tagger._fetchPoint();
            }
            return this.fire("submit", {
                files: this.successFiles
            });
        };

        TagUploader.prototype._postCallback = function(data) {
            if (data.success || data.status) {
                return this.fire("post:success", {
                    data: data
                });
            } else {
                return this.fire("post:error", {
                    data: data
                });
            }
        };

        TagUploader.prototype._fetchFiles = function() {
            var file, _i, _len, _ref, _results;
            _ref = this.files;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                file = _ref[_i];
                if (file.itemEl) {
                    _results.push(file.despt = file.itemEl.one('.J_TUItemDspt').val());
                } else {
                    _results.push(void 0);
                }
            }
            return _results;
        };

        TagUploader.prototype._addFileHandler = function(ev) {
            var file, files, _i, _len;
            this.inputEl = this.uploader.inputEl;
            files = ev.files;
            for (_i = 0, _len = files.length; _i < _len; _i++) {
                file = files[_i];
                this._addFileToBox(file, this.fileID++);
                this.files.push(file);
            }
            return this.fire("files:add", {
                files: files
            });
        };

        TagUploader.prototype._addFileToBox = function(file, key) {
            var itemEl, _ref;
            file.itemKey = key;
            itemEl = this.itemTPL.clone(true);
            itemEl.addClass("J_FileItem");
            itemEl.prop('file', file);
            itemEl.all('.J_TUItemFileName').text(file.name);
            file.itemEl = itemEl;
            itemEl.appendTo(this.wrapperEl);
            this.outterEl.addClass("taguploader-notempty");
            if ((_ref = this.kScroll) != null) {
                _ref.resize();
            }
            return this.initPlaceholder(itemEl.one('input')[0]);
        };

        TagUploader.prototype._delItemHandler = function(ev) {
            var file, key, parent;
            parent = $(ev.target).parent(".J_FileItem");
            file = parent.prop('file');
            file.itemEl.remove();
            file.itemEl = null;
            key = S.indexOf(file, this.successFiles);
            if (key !== -1) {
                this.successFiles.splice(key, 1);
            }
            if (this.wrapperEl.all(".J_FileItem").length === 0) {
                this.outterEl.removeClass("taguploader-notempty");
            }
            this.uploader._removeFileHandler(file);
            return this.fire("files:remove", {
                files: this.successFiles,
                file: file
            });
        };

        TagUploader.prototype._checkInputPlace = function() {
            var _ref;
            if (this.outterEl.hasClass(".taguploader-notempty")) {
                this.inputEl.appendTo(this.anotherInput);
                return this.anotherInput.show();
            } else {
                if ((_ref = this.anotherInput) != null) {
                    _ref.hide();
                }
                return this.inputEl.appendTo(this.originalInputPlace);
            }
        };

        TagUploader.prototype._progressHandler = function(ev) {
            var barEl, file, progressEl, _i, _len, _ref;
            _ref = ev.files;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                file = _ref[_i];
                if (!(progressEl = file.itemEl.one(".J_TUProgress"))) {
                    return;
                }
                barEl = progressEl.children();
                barEl[0].style.marginLeft = -100 + ev.loaded / ev.total * 100 + "%";
            }
        };

        TagUploader.prototype._completeHandler = function(ev) {
            var file, files, _file, _i, _j, _len, _len1, _ref;
            if (!(files = ev.files)) {
                return;
            }
            for (_i = 0, _len = files.length; _i < _len; _i++) {
                _file = files[_i];
                _ref = this.files;
                for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                    file = _ref[_j];
                    if (_file === file) {
                        this._updateStatus(file);
                    }
                }
            }
            return this.fire("files:update", {
                files: this.successFiles
            });
        };

        TagUploader.prototype._updateStatus = function(file) {
            var thumb;
            if (file.status === "success") {
                this.successFiles.push(file);
                file.itemEl.addClass("J_TUItemSuccess");
                if (thumb = file.itemEl.one(this.config.itemThumbSelector) || file.itemEl.one('.J_TUItemThumb')) {
                    return thumb[0].src = file.url;
                }
            } else {
                file.itemEl.addClass("J_TUItemFail");
                return file.itemEl.one('.J_TUFailure').all('span')[1].innerHTML = file.message || "上传失败";
            }
        };

        TagUploader.prototype._setDescription = function(ev) {
            var file, parent, val;
            val = $(ev.target).val();
            if (val.length > 25 && ev.keyCode !== 8) {
                ev.preventDefault();
            }
            val = val.substring(0, 25);
            parent = $(ev.target).parent(".J_FileItem");
            file = parent.prop('file');
            return file.description = val;
        };

        TagUploader.prototype._messageHandler = function(ev) {
            return this.fire(ev.errorType);
        };

        TagUploader.prototype.destroy = function() {
            var key, _ref, _ref1, _results;
            this.fire("destroy");
            this.uploader.destroy();
            if ((_ref = this.outterEl) != null) {
                _ref.empty().remove();
            }
            _results = [];
            for (key in this) {
                if (!__hasProp.call(this, key)) continue;
                if ((_ref1 = this[key]) != null) {
                    if (typeof _ref1.empty === "function") {
                        _ref1.empty();
                    }
                }
                _results.push(this[key] = null);
            }
            return _results;
        };

        return TagUploader;

    })();
}, {
    requires: ["./uploader", "./tagger", "node", "ajax", "gallery/kscroll/1.1/index", "../placeholder"]
});

/*
 combined files : 

 gallery/pagination/2.0/index

 */
/**
 * @fileoverview 分页组件，可以定制分页展示的数量
 * @author aloysious.ld@taobao.com
 * @version 2.0
 *
 */
KISSY.add('hy/widgets/pagination',function(S, Base, EVENT, NODE, DOM){

    "use strict";

    function Pagination(selector, cfg) {
        if (this instanceof Pagination) {

            if(S.isObject(selector)){
                this.con = selector;
            }else if(/^#/i.test(selector)){
                this.con = S.one(selector);
            }else if(S.one("#"+selector)){
                this.con = S.one("#"+selector);
            }else if(S.one(selector)){
                this.con = S.one(selector);
            }else {
                throw new Error('Pagination Container Hooker not found');
            }

            Pagination.superclass.constructor.call(this, cfg);
            this.init();

        } else {
            return new Pagination(selector, cfg);
        }
    }

    Pagination.ATTRS = {
        // 总页数
        totalPage: {
            value: 10
        },
        // 默认选中的页数
        currentPage: {
            value: 1
        },
        // 当前页的最大紧邻前置页数（不包括最前面的显示页数）
        preposePagesCount: {
            value: 2
        },
        // 当前页的最大紧邻后置页数
        postposePagesCount: {
            value: 1
        },
        // 第一个"..."前显示的页数
        firstPagesCount: {
            value: 2
        },
        // 第二个"..."后显示的页数
        lastPagesCount: {
            value: 0
        },
        render: {
            value: true
        }
    };

    S.extend(Pagination, S.Base, {
        init: function() {
            if (this.get('render')) {
                this.render();
            }
        },
        render: function() {
            this.renderUI();
            this.bindUI();
            this.syncUI();
        },
        renderUI: function() {
            this._resetPagination();
        },
        bindUI: function() {
            var self = this;

            EVENT.delegate(self.con, 'click', '.pagination-spec', function(e) {
                var currTarget = e.currentTarget,
                    toPage = parseInt(DOM.attr(currTarget, 'data-page'));
                self._switchToPage(toPage);
            });
            EVENT.delegate(self.con, 'click', '.pagination-prev', function(e) {
                var toPage = self.get('currentPage') - 1;
                self._switchToPage(toPage);
            });
            EVENT.delegate(self.con, 'click', '.pagination-next', function(e) {
                var toPage = self.get('currentPage') + 1;
                self._switchToPage(toPage);
            });
        },
        syncUI: function() {},
        /**
         * @brief 刷新分页组件
         */
        _resetPagination: function() {
            var paginationInner = '',
                totalPage = this.get('totalPage') > 0 ? this.get('totalPage') : 1,
                currPage = (this.get('currentPage') <= totalPage && this.get('currentPage')) > 0 ? this.get('currentPage') : 1,
                preposePagesCount = this.get('preposePagesCount') >= 0 ? this.get('preposePagesCount') : 2,
                postposePagesCount = this.get('postposePagesCount') >= 0 ? this.get('postposePagesCount') : 1,
                firstPagesCount = this.get('firstPagesCount') >= 0 ? this.get('firstPagesCount') : 2,
                lastPagesCount = this.get('lastPagesCount') >= 0 ? this.get('lastPagesCount') : 0,
                offset;

            // currPage前的页码展示
            paginationInner += currPage === 1 ? '<span class="pagination-start"><span>上一页</span></span>' : '<a class="pagination-prev"><span>上一页</span></a>';

            if (currPage <= firstPagesCount + preposePagesCount + 1) {
                for(var i=1; i<currPage; i++) {
                    paginationInner += this._renderActivePage(i);
                }

            } else {
                for(var i=1; i<=firstPagesCount; i++) {
                    paginationInner += this._renderActivePage(i);
                }
                paginationInner += '<span class="pagination-break">...</span>';
                for(var i=currPage-preposePagesCount; i<=currPage-1; i++) {
                    paginationInner += this._renderActivePage(i);
                }
            }

            // currPage的页码展示
            paginationInner += '<span class="pagination-curr">' + currPage + '</span>';

            // currPage后的页码展示
            if (currPage >= totalPage - lastPagesCount - postposePagesCount) {
                offset = currPage + 1;
                for(var i=currPage+1; i<=totalPage; i++) {
                    paginationInner += this._renderActivePage(i);
                }

            } else {
                for(var i=currPage+1; i<=currPage+postposePagesCount; i++) {
                    paginationInner += this._renderActivePage(i);
                }
                paginationInner += '<span class="pagination-break">...</span>';
                for(var i=totalPage-lastPagesCount+1; i<=totalPage; i++) {
                    paginationInner += this._renderActivePage(i);
                }
            }

            paginationInner += currPage === totalPage ? '<span class="pagination-end"><span>下一页</span></span>' : '<a class="pagination-next"><span>下一页<span></a>';

            DOM.html(this.con, paginationInner);

        },
        /**
         * @brief 渲染可点击的页码
         * @param index {Number} 页码索引
         *
         */
        _renderActivePage: function(index) {
            return '<a class="pagination-spec" data-page="' + index + '">' + index + '</a>';
        },
        _switchToPage: function(page) {
            this.set('currentPage', page);
            this._resetPagination();
            this.fire('switch', {
                toPage: this.get('currentPage')
            });
        },
        show: function() {
            this.con.show();
        },
        hide: function() {
            this.con.hide();
        }
    });

    return Pagination;

},{
    requires:['base', 'event', 'node', 'dom']
});
var __hasProp = {}.hasOwnProperty;

KISSY.add('hy/detail',function(S, Overlay, SuitableImage, Exp, ScrollMaster, GhostScroll, TS, Share, TagUploader, Pagination) {
    var $, Ajax, DOM, Detail, Event, JSON, UA;
    $ = S.all;
    DOM = S.DOM;
    Ajax = S.io;
    Event = S.Event;
    JSON = S.JSON;
    UA = S.UA;
    return Detail = (function() {
        function Detail(config) {
            var detailEl, detailTpl, feed;
            this.config = config;
            if (this.config.feed == null) {
                return;
            }
            this.feed = feed = this.config.feed;
            detailTpl = "<div class=\"overlay-wrapper detail active-overlay\">\n<div class=\"share-panel\">\n  <div class=\"share-col\">\n    <div class=\"share-bar\">\n      <a href=\"javascript:void(0)\" class=\"share-panel-angle\"></a>\n      <a class=\"share-bar-icon share-like J_LikeBtn\" href=\"javascript:void(0)\" title=\"喜欢\"><i></i><span class=\"J_LikeNum\">0</span></a>\n      <a class=\"share-bar-icon share-comment J_CommentBtn\" href=\"javascript:void(0)\" title=\"评论\"><i></i><span class=\"J_CommentNum\">0</span></a>\n      <a class=\"share-bar-icon share-sina J_ShareSina\" target=\"_blank\" href=\"javascript:void(0)\" title=\"分享到微博\"><i></i></a>\n      <a class=\"share-bar-icon share-douban J_ShareDouban\" target=\"_blank\" href=\"javascript:void(0)\" title=\"分享到豆瓣\"><i></i></a>\n      <a class=\"share-bar-icon share-qzone J_ShareQzone\" target=\"_blank\" href=\"javascript:void(0)\" title=\"分享到QQ空间\"><i></i></a>\n    </div>\n  </div>\n  <div class=\"comment-box\">\n    <div class=\"comment-wrapper\">\n    <div class=\"head\">\n    <h3>评论</h3><span class=\"comment-count J_CommentNum\"></span>\n    </div>\n    <div class=\"J_CommentBox\"></div>\n    </div>\n  </div>\n</div>\n<div class=\"detail-wrapper\">\n</div>\n</div>";
            this.preScrollEl = ScrollMaster.el;
            this.detailEl = detailEl = $(DOM.create(detailTpl));
            this.isReturn = this.config.isReturn;
            Overlay.showOverlayWith(this, 2, detailEl, false, false);
            this.detailWrapper = detailEl.one('.detail-wrapper');
            this.sharePanel = detailEl.one('.share-panel');
            this.imgDDIns = [];
            if (!this.isReturn) {
                if (feed.detailContent) {
                    $('body').append('<div id="J_FirstLoading"><span class="kaitong-col-loading-pic"></span>加载中，请稍候。。。</div>');
                    this.showContent(feed.detailContent);
                } else {
                    S.log("empty");
                    location.href = "#!/index";
                }
            } else {
                Router.switchView(this, function() {
                    if (feed.detailContent) {
                        $('body').append('<div id="J_FirstLoading"><span class="kaitong-col-loading-pic"></span>加载中，请稍候。。。</div>');
                        return this.showContent(feed.detailContent);
                    } else {
                        S.log("empty");
                        return location.href = "#!/index";
                    }
                });
            }
        }

        Detail.prototype.showContent = function(content) {
            var _left, _leftEl, _rightEl,
                _this = this;
            this.sharePanel.hide();
            this.detailWrapper.hide().html(content);
            this.detailInnerWrapper = this.detailEl.one(".detail-inner-wrapper");
            this.detailLeftEl = this.detailEl.one('.detail-left');
            this.detailRightEl = this.detailWrapper.one('.detail-right');
            this.detailRightWrapper = this.detailWrapper.one(".detail-right-wrapper");
            this.preTitle = document.title;
            document.title = this.feed.title + ' - ' + SELLER_NICK + " 的后院";
            _leftEl = this.detailLeftEl;
            _left = parseInt(_leftEl.css('left'));
            _rightEl = this.detailRightEl;
            ScrollMaster.config.allowScroll = false;
            return S.later(function() {
                $('#J_FirstLoading').remove();
                _this.init();
                _this.detailWrapper.show();
                $('.share-panel').addClass('share-panel-show');
                _this.sharePanel.show();
                $('#J_Wrapper').addClass("mainback");
                S.later(function() {
                    $('#J_Wrapper').removeClass("mainback");
                    if (typeof callback !== "undefined" && callback !== null) {
                        return callback.call(context);
                    }
                }, 210);
                _this.detailEl.all(".detail-text-scroll").each(function(el) {
                    if (el.height() > 360) {
                        return new GhostScroll({
                            "el": el
                        });
                    } else {
                        return el.css('padding-top', (420 - el.height()) / 2);
                    }
                });
                _this.setComment();
                _this.setSNS();
                _this.initImageLike();
                _this.initXiaobao();
                _this.initAlbum();
                _this.initAlbumHook();
                _this.initVote();
                return _this.setScroll();
            }, 600);
        };

        Detail.prototype.init = function() {
            var _this = this;
            this.detailEl.one('.J_ReturnBtn').on("click", function() {
                $('#J_Wrapper').addClass("mainback");
                _this.innerClose();
                return S.later(function() {
                    $('#J_Wrapper').removeClass("mainback");
                    if (typeof callback !== "undefined" && callback !== null) {
                        return callback.call(context);
                    }
                }, 210);
            });
            this.detailEl.all('.ss-image-lazyload').each(function(item) {
                return new SuitableImage(item);
            });
            this.freezelayer = $(DOM.create('<div class="detail-freeze-layer"></div>'));
            return this.freezelayer.appendTo(this.detailRightEl);
        };

        Detail.prototype.setScroll = function() {
            var _this = this;
            ScrollMaster.init(this.detailWrapper);
            ScrollMaster.config.allowScroll = true;
            ScrollMaster.on("start", function() {
                return _this.freezelayer.show();
            });
            return ScrollMaster.on("end", function() {
                return _this.freezelayer.hide();
            });
        };

        Detail.prototype.setSNS = function() {
            var douban, error, qzone, shareInst, sina, _ref, _ref1, _ref2,
                _this = this;
            if (this.feed.isLiked) {
                this.detailEl.one(".J_LikeBtn").addClass("liked");
            }
            if (this.feed.favorCount) {
                this.detailEl.one(".J_LikeNum").text(this.feed.favorCount);
            }
            if (this.feed.commentCount) {
                this.detailEl.one(".J_CommentNum").text(this.feed.commentCount);
            }
            if (this.feed.sns != null) {
                try {
                    SNS.ui("comment", {
                        "element": this.detailEl.one(".J_CommentBox"),
                        "isAutoHeight": false,
                        "param": {
                            "app_id": APP_ID,
                            "target_key": this.feed.sns.favor_target_key,
                            "type_id": APP_ID,
                            "rec_user_id": this.feed.sns.rec_user_id,
                            "view": "detail_list",
                            "title": "这是一条来自店铺后院的评论",
                            "moreurl": location.href,
                            "canFwd": "0",
                            "pageSize": 8
                        },
                        "paramList": {
                            "view": "list_trunPage"
                        },
                        "callback": {
                            "delCallback": function() {
                                var num;
                                num = parseInt(this.detailEl.one('.J_CommentNum').text()) - 1;
                                return this.setCommentNum(num);
                            },
                            "commentCallback": function() {
                                var num;
                                num = parseInt(_this.detailEl.one('.J_CommentNum').text()) + 1;
                                return _this.setCommentNum(num);
                            }
                        }
                    });
                } catch (_error) {
                    error = _error;
                }
            }
            this.detailEl.one('.J_LikeBtn').on("click", function(ev) {
                ev.halt();
                if (!Exp.likeCheck(ev.currentTarget, 1)) {
                    return;
                }
                return Ajax({
                    url: INDEX_LIKE_URL,
                    type: "post",
                    dataType: "json",
                    data: {
                        _tb_token_: SUBMIT_TOKEN,
                        target_key: _this.feed.sns.favor_target_key,
                        type_id: _this.feed.sns.favor_type_id,
                        seller_id: SELLER_ID,
                        subType: _this.feed.type,
                        act: "add"
                    },
                    success: function(data) {
                        if (data.success) {
                            _this.setLikeNum(data.count);
                            return _this.detailEl.one(".J_LikeBtn").addClass("liked");
                        } else {
                            return Exp.showError($(ev.currentTarget), (data.message ? data.message : "操作失败，请稍后重试"), 1);
                        }
                    },
                    error: function() {
                        return Exp.showError($(ev.currentTarget), "操作失败，请稍后重试", 1);
                    }
                });
            });
            shareInst = null;
            shareInst = new Share({
                title: this.feed.title,
                pic: ((_ref = this.detailEl.one('.activity-thumb-wrapper')) != null ? _ref.attr("data-image") : void 0) || ((_ref1 = this.detailEl.one(".detail-image")) != null ? (_ref2 = _ref1.one("img")) != null ? _ref2.attr("src") : void 0 : void 0),
                url: this.feed.shortUrl ? this.feed.shortUrl : location.href.replace("?share", "").replace("?comment", ""),
                show: false
            });
            sina = this.detailEl.one('.share-sina').attr("href", shareInst.sinaURL);
            douban = this.detailEl.one('.share-douban').attr("href", shareInst.doubanURL);
            qzone = this.detailEl.one('.share-qzone').attr("href", shareInst.qzoneURL);
            return sina.add(douban).add(qzone).on('click', function(ev) {
                return ev.stopPropagation();
            });
        };

        Detail.prototype.setComment = function() {
            var _this = this;
            this.sharePanel = this.detailEl.one(".share-panel");
            this.sharePanel.one('.share-col').on("click", function(ev) {
                ev.halt();
                return _this.sharePanel.toggleClass("share-panel-full");
            });
            return this.detailWrapper.on("scroll", function() {
                if ((_this.detailWrapper[0].scrollLeft + VIEWPORTWIDTH) >= (_this.detailInnerWrapper[0].offsetWidth - 10)) {
                    return _this.sharePanel.addClass("share-panel-full");
                } else {
                    return _this.sharePanel.removeClass("share-panel-full");
                }
            });
        };

        Detail.prototype.initAlbumHook = function() {
            return this.detailEl.delegate('click', '.J_AlbumHook', function(ev) {
                var box, el, ins, link, _overlay;
                ev.halt();
                el = $(ev.currentTarget);
                link = el.attr('href');
                ins = {
                    destroy: function() {
                        return {};
                    }
                };
                _overlay = $("<div class=\"album-overlay\"> <div class=\"album-box\"> <iframe class=\"album-frame\" border=\"0\" src=\"" + link + "\"></iframe> </div> </div>");
                Overlay.showOverlayWith(ins, 4, _overlay, 0, true);
                if (UA.ie <= 8) {
                    box = _overlay.one('.album-box');
                    return box.css({
                        left: (VIEWPORTWIDTH - box.width()) / 2,
                        top: (VIEWPORTHEIGHT - box.height()) / 2
                    });
                }
            });
        };

        Detail.prototype.initImageLike = function() {
            return this.detailEl.delegate("click", '.J_ImageLike', function(ev) {
                var el, itemKey;
                el = $(ev.currentTarget);
                if (!(itemKey = el.attr("data-itemid"))) {
                    return;
                }
                if (!Exp.checkLogin()) {
                    return;
                }
                ev.halt();
                return Ajax({
                    url: INDEX_LIKE_URL,
                    type: "post",
                    dataType: "json",
                    data: {
                        _tb_token_: SUBMIT_TOKEN,
                        target_key: itemKey,
                        act: "add"
                    },
                    success: function(data) {
                        var num;
                        if (data.success) {
                            if (data.count) {
                                num = data.count;
                            } else {
                                num = parseInt(el.text());
                            }
                            el.html("<i></i>+1");
                            el.addClass("liked");
                            return setTimeout(function() {
                                return el.html("<i></i>" + num);
                            }, 2000);
                        } else {
                            return Exp.showError(el, (data.message ? data.message : "操作失败，请稍后重试"), 1);
                        }
                    }
                });
            });
        };

        Detail.prototype.initXiaobao = function() {
            var fixWidth;
            if (S.UA.ie === 7) {
                $('.detail-bigtext').all('.ss-ghostscroll-invail').append(this.detailEl.one('.vertical-fixed').clone());
            }
            fixWidth = function(node) {
                var width;
                width = (function() {
                    var _width;
                    _width = 0;
                    node.children().each(function(el) {
                        return _width += el.outerWidth(true);
                    });
                    return _width;
                })();
                return node.parent('.detail-table-col').css('width', width + 120);
            };
            this.detailEl.all('.xiaobao-all-col').all('img').on("load", function(ev) {
                return fixWidth($(ev.target).parent('.xiaobao-all-col'));
            });
            this.detailEl.all('.xiaobao-all-col').each(function(el) {
                fixWidth($(el));
                return $('.vote-col').each(function() {
                    var w;
                    w = this.width();
                    return this.width(w + 310);
                });
            });
            return this.detailEl.all('.J_TUTagPoint').each(function(tagEl) {
                var imgEl, loadEvent, picSrc, pos, tmpPic;
                imgEl = tagEl.parent(".detail-image-wrapper").one('img');
                picSrc = imgEl[0].src;
                if (!DOM.attr(tagEl, 'ks-data-pos') || DOM.attr(tagEl, 'ks-data-pos') === "") {
                    return;
                }
                pos = JSON.parse(DOM.attr(tagEl, 'ks-data-pos'));
                tmpPic = new Image;
                loadEvent = function(ev) {
                    var actuHeight, actuWidth, actuX, actuY, dLeft, dTop, detail, realHeight, realWidth;
                    if (!tmpPic.width) {
                        return;
                    }
                    realHeight = tmpPic.height;
                    realWidth = tmpPic.width;
                    actuWidth = imgEl[0].width;
                    actuHeight = imgEl[0].height;
                    if (pos.x >= 1) {
                        actuX = pos.x * (actuWidth / realWidth);
                        actuY = pos.y * (actuHeight / realHeight);
                    } else {
                        actuX = pos.x * actuWidth;
                        actuY = pos.y * actuHeight;
                    }
                    DOM.css(tagEl, {
                        left: actuX - 13,
                        top: actuY - 33,
                        display: "block"
                    });
                    detail = $(tagEl).one(".J_TTPDetail");
                    if (actuHeight - actuY < 133) {
                        dTop = -123;
                    } else {
                        dTop = 36;
                    }
                    if (actuWidth - actuX < 280) {
                        dLeft = -(280 - actuWidth + actuX);
                    } else {
                        dLeft = 0;
                    }
                    return DOM.css(detail, {
                        left: dLeft,
                        top: dTop,
                        position: "absolute"
                    });
                };
                Event.on(tmpPic, 'load', loadEvent);
                tmpPic.src = picSrc;
                return loadEvent({
                    target: tmpPic
                });
            });
        };

        Detail.prototype.initVote = function() {
            var isSubmiting,
                _this = this;
            isSubmiting = false;
            return this.detailEl.delegate("click", ".J_DetailVoteBtn", function(ev) {
                if (!Exp.checkLogin()) {
                    return;
                }
                if (isSubmiting || $(ev.target).hasClass("disabled")) {
                    return;
                }
                Ajax.get(SC_SUBMIT_URL, {
                    type: 2,
                    shopId: SHOP_ID
                });
                isSubmiting = true;
                return Ajax({
                    url: VOTE_SUBMIT_URL,
                    type: "post",
                    dataType: "json",
                    form: '.J_DetailVoteForm',
                    complete: function() {
                        return isSubmiting = false;
                    },
                    success: function(data) {
                        if ((data != null ? data.success : void 0) === true) {
                            return _this.voteHandler.call(_this, data, isSubmiting);
                        } else {
                            return Exp.showError($(ev.target), (data.message ? data.message : "操作失败，请稍后重试"), 1);
                        }
                    },
                    error: function() {
                        return Exp.showError($(ev.target), "操作失败，请稍后重试", 1);
                    }
                });
            });
        };

        Detail.prototype.voteHandler = function(data, isSubmiting) {
            var item, key, percent, voteCount, _i, _len, _ref, _ref1, _ref2, _results;
            this.detailEl.all(".item-result").css("display", "block");
            this.detailEl.all(".J_DetailVoteBtn").text("已投票");
            isSubmiting = true;
            voteCount = data.voteCount;
            if ((_ref = this.detailEl.one(".J_VoteJionCount")) != null) {
                if ((_ref1 = _ref.one('span')) != null) {
                    _ref1.text(voteCount);
                }
            }
            if ((data.voteResult != null) && data.voteResult.length !== 0) {
                _ref2 = data.voteResult;
                _results = [];
                for (key = _i = 0, _len = _ref2.length; _i < _len; key = ++_i) {
                    item = _ref2[key];
                    percent = Math.round((1 - item[1] / voteCount) * 100, 3);
                    _results.push(this.detailEl.all('.vote-item').each(function(el) {
                        if (el.one('input').val() === item[0].toString()) {
                            el.one('.line-bg').animate({
                                "left": "-" + percent + "%"
                            }, 0.4, "easeBoth");
                            return el.one('.result-text').removeClass("hidden").text(item[1] + " (" + (100 - percent) + "%)");
                        }
                    }));
                }
                return _results;
            }
        };

        Detail.prototype.initAlbum = function() {
            var uploadBtn;
            this.initAlbumList();
            if (uploadBtn = this.detailEl.one('.J_DetailUploadBtn')) {
                this.albumId = uploadBtn.attr("data-albumid");
                this.activityId = uploadBtn.attr("data-activityid");
                return uploadBtn.on("click", this.albumUploadHandler, this);
            }
        };

        Detail.prototype.initAlbumScroll = function() {};

        Detail.prototype.initAlbumList = function() {
            var _this = this;
            if (!(this.albumCol = this.detailEl.one(".album-col"))) {
                return;
            }
            this.detailEl.delegate("click", ".album-delete", this.albumDeleteHandler, this);
            this.detailEl.delegate("click", ".album-like", this.albumLikeHandler, this);
            this.detailEl.delegate('click', '.J_Tab', this.albumSwitchHandler, this);
            if (S.UA.ie === 7) {
                this.albumCol.parent().width(960);
            }
            return setTimeout(function() {
                return _this.albumCol.one('.J_Tab').fire('click');
            }, 1000);
        };

        Detail.prototype.albumSwitchHandler = function(ev) {
            var el, loadedHandler, loadingEl, postData, type, wrapEl,
                _this = this;
            this.albumCol.all('.J_Tab').removeClass('active');
            el = $(ev.target);
            el.addClass('active');
            type = el.attr('ks-type');
            loadingEl = this.albumCol.one('.J_AlbumLoading');
            loadingEl.show();
            wrapEl = this.albumCol.one('.J_AlbumWrap');
            postData = JSON.parse(this.albumCol.attr("postData"));
            postData = S.merge(postData,{_tb_token_: SUBMIT_TOKEN});
            wrapEl.empty();
            loadedHandler = function(data) {
                var key, pagiEl, _ref;
                if (!data || !data.success) {
                    return;
                }
                loadingEl.hide();
                wrapEl.empty();
                if (data.data === "") {
                    wrapEl.addClass("empty");
                    return wrapEl.append("<p>大批晒客正在赶来，不如做我们的第一个晒客吧</p>");
                } else {
                    wrapEl.append(data.data);
                    pagiEl = _this.albumCol.one('.J_AlbumPagi');
                    pagiEl.empty();
                    if (_this.AlbumPagi) {
                        _this.AlbumPagi.detach('switch');
                        _ref = _this.AlbumPagi;
                        for (key in _ref) {
                            if (!__hasProp.call(_ref, key)) continue;
                            delete _this.AlbumPagi[key];
                        }
                    }
                    if (data.totalPage <= 1) {
                        return;
                    }
                    _this.AlbumPagi = new Pagination(pagiEl, {
                        currentPage: data.currentPage,
                        totalPage: data.totalPage,
                        firstPagesCount: 2,
                        preposePagesCount: 1,
                        postposePagesCount: 1,
                        lastPagesCount: 2
                    });
                    return _this.AlbumPagi.on('switch', function(ev) {
                        loadingEl.show();
                        return Ajax.jsonp(ALBUM_MORE_URL, S.merge(postData, {
                            type: type,
                            pageNum: ev.toPage
                        }), loadedHandler);
                    });
                }
            };
            return Ajax.jsonp(ALBUM_MORE_URL, S.merge(postData, {
                type: type,
                pageNum: 1
            }), loadedHandler);
        };

        Detail.prototype.albumLikeHandler = function(ev) {
            var albumId, isLike, numEl, photoEl;
            ev.preventDefault();
            if (!Exp.checkLogin()) {
                return;
            }
            photoEl = $(ev.currentTarget);
            numEl = photoEl.one(".album-like-count");
            isLike = this.detailEl.one('.J_DetailUploadBtn').attr("data-begun");
            if (isLike && isLike === "true") {
                Exp.showError(numEl, "活动不在进行中，不能喜欢", 1);
            }
            albumId = "album-" + photoEl.attr("data-itemid");
            return Ajax({
                url: INDEX_LIKE_URL,
                type: "post",
                dataType: "json",
                data: {
                    _tb_token_: SUBMIT_TOKEN,
                    target_key: albumId,
                    act: "add"
                },
                success: function(data) {
                    var num;
                    if (data.success) {
                        if (data.count) {
                            num = data.count;
                        } else {
                            num = numEl.text();
                        }
                        numEl.html("+1");
                        photoEl.addClass("liked");
                        return setTimeout(function() {
                            return numEl.html(num);
                        }, 2000);
                    } else {
                        return Exp.showError(numEl, (data.message ? data.message : "操作失败，请稍后重试"), 1);
                    }
                },
                error: function() {
                    return Exp.showError(numEl, "操作失败，请稍后重试", 1);
                }
            });
        };

        Detail.prototype.albumDeleteHandler = function(ev) {
            ev.halt();
            if (!confirm("确认删除此图片？")) {
                return;
            }
            return Ajax({
                url: DELETE_ALBUM_PIC,
                type: "post",
                dataType: "json",
                data: {
                    albumId: this.albumId,
                    activityId: this.activityId,
                    fileId: $(ev.target).attr("data-fileid"),
                    _tb_token_: SUBMIT_TOKEN
                },
                success: function(data) {
                    if (data.success) {
                        return $(ev.target).parent('.album-item').css("visibility", "hidden");
                    } else {
                        return Exp.showError($(ev.target), (data.message ? data.message : "操作失败，请稍后重试"));
                    }
                },
                error: function() {
                    return Exp.showError($(ev.target), "操作失败，请稍后重试");
                }
            });
        };

        Detail.prototype.albumUploadHandler = function(ev) {
            var btn, config, outterEl, postData, submiting, tagUploader, target, uploadCallBack, uploaderConfig,
                _this = this;
            if (!Exp.checkLogin()) {
                return;
            }
            target = $(ev.target);
            if (target.hasClass("disabled")) {
                return;
            }
            if (target.attr("data-uploadon") && target.attr("data-uploadon") === "true") {
                return;
            }
            uploaderConfig = {
                outterEl: this.detailEl,
                uploadUrl: AIXIU_PICS_SUBMIT_URL,
                maxFile: 1,
                itemTPL: ".tu-album-item",
                hasDescription: true,
                useTagger: true,
                taggerConfig: {
                    itemListAction: DETAIL_UPLOAD_ITEMS_URL,
                    userListAction: ""
                }
            };
            btn = $(ev.target);
            outterEl = $($('#J_TagUploaderTPL').html());
            outterEl.appendTo(this.detailEl);
            config = S.clone(uploaderConfig);
            postData = JSON.parse(btn.attr('postData'));
            postData = S.merge(postData,{_tb_token_: SUBMIT_TOKEN});
            config['outterEl'] = outterEl;
            config['maxFile'] = JSON.parse(btn.attr('ks-max-count')) || 1;
            config['uploadParams'] = postData;
            submiting = false;
            tagUploader = new TagUploader(config).init().show();
            tagUploader.on("files:update files:remove", function(ev) {
                var fail, file, files, success, sum, text, _i, _len;
                files = ev.files;
                sum = 0;
                success = 0;
                fail = 0;
                for (_i = 0, _len = files.length; _i < _len; _i++) {
                    file = files[_i];
                    if (!file) {
                        continue;
                    }
                    sum++;
                    if (file.status === "success") {
                        success++;
                    }
                }
                text = "已上传 " + success + " 张";
                if (fail = sum - success) {
                    tagUploader.outterEl.all('.J_TUUploadStatus').addClass("tu-footer-status-error");
                } else {
                    tagUploader.outterEl.all('.J_TUUploadStatus').removeClass("tu-footer-status-error");
                }
                if (fail) {
                    text += "，" + fail + " 张上传失败";
                }
                tagUploader.outterEl.all('.J_TUUploadStatus').children().text(text);
                return tagUploader.outterEl.all('.J_TURemainCount').text(success);
            });
            tagUploader.tagger.createTagList({
                item: JSON.parse(btn.attr('ks-recommend-tags')),
                people: []
            });
            tagUploader.on('to~tag~box', function(ev) {
                var t, _ref;
                t = this;
                if ((_ref = t.outterEl.one('.J_TUAnotherInput')) != null) {
                    _ref.css('visibility', 'hidden');
                }
                t.outterEl.one('.J_TagItemBox').show();
                t.outterEl.one('.J_TUTitle').text("圈图");
                t.outterEl.one('.J_TUUploadStatus').hide();
                return t = null;
            });
            uploadCallBack = function(data) {
                var msg;
                if (!data || !data.success) {
                    msg = data && data.message ? data.message || "提交照片失败，请稍后重试" : void 0;
                    Exp.showError(tagUploader.outterEl.one(tagUploader.config.submitSelector), msg);
                    return submiting = false;
                } else {
                    msg = "提交成功！5 秒后自动刷新";
                    Exp.showTip(tagUploader.outterEl.one(tagUploader.config.submitSelector), msg);
                    return setTimeout(function() {
                        return location.reload();
                    }, 5000);
                }
            };
            return tagUploader.on('submit', function(ev) {
                var file, files, _i, _len, _ref;
                if (submiting) {
                    return;
                }
                if (!ev.files) {
                    Exp.showError(ev.target, "还没上传文件哦");
                }
                submiting = true;
                files = [];
                _ref = ev.files;
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    file = _ref[_i];
                    files.push({
                        description: file.description,
                        points: file.points,
                        url: file.url
                    });
                }
                return Ajax.post(ALBUM_SUBMIT_URL, S.mix(postData, {
                    files: JSON.stringify(files)
                }), uploadCallBack, 'json');
            });
        };

        Detail.prototype.setLikeNum = function(num) {
            return this.detailEl.all('.J_LikeNum').text(num);
        };

        Detail.prototype.setShareNum = function(num) {};

        Detail.prototype.setCommentNum = function(num) {
            return this.detailEl.all('.J_CommentNum').text(num);
        };

        Detail.prototype.innerClose = function() {
            if (this.isReturn) {
                return window.history.back();
            } else {
                if (this.feed.parentPath != null) {
                    return window.location.hash = "#!" + feed.parentPath;
                } else {
                    return window.location.hash = "#!/index";
                }
            }
        };

        Detail.prototype.close = function(withGoBack) {
            var callbackAnim, _left, _leftEl;
            _leftEl = this.detailLeftEl;
            _left = window.VIEWPORTWIDTH;
            callbackAnim = function() {
                var error, key, _ref, _results;
                Overlay.closeOverlay(2, false);
                if (this.preTitle) {
                    document.title = this.preTitle;
                }
                if ((_ref = this.pageNav) != null) {
                    _ref.destroy();
                }
                S.each(this.imgDDIns, function(imgDD) {
                    imgDD.destroy();
                    return imgDD = null;
                });
                ScrollMaster.detach("start end");
                if (this.preScrollEl) {
                    ScrollMaster.init(this.preScrollEl);
                }
                try {
                    _results = [];
                    for (key in this) {
                        if (!__hasProp.call(this, key)) continue;
                        _results.push(delete (this[key] = null));
                    }
                    return _results;
                } catch (_error) {
                    error = _error;
                }
            };
            return Router.switchView(this, callbackAnim);
        };

        return Detail;

    })();
}, {
    requires: ["./ss-overlay", "./widgets/suitableimage", "./exception", "./widgets/scrollmaster2", "./widgets/ghostscroll", "./widgets/tinyshow", "./share", "./widgets/taguploader/taguploader", "./widgets/pagination"]
});

var __hasProp = {}.hasOwnProperty;

KISSY.add('hy/item',function(S, Overlay, scrollMaster, SuitImage, Horiflow, dataFunc, Exp) {
    var $, Ajax, DOM, Event, Item;
    $ = S.all;
    DOM = S.DOM;
    Event = S.Event;
    Ajax = S.io;
    return Item = (function() {
        function Item(config) {
            var containerHeight, feed, itemEl, itemTpl, _left, _leftEl, _rightEl,
                _this = this;
            this.config = config;
            if (this.config.feed == null) {
                return;
            }
            this.feed = feed = this.config.feed;
            this.isReturn = this.config.isReturn;
            this.preTitle = document.title;
            if (feed.title === null) {
                feed.title = '';
                document.title = SELLER_NICK + " 的后院";
            } else {
                document.title = feed.title + ' - ' + SELLER_NICK + " 的后院";
            }
            this.feedId = feed.feedId;
            this.itemTitle = feed.title;
            this.itemURL = feed.itemURL;
            this.itemPic = feed.itemPic;
            this.itemPrice = feed.itemPrice;
            this.preScrollEl = scrollMaster.el;
            itemTpl = "<div class=\"overlay-wrapper item active-overlay\">\n  <div class=\"detail-wrapper\"></div>\n</div>";
            this.itemEl = itemEl = $(DOM.create(itemTpl));
            this.detailWrapper = itemEl.one('.detail-wrapper');
            this.detailWrapper.append(feed.detailContent);
            itemEl.one('.detail-right').width(window.VIEWPORTWIDTH);
            this.getWrapperHeight = function() {
                return DOM.viewportHeight() - USERBAR_HEIGHT;
            };
            this.getContainerHeight = function() {
                var height;
                if ((height = this.getWrapperHeight()) < 680) {
                    return parseInt((height + 10) / 70) * 70;
                } else {
                    return height = parseInt((height + 10) * 0.8 / 280) * 280;
                }
            };
            this.containerHeight = containerHeight = this.getContainerHeight();
            Overlay.showOverlayWith(this, "#J_ItemOverlay", itemEl, false, false);
            _rightEl = itemEl.one('.detail-right');
            _leftEl = itemEl.one('.detail-left');
            _rightEl.width(window.VIEWPORTWIDTH - _leftEl.width());
            if (!IsSupportTransition) {
                _left = parseInt(_leftEl.css('left'));
                _rightEl.animate({
                    'left': 0
                }, 0.4, function(t) {
                    var _t;
                    _t = (2 - t) * t;
                    _leftEl.css('left', _left * (1 - _t));
                    return _t;
                }, function() {
                    _leftEl.css('left', 0);
                    return _this.afterEnterAnim();
                });
            } else {
                S.later(function() {
                    return _this.detailWrapper.addClass("detail-wrapper-active");
                }, 0);
                S.later(this.afterEnterAnim, 400, false, this);
            }
        }

        Item.prototype.afterEnterAnim = function() {
            var flowConfig, horiFlow,
                _this = this;
            new SuitImage(this.itemEl.one('.ss-image-lazyload'));
            flowConfig = {
                cata: 0,
                itemId: this.feed.itemId,
                wrapperEl: this.itemEl.one(".flow"),
                wrapperContainer: this.itemEl.one(".flow-container"),
                dataFunc: dataFunc,
                containerHeight: this.containerHeight,
                beginLeft: 0,
                feedPerPage: 30,
                lazyLoadOffsetPage: 1,
                scrollType: 0,
                scrollEl: this.itemEl.one(".detail-right")
            };
            this.horiFlow = horiFlow = new Horiflow(flowConfig);
            horiFlow.renderPage(0);
            Event.on(window, "resize orientationchange", S.buffer(function() {
                $('#J_Container').height(_this.getWrapperHeight());
                horiFlow.resize(_this.getContainerHeight());
                return window.VIEWPORTWIDTH = DOM.viewportWidth();
            }, 400));
            Router.activeFlow = horiFlow;
            this.itemEl.one(".detail-right").width(window.VIEWPORTWIDTH - this.itemEl.one(".detail-left").width());
            scrollMaster.init(this.itemEl.one(".detail-right"));
            this.itemEl.one(".J_ReturnBtn").on("click", function() {
                return _this.innerClose();
            });
            this.itemEl.delegate(this.itemEl, "click", ".item-hook", function(ev) {
                ev.preventDefault();
                return ev.stopPropagation();
            });
            return this.itemEl.one(".J_LikeBtn").on("click", function(ev) {
                if (!Exp.likeCheck(ev.currentTarget)) {
                    return;
                }
                return Ajax({
                    url: INDEX_LIKE_URL,
                    type: "post",
                    dataType: "json",
                    data: {
                        target_key: feed.sns.favor_target_key,
                        _tb_token_: SUBMIT_TOKEN,
                        subType: feed.type,
                        seller_id: SELLER_ID
                    },
                    success: function(data) {
                        if (data.success) {
                            _this.setLikeNum(data.count);
                            return Exp.showTip($(ev.currentTarget), "喜欢成功！");
                        } else {
                            return Exp.showError($(ev.currentTarget), data.message ? data.message : "操作失败，请稍后重试");
                        }
                    },
                    error: function() {
                        return Exp.showError($(ev.currentTarget), "操作失败，请稍后重试");
                    }
                });
            });
        };

        Item.prototype.setLikeNum = function(num) {
            this.itemEl.one(".J_LikeNum").text(num);
            return this.updateFeedNum(num, null, null);
        };

        Item.prototype.updateFeedNum = function(likeNum, commentNum, shareNum) {};

        Item.prototype.innerClose = function() {
            if (this.isReturn) {
                return window.history.back();
            } else {
                if (this.feed.parentPath != null) {
                    return window.location.hash = "#!" + feed.parentPath;
                } else {
                    return window.location.hash = "#!/index";
                }
            }
        };

        Item.prototype.afterLeaveAnim = function() {
            var error, key, _ref, _results;
            if ((_ref = this.horiFlow) != null) {
                if (typeof _ref.release === "function") {
                    _ref.release();
                }
            }
            delete this.horiFlow;
            Overlay.closeOverlay("#J_ItemOverlay", false);
            try {
                _results = [];
                for (key in this) {
                    if (!__hasProp.call(this, key)) continue;
                    _results.push(this[key] = null);
                }
                return _results;
            } catch (_error) {
                error = _error;
            }
        };

        Item.prototype.close = function() {
            var _this = this;
            if (this.preTitle) {
                document.title = this.preTitle;
            }
            scrollMaster.init(this.preScrollEl);
            if (!IsSupportTransition) {
                this.itemEl.one('.detail-left').animate({
                    "left": -500
                }, 0.4, "easeIn");
                return this.itemEl.one('.detail-right').animate({
                    "left": window.VIEWPORTWIDTH
                }, 0.4, "easeIn", function() {
                    return _this.afterLeaveAnim();
                });
            } else {
                this.detailWrapper.removeClass("detail-wrapper-active");
                return S.later(this.afterLeaveAnim, 400, false, this);
            }
        };

        return Item;

    })();
}, {
    requires: ['./ss-overlay', './widgets/scrollmaster2', "./widgets/suitableimage", "./horiflow", "./datafunc", "./exception"]
});

KISSY.add('hy/views',function(S, DOM, Event, Ajax, UA, HoriFlow, dataFunc, Detail, Item, ScrollMaster2, GhostScroll) {
    var $, View, Views, activeFlow, activeView, getContainerHeight, getWrapperHeight, mainWrapper, superContainer;
    $ = S.all;
    mainWrapper = $('#J_Main');
    superContainer = $('#J_Container');
    activeView = null;
    activeFlow = null;
    getWrapperHeight = function() {
        return DOM.viewportHeight() - 46;
    };
    getContainerHeight = function() {
        var height;
        if ((height = getWrapperHeight()) < 680) {
            return parseInt((height + 14) / 68) * 68;
        } else {
            return height = parseInt((height + 14) * 0.8 / 280) * 280;
        }
    };
    Event.on(window, "resize orientationchange", S.buffer(function() {
        var c_h, w_h, _ref, _ref1;
        window.VIEWPORTWIDTH = DOM.viewportWidth();
        window.VIEWPORTHEIGHT = DOM.viewportHeight();
        if (!Views.allowResizing) {
            return;
        }
        superContainer.height(w_h = getWrapperHeight());
        if (activeFlow != null) {
            activeFlow.resize(c_h = getContainerHeight());
        }
        return (_ref = $(".index-info")) != null ? (_ref1 = _ref.one(".about")) != null ? _ref1.css("margin-top", (((w_h - c_h) / 2 - 30) < 0 ? 0 : (w_h - c_h) / 2 - 30)) : void 0 : void 0;
    }, 100));
    Views = {
        views: [],
        viewTpl: "<div class=\"view\">\n  <div class=\"flow sub-flow\">\n    <div class=\"flow-wrapper\">\n      <div class=\"flow-container\"></div>\n    </div>\n  </div>\n</div>",
        allowResizing: true,
        switchView: function(preIndex, nextIndex, feedType, cata, title) {
            var animCallback, defaultFlowConfig, flowConfig, infoCol, moveUp, nextView, nextViewEl, preContent, preView, preViewEl, _flowConfig, _ref, _top,
                _this = this;
            this.changeNav(nextIndex);
            if (title === null || title === 'null') {
                document.title = SELLER_NICK + " 的后院";
            } else {
                document.title = title + ' - ' + SELLER_NICK + " 的后院";
            }
            ScrollMaster2.config.allowScroll = false;
            defaultFlowConfig = {
                cata: 0,
                wrapperEl: null,
                wrapperContainer: null,
                containerHeight: getContainerHeight(),
                dataFunc: dataFunc,
                beginLeft: 255,
                feedPerPage: 30,
                lazyLoadOffsetPage: 1,
                maxPage: FLOW_MAX_PAGE || 3,
                scrollType: 0,
                scrollEl: null
            };
            if (!preIndex) {
                moveUp = 0;
            } else {
                preView = this.views[preIndex];
                preViewEl = preView.el;
                moveUp = preIndex > nextIndex ? 1 : 2;
            }
            if (this.views[nextIndex]) {
                nextView = this.views[nextIndex];
                nextViewEl = this.views[nextIndex].el;
            } else {
                nextViewEl = $(this.viewTpl);
                nextViewEl.attr("id", "J_ActiveView" + cata);
                this.views[nextIndex] = nextView = new View(nextViewEl, nextIndex, feedType, cata);
            }
            _flowConfig = {
                cata: parseInt(feedType, 10),
                wrapperEl: nextViewEl.one('.flow'),
                wrapperContainer: nextViewEl.one('.flow-container'),
                scrollEl: nextViewEl
            };
            this.flowConfig = flowConfig = S.merge(defaultFlowConfig, _flowConfig);
            if (nextIndex === 0) {
                infoCol = $('#J_IndexInfoWrapper');
                if (infoCol.length) {
                    if ((_ref = infoCol.one(".about")) != null) {
                        _ref.css("margin-top", (((getWrapperHeight() - flowConfig.containerHeight) / 2 - 30) < 0 ? 0 : (getWrapperHeight() - flowConfig.containerHeight) / 2 - 30));
                    }
                }
                flowConfig.wrapperEl.prepend(infoCol.children());
                flowConfig.beginLeft = window.VIEWPORTWIDTH - 140 - 260;
                if ((preContent = $('#J_IndexPreContent')).length) {
                    preContent.children().insertBefore(flowConfig.wrapperEl);
                }
            }
            $(nextViewEl).one(".flow").css("margin-left", flowConfig.beginLeft);
            _top = DOM.viewportHeight() - USERBAR_HEIGHT;
            $("body").addClass("disable-transform");
            if (moveUp === 2) {
                DOM.css(nextViewEl, {
                    display: "block"
                });
                this.setTopCSS(nextViewEl, _top);
                _top = -_top;
            } else if (moveUp === 1) {
                DOM.css(nextViewEl, {
                    display: "block"
                });
                this.setTopCSS(nextViewEl, -_top);
            }
            DOM.append(nextViewEl, mainWrapper);
            nextViewEl.removeClass("inactive");
            if (preViewEl != null) {
                preViewEl.removeClass("active-view");
            }
            activeView = nextView;
            animCallback = function() {
                nextViewEl.addClass("active-view " + (cata != null ? cata : ""));
                _this.renderFlow(nextView);
                if (preViewEl) {
                    _this.setTopCSS(preViewEl, _top);
                    preViewEl.addClass("inactive");
                    return preView.release();
                }
            };
            $("body").removeClass("disable-transform");
            if (moveUp) {
                if (!window.IsSupportTransition) {
                    nextViewEl.animate({
                        'top': 0
                    }, 0.3, function(t) {
                        var _t;
                        _t = (2 - t) * t;
                        if (preViewEl != null) {
                            preViewEl.css("top", t * _top);
                        }
                        return _t;
                    }, animCallback);
                } else {
                    S.later(function() {
                        this.setTopCSS(nextViewEl, 0);
                        this.setTopCSS(preViewEl, _top);
                        return S.later(animCallback, 300);
                    }, 0, false, this);
                }
            } else {
                animCallback();
            }
            if (nextIndex === 0 && !window.ABOUTCONTENTSCROLL) {
                window.ABOUTCONTENTSCROLL = new GhostScroll({
                    el: $('#J_AboutContent'),
                    delay: 0,
                    offset: ['right', -10]
                });
            }
            ScrollMaster2.init(nextViewEl);
            return ScrollMaster2.config.allowScroll = true;
        },
        changeNav: function(index) {
            var els;
            els = $("#J_NavList li.nav-item");
            els.removeClass("nav-active");
            return $(els[index]).addClass("nav-active");
        },
        scrollToLeft: function() {
            var _ref;
            if (!activeView) {
                return;
            }
            return (_ref = activeView.el.one("flow")) != null ? _ref.animate({
                "scrollLeft": 0
            }, 0.3, "easeBothStrong") : void 0;
        },
        renderFlow: function(nextView) {
            nextView.flow = new HoriFlow(this.flowConfig);
            activeFlow = Router.activeFlow = nextView.flow;
            return activeFlow.renderPage(0);
        },
        setTopCSS: function(el, val) {
            if (window.IsSupportTransition) {
                this._setCSS(el, "-webkit-transform", "translateY(" + val + "px)");
                this._setCSS(el, "-moz-transform", "translateY(" + val + "px)");
                this._setCSS(el, "-o-transform", "translateY(" + val + "px)");
                this._setCSS(el, "-ms-transform", "translateY(" + val + "px)");
                return this._setCSS(el, "transform", "translateY(" + val + "px)");
            } else {
                return this._setCSS(el, "top", "" + val + "px");
            }
        },
        _setCSS: function(el, prop, val) {
            if (el[0]) {
                el = el[0];
            }
            return el.style[prop] = val;
        }
    };
    View = (function() {
        function View(el, index, type, flow, cata) {
            this.el = el;
            this.index = index;
            this.type = type;
            this.flow = flow;
            this.cata = cata;
        }

        View.prototype.release = function() {
            this.flow.config.wrapperContainer.empty();
            this.flow.release();
            return this.flow = null;
        };

        return View;

    })();
    return Views;
}, {
    requires: ["dom", "event", "ajax", "ua", "./horiflow", "./datafunc", "./detail", "./item", "./widgets/scrollmaster2", "./widgets/ghostscroll"]
});

KISSY.add('hy/router',function(S, SSlog, Overlay, DataFunc, Views, Detail, Item) {
    var $, Ajax, Body, DOM, Event, Wrap;
    $ = S.all;
    Event = S.Event;
    DOM = S.DOM;
    Ajax = S.io;
    Wrap = $('#J_Wrapper');
    Body = $('body');
    return window.Router = {
        isReturn: false,
        views: ["index", "activity", "xiaobao", "show"],
        details: ['xb', 'ax', 'aw', 'hd', 'pl'],
        activeFlow: null,
        activeDetails: [],
        prePath: "",
        freezeLayer: (function() {
            var el;
            el = $("<div class=\"freeze-layer\"></div>");
            el.appendTo("body");
            return el;
        })(),
        serializePath: function(rawHash) {
            var showReview, showShare;
            showReview = rawHash.indexOf("?comment") >= 0;
            showShare = rawHash.indexOf("?share") >= 0;
            rawHash = rawHash.replace(/\?(.*)$/, "");
            if (rawHash === "" || rawHash === "#") {
                rawHash = "#!/index";
            }
            return {
                rawHash: rawHash,
                path: rawHash.replace(/^#!/, ""),
                subject: rawHash.replace(/^#!\/(\w*)(\/)?.*$/, "$1"),
                subjectId: rawHash.replace(/^.*(\/)(.*)$/, "$2"),
                comment: showReview,
                share: showShare
            };
        },
        getFeed: function(type, id) {
            var index;
            if (type === "item") {
                index = S.indexOf(id, DataFunc.Feeds.feedDetailItemIDs);
                if (index >= 0) {
                    return DataFunc.Feeds.feeds[index];
                } else {
                    return null;
                }
            }
            if (type === "detail") {
                index = S.indexOf(id, DataFunc.Feeds.feedHashs);
                if (index >= 0) {
                    return DataFunc.Feeds.feeds[index];
                } else {
                    return null;
                }
            }
        },
        routePath: function(rawHash) {
            var detail, hash, index, navItem, _cata, _i, _j, _len, _len1, _preIndex, _ref, _ref1, _title, _type,
                _this = this;
            hash = this.serializePath(rawHash);
            this.hash = hash;
            if ((index = S.indexOf(hash.subject, Router.views)) >= 0) {
                if (this.isReturn === false) {
                    this.toggleBG(true);
                }
                this.isReturn = true;
                this.prePath = "";
                _ref = this.activeDetails.slice().reverse();
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                    detail = _ref[_i];
                    if (typeof detail.close === "function") {
                        detail.close();
                    }
                    this.activeDetails.pop();
                }
                navItem = $('#J_NavList .nav-item')[index];
                _type = $(navItem).attr("data-type");
                _cata = $(navItem).attr("data-cata");
                _title = $(navItem).text();
                _preIndex = $('.nav-active').attr("data-index");
                if (_preIndex === index.toString()) {
                    Views.scrollToLeft();
                    return;
                }
                Views.switchView(_preIndex, index, _type, _cata, _title);
                return;
            }
            if (this.prePath === hash.path) {
                return;
            }
            _ref1 = this.activeDetails.slice().reverse();
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                detail = _ref1[_j];
                if (typeof detail.close === "function") {
                    detail.close();
                }
                this.activeDetails.pop();
            }
            if (hash.subject === "item") {
                this.prePath = hash.path;
                this.freezeScreen(true);
                return Ajax({
                    url: FEED_DETAIL_AJAX_URL,
                    dataType: "jsonp",
                    data: {
                        _escaped_fragment_: hash.path,
                        full: "pre"
                    },
                    complete: function() {
                        var _ref2;
                        if (typeof feed !== "undefined" && feed !== null) {
                            if ((_ref2 = feed.feedItem) != null) {
                                _ref2.removeLoading();
                            }
                        }
                        return _this.freezeScreen(false);
                    },
                    success: function(feed) {
                        if ((feed.success != null) && feed.success) {
                            return _this.activeDetails.push(new Item({
                                feed: feed,
                                preFlow: _this.activeFlow,
                                isReturn: _this.isReturn
                            }));
                        } else {
                            return location.href = "#!/index";
                        }
                    },
                    error: function(xhr) {
                        return location.href = "#!/index";
                    }
                });
            } else if ((index = S.indexOf(hash.subject, Router.details)) >= 0) {
                this.prePath = hash.path;
                this.freezeScreen(true);
                return Ajax({
                    url: FEED_DETAIL_AJAX_URL,
                    dataType: "jsonp",
                    data: {
                        _escaped_fragment_: hash.path,
                        full: "pre"
                    },
                    complete: function() {
                        var _ref2;
                        if (typeof feed !== "undefined" && feed !== null) {
                            if ((_ref2 = feed.feedItem) != null) {
                                _ref2.removeLoading();
                            }
                        }
                        return _this.freezeScreen(false);
                    },
                    success: function(feed) {
                        if ((feed.success != null) && feed.success) {
                            return _this.activeDetails.push(new Detail({
                                feed: feed,
                                detailContent: feed.detailContent,
                                preFlow: _this.activeFlow,
                                showReview: hash.comment,
                                showShare: hash.share,
                                isReturn: _this.isReturn
                            }));
                        } else {
                            return location.href = "#!/index";
                        }
                    },
                    error: function(xhr) {
                        return location.href = "#!/index";
                    }
                });
            } else {
                return location.href = "#!/index";
            }
        },
        switchView: function(context, callback) {
            Body.css("background-color", COLORS[parseInt(COLORS.length * Math.random())]);
            return S.later(function() {
                Wrap.removeClass("mainback");
                return callback.call(context);
            }, 210);
        },
        freezeScreen: function(freeze) {
            if (freeze) {
                return this.freezeLayer.show();
            } else {
                return S.later(this.freezeLayer.hide, 450, false, this.freezeLayer);
            }
        },
        toggleBG: function(show) {
            if (!show) {
                return $('#J_Container').children().add('#J_MainBG').css("display", "hidden");
            } else {
                return $('#J_Container').children().add('#J_MainBG').css("display", "block");
            }
        }
    };
}, {
    requires: ["./widgets/sslog", "./ss-overlay", "./datafunc", "./views", "./detail", "./item"]
});

KISSY.add('hy/widgets/limitbox',function(S) {
    var $, Event, LimitBox;
    $ = S.all;
    Event = S.Event;
    return LimitBox = (function() {
        function LimitBox(config) {
            var _this = this;
            this.config = config;
            if (typeof this.config.el === "string") {
                this.config.el = $(this.config.el);
            }
            if (typeof this.config.bindNumEl === "string") {
                this.config.bindNumEl = $(this.config.bindNumEl);
            }
            Event.on(this.config.el, "valuechange", function(ev) {
                return _this.checkLen(ev);
            });
        }

        LimitBox.prototype.checkLen = function(ev) {
            var limitLen, nowLen;
            limitLen = this.config.limitLen;
            nowLen = this.config.el.val().length;
            if (nowLen <= limitLen) {
                if (this.config.bindNumEl != null) {
                    return this.updateNum(nowLen, limitLen);
                }
            } else {
                ev.preventDefault();
                return this.config.el.val(this.config.el.val().substr(0, limitLen));
            }
        };

        LimitBox.prototype.updateNum = function(nowLen, limitLen) {
            return this.config.bindNumEl.html("<span class='limit-box-current'>" + parseInt(nowLen) + "</span><span>" + "&nbsp;/&nbsp;" + parseInt(limitLen) + "</span>");
        };

        return LimitBox;

    })();
});

var __hasProp = {}.hasOwnProperty;

KISSY.add('hy/widgets/taguploader/aitagger',function(S, Node, Ajax, ComboBox, KScroll, Tip) {
    var $, Tagger, defaultConfig;
    $ = Node.all;
    defaultConfig = {
        itemThumbSelector: '.J_TUItemThumb',
        outterEl: '.J_TUOuter',
        wrapperEl: '.J_TagItemBox',
        panelItemTPL: ".J_TUTagItem",
        pointTPL: ".J_TUTagPoint",
        pointSelector: ".J_TUTagPoint",
        panelEl: ".J_TUPanel",
        panelSave: '.J_TUPanelSave',
        panelClose: '.J_TUPanelClose',
        itemListTPL: '.J_TUItemListTPL',
        userListTPL: '.J_TUUserListTPL',
        selGoods: '.J_SelGoods',
        nextStepBtn: '.J_NextStep',
        goodsNum: '.J_GoodsNum',
        detailTPL: '#J_DetailTPL',
        itemListAction: null,
        userListAction: null,
        salerId: null,
        maxPoint: 3
    };
    return Tagger = (function() {
        function Tagger(config) {
            var key, value, _ref,
                _this = this;
            this.config = config;
            this.noPointNum = 30;
            this.pointNo = 1;
            this.currentPointNo = null;
            S.mix(this, S.EventTarget);
            this.config = S.merge(defaultConfig, this.config);
            _ref = this.config;
            for (key in _ref) {
                if (!__hasProp.call(_ref, key)) continue;
                value = _ref[key];
                this[key] = value;
            }
            this.outterEl = $(this.outterEl);
            this.selGoods = this.outterEl.one(this.selGoods);
            this.nextStepBtn = this.outterEl.one(this.nextStepBtn);
            this.goodsNum = this.outterEl.one(this.goodsNum);
            this.wrapperEl = this.outterEl.one(this.wrapperEl);
            this.panelEl = this.outterEl.one(this.panelEl);
            this.pointTPL = this.outterEl.one(this.pointTPL);
            this.itemListTPL = this.outterEl.one(this.itemListTPL).outerHTML();
            this.detailTPL = $(this.detailTPL).html();
            this.panelItemTPL = $(this.panelItemTPL);
            if (!this.panelEl.parent()) {
                this.panelEl.appendTo(this.wrapperEl);
            }
            this.panelEl.delegate('click', this.panelSave, this._savePoint, this);
            this.panelEl.delegate('click', this.panelClose, this._closePanel, this);
            this.panelEl.delegate('click', '.J_TUPanelTabs', function(ev) {
                return _this.panelEl.toggleClass('tu-p-people');
            });
            this.initComboBox();
        }

        Tagger.prototype.initKScroll = function() {
            return this.kScroll = new KScroll(this.wrapperEl, {
                prefix: "tu-scroll-",
                hotkey: true,
                bodydrag: true,
                allowArrow: false
            });
        };

        Tagger.prototype.initComboBox = function() {
            if (this.itemListAction) {
                return this.initItemList();
            }
        };

        Tagger.prototype.initItemList = function() {
            var comboBox, parentObj, tpl,
                _this = this;
            parentObj = this;
            tpl = this.itemListTPL;
            comboBox = new ComboBox({
                srcNode: this.panelEl.one('#J_TitlePanel'),
                hasTrigger: true,
                maxItemCount: 10,
                menu: {
                    xclass: 'popupmenu',
                    prefixCls: 'nameitem-'
                },
                dataSource: new ComboBox.RemoteDataSource({
                    xhrCfg: {
                        url: this.itemListAction,
                        dataType: 'jsonp',
                        data: {
                            code: "utf-8",
                            pageSize: 10,
                            sellerId: this.salerId
                        }
                    },
                    paramName: "q",
                    cache: false,
                    parse: function(query, results) {
                        var index, maxItem;
                        parentObj.queryIng = false;
                        maxItem = 10;
                        if (results.total > maxItem) {
                            index = maxItem - 1;
                            results.items[index] = "outMaxNum";
                        } else if (results.total === 0) {
                            results.items.reverse();
                            results.items.push("");
                            results.items.reverse();
                        }
                        return results.items;
                    }
                }),
                format: function(query, results) {
                    var r, ret, _i, _len;
                    ret = [];
                    for (_i = 0, _len = results.length; _i < _len; _i++) {
                        r = results[_i];
                        if (r === "") {
                            continue;
                        }
                        if (r === "outMaxNum") {
                            ret.push({
                                disabled: true,
                                content: '找不到宝贝？确认下宝贝名称再试试！'
                            });
                        } else {
                            ret.push({
                                textContent: r.title,
                                content: S.substitute(tpl, {
                                    title: r.title,
                                    pic: r.pic,
                                    src: "src",
                                    shop_info: {
                                        shop_id: r.shop_info.shop_id,
                                        shop_name: r.shop_info.shop_name,
                                        shop_href: r.shop_info.shop_href
                                    }
                                })
                            });
                        }
                    }
                    if (ret.length === 0) {
                        ret.push({
                            disabled: true,
                            content: "<div class='no-find'>未找到相关宝贝</div>"
                        });
                    }
                    return ret;
                }
            });
            comboBox.render();
            comboBox.get("input").parent(".J_TUPanelItem").one(".ks-combobox-trigger").delegate("click", function(ev) {
                var inputValue;
                if (parentObj.queryIng === true) {
                    return;
                }
                inputValue = comboBox.get("input").val();
                if (!inputValue && inputValue !== "") {
                    comboBox.sendRequest(inputValue);
                    return parentObj.queryIng = true;
                } else {
                    comboBox.sendRequest(' ');
                    return parentObj.queryIng = true;
                }
            });
            comboBox.get('input').on('keypress', function(ev) {
                if (parentObj.queryIng === true) {
                    return;
                }
                if (ev.keyCode === 13) {
                    comboBox.sendRequest(ev.target.value);
                    return parentObj.queryIng = true;
                } else {
                    comboBox.sendRequest(comboBox.get('input').val());
                    return parentObj.queryIng = true;

                    /*S.later ->
                     comboBox.sendRequest(comboBox.get('input').val())
                     ,100,false
                     */
                }
            });
            comboBox.get('input').on('change', function(ev) {
                _this.panelEl.pointEl.prop('itemVal', null);
                return _this.panelEl.all(_this.panelSave).addClass("disabled");
            });
            return comboBox.on('click', function(ev) {
                _this.panelEl.pointEl.prop('itemVal', ev.target.userConfig.value);
                return _this.panelEl.all(_this.panelSave).removeClass("disabled");
            });
        };

        Tagger.prototype.initUserList = function() {};

        Tagger.prototype.enableTagger = function() {
            this.wrapperEl.delegate("click", this.itemThumbSelector, this._addPointHandler, this);
            this.wrapperEl.delegate('click', '.J_TTPDDel', this._delPoint, this);
            return this.wrapperEl.delegate('click', '.J_TTPDEdit', this._editPoint, this);
        };

        Tagger.prototype.disableTagger = function() {
            return this.wrapperEl.detach("click", this.itemThumbSelector, this._addPointHandler);
        };

        Tagger.prototype.clearTagger = function() {
            this.outterEl.all('.J_TUTagPoint').remove();
            return this.outterEl.all('.J_GoodsContent').empty();
        };

        Tagger.prototype.createTagList = function(list) {
            var tagComboBox;
            tagComboBox = new ComboBox({
                srcNode: this.panelEl.one('#J_TagsPanel'),
                hasTrigger: true,
                menu: {
                    xclass: 'popupmenu',
                    prefixCls: 'tagitem-'
                },
                dataSource: new ComboBox.LocalDataSource({
                    data: list.item
                })
            });
            tagComboBox.render();
            return this.panelEl.one('.J_PanelItemTag').on('valuechange', function(ev) {
                var input, val;
                input = $(ev.target);
                val = input.val();
                if (!/^[\u3400-\u9FFFa-zA-Z0-9`']+$/.test(val)) {
                    val.replace(/[^\u3400-\u9FFFa-zA-Z0-9]/ig, '');
                }
                if (val && val.length > 10) {
                    ev.preventDefault();
                    val = val.substr(0, 10);
                    return input.val(val);
                }
            });
        };

        Tagger.prototype._fetchPoint = function() {
            var items;
            items = this.wrapperEl.all(".J_FileItem");
            if (items.length === 0) {
                return;
            }
            return this.wrapperEl.all(".J_FileItem").each(function(item) {
                var file, imgSrc, originalImage, realImg;
                file = item.prop('file');
                realImg = item.one(this.itemThumbSelector);
                imgSrc = realImg[0].src;
                originalImage = new Image();
                originalImage.onload = function() {
                    var o_height, o_width, r_height, r_width, _ref, _ref1;
                    o_width = originalImage.width;
                    o_height = originalImage.height;
                    _ref = [realImg[0].width, realImg[0].height], r_width = _ref[0], r_height = _ref[1];
                    return (_ref1 = item.all(this.pointSelector)) != null ? _ref1.each(function(point) {
                        var dataValue, offset;
                        offset = [(point.offset().left + point.width() / 2 - realImg.offset().left) / r_width * o_width, (point.offset().top + point.height() - realImg.offset().top) / r_height * o_height];
                        dataValue = point.prop("data-value");
                        dataValue['itemVal'].pos = offset;
                        return point.prop('data-value', dataValue);
                    }) : void 0;
                };
                return originalImage.src = imgSrc;
            }, this);
        };

        Tagger.prototype._hasPoint = function(title) {
            var hasThisPoint, parent, points, _ref;
            if (!this.currentItem) {
                return false;
            }
            parent = this.currentItem.hasClass("J_FileItem") ? this.currentItem : this.currentItem.parent(".J_FileItem");
            points = parent.all(this.pointSelector);
            if (points.length === 0) {
                return false;
            }
            hasThisPoint = false;
            if ((_ref = parent.all(this.pointSelector)) != null) {
                _ref.each(function(point) {
                    var content;
                    content = point.prop("data-value");
                    if (content && content['itemVal'].title === title) {
                        hasThisPoint = true;
                    }
                }, this);
            }
            return hasThisPoint;
        };

        Tagger.prototype._calPos = function(item, point) {
            var imgSrc, o_height, o_width, offset, originalImage, realImg;
            realImg = item.one(this.itemThumbSelector);
            offset = [];
            o_width = 0;
            o_height = 0;
            imgSrc = realImg[0].src;
            originalImage = new Image();
            originalImage.onload = function() {
                var r_height, r_width, _ref;
                o_width = originalImage.width;
                o_height = originalImage.height;
                _ref = [realImg[0].width, realImg[0].height], r_width = _ref[0], r_height = _ref[1];
                return offset = [(point.offset().left + point.width() / 2 - realImg.offset().left) / r_width * o_width, (point.offset().top + point.height() - realImg.offset().top) / r_height * o_height];
            };
            originalImage.src = imgSrc;
            return offset;
        };

        Tagger.prototype._setDetailPos = function(parent, pointEl, pTop, left) {
            var outerHeight, outerObj, outerTop, sHeight, top;
            outerObj = parent.parent(".tu-outer");
            outerTop = outerObj.offset().top;
            outerHeight = outerObj.outerHeight();
            sHeight = outerTop + outerHeight - 120 - pTop;
            sHeight = parseInt(sHeight, 10);
            top = 25;
            if (sHeight < 160) {
                top = -(160 - sHeight);
            } else {
                top = 25;
            }
            return pointEl.one('.J_TTPDetail').css({
                'top': 'top',
                top: top
            });
        };

        Tagger.prototype._outRange = function(pointEl, parent, evX, evY) {
            var height, noBottom, noLeft, noRight, noTop, outerLeft, outerObj, outerTop, width, wrapHeight, wrapWidth;
            outerObj = parent.parent(".tu-outer");
            outerTop = outerObj.offset().top;
            outerLeft = outerObj.offset().left;
            wrapHeight = parent.outerHeight();
            wrapWidth = parent.outerWidth();
            height = pointEl.height();
            width = pointEl.width();
            noTop = outerTop + 80 + (wrapHeight - height) / 2 + this.noPointNum;
            noLeft = outerLeft + 18 + (wrapWidth - width) / 2 + this.noPointNum;
            noBottom = noTop + height - 2 * this.noPointNum;
            noRight = noLeft + width - 2 * this.noPointNum;
            if (evY < noTop || evY > noBottom || evX < noLeft || evX > noRight) {
                return true;
            } else {
                return false;
            }
        };

        Tagger.prototype._addPointHandler = function(ev) {
            var left, parent, pointEl, top, _ref, _tmp;
            this.isEdit = false;
            if (this.panelIsShowing) {
                return;
            }
            _tmp = $(ev.target);
            parent = _tmp.hasClass("J_FileItem") ? _tmp : _tmp.parent(".J_FileItem");
            this.currentItem = _tmp;
            if (parent.all(this.pointSelector).length >= this.maxPoint) {
                return;
            }
            if (this._outRange(_tmp, parent, ev.clientX, ev.clientY)) {
                return;
            }
            pointEl = this.pointTPL.clone(true);
            pointEl.appendTo(parent);
            pointEl.show();
            left = ev.clientX - pointEl.width() / 2;
            top = ev.clientY - pointEl.height();
            pointEl.offset({
                left: left,
                top: top
            });
            this._setDetailPos(parent, pointEl, top, left);
            this._showPanel(pointEl, ev.clientX + 10, ev.clientY - 10);
            return (_ref = this.kScroll) != null ? _ref.set("step", 0) : void 0;
        };

        Tagger.prototype._showPanel = function(pointEl, left, top) {
            var title, val;
            this.panelIsShowing = true;
            this.panelEl.pointEl = pointEl;
            pointEl.addClass("activated");
            this.panelEl.show();
            this.panelEl.offset({
                left: left,
                top: this.wrapperEl.offset().top + 20
            });
            if (pointEl) {
                val = pointEl.prop('data-value');
            }
            if (val == null) {
                val = {};
            }
            this.currentPointNo = val['pointNo'] ? val['pointNo'] : null;
            title = val['itemVal'] ? val['itemVal'].title : "";
            this.panelEl.one('.J_PanelItemValue').val(title);
            this.panelEl.one('.J_PanelItemTag').val(val['itemTag'] || "");
            this.panelEl.removeClass('tu-p-people');
            this.panelEl.all('li').removeClass('selected');
            if (!S.trim(this.panelEl.one('.J_PanelItemValue').val())) {
                this.panelEl.one(this.panelSave).addClass("disabled");
            }
            return this.fire("panel:show");
        };

        Tagger.prototype._closePanel = function() {
            var val, _ref;
            this.panelIsShowing = false;
            this.panelEl.hide();
            val = this.panelEl.pointEl.prop("data-value");
            this.panelEl.pointEl.removeClass("activated");
            if (!val) {
                this._removePoint(this.panelEl.pointEl);
            }
            return (_ref = this.kScroll) != null ? _ref.set("step", 32) : void 0;
        };

        Tagger.prototype._removePoint = function(pointEl) {
            return pointEl != null ? pointEl.remove() : void 0;
        };

        Tagger.prototype._updateGoods = function(type, val) {
            var goodsContent, nameItem, pointNo;
            if (type === 'add') {
                goodsContent = this.selGoods.one('.J_GoodsContent');
                if (goodsContent.one('.J_PointNo' + val['pointNo'])) {
                    goodsContent.one('.J_PointNo' + val['pointNo']).text(val['itemVal'].title);
                } else {
                    nameItem = '<li><span class="goods-name J_PointNo' + val['pointNo'] + '">' + val['itemVal'].title + '</span></li>';
                    goodsContent.append(nameItem);
                    this.goodsNum.text(parseInt(this.goodsNum.text(), 10) - 1);
                }
            } else {
                pointNo = val['pointNo'];
                this.selGoods.one('.J_GoodsContent').one(".J_PointNo" + pointNo).parent('li').remove();
                this.goodsNum.text(parseInt(this.goodsNum.text(), 10) + 1);
            }
            if (this.goodsNum.text() < this.maxPoint) {
                return this.nextStepBtn.removeClass("disabled");
            } else {
                return this.nextStepBtn.addClass("disabled");
            }
        };

        Tagger.prototype._savePoint = function(ev) {
            var contentPara, detailEl, el, pointEl, title, val;
            el = $(ev.target);
            val = {};
            pointEl = this.panelEl.pointEl;
            val['pointNo'] = this.currentPointNo ? this.currentPointNo : this.pointNo++;
            val['itemVal'] = pointEl.prop('itemVal');
            val['itemTag'] = this.panelEl.one('.J_PanelItemTag').val();
            if (this._hasPoint(val['itemVal'].title) && !this.isEdit) {
                new Tip(el, "该宝贝已经关联过啦！", 0, "error");
                return;
            }
            if (val['itemVal'] || val['peopleVal']) {
                pointEl.prop('data-value', val);
                this.fire("item~value~change");
            } else {
                return false;
            }
            title = val['itemVal'].title || val['peopleVal'].title;
            if (title) {
                title = this._getSubTitle(title);
            }
            contentPara = {
                pointNo: val['pointNo'],
                title: title,
                pic: val['itemVal'].large_pic || val['peopleVal'].large_pic,
                price: val['itemVal'].price || "",
                tag: val['itemTag'] || val['peopleTag'] || "",
                src: "src"
            };
            this._updateGoods('add', val);
            detailEl = pointEl.one('.J_TTPDetail');
            detailEl.html(S.substitute(this.detailTPL, contentPara));
            if (!contentPara.tag || contentPara.tag === "") {
                detailEl.one(".ttps-tags-ai").hide();
            }
            return this._closePanel();
        };

        Tagger.prototype._getSubTitle = function(title) {
            var c, index, maxLength, s, _i, _len;
            maxLength = 35;
            index = 0;
            s = 0;
            for (_i = 0, _len = title.length; _i < _len; _i++) {
                c = title[_i];
                index++;
                if (c.match(/[\u4e00-\u9fa5]/)) {
                    s += 2;
                } else {
                    s++;
                }
                if (s >= maxLength) {
                    title = title.substr(0, index) + "...";
                    break;
                }
            }
            return title;
        };

        Tagger.prototype._delPoint = function(ev) {
            var pointEl, val;
            pointEl = $(ev.target).parent(this.pointSelector);
            val = pointEl.prop('data-value');
            this._updateGoods('minus', val);
            return pointEl.empty().remove();
        };

        Tagger.prototype._editPoint = function(ev) {
            var pointEl;
            this.isEdit = true;
            pointEl = $(ev.target).parent(this.pointSelector);
            return this._showPanel(pointEl, pointEl.offset.left);
        };

        Tagger.prototype._addFileToPanelBox = function(file, key) {
            var itemEl, _ref;
            itemEl = this.panelItemTPL.clone(true);
            itemEl.addClass("J_FileItem");
            itemEl.prop('file', file);
            itemEl.appendTo(this.wrapperEl);
            itemEl.one(this.itemThumbSelector).attr('src', file.url);
            return (_ref = this.kScroll) != null ? _ref.resize() : void 0;
        };

        return Tagger;

    })();
}, {
    requires: ['node', 'ajax', "combobox", "gallery/kscroll/1.1/index", '../simpletip']
});

var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

KISSY.add('hy/aixiu',function(S, Ajax, JSON, LimitBox, Overlay, Exp, Uploader, Tagger, Placeholder) {
    var $, Aixiu;
    $ = S.all;
    return Aixiu = (function() {
        function Aixiu() {
            this.ItemBind = __bind(this.ItemBind, this);
            this.submitHandler = __bind(this.submitHandler, this);
            this.submitForm = __bind(this.submitForm, this);
            var aixiuTpl, successTpl;
            successTpl = $("#J_AixiuSuccess").html();
            this.successBox = $(successTpl);
            this.maxPoint = 3;
            this.imageData = [];
            aixiuTpl = $('#J_AiXiuTPL').html();
            this.aixiuEl = $(aixiuTpl);
            this.bindListEl = this.aixiuEl.one('.J_RelatedList');
            this.bindShopTPL = this.aixiuEl.one('.J_RelatedItem').outerHTML();
            this.postData = JSON.parse($('#J_AixiuBtn').attr("postdata"));
            this.postData = S.merge(this.postData,{_tb_token_: SUBMIT_TOKEN});
            this.isFirstShow();
            this.init();
        }

        Aixiu.prototype.init = function() {
            this.initLimitBox();
            this.initUploader();
            this.bindEvents();
            this.aixiuEl.one('.J_GoodsNum').text(this.maxPoint);
            this.initPlaceholder(this.aixiuEl.one('.J_PanelItemValue'));
            return this.initPlaceholder(this.aixiuEl.one('.J_PanelItemTag'));
        };

        Aixiu.prototype.isFirstShow = function() {
            var _this = this;
            return Ajax({
                url: IS_FIRST_SHOW,
                type: 'post',
                data: {
                    "userId": LOGIN_USER_ID,
                    "_tb_token_": SUBMIT_TOKEN
                },
                dataType: 'json',
                complete: function(data) {
                    if (data && data.status && !data.isfirst) {
                        _this.stepNum = 1;
                    } else {
                        _this.stepNum = 0;
                    }
                    _this.nextStepHandle();
                    Overlay.showOverlayWith(_this, 0, _this.aixiuEl, false, true);
                    return _this.aixiuEl.parent('#J_WrapperOverlay').one(".J_Lightbox").addClass('lightbox');
                }
            });
        };

        Aixiu.prototype.initPlaceholder = function(node) {
            if (!S.UA.ie || S.UA.ie > 8) {
                return;
            }
            return new Placeholder({
                node: node
            });
        };

        Aixiu.prototype.bindEvents = function() {
            var _this = this;
            this.aixiuEl.one(".J_Start").on('click', function(ev) {
                _this.stepNum = 1;
                return _this.nextStepHandle(ev);
            });
            this.aixiuEl.one('.J_ImgDel').on('click', function(ev) {
                return _this.removeImg(ev);
            });
            this.aixiuEl.one('.J_NextStep').on('click', function(ev) {
                if ($(ev.target).hasClass("disabled")) {
                    return;
                }
                _this.stepNum++;
                return _this.nextStepHandle(ev);
            });
            this.aixiuEl.one('.J_LastStep').on('click', function(ev) {
                if (_this.tagger) {
                    if (_this.tagger.panelIsShowing) {
                        return;
                    }
                }
                _this.stepNum--;
                return _this.lastStepHandle(ev);
            });
            this.aixiuEl.one('.J_TUSubmit').on('click', function(ev) {
                return _this.submitForm(ev);
            });
            return this.aixiuEl.one('#J_AiXiuClose').on('click', function(ev) {
                var confirmClose, overlay;
                ev.preventDefault();
                if (_this.stepNum === 0) {
                    overlay = _this.aixiuEl.parent('.overlay');
                    return Overlay.closeOverlay(overlay, true);
                } else {
                    confirmClose = _this.aixiuEl.one('.J_ConfirmClose');
                    confirmClose.one('.confirm-yes-btn').on('click', function(ev) {
                        ev.preventDefault();
                        overlay = _this.aixiuEl.parent('.overlay');
                        return Overlay.closeOverlay(overlay, true);
                    });
                    confirmClose.all('.J_ConfClose').on('click', function(ev) {
                        ev.preventDefault();
                        return confirmClose.hide();
                    });
                    return confirmClose.show();
                }
            });
        };

        Aixiu.prototype.submitForm = function(ev) {
            var _this = this;
            if (this.isSubmiting === true) {
                return;
            }
            this.isSubmiting = true;
            this.aixiuEl.one('.J_TUSubmit').addClass("disabled");
            if (!this.imageData.length) {
                return this.showError("必须要圈一个宝贝才能晒图");
            }
            this.aixiuEl.one('.J_ItemData').val(JSON.stringify(this.imageData));
            return Ajax({
                url: AIXIU_SUBMIT_URL,
                type: 'post',
                form: '.J_AiXiuForm',
                data: {
                    "_tb_token_": SUBMIT_TOKEN,
                    "seller_id": SELLER_ID,
                    "url": this.aixiuEl.one(".J_UploadPreview").attr("src")
                },
                dataType: 'json',
                complete: function(data) {
                    return _this.submitHandler.call(_this, data);
                }
            });
        };

        Aixiu.prototype.submitHandler = function(data) {
            var overlay, xiuData;
            if (!data || !data.success) {
                this.showError((data && data.message) || "发布失败，请稍后重试");
                this.isSubmiting = false;
                return this.aixiuEl.one('.J_TUSubmit').removeClass("disabled");
            } else {

                /*@showSuccess "发布成功，5秒后自动刷新"
                 setTimeout ->
                 location.reload()
                 , 5000
                 */
                overlay = this.aixiuEl.parent('.overlay');
                Overlay.closeOverlay(overlay, true);
                xiuData = this.aixiuEl.one('.J_ItemData').val();
                if (xiuData) {
                    return this.showSuccessBox(data.shop_info);
                }
            }
        };

        Aixiu.prototype.showSuccessBox = function(data) {
            var innerHt, item, obj, _i, _len;
            obj = data;
            if (obj.length === 0) {
                return;
            }
            innerHt = [];
            for (_i = 0, _len = obj.length; _i < _len; _i++) {
                item = obj[_i];
                if (!item.success) {
                    continue;
                }
                innerHt.push('<li class="content-li"><a href="' + item.shop_href + '" target="_blank">' + item.shop_name + '</a></li>');
            }
            this.successBox.one('.J_ShopContent').html(innerHt.join(""));
            Overlay.showOverlayWith(this, 0, this.successBox, false, true);
            return this.initShareIcon();
        };

        Aixiu.prototype.ItemBind = function(stNum) {
            var _this = this;
            this.aixiuEl.one('.J_FileItem').detach('mouseenter');
            this.aixiuEl.one('.J_FileItem').detach('mouseleave');
            if (stNum === 1) {
                this.aixiuEl.one('.J_TaggerDel').hide();
                this.aixiuEl.one('.J_TaggerTip').hide();
                this.aixiuEl.one('.J_LastStep').hide();
                this.aixiuEl.one('.J_FileItem').on('mouseenter', function(ev) {
                    return _this.aixiuEl.one('.J_TaggerDel').show();
                });
                return this.aixiuEl.one('.J_FileItem').on('mouseleave', function(ev) {
                    return _this.aixiuEl.one('.J_TaggerDel').hide();
                });
            } else if (stNum === 2) {
                this.aixiuEl.one('.J_TaggerTip').show();
                this.aixiuEl.one('.J_TaggerDel').hide();
                this.aixiuEl.one('.J_FileItem').on('mouseenter', function(ev) {
                    return _this.aixiuEl.one('.J_TaggerTip').hide();
                });
                return this.aixiuEl.one('.J_FileItem').on('mouseleave', function(ev) {
                    return _this.aixiuEl.one('.J_TaggerTip').show();
                });
            }
        };

        Aixiu.prototype.nextStepHandle = function(ev) {
            this.ItemBind(this.stepNum);
            if (this.stepNum === 1) {
                this.aixiuEl.all(".J_Introduce").hide();
                this.aixiuEl.all(".J_UploadWrapper").show();
                return this.aixiuEl.one('.J_TaggerTip').hide();
            } else if (this.stepNum === 2) {
                this.aixiuEl.one('.J_TaggerDel').hide();
                this.aixiuEl.one('.J_UploadStep').hide();
                this.aixiuEl.one('.J_SelGoods').show();
                if (this.aixiuEl.one('.J_FileItem').all('.J_TUTagPoint').length === 0) {
                    this.aixiuEl.one('.J_NextStep').addClass("disabled");
                }
                this.aixiuEl.one('.J_LastStep').show();
                if (!this.tagger) {
                    this.initTagger();
                }
                this.tagger.enableTagger();
                return this.aixiuEl.all('.J_TTPDCtrl').show();
            } else if (this.stepNum === 3) {
                this.aixiuEl.one('.J_SelGoods').hide();
                this.showHyName();
                this.aixiuEl.one('.J_ShareContent').show();
                this.aixiuEl.one('.J_NextStep').hide();
                this.aixiuEl.one('.J_TUSubmit').show();
                this.aixiuEl.all('.J_TTPDCtrl').hide();
                if (this.tagger) {
                    return this.tagger.disableTagger();
                }
            }
        };

        Aixiu.prototype.lastStepHandle = function(ev) {
            this.ItemBind(this.stepNum);
            if (this.stepNum === 1) {
                this.aixiuEl.one('.J_UploadStep').show();
                this.aixiuEl.one('.J_SelGoods').hide();
                this.aixiuEl.one('.J_NextStep').removeClass("disabled");
                if (this.tagger) {
                    this.tagger.disableTagger();
                    return this.aixiuEl.all('.J_TTPDCtrl').hide();
                }
            } else if (this.stepNum === 2) {
                this.aixiuEl.one('.J_ShareContent').hide();
                this.aixiuEl.one('.J_SelGoods').show();
                this.aixiuEl.one('.J_NextStep').show();
                this.aixiuEl.one('.J_TUSubmit').hide();
                this.aixiuEl.all('.J_TTPDCtrl').show();
                if (!this.tagger) {
                    this.initTagger();
                }
                return this.tagger.enableTagger();
            }
        };

        Aixiu.prototype.getImageData = function() {
            var items, parentObj;
            parentObj = this;
            items = this.aixiuEl.all(".J_FileItem");
            if (items.length === 0) {
                return;
            }
            return this.aixiuEl.all(".J_FileItem").each(function(item) {
                var imgSrc, originalImage, realImg;
                realImg = item.one('.J_TUItemThumb');
                imgSrc = realImg[0].src;
                originalImage = new Image();
                originalImage.onload = function() {
                    var o_height, o_width, r_height, r_width, _ref, _ref1;
                    o_width = originalImage.width;
                    o_height = originalImage.height;
                    _ref = [realImg[0].width, realImg[0].height], r_width = _ref[0], r_height = _ref[1];
                    return (_ref1 = item.all('.J_TUTagPoint')) != null ? _ref1.each(function(point) {
                        var dataValue, offset;
                        offset = [(point.offset().left + point.width() / 2 - realImg.offset().left) / r_width * o_width, (point.offset().top + point.height() - realImg.offset().top) / r_height * o_height];
                        dataValue = point.prop("data-value");
                        dataValue['itemVal'].pos = offset;
                        point.prop('data-value', dataValue);
                        parentObj.imageData.push(dataValue);
                        return parentObj.isLoaded = true;
                    }) : void 0;
                };
                return originalImage.src = imgSrc;
            }, this);
        };

        Aixiu.prototype.unique = function(arr) {
            var hash, id, item, key, ret, _i, _len;
            ret = [];
            hash = {};
            for (_i = 0, _len = arr.length; _i < _len; _i++) {
                item = arr[_i];
                id = item['itemVal']['shop_info'].shop_id;
                key = typeof id + id;
                if (hash[key] !== 1) {
                    ret.push(item);
                    hash[key] = 1;
                }
            }
            return ret;
        };

        Aixiu.prototype.showHyName = function() {
            this.getImageData();
            return S.later(function() {
                var dataTemp, item, liHtml, _i, _len;
                if (this.isLoaded) {
                    liHtml = [];
                    dataTemp = this.unique(this.imageData);
                    for (_i = 0, _len = dataTemp.length; _i < _len; _i++) {
                        item = dataTemp[_i];
                        liHtml.push('<li class="related-item"><span>' + item['itemVal']['shop_info'].shop_name + '</a></li>');
                    }
                    return this.aixiuEl.one('.J_RelatedList').html(liHtml.join(""));
                } else {
                    return S.later(this.showHyName, 100, false, this);
                }
            }, 100, false, this);
        };

        Aixiu.prototype.removeImg = function(ev) {
            var previewEl;
            previewEl = this.aixiuEl.one('.J_UploadPreview');
            previewEl[0].src = "";
            previewEl.parent().prop("file", '');
            previewEl.parent().hide();
            this.aixiuEl.one('.J_UploadWrap').show();
            this.aixiuEl.one('.J_NextStep').addClass("disabled");
            if (this.tagger) {
                return this.tagger.clearTagger();
            }
        };

        Aixiu.prototype.initShareIcon = function() {
            var init,
                _this = this;
            init = function() {
                return SNS.ui("sharesite", {
                    defaultChecked: true,
                    batchCheckbox: false,
                    includeSites: '[4,7,11]',
                    checkedSites: '[-1]',
                    output: _this.successBox.one('.J_ShareList')
                });
            };
            if (typeof SNS === "undefined" || SNS === null) {
                return S.getScript('http://a.tbcdn.cn/p/snsdk/core.js', {
                    success: init
                });
            } else {
                return init();
            }
        };

        Aixiu.prototype.initUploader = function() {
            var _this = this;
            this.uploader = new Uploader({
                wrapperEl: this.aixiuEl.one('.J_UploadBox'),
                inputEl: this.aixiuEl.one('.J_AiXiuFile'),
                uploadUrl: AIXIU_PICS_SUBMIT_URL,
                dropperFieldName: "upload_files[]",
                uploadParams: this.postData
            });
            this.uploader.on('files:add', function(ev) {
                return _this.aixiuEl.one('.J_Loading').show();
            });
            this.uploader.on('files:update', function(ev) {
                return _this.aixiuEl.one('.J_Loading').hide();
            });
            this.uploader.on('allsuccess', function(ev) {
                _this.aixiuEl.one('.J_Loading').hide();
                return _this.uploadHandler.call(_this, ev);
            });
            return this.uploader.on('allerror', function(ev) {
                _this.aixiuEl.one('.J_Loading').hide();
                return _this.uplaodErrorHandler.call(_this, ev);
            });
        };

        Aixiu.prototype.uploadHandler = function(ev) {
            var previewEl;
            previewEl = this.aixiuEl.one('.J_UploadPreview');
            previewEl[0].src = ev.files[0].url;
            previewEl.parent().prop("file", ev.files[0]);
            previewEl.parent().show();
            this.aixiuEl.one('.J_UploadWrap').hide();
            this.aixiuEl.one('.J_NextStep').removeClass("disabled");
            return this.aixiuEl.one(".J_AixiuResult").text("").hide();
        };

        Aixiu.prototype.uplaodErrorHandler = function(ev) {
            var data;
            data = ev.data.data[0];
            if (data && !data.success && data.message) {
                return this.aixiuEl.one(".J_AixiuResult").text(data.message).show();
            } else {
                return this.aixiuEl.one(".J_AixiuResult").text("图片大于4M或者宽度小于600").show();
            }
        };

        Aixiu.prototype.initTagger = function() {
            var _this = this;
            this.tagger = new Tagger({
                outterEl: '.J_AiXiuBox',
                wrapperEl: '.tu-container',
                itemListAction: AIXIU_BOUGHT_URL,
                salerId: SELLER_ID,
                maxPoint: this.maxPoint,
                hasTrigger: true,
                nextStepBnt: '.J_NextStep'
            });
            this.tagger.createTagList({
                item: AIXIU_RECOMMEND_TAGS
            });
            return this.tagger.on('item~value~change', function() {
                return _this.bindShops.call(_this);
            });
        };

        Aixiu.prototype.bindShops = function() {

            /*@bindListEl.empty().show()
             shopList = []
             for pointEl in @tagger.wrapperEl.all('.J_TUTagPoint')
             shopInfo = $(pointEl).prop('data-value')['itemVal']['shop_info']
             continue if S.indexOf(shopInfo[0], shopList) != -1
             shopList.push shopInfo[0]
             @bindListEl.append S.substitute(@bindShopTPL, {
             shop_name: shopInfo[1]
             shop_id: shopInfo[0]
             })
             */
        };

        Aixiu.prototype.initLimitBox = function() {
            return new LimitBox({
                el: this.aixiuEl.one('.J_AiXiuContent'),
                bindNumEl: this.aixiuEl.one('.J_LimitBox'),
                limitLen: 500
            });
        };

        Aixiu.prototype.showError = function(msg) {
            var el;
            el = this.aixiuEl.one('.J_AixiuResult');
            el.text(msg);
            return el.show();
        };

        Aixiu.prototype.showSuccess = function(msg) {
            return this.aixiuEl.one('.J_AixiuResult').text(msg);
        };

        return Aixiu;

    })();
}, {
    requires: ["ajax", "json", "./widgets/limitbox", "./ss-overlay", "./exception", "./widgets/taguploader/uploader", "./widgets/taguploader/aitagger", "./widgets/placeholder"]
});

KISSY.add('hy/noaixiu',function(S, Ajax, JSON, Overlay, Exp) {
    var $, NoAixiu;
    $ = S.all;
    return NoAixiu = (function() {
        function NoAixiu() {
            this.init();
            this.initEvent();
        }

        NoAixiu.prototype.init = function() {};

        NoAixiu.prototype.initEvent = function() {};

        NoAixiu.prototype.showUserTip = function(type, msg) {
            this.tipPop = $($("#J_AiXiuPop").html());
            if (type === 1) {
                this.tipPop.one(".J_TipBody").text("您正在使用卖家账号，请切换到买家账号进行晒单");
            } else if (type === 2) {
                this.tipPop.one(".J_TipBody").text("淘宝会员等级V2以上剁手党方可晒单！亲，再多买一些哟！");
            } else {
                this.tipPop.one(".J_TipBody").text("亲！购买过本店宝贝，才可晒单哟！");
            }
            return Overlay.showOverlayWith(this, 0, this.tipPop, false, true);
        };

        return NoAixiu;

    })();
}, {
    requires: ["ajax", "json", "./ss-overlay", "./exception"]
});


/*
 风云榜页面
 */
KISSY.add('hy/fyb',function(S, Ajax, JSON, Overlay) {
    var $, FYB;
    $ = S.all;
    return FYB = (function() {
        function FYB() {
            this.init();
            this.initEvent();
        }

        FYB.prototype.init = function() {
            var fybHtml;
            fybHtml = $("#J_HYZS");
            if (!fybHtml) {
                return;
            }
            this.fyb = $(fybHtml.html());
            Overlay.showOverlayWith(this, 0, this.fyb, false, true);
            this.fyb.parent('#J_WrapperOverlay').one(".J_Lightbox").addClass('lightbox');
            return this.getData();
        };

        FYB.prototype.getData = function() {
            var dataBody, dataTpl,
                _this = this;
            dataTpl = $("#J_FybData");
            dataBody = $(".J_DataBody");
            return Ajax({
                url: GET_FYB_DATA,
                type: 'get',
                dataType: 'json',
                complete: function(data) {
                    var hotHtml, hotIndex, hotItem, hots, newHtml, newIndex, newItem, news, _i, _j, _len, _len1;
                    if (!data) {
                        return;
                    }
                    $(".J_Loading").hide();
                    hots = data.hot;
                    hotHtml = "";
                    for (hotIndex = _i = 0, _len = hots.length; _i < _len; hotIndex = ++_i) {
                        hotItem = hots[hotIndex];
                        if (hotItem.pic) {
                            hotItem['src'] = "src";
                        }
                        if (hotItem.creditImg) {
                            hotItem['creditSrc'] = "src";
                        }
                        if (hotItem.creditImg.length > 0) {
                            hotItem['isShow'] = '';
                        } else {
                            hotItem['isShow'] = 'none';
                        }
                        if (hotIndex < 3) {
                            hotItem['top'] = "top";
                        } else {
                            hotItem['top'] = "";
                        }
                        hotHtml += S.substitute(dataTpl.html(), hotItem);
                    }
                    dataBody.one(".J_HotUl").html(hotHtml);
                    news = data["new"];
                    newHtml = "";
                    for (newIndex = _j = 0, _len1 = news.length; _j < _len1; newIndex = ++_j) {
                        newItem = news[newIndex];
                        if (newItem.pic) {
                            newItem['src'] = "src";
                        }
                        if (newItem.creditImg) {
                            newItem['creditSrc'] = "src";
                        }
                        if (newIndex < 3) {
                            newItem['top'] = "top";
                        } else {
                            newItem['top'] = "";
                        }
                        newHtml += S.substitute(dataTpl.html(), newItem);
                    }
                    dataBody.one(".J_NewUl").html(newHtml);
                    return dataBody.show();
                }
            });
        };

        FYB.prototype.initEvent = function() {
            var _this = this;
            this.fyb.one('#J_HYZSClose').on('click', function(ev) {
                return _this._closeOverLay(ev);
            }, this);
            return this.fyb.one('#J_HYZS1Close').on('click', function(ev) {
                return _this._closeOverLay(ev);
            }, this);
        };

        FYB.prototype._closeOverLay = function(ev) {
            var overlay;
            ev.preventDefault();
            overlay = this.fyb.parent('.overlay');
            return Overlay.closeOverlay(overlay, true);
        };

        return FYB;

    })();
}, {
    requires: ["ajax", "json", "./ss-overlay"]
});

KISSY.add('hy/userbar',function(S, Exp, AiXiu, NoAixiu, FYB) {
    var $, Ajax, bindEvents, getDelURL, getPopupIndex, getSubType, getType, getURL, initPopup, loadPopupData, popupEl, popupTab, setLoading;
    $ = S.all;
    Ajax = S.io;
    $("#J_AixiuBtn").on("click", function(e) {
        var _this = this;
        e.preventDefault();
        if (!Exp.checkLogin()) {
            return;
        }
        if (!Exp.checkVip(1)) {
            new NoAixiu().showUserTip(2);
            return;
        }
        if (!Exp.checkHasBuy()) {
            new NoAixiu().showUserTip(0);
            return;
        }
        if (!Exp.checkIsSaler()) {
            new NoAixiu().showUserTip(1);
            return;
        }
        if (IS_BLACKLIST === '1') {
            $('<div id="J_KaitongAixiuTip" class="ss-simpletip-wrapper" style="margin-left: -20px;"><span class="ss-simpletip-container"><span class="ss-simpletip-icon ss-simpletip-error"></span><span class="ss-simpletip-content">因之前曾发布广告晒单 你已被归入黑名单 暂无法晒单</span><span class="ss-simpletip-close">&times;</span></span></div>').appendTo('#J_AixiuBtn');
            $('body').on("mousewheel", function() {
                return $('#J_KaitongAixiuTip').remove();
            });
            setTimeout(function() {
                return $('#J_KaitongAixiuTip').remove();
            }, 4000);
            return;
        }
        return window.SS_AIINSTANTS.push(new AiXiu);
    });
    if (S.UA.ie <= 6) {
        $("#J_UserMenuWrapper").on("mouseenter", function() {
            return $(this).children(".user-menu").addClass("user-menu-hover");
        });
        $("#J_UserMenuWrapper").on("mouseleave", function() {
            return $(this).children(".user-menu").removeClass("user-menu-hover");
        });
    }
    $(".need-login").on("click", function() {
        return Exp.showLogin();
    });
    popupEl = $("#J_BarPopup");
    popupTab = null;
    if (!popupEl) {
        return;
    }
    popupEl.delegate("mouseenter", "div.item", function(e) {
        return $(e.currentTarget).addClass("item-active");
    });
    popupEl.delegate("mouseleave", "div.item", function(e) {
        return $(e.currentTarget).removeClass("item-active");
    });
    $("#J_WhosShop").on("click", function(e) {
        e.preventDefault();
        popupEl.toggle();
        return initPopup();
    });
    popupEl.delegate("click", ".bar-popup-close", function(e) {
        e.preventDefault();
        return popupEl.hide();
    });
    $("#J_FYBBtn").on("click", function() {
        return new FYB;
    });
    initPopup = function() {
        if (popupTab) {
            return;
        }
        bindEvents();
        return S.use("switchable", function(S, Switchable) {
            popupTab = new Switchable.Tabs(popupEl, {
                triggerType: "click",
                activeTriggerCls: "current",
                switchTo: 0
            });
            loadPopupData();
            return popupTab.on("switch", loadPopupData);
        });
    };
    loadPopupData = function() {
        var index, url;
        index = getPopupIndex();
        url = getURL(index);
        setLoading(index, true);
        return S.io.jsonp(url, {
            userId: LOGIN_USER_ID,
            sellerId: SELLER_ID
        }, function(result) {
            if (result.success) {
                setLoading(index, false);
                if (result.data !== "") {
                    return $(popupTab.panels[index]).children().html(result.data);
                } else {
                    return $(popupTab.panels[index]).children().html("<div class=\"userbar-empty-panel\">暂时没有数据哦</div>");
                }
            }
        });
    };
    getPopupIndex = function() {
        return popupTab.activeIndex;
    };
    getURL = function(index) {
        if (index === 0) {
            return USER_BACKYARD_LIKED_URL;
        }
        if (index === 1) {
            return USER_BACKYARD_ITEMS_URL;
        }
        return USER_BACKYARD_SHARES_URL;
    };
    setLoading = function(index, bool) {
        if (bool) {
            return $(popupTab.panels[index]).addClass("loading-gif");
        } else {
            return $(popupTab.panels[index]).removeClass("loading-gif");
        }
    };
    bindEvents = function() {
        return popupEl.delegate("click", ".bar-item-delete", function(ev) {
            var el, id, index, parent, saleId, subType, type, url;
            el = $(ev.currentTarget);
            parent = el.parent('.item');
            index = el.parent('.bar-popup-panel').index();
            url = getDelURL(index);
            type = getType(index);
            subType = getSubType(index);
            id = parent.attr("data-shopid") || parent.attr("data-itemid") || parent.attr("data-feedid");
            saleId = parent.attr("data-sellerid");
            return Ajax({
                url: url,
                type: "post",
                dataType: "json",
                data: {
                    "subject": "favor",
                    "act": "unliked",
                    "loginUserId": LOGIN_USER_ID,
                    "ownerUserId": SELLER_ID,
                    "seller_id": saleId,
                    "shopId": index === 1 ? "" : id,
                    "subType": subType,
                    "typeId": type,
                    "target_key": id,
                    "_tb_token_": SUBMIT_TOKEN
                },
                success: function(data) {
                    var msg;
                    if (data.success) {
                        return parent.empty().remove();
                    } else {
                        msg = data.message || data.msg || "系统出了点小问题，请稍后重试。";
                        return Exp.showError(el, msg);
                    }
                },
                error: function() {
                    return Exp.showError(el, "系统出了点小问题，请稍后重试。");
                }
            });
        });
    };
    getDelURL = function(index) {
        if (index === 2) {
            return USER_BACKYARD_DEL_PUBLISH;
        }
        if (index === 1) {
            return INDEX_LIKE_URL;
        }
        if (index === 0) {
            return INDEX_LIKE_URL;
        }
    };
    getType = function(index) {
        if (index === 2) {
            return "";
        }
        if (index === 1) {
            return 2;
        }
        if (index === 0) {
            return "";
        }
    };
    return getSubType = function(index) {
        if (index === 2) {
            return "";
        }
        if (index === 1) {
            return "";
        }
        if (index === 0) {
            return 4;
        }
    };
}, {
    requires: ['./exception', './aixiu', "./noaixiu", "./fyb"]
});


/*
 @fileOverview 吊顶自动隐藏脚本.
 @creator 云谦 <yunqian@taobao.com>
 */
KISSY.add('hy/sitenav',function(S, UA) {
    var $, Anim, HIDE_DELAY, SHOW_DELAY, SiteNav;
    $ = S.all;
    Anim = S.Anim;
    SHOW_DELAY = 300;
    HIDE_DELAY = 500;
    if (UA.mobile) {
        return;
    }
    SiteNav = (function() {
        SiteNav.prototype.showTimer = null;

        SiteNav.prototype.hideTimer = null;

        function SiteNav() {
            this.navEl = $("#site-nav");
            this.shimEl = $("#site-nav-shim");
            this.init();
        }

        SiteNav.prototype.init = function() {
            return this.bindEvents();
        };

        SiteNav.prototype.bindEvents = function() {
            this.shimEl.on("mouseenter", this.showHandler, this);
            this.shimEl.on("mouseleave", this.hideHandler, this);
            this.navEl.on("mouseenter", this.showHandler, this);
            return this.navEl.on("mouseleave", this.hideHandler, this);
        };

        SiteNav.prototype.showHandler = function() {
            var _ref, _ref1;
            if ((_ref = this.showTimer) != null) {
                _ref.cancel();
            }
            if ((_ref1 = this.hideTimer) != null) {
                _ref1.cancel();
            }
            return this.showTimer = S.later(this.show, SHOW_DELAY, false, this);
        };

        SiteNav.prototype.hideHandler = function() {
            var _ref, _ref1;
            if ((_ref = this.showTimer) != null) {
                _ref.cancel();
            }
            if ((_ref1 = this.hideTimer) != null) {
                _ref1.cancel();
            }
            return this.hideTimer = S.later(this.hide, HIDE_DELAY, false, this);
        };

        SiteNav.prototype.show = function() {
            var anim;
            anim = Anim(this.navEl, {
                "top": 0
            }, .2);
            return anim.run();
        };

        SiteNav.prototype.hide = function() {
            var anim;
            anim = Anim(this.navEl, {
                "top": -28
            }, .2);
            return anim.run();
        };

        return SiteNav;

    })();
    return new SiteNav;
}, {
    requires: ["ua"]
});

var __hasProp = {}.hasOwnProperty;

if (KISSY.one('#decSaleTopBanner') != null) {
    KISSY.one('#decSaleTopBanner').remove();
}

KISSY.add("hy/init", function(S, SuitImage, ME, SSlog, SimpleTip, GhostScroll, Share, Exp, Router, DataFunc, Exception, Views) {
    var $, Ajax, Cookie, DOM, Event, UA, indexLikeHandler, mainBG, mainWrapper, scrollTipLayer, superContainer, url, wrapperEl,
        _this = this;
    $ = S.all;
    DOM = S.DOM;
    Event = S.Event;
    Ajax = S.io;
    Cookie = S.Cookie;
    UA = S.UA;
    window.SS_ACTIVE_HORIFLOW = [];
    window.SS_AIINSTANTS = [];
    window.VIEWPORTWIDTH = DOM.viewportWidth();
    window.VIEWPORTHEIGHT = DOM.viewportHeight();
    window.USERBAR_HEIGHT = 46;
    superContainer = $("#J_Container");
    mainWrapper = $("#J_Main");
    mainBG = $("#J_MainBG");
    wrapperEl = $("#J_Wrapper");
    superContainer.height(DOM.viewportHeight() - USERBAR_HEIGHT);
    Router.routePath(location.hash);
    $(window).on("hashchange", function(ev) {
        return Router.routePath(location.hash);
    });
    $('body').css("background-color", COLORS[parseInt(COLORS.length * Math.random())]);
    S.later(function() {
        var BG;
        if (BG_SHOW_TYPE === 2) {
            BG = new SuitImage({
                wrapperEl: "#J_MainBG",
                contain: false,
                cover: false,
                position: "left top"
            });
        } else {
            BG = new SuitImage("#J_MainBG");
        }
        return new SuitImage("#J_Logo");
    }, 400);
    ME(".shop-title", {
        height: 50,
        exact: true
    });
    if (!Cookie.get("SCROLLTIP") && window.SHOW_SCROLL_TIP) {
        scrollTipLayer = "<div class=\"scroll-tip-layer\">\n<a href=\"javascript:void(0)\" class=\"scroll-tip-close\"></a>\n<dl>\n<dd class=\"scroll-tip-mouse\"></dd>\n<dt class=\"scroll-tip-title\">有一种精彩横着滚出来</dt>\n<dd class=\"scroll-tip-keyboard\"><br>试试方向键发现更多</dd>\n</dl>\n</div>";
        S.later(function() {
            var scrollTip;
            scrollTip = $(DOM.create(scrollTipLayer));
            DOM.append(scrollTip, "#J_Main");
            $(".scroll-tip-close").on("click", function() {
                var domain;
                $('.scroll-tip-layer').remove();
                domain = "";
                if (location.href.indexOf("tmall.com") >= 0) {
                    domain = "tmall.com";
                } else if (location.href.indexOf("taobao.com") >= 0) {
                    domain = "taobao.com";
                } else {
                    domain = "daily.taobao.net";
                }
                Cookie.set("SCROLLTIP", 1, 999, domain, "/hy");
                if (LOGIN_USER_ID) {
                    return S.io.get(USER_BACKYARD_CLOSETIPS, {
                        userId: LOGIN_USER_ID
                    });
                }
            });
            $('body').on("mousewheel keydown scroll", function() {
                scrollTip.remove();
                $('body').detach("mousewheel keydown scroll");
                return $('body').undelegate("mousedown touchstart", '.view');
            });
            return $('body').delegate("mousedown touchstart", '.view', function() {
                scrollTip.remove();
                $('body').undelegate("mousedown touchstart", '.view');
                return $('body').detach("mousewheel keydown scroll");
            });
        }, 1000);
    }
    window.IsSupportTransition = (function() {
        var s;
        s = document.body.style;
        if ("WebkitTransition" in s) {
            return true;
        }
        if ("MozTransition" in s) {
            return true;
        }
        if ("msTransition" in s) {
            return true;
        }
        if ("OTransition" in s) {
            return true;
        }
        if ("Transition" in s) {
            return true;
        }
        return false;
    })();
    if (window.IsSupportTransition) {
        $("body").addClass("support-transition");
    }
    if (UA.mobile) {
        Event.on("#J_Main", "swipe", function(ev) {
            var navItem, nextIndex, preIndex, _ref;
            if (((_ref = ev.direction) === 'left' || _ref === 'right') || !ev.direction) {
                return;
            }
            ev.halt();
            navItem = $("#J_NavList .nav-active");
            preIndex = parseInt(navItem.attr("data-index"));
            nextIndex = ev.direction === 'up' ? preIndex + 1 : preIndex - 1;
            if (nextIndex < 0 || nextIndex >= $('#J_NavList .nav-item').length) {
                return;
            }
            return location.href = $('#J_NavList .nav-item')[nextIndex].children[0].href;
        });
    }
    if (location.search && location.search.indexOf("leap") >= 0) {
        url = "http://" + (location.host.indexOf('daily') !== -1 ? "assets.daily.taobao.net" : "a.tbcdn.cn") + "/apps/taesite/hy/20130618/javascripts/hy/lab/leapmotion.js";
        S.getScript(url, function() {
            return S.use("hy/lab/leapmotion");
        });
    }
    Event.on(".J_IndexShareBtn", "click", function() {
        return new Share({
            title: SELLER_NICK + " 的后院",
            url: location.href,
            show: true
        });
    });
    indexLikeHandler = function() {
        var act, self, status, tip,
            _this = this;
        if (!Exp.checkLogin()) {
            return;
        }
        self = $('#J_IndexLikeBtn');
        tip = $('#J_IndexUnlikeBtn');
        status = self.attr("data-status");
        act = !parseInt(status) ? "add" : "unlike";
        return Ajax({
            url: INDEX_LIKE_URL,
            data: {
                "subject": "favor",
                "act": act,
                "loginUserId": LOGIN_USER_ID,
                "ownerUserId": SELLER_ID,
                "seller_id": SELLER_ID,
                "shopId": SHOP_ID,
                "subType": 4,
                "_tb_token_": SUBMIT_TOKEN
            },
            type: "post",
            dataType: "json",
            success: function(data) {
                if (data.status === 1) {
                    self.parent('.like-btn-wrapper').removeClass("unliked");
                    self.attr("data-status", 1);
                    return Exp.showTip(self, data.message);
                } else {
                    self.attr("data-status", 0);
                    self.parent(".like-btn-wrapper").addClass("unliked");
                    return Exp.showTip(self, data.message);
                }
            },
            error: function(data) {
                return Exp.showError(self, data.message);
            }
        });
    };
    Event.on("#J_IndexLikeBtn", "click", indexLikeHandler);
    Event.on("#J_IndexUnlikeBtn", "click", indexLikeHandler);
    $(".bar-news-wrapper").on("click", function(ev) {
        var newsBtn;
        ev.preventDefault();
        ev.stopPropagation();
        newsBtn = $("#tstart-plugin-news .tstart-drop-trigger");
        newsBtn.fire("click");
        return $('.tstart-drop-panel').css('right', '-5px').css('bottom', '45px');
    });
    return setTimeout(function() {
        return setInterval(function() {
            var index, instant, key, _i, _len, _ref, _ref1, _ref2, _ref3;
            $('#J_BarNewsCount').html((_ref = $(".J_TMsgCount")) != null ? (_ref1 = _ref.one('em')) != null ? _ref1.text() : void 0 : void 0);
            _ref2 = window.SS_AIINSTANTS;
            for (index = _i = 0, _len = _ref2.length; _i < _len; index = ++_i) {
                instant = _ref2[index];
                if ((instant == null) || (instant.mainEl == null) || window.SS_AIINSTANTS.splice(index, 1)) {

                } else if (!instant.mainEl.parent('body')) {
                    for (key in instant) {
                        if (!__hasProp.call(instant, key)) continue;
                        instant[key] = null;
                    }
                    window.SS_AIINSTANTS.splice(index, 1);
                }
            }
            if (typeof window.CollectGarbage === "function") {
                window.CollectGarbage();
            }
            return (_ref3 = window.opera) != null ? typeof _ref3.collect === "function" ? _ref3.collect() : void 0 : void 0;
        }, 10000);
    }, 10000);
}, {
    requires: ['./widgets/suitableimage', './widgets/multiellipsis', './widgets/sslog', './widgets/simpletip', './widgets/ghostscroll', './share', './exception', './router', './datafunc', './exception', './views', './userbar', './sitenav']
});

KISSY.use("hy/init");

