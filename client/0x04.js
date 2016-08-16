/*
	0x04.js
	Browser
*/

Browser = (function() {
	function CustomInfo() {};
	var _ua = navigator.userAgent.toLowerCase(), _v = navigator.vendor, _p = navigator.platform, vs = "version";
	var db = [
		{ s: _ua, 		ss: "chrome", 	i: "chrome" },
		{ s: _ua, 		ss: "omniweb", 	i: "omniweb", 	vs: "omniweb" },
		{ s: _v, 		ss: "apple", 	i: "safari", 	vs: "version" },
		{ prop: window.opera, 			i: "opera", 	vs: "version" },
		{ s: _v, 		ss: "icab", 	i: "iCab" },
		{ s: _v, 		ss: "kde", 	i: "konqueror" },
		{ s: _ua, 		ss: "firefox", 	i: "firefox" },
		{ s: _v, 		ss: "camino", 	i: "camino" },
		{ s: _ua, 		ss: "netscape", i: "netscape" },
		{ s: _ua, 		ss: "msie", 	i: "explorer", 	vs: "msie" },
		{ s: _ua, 		ss: "gecko", 	i: "mozilla", 	vs: "rv" },
		{ s: _ua, 		ss: "mozilla", 	i: "netscape", 	vs: "mozilla" }
	];
	var dos = [
		{ s: _ua, 		ss: "ipod", 	i: "osx" },
		{ s: _ua, 		ss: "iphone", 	i: "osx" },
		{ s: _ua, 		ss: "ipad", 	i: "osx" },
		{ s: _p, 		ss: "win", 	i: "windows" },
		{ s: _p, 		ss: "mac", 	i: "osx" },
		{ s: _p, 		ss: "linux", 	i: "linux" },
		{ s: _ua, 		ss: "android", 	i: "linux" },
		{ s: _ua, 		ss: "froyo", 	i: "linux" },
		{ s: _ua, 		ss: "ginger", 	i: "linux" },
		{ s: _ua, 		ss: "icecream", 	i: "linux" }
	];
	var ddv = [
		{ s: _ua, 		ss: "(playbook", 	i: "blackberry" },
		{ s: _ua, 		ss: "(bb10", 	i: "blackberry" },
		{ s: _ua, 		ss: "nexus", 	i: "nexus" },
		{ s: _ua, 		ss: "sprint", 	i: "htc" },
		{ s: _ua, 		ss: "symbianOS", 	i: "nokia" },
		{ s: _ua, 		ss: "sony", 	i: "sony" },
		{ s: _ua, 		ss: "lg", 	i: "lg" },
		{ s: _ua, 		ss: "samsung", 	i: "samsung" },
		{ s: _ua, 		ss: "ipod", 	i: "apple" },
		{ s: _ua, 		ss: "ipad", 	i: "apple" },
	];
	var r = new CustomInfo;
	r.s1 = function(arr) {
		for (var i = 0; i < arr.length; i++) {
			var ds = arr[i].s, dp = arr[i].prop;
			r.vss = arr[i].vs || arr[i].i;
			if (ds) { if (ds.indexOf(arr[i].ss) != -1) return arr[i].i; }
			else if (dp) return arr[i].i;
		}
	}
	r.s2 = function(arg) {
		var index = arg.indexOf(r.vss); if (index == -1) return; 
		return parseFloat(arg.substring(index + r.vss.length + 1));
	};
	r.init = function () {
		r.name = r.s1(db) || "An unknown browser";
		r[vs] = r.s2(_ua) || r.s2(navigator.appVersion) || "an unknown version";
		r.OS = r.s1(dos) || "an unknown OS";
		r.device = r.s1(ddv) || "unkown device";
		r.touchEnabled = (function () { return !!('ontouchstart' in window); })();
		r.webkit = /webkit\//i.test(_ua);
		r.gecko = /gecko\//i.test(_ua);
		r.trident = /trident\//i.test(_ua);
		r.presto = /presto\//i.test(_ua);
		r.chrome = (r.name=="Chrome");
		r.firefox = (r.name=="Firefox");
		r.ie = (r.name == "Explorer");
		r.ie9 = r.ie && (r[vs] == 9); r.ie8 = r.ie && (r[vs] == 8); r.ie7 = r.ie && (r[vs] == 7); r.ie6 = r.ie && (r[vs] == 6);
		r.ff = (r.name == "Firefox");
		r.safari = (r.name == "Safari");
		r.opera = (r.name == "Opera");
		r.lang = (window.navigator.userLanguage || window.navigator.language);
		r.variavel = true;
		console.log("language:",r.lang);
	}
	r.init();
	
	delete r.s1;
	delete r.s2;
	delete r.init;
	return r;
})();


