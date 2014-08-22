/*
combined files : 

tbc/tmsg/1.2.0/mods/core
tbc/tmsg/1.2.0/mods/messenger
tbc/tmsg/1.2.0/mods/umpp
tbc/tmsg/1.2.0/mods/init
tbc/tmsg/1.2.0/index

*/
 
 /**
 * 定义TMsg全局命名空间
 * @author zizhong<zizhong.lxz@taobao.com>
 * @date 2013-6-15
 */

KISSY.add('tbc/tmsg/1.2.0/mods/core', function(S) {

		var T = S.namespace('TMsg', true),
			MODULEPATH = 'tbc/tmsg/1.2.0/plugin/',
			isOnline = -1 === location.host.indexOf('daily') && -1 === location.search.indexOf('__daily__');

		/**
		 * TMsg
		 */
		 return S.mix(T, {

			// 环境变量
			isKS16: !(parseFloat(S.version, 10) > 1.1),

			isDebug: -1 !== location.search.indexOf('ks-debug'),

			isOnline: isOnline,

			cdnHost: isOnline ? 'http://g.tbcdn.cn/' : 'http://g.assets.daily.taobao.net/',

			serverHost: isOnline ? 'taobao.com' : 'daily.taobao.net',

			
			// 调用 tmsg 中的插件
			use: function (name, callback) {

				// 调用插件前需先引入的文件
				var mods = ['encode', 'error', 'msgpanel'],
					path;

				if (T[name]) {

					callback && callback();

				} else if (MODULEPATH.length > 10) {

					// 线上环境, 为了方便。。。不管 kissy 啥版本，都直接 getScript 先
					if (!T.MsgPanel) {

						path = ( '??' + mods.join('-min.js,') + '-min.js,' ) + name + '-min.js';

						mods.push(name);

					} else {

						mods = [name];

						path = name + '-min.js';

					}

					if (T.isDebug) {

						path = path.replace(/-min/g, '');

					}

					S.getScript(T.cdnHost + MODULEPATH + path, function() {

						if (!T.isKS16) {

							S.use(MODULEPATH + mods.join(',' + MODULEPATH), function() {

								callback && callback();

							});

						} else {

							callback && callback();

						}

					});

				} else {

					mods.push(name);

					// demo
					S.use(MODULEPATH + mods.join(',' + MODULEPATH), function() {

						callback && callback();
						
					});

				}

			},

			/**
			 * 发送统计.
			 * @param { String } code 统计埋点.
			 */
			sendStatistic: function(code) {
				if (code) {
					new Image().src = 'http://log.mmstat.com/sns.' + code + '?t=' + S.now() + '&url=' + encodeURI(location.href.replace(location.hash, ''));
				}
			},

			// 获取 token
			getToken: function(callback) {
				var tokenURL =  'http://comment.jianghu.'+T.serverHost+'/json/token.htm';
				S.IO.jsonp(tokenURL,{ _fetchToken:true},function (data) {
					callback&&callback(data.token);
				})

			},
			fromUnicode:function (str) {
				return str.replace(/\\u([a-f\d]{4})/ig, function (m, u) {
					return  String.fromCharCode(parseInt(u, 16));
				});
			},	
			// 获取 nick
			getNick: function() {
				return T.fromUnicode(S.Cookie.get('_nk_'));
			}

		 });
	},

	{
		requires: ['core']

	}
);
 



/**
 * @fileoverview 跨域通信, 1.1.6 版本.
 * @author shiran<shiran@taobao.com>
 */

KISSY.add('tbc/tmsg/1.2.0/mods/messenger', function(S) {

		var	win = window,

			// 添加命名空间
			Messenger = S.namespace('TBC.Messenger'),

			DOM = S.DOM, Event = S.Event, UA = S.UA, JSON = S.JSON,

			// domain
			domain = document.domain,

			// 判断是否使用 flash
			useFlash = 'undefined' === typeof postMessage || !win.addEventListener,

			// 判断是否是线上环境
			isOnline = -1 === location.host.indexOf('daily') && -1 === location.host.indexOf('net'),

			// cdn 地址
			cdn = 'http://' + (isOnline ? 'g.tbcdn.cn' : 'g.assets.daily.taobao.net'),

			VERSION = '1.2.0',

			// post message flash 地址
			postMessageSwf = VERSION ? (cdn + '/tbc/tmsg/' + VERSION + '/flash-post-message.swf') : 'flash-post-message.swf',

			// 事件
			attachedEvents = [],

			// swf 变量
			swf, 
			
			// 当前页面创建的 flash 的name
			flashName = '_MessengerFlash_' + S.now();



		/**
		 * 注册消息事件.
		 * @param { String } type 消息类型.
		 * @param { Function } cb 回调函数.
		 */
		function register(type, cb) {
		
			attachedEvents.push([type, cb]);

		}

		/**
		 * 发送消息.
		 * @param { String } type 消息类型.
		 * @param { Anything } content 消息内容.
		 * @param { Object } 目标窗口对象.
		 */
		function send(type, content, target) {

			var data = { type: type, content: content },
				iframeEl = target;

			if (S.isString(target)) {
				iframeEl = DOM.get('#' + target);
				target = iframeEl.contentWindow;
			} else if (target.contentWindow) {
				target = target.contentWindow;
			}

			if (isSameDomain()) {

				try {

					return target.KISSY.TBC.Messenger._fire(type, content);

				} catch(e) { };

			}

		   	if (!useFlash) {

				target.postMessage(JSON.stringify(data), '*');

			} else {
				if (swf.callSWF) {
					swf.callSWF('send', [data, getTargetFlashName(iframeEl)]);
				} else {
					swf.send(data, getTargetFlashName(iframeEl));
				}

			}

		}

		/**
		 * 激活事件。
		 */
		function fire(type, param) {
			S.each(attachedEvents, function(ev) {
				if (ev[0] === type) {
					ev[1](param);
				}
			});
		}

		/**
		 * 创建 iframe.
		 * @param { Object | String } attr iframe 节点属性对，如果仅有 src 时可为字符串。
		 * @param { HTMLElement | String } selector 需要放置 iframe 的节点或者节点 selector, 默认为 body。
		 * @return { HTMLElement } iframe 节点。
		 */
		function createIframe(attr, selector) {

			var param = 'parentFlash=' + flashName + '&childFlash=_MessengerChildFlash_' + S.now() + '&domain=' + document.domain,
				src,
				sep;

			if (S.isString(attr)) {
				src = attr;
				attr = {};
			} else {
				src = attr.src;
			}

			attr.src = src + ( src.indexOf('?') > -1 ? '&' : '?' ) + param;

			var iframe = DOM.create('<iframe>', attr);

			iframe.setAttribute('width', 1);
			iframe.setAttribute('height', 1);

			return DOM.get(selector || 'body').appendChild(iframe);

		}

		/**
		 * 获取目标对象的 flashName.
		 * @param { Object } 目标窗口对象.
		 */
		function getTargetFlashName(target) {

			var src = target.src,
				reg = /childFlash=([^&]+)/,
				match;

			if (src) {

				// 目标为 iframe
				var m = src.match(reg);

				if (m && m[1]) {
					// name 首字母必须为 _
					return m[1];
				} else {
					throw 'iframe has no flashName param';
				}

			}

		}

		/**
		 * 判断是否是同域。
		 */
		function isSameDomain() {

			return !!document.domain.match(/^taobao\.com/);

		}

		// 非同域处理，或者不使用 flash 的通信，因为 domain 的后设置会导致不能通信，所以，对于ie8- 都加载 flash。
		if (!isSameDomain() || useFlash) {

			if (!useFlash) {

				// 高级浏览器
				win.addEventListener('message', function(ev) {

					var data = ev.data;

					if (data && S.isString(data)) {

						try {

							var ret = JSON.parse(data);

							fire(ret['type'], ret.content);

						} catch(e) {};

					}
						
				}, false);	

			} else {

				S.use(parseFloat(S.version, 10) > 1.2 ? 'swf' : 'flash', function(S, SWF) {

					// 低级浏览器

					// flash 函数
					window['_Messenger_Flash_PostMessage'] = function (swfid, msg){

						var type = msg.type,
							data = msg.msg;

						if ('message' == type && data) {
							fire(data.type, data.content);
						}

					};

					var	flashConfig = {

						src: postMessageSwf,

						attrs: {
							width: 1,
							height: 1,
							style: 'position:absolute;top:0'
						},

						params: {
							flashVars: {
								jsentry: '_Messenger_Flash_PostMessage',
								swfid: 'J_MessengerFlashPostMessage',
								name: flashName
							},
							allowscriptaccess: 'always'
						}

					};


					// flash 对象
					if (SWF && parseFloat(S.version, 10) > 1.2) {
						swf = new SWF(flashConfig);
					} else {
						S.Flash['add']('#J_FlashPostMessageContainer', flashConfig, function(data) {
							swf = data.swf;		
						});
					}

				});

			}

		}

		return S.mix(Messenger, {

			register: register,
			send: send,
			createIframe: createIframe,
			_fire: fire,
			flashName: flashName

		});
		
	},

	{
		requires: ['core']	
	}

);