var BrowserTools = {};

BrowserTools.setStyle = function(target,opt,inner) {
	if("dispose" in opt) {
		
		if("events" in opt) for(var key in opt.events) {
			if( Object.prototype.toString.apply(opt.events[key]) == "[object Array]" ) {
				for(var x = 0; x < opt.events[key].length;x++ ) {
					target.removeEventListener(key,opt.events[key][x]);
				}
			} else {
				target.removeEventListener(key,opt.events[key]);	
			}
		}
		console.log("disposing.");
		
	} else {
		
		for(var key in opt) { if(key!="events" && key!="attribs" && key!="value") target.style[key] = opt[key]; } 
		if(inner) target.innerHTML = inner; 
		if("events" in opt) for(var key in opt.events) {
			if( Object.prototype.toString.apply(opt.events[key]) == "[object Array]" ) {
				if( opt.events[key].length > 1 && Object.prototype.toString.apply( opt.events[key][ 1 ] ) == "[object Boolean]" ) {
					// pwm 50%
					for(var x = 0; x < opt.events[key].length;x+=2 ) {
						target.addEventListener(key,opt.events[key][x],opt.events[key][x+1]);
					}
				} else {
					if( Object.prototype.toString.apply( opt.events[key][ opt.events[key].length -1 ] ) == "[object Boolean]" ) {
						for(var x = 0; x < opt.events[key].length;x++ ) {
							target.addEventListener(key,opt.events[key][x],opt.events[key][ opt.events[key].length -1 ]);
						}
					} else { // default
						for(var x = 0; x < opt.events[key].length;x++ ) {
							target.addEventListener(key,opt.events[key][x]);
						}	
					}
				}
			} else {
				//console.log("defining click 2",opt.events[key])
				//console.log(key);
				target.addEventListener(key,opt.events[key]);	
			}
		}
		if("attribs" in opt) for(var key in opt.attribs) target.setAttribute(key,"" + opt.attribs[key]);
		if("value" in opt) target.value = opt.value;
	}
}

BrowserTools.arraySetStyle = function(target,opt) { 
	for(var key in opt) if(key !="events" && key !="attribs" && key != "value") for(var x = 0; x < target.length;x++) target[x].style[key] = opt[key];
	if(inner) for(var x = 0; x < target.length;x++) target[x].innerHTML = inner;
	if("events" in opt) for(var key in opt.events) for(var x = 0; x < target.length;x++) target[x].addEventListener(key, opt.events[key]);
	if("attribs" in opt) for(var key in opt.attribs) for(var x = 0; x < target.length;x++) target[x].setAttribute(key, "" + opt.attribs[key]);
	if("value" in opt) for(var x = 0; x < target.length;x++) target[x].value = opt.value;
}

BrowserTools.inoutStyle = function(a,b) {
	var self = this;
	this.addEventListener("mouseover",function() { for(var key in a) self.style[key] = a[key]; });
	this.addEventListener("mouseout",function() { for(var key in b) self.style[key] = b[key]; });
}
BrowserTools.inIframe = function() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}