/**
 * @fileoverview 注册用户消息。
 * @author shiran<shiran@taobao.com>
 */
KISSY.add('tbc/tmsg/1.2.0/mods/umpp', function(S) {

		var DOM = S.DOM,
			Cookie = S.Cookie,
			Messenger = S.TBC.Messenger,

			umpp = S.namespace('TBC.umpp'),

			isLogin = Cookie.get('_nk_'),
		
			domain = document.domain,

			iframeId = 'J_Um_Iframe',

			isOnline = -1 == location.host.indexOf('daily'),

			// 传入父页面 host 以及 message 组件需要用到的 flashName
			iframeUrl = 'http://mpp.' + (isOnline ? 'taobao.com' : 'daily.taobao.net:8080') + '/ajaxconn.html?domain=' + domain;

		/**
		 * 检测是否已经有长连接在建立。
		 */
		function checkConnection() {

			return DOM.get('#' + iframeId);

		}

		// 判断是否登录
		if (!isLogin) {

			return S.mix(umpp, { register: function(){}, send: function() {} });

		}

		// 创建 iframe
		if (!checkConnection()) {

			Messenger.createIframe({
				src: iframeUrl,
				id: iframeId,
				frameborder: 0,
				scrolling: 'no'
			});

		}

		return S.mix(umpp, {

			register: function(type, cb) {

				return Messenger.register.apply(null, arguments);

			},

			send: function(type, content) {

				return Messenger.send.call(null, type, content, iframeId);

			},

			clear: function(content) {

				return this.send('clearTMsg', content);

			}

		});

	},

	{
		requires: ['dom', 'cookie']	
	}
);

/**
 * @subModule  吊顶消息初始化
 * @author zizhong<zizhong.lxz@taobao.com>
 */
KISSY.add('tbc/tmsg/1.2.0/mods/init', function(S) {

		var DOM = S.DOM,
			Event = S.Event,
			IO = S.IO,
			T = TMsg,

			sc = { //statisticsCode统计埋点
				'hover_enter' : '21.1',
				'click_service':'21.2',
				'click_comment':'21.3',
				'click_atme':'21.4',
				'click_fans':'21.5',
				'click_letter':'21.6',
				'click_inform':'21.7',
				'ignore_service':'21.8',
				'ignore_comment':'21.9',
				'ignore_atme':'21.10',
				'ignore_fans':'21.11',
				'ignore_letter':'21.12',
				'ignore_inform':'21.13'
			},			
			
			umpp = S.TBC.umpp,

			msgMenu,
			loadingImgObj,
			isLoadingDetail = false,
			styleSheet = '1.2.0' ? (T.cdnHost + '/tbc/tmsg/' + '1.2.0' + '/content-min.css') : 'content.css',
			styleLoaded = false,
			ignoreURL = 'http://i.'+T.serverHost+'/message/shield_message.htm',
			loadingImg = 'http://img03.taobaocdn.com/tps/i3/T1HLdLXctlXXXXXXXX-16-16.gif',
			itemURL = 'http://i.'+T.serverHost+'/message/message_list.htm',
			
			NO_MESSAGE_NOTICE = '<p class="no-tmsg-text">亲，暂时没有新消息哦！</p>',
			
			TMSG_HTML = ''+
			'<div class="tmsg" id="J_Tmsg" style="display:none">'+
				'<span class="tmsg-list" id="J_TmsgList">'+
					'<span class="tmsg-head">'+
						'<span class="tmsg-ico" id="J_TmsgIcon"></span>'+
						'<span class="tmsg-notice">'+
							'<span class="tmsg-no-tips" id="J_TmsgTip"></span>'+
							'<b></b>'+
						'</span>'+
					'</span>'+
					'<span class="tmsg-content" id="J_TmsgListDetail">'+
						'<span class="tmsg-content-bd" id="J_TmsgListBd">' +
							NO_MESSAGE_NOTICE +
						'</span>' +
						'<span class="tmsg-content-ft">'+
							'<span class="tmsg-operate-area">'+
								'<a href="http://i.'+T.serverHost+'/message/message_set.htm"  target="_blank" class="tmsg-setting" hidefocus="true" title="设置">设置</a>'+
							'</span>'+
							'<a href="http://i.'+T.serverHost+'/message/view_message.htm" target="_blank" class="tmsg-center">消息中心</a>'+
						'</span>'+
					'</span>'+
				'</span>' +
				'<span class="tmsg-panel tmsg-content tmsg-hidden" id="J_TmsgPanel"></span>' +
			'</div>',

			IGNORE_NOTICE = '<span class="ignore-tmsg-tips">亲，你经常忽略此类消息，需要屏蔽吗?<span class="tmsg-ignore-comfirm"><a href="#" class="tmsg-ignore-comfirm-yes J_IgnoreComfirmYes">是</a><a href="#" class="tmsg-ignore-comfirm-no J_IgnoreComfirmNo">否</a></span></span>';
		
		/**
		 * @subModule  消息体对象
		 */
		T.Message = {

			itemURL: itemURL,

			init: function() {

				var self =this;

				// 注册消息接收事件
				umpp.register('1064', function(data) {
					
					msgMenu = data;
					self.renderMsgNum();
					
				});

				// 渲染节点以及绑定事件
				var node = self.render();
				
				self.bindEvent(node);
				
			},

			// 创建消息节点
			render: function(loginInfo) {

				var loginInfo = DOM.get('.login-info', '#site-nav'),

					msg = DOM.create(TMSG_HTML);

				return DOM.insertAfter(msg, loginInfo);


			},

			// 绑定事件
			bindEvent: function() {

				var self = this,
				
					hoverTimer = null, outTimer = null,
				
					msgList = DOM.get('#J_TmsgList'),
					
					root = DOM.get('#J_Tmsg');

				// icon mouse 事件
				Event.on(msgList, 'mouseenter', function(e) {
				
					T.sendStatistic(sc['hover_enter']);
					
					var relatedTarget = e.relatedTarget;

					if ( !relatedTarget ||
						 ( 
						     DOM.get('#J_Tmsg') != relatedTarget && 
						     ( DOM.contains('#J_Tmsg', relatedTarget) || -1 !== relatedTarget.className.indexOf('tmsg') ) 
						 )
					) {
						// contains 有时候不能正确输出，不清楚为啥。。。,另外修复当从上侧根节点进入无法触发的问题

						return;

					}

					outTimer && outTimer.cancel();

					hoverTimer && hoverTimer.cancel();
					
					hoverTimer = S.later(function() {

						self.showList();

						if (!styleLoaded) {
							S.getScript(styleSheet); 
							styleLoaded = true;
						}

					},100);
						
				});

				Event.on(msgList, 'mouseleave', function(e) {   

					outTimer && outTimer.cancel();

					hoverTimer && hoverTimer.cancel();

					outTimer = S.later(function(){

						self.hideList();

					}, 300);

				});

				
				// 列表点击事件
				Event.on(root,'click',function(ev) {

					var target = ev.target;
					
					if (DOM.hasClass(target, 'J_IgnoreComfirmYes')) {

						// 确认忽略消息

						ev.preventDefault();

						self.ignoreMsg(DOM.parent(target, '.ignore-tmsg-tips'), true);
						isLoadingDetail = false;

					} else if (DOM.hasClass(target, 'J_IgnoreComfirmNo')) {

						// 不忽略消息
						ev.preventDefault();
						self.removeMsg(DOM.parent(target,'.J_MenuItemHandler'));
						isLoadingDetail = false;

					}else if (DOM.hasClass(target, 'J_MenuItemMsgIgnore')) {

						// 忽略消息
						
						if( isLoadingDetail ) return;
						
						self.ignoreMsg(target);

					} else if (DOM.hasClass(target, 'J_BackMsgList')) {

							ev.preventDefault();

							if (!T.isKS16) {

								new S.Anim(

										'#J_TmsgPanel', 

										self.getListSize(),

										0.3,

										'easeOut',

										function() {
											self.showList(true);
										}

									).run();

							} else {

								// ks 16 没有动画
								DOM.css('#J_TmsgPanel', self.getListSize());
								self.showList(true);

							}

					}else if ((DOM.hasClass(target, 'J_MenuItemHandler')||DOM.parent(target, '.J_MenuItemHandler')) ) {
						
						// 加载列表
						target = DOM.hasClass(target, 'J_MenuItemHandler')?target:DOM.parent(target, '.J_MenuItemHandler');
						
						ev.preventDefault();
					
						if( isLoadingDetail ) return;

						self.showContent(target);

					} 

				});
				

				// body 添加点击事件，关闭内容框
				Event.on('body', 'click', function(ev) {
					
					var target = ev.target;

					if ( !target || (!DOM.contains('#J_Tmsg', target) && -1 === target.className.indexOf('tmsg')) ) {
						self.hideContent();
					}
					
				});

			},

			// 渲染消息数
			renderMsgNum: function() {

				var strong = ['1', '2', '3', '4'],
					num = 0,
					hasStrongMsg = false,
					tip = DOM.get('#J_TmsgTip'),
					cls;

				S.each(msgMenu, function(item) {

					if (!hasStrongMsg && item.num > 0 && -1 !== S.indexOf(item.type, strong)) {
						hasStrongMsg = true;
					}

					num += item.num * 1;
					
				});

				if (hasStrongMsg) {
					// 强提醒
					cls = num > 20 ? 'tmsg-num-tips tmsg-more-than-twenty' : (num <10 ? 'tmsg-num-tips tmsg-less-than-ten' : 'tmsg-num-tips');

					DOM.html(tip, num > 20 ? '' : num);
					
				} else {

					cls = num > 0 ? 'tmsg-sys-tips' : 'tmsg-no-tips';
					
					DOM.html(tip, '');

				}

				// 替换式的添加 class
				tip.className = cls;

				if (num > 0) {
					// 添加有消息的 icon
					DOM.addClass('#J_TmsgIcon', 'tmsg-ico-hasmsg');
				} else {
					// 移除有消息的icon
					DOM.removeClass('#J_TmsgIcon', 'tmsg-ico-hasmsg');
					DOM.html(tip, '');
				}

			},

			// 显示消息列表
			showList: function(noPaint) {

				// 渲染列表
				if (!noPaint) {
					this.renderList();
				}

				DOM.addClass(DOM.get('#J_Tmsg'), 'tmsg-hover');

				// 关闭 content
				this.hideContent();

			},

			// 隐藏消息列表
			hideList: function() {

				DOM.removeClass(DOM.get('#J_Tmsg'), 'tmsg-hover'); 

			},

			// 渲染消息列表
			renderList: function() {

				var name = {
						"service" : "服务通知",
						"comment" : "新评论",
						"letter" : "私信",
						"atme" : "提到我",
						"fans" : "新粉丝",
						"inform" : "互动提醒"
					},

					ignore = ['service'],

					html = '<ul class="tmsg-menu-list">',

					len = html.length,
					
					num, url;

				S.each(msgMenu, function(item, idx) {

					num = item.num;
					url = item.url;

					if (num > 0) {
					
						
						html += '<li><a hidefocus="true" href="#" class="tmsg-menu-item J_MenuItemHandler" data-num="' + num + '" data-type="' + url + '">';

						if (-1 === S.indexOf(url, ignore)) {

							html += '<span class="ignore-tmsg J_MenuItemMsgIgnore">忽略</span>';

						}

						html += '<span  class="tmsg-menu-item-link" ><b>' + (num > 99 ? '99+':num)+ '</b>' + name[url] + '</span>';

						html += '</a></li>';

					}

				});

				if (html.length > len) {

					html += '</ul>';

				} else {

					html = NO_MESSAGE_NOTICE;
					
				}

				DOM.html('#J_TmsgListBd', html);

			},

			// 显示消息内容
			showContent: function(target) {

				var self = this,
					type = DOM.attr(target,'data-type');
				
				T.sendStatistic(sc['click_'+type]);
				
				//加载中
				self.showDetailLoading(target);

				var num = DOM.attr(target, 'data-num');
				 
				
				IO.jsonp(

					itemURL,

					{
						tab: type,
						_input_charset:'utf-8',
						page: 1,
						size: Math.min(num, 10)
					},

					function(data) {

						if( data.status == '-1') {
							T.use('error',function() {
								T.error.noLogin();
							});
							
							return ;
						}
						
						if(data.status == '0') {
						
							// 异步引入
							T.use(type, function() {
								
								// show 
								DOM.addClass('#J_Tmsg', 'tmsg-selected');

								// 显示 panel
								var listSize = self.getListSize();

								DOM.css('#J_TmsgPanel', listSize);

								DOM.removeClass('#J_TmsgPanel', 'tmsg-hidden');

								self.hideDetailLoading();

								// 内容初始化
								T[type] && T[type].init(data.list, {
									tab: type,
									total: num,
									page: 1,
									size: Math.min(num, 10)
								});

								// hide list
								self.hideList();

								// 放到最后，以免影响内容的展示
								self.removeMsg(target);

							});
							
						}else {
							self.hideList();
							
							T.use('error',function() {
								T.error.loadDetailError();
							});
						}
					}

				);			
				
			},
		
			// 隐藏消息框
			hideContent: function() {

				DOM.addClass('#J_TmsgPanel', 'tmsg-hidden');
				DOM.html('#J_TmsgPanel', '');
				DOM.removeClass('#J_Tmsg', 'tmsg-selected');
				isLoadingDetail = false;

			},

			// 获取 list 尺寸
			getListSize: function() {

				var list = DOM.get('#J_TmsgListDetail');

				return {
					width: DOM.css(list, 'width') || 0, 
					height: DOM.css(list, 'height') || 0
				};

			},

			// 移除消息类型
			removeMsg: function(target) {

				var type = DOM.attr(target,'data-type'),
					i = 0, len = msgMenu.length,
					ul = DOM.parent(target, 'ul'),
					item;

				for (; i < len; i++) {

					item = msgMenu[i];

					if (type === item['url']) {

						item['num'] = 0;
						// 如果不是本地，则清除本地存储
						'1.2.0' && umpp.clear(item['url']);

						break;

					}

				}

				DOM.remove(DOM.parent(target, 'li'));

				if (DOM.children(ul).length < 1) {

					this.renderList();

				}

				// 更新数字
				this.renderMsgNum();

			},
			
			// 显示加载状态
			showDetailLoading: function(target) {

				isLoadingDetail = true;

				// 插入loading状态
				loadingImgObj = DOM.create('<span class="tmsg-menu-item-loading"><img src="' + loadingImg + '"/></span>');
				DOM.append(loadingImgObj, target);

			},
			
			// 隐藏加载状态
			hideDetailLoading: function() {
				DOM.remove(loadingImgObj);
				isLoadingDetail = false;
			},

			
			ignoreMsg: function(target, forceDel) {
			
				var self = this,
					type = DOM.attr(DOM.parent(target),'data-type');
					
				//忽略的统计
				T.sendStatistic(sc['ignore_'+type]);
				
				T.getToken(function(token) {

					IO.jsonp(

						ignoreURL,
						
						{ tab: type, m_token: token, 'do': forceDel || false }, 

						function(data) {
							if( data.status == '-2') {
								T.use('error',function() {
									T.error.noLogin();
								});
							}
							
							if (!forceDel) {
								if( data.status == '0' && data.num == 2) {

									var tips = DOM.create(IGNORE_NOTICE); 
									
									DOM.insertAfter(tips, target);

									isLoadingDetail = true;

								}else {
									self.removeMsg(DOM.parent(target,'.J_MenuItemHandler'));
								}

							} else {

								if( (data.num == 3) && (data.status = '0') ) {
									self.removeMsg(DOM.parent(target,'.J_MenuItemHandler'));
								}

							}

						}

					);

				});

			}
		};

	},

	{
		requires: ['core']
	}

);


/**
 * @fileoverview tmsg.
 * @author 释然<shiran@taobao.com>
 */
KISSY.add('tbc/tmsg/1.2.0/index', function(S) { 

		var T = TMsg,
			styleSheet = '1.2.0' ? (T.cdnHost + '/tbc/tmsg/' + '1.2.0' + '/index-min.css') : 'index.css';

		//T.sm.init();
		if (!T.isKS16) {

			S.getScript(styleSheet, function() {

				// 请求到 css 后加载 html，以免裸奔。。。
				T.Message.init();

			});

		} else {

			// 1.1.6 无法如上使用，所以单独处理
			S.getScript(styleSheet); 

			T.Message.init();

		}

	},

	{
		requires: ['core', 'tbc/tmsg/1.2.0/mods/core', 'tbc/tmsg/1.2.0/mods/messenger', 'tbc/tmsg/1.2.0/mods/umpp', 'tbc/tmsg/1.2.0/mods/init']		
	}

);