var JSONTools = {};
JSONTools.pretty_stringfy = function(json) {
	var debug = false;
	var cache = {};
	function tabs(n) {
		if(n in cache) return cache[n];
		cache[0] = "";
		cache[1] = "\t";
		for(var x = 2; x <= n;x++) cache[x] = cache[x-1] + "\t";
		return cache[n];
	}
	function str_format(str) {
		var ret = [];
		for(var x = 0; x < str.length;x++) {
			if(str.charAt(x) == 9 ) {
				ret.push("\\t");
			} else if(str.charAt(x) == 10 ) {
				ret.push("\\n");
			} else if(str.charAt(x) == 13 ) {
				ret.push("\\r")
			} else {
				ret.push(str.charAt(x));
			}
		}
		return "\"" + ret.join("") + "\"";
	}
	function json_obj(builder,target,level) {
		if(level==0) builder.push(tabs(level) + "{");
		var keys = [];
		for(var key in target) {
			
			keys.push(key);
		}
		keys.sort();
		for(var x = 0; x < keys.length;x++) {
			var key = keys[x];
			var val = target[ key ];
			var type = Object.prototype.toString.apply(val);
			var comma = (x>0) ? "," : " ";
			if(type == "[object String]") {
				builder.push(tabs(level+1) + comma + "\"" + key + "\" : " + str_format(val) );
			} else if(type == "[object Number]") {
				builder.push(tabs(level+1) + comma + "\"" + key + "\" : " + val );
			} else if(type == "[object Array]") {
				builder.push(tabs(level+1) + comma + "\"" + key + "\" : [");
				json_arr( builder, val, level+1);
			} else if(type == "[object Object]") {
				builder.push(tabs(level+1) + comma + "\"" + key + "\" : {");
				json_obj( builder, val, level+1);
			} else {
				throw "not implemented."
			}
		}
		if(level==0) builder.push(tabs(level) + "}");
		else builder.push(tabs(level) + "}");
	}
	function json_arr(builder,target,level) {
		
		if(level==0) builder.push(tabs(level) + "[");
		var keys = [];
		for(var key in target) keys.push(key);
		keys.sort();
		for(var x = 0; x < keys.length;x++) {
			var key = keys[x];
			var val = target[ key ];
			var type = Object.prototype.toString.apply(val);
			var comma = (x>0) ? "," : " ";
			if(type == "[object String]") {
				builder.push(tabs(level+1) + comma + str_format(val) );
			} else if(type == "[object Number]") {
				builder.push(tabs(level+1) + comma + val );
			} else if(type == "[object Array]") {
				builder.push(tabs(level+1) + comma + "[");
				json_arr( builder, val, level+1);
			} else if(type == "[object Object]") {
				builder.push(tabs(level+1) + comma + "{");
				json_obj( builder, val, level+1);
			} else {
				throw "not implemented."
			}
		}
		if(level==0) builder.push(tabs(level) + "]");
		else builder.push(tabs(level) + "]");
	}
	var build = [];
	json_obj(build,json,0);
	return build.join("\r\n");
}


if("localStorage" in window) {
	// front-end developer level protect against unawareness
	var save = window.localStorage.setItem;
	var load = window.localStorage.getItem;
	// reserved keys
	var reserved = ["index"];
	
	
	Object.defineProperty( window.localStorage, "setItem", { 
		configurable : false,
		get : function() { 
			return function(key,value) {
				if( reserved.indexOf( key ) > -1 ) {
					throw "use setReservedItem, be carefull.";
				} else {
					return save.apply(window.localStorage,[key,value]);
				}
			}
		}
	});
	Object.defineProperty( window.localStorage, "setReservedItem", { 
		configurable : false,
		get : function() { 
			return function(key,value) {
				if( reserved.indexOf( key) > -1 ) {
					return save.apply(window.localStorage,[key,value]);	
				} else {
					throw "use setItem";
				}
			}
		}
	});
	Object.defineProperty( window.localStorage, "getItem", {
		configurable : false,
		get : function() {
			return function(key) {
				if( reserved.indexOf( key ) > -1 ) {
					throw "use getReservedItem, be careful.";
				} else {
					return load.apply(window.localStorage,[key]);
				}
			};
		}
	});
	Object.defineProperty( window.localStorage, "getReservedItem",{
		configurable : false,
		get : function() {
			return function(key) {
				if( reserved.indexOf( key) > -1 ) {
					return load.apply(window.localStorage,[key]);
				} else {
					throw "use setItem";
				}
			};
		}
	});
	
}
