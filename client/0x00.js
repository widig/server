
/*
	roteiro do sistema
		
		ajax to get answers
		then
		1)
		send login form
		then
		receive login form
		then
			update to command window in case of succed login
				send command form
					[ word (topico) | sentences (mote) | code(artigo) ]
					add word ( adicionar topico )
					list words ( listar topicos )
						list instance of word ( listar items usando pesquisa )
					remove word ( remover topicos )
					add instance of word ( adicionar item ao topico ) -> json :: drawing, point, message, number, audio, video
					find instance of word ( procurar items usando topico )
						remove instance of word ( remover items usando pesquisa )
					add sentence ( adicionar mote )
					find senteces ( procurar mote )
						remove sentence ( remove mote )
					add instance of sentence ( adicionar conjunto de items dos topicos do mote )
					find instances of sentence ( procurar items dos topicos do mote )
						remove instances of sentence ( remover conjunto de items dos topicos do mote )
						refine search of instances of sentence ( especificar mote )
					ask [interface] on sentence. ( adicionar eventos de mote )
					
			clear screen window in case of fail login
			
			// abstraction :
			//	word -> word instance -> sentence item reference
			//	word -> word instance
			4) log actions
		2) remember login
		3) create login (token)
		
*/

function ImportInstanceHeader() {
	this.url = "";
	this.method = "get";
	this.data = {};
	this.json = false;
	this.headers = [];
};
ImportInstanceHeader.prototype.formatArguments = function() {
	var arr = [], str;
	for(var name in this.data) {
		arr.push(name + '=' + encodeURIComponent(this.data[name]));
	}
	str = arr.join('&');
	if(str != '') {
		return this.method == "get" ? 
			(this.url.indexOf('?') < 0 ? '?' + str : '&' + str) : 
			str;
	}
	return '';
}
function Import(opt) {
	if(!( this instanceof Import )) return new Import(opt);
	this.host = {};
	this.doneCallback = null;
	this.failCallback = null;
	this.xhr = null;
	this.info = new ImportInstanceHeader;
	if(Object.prototype.toString.apply(opt)=="[object String]") {
		this.info.url = opt;
	}
	if(Object.prototype.toString.apply(opt)=="[object Object]") {
		if("url" in opt) this.info.url = opt.url;
		if("method" in opt) this.info.method = opt.method;
		if("data" in opt) this.info.data = opt.data;
		if("json" in opt) this.info.json = opt.json;
	}
}
Import.prototype.done = function(callback) { this.doneCallback = callback; return this; };
Import.prototype.fail = function(callback) { this.failCallback = callback; return this; };
Import.prototype.always = function(callback) { this.alwaysCallback = callback; return this; };
Import.prototype.setHeaders = function(headers) {
	this.info.headers = headers;
	for(var name in this.info.headers) { this.xhr && this.xhr.setRequestHeader(name, this.info.headers[name]); }
	return this;
};
Import.prototype.send = function() {
	if(this.info.url.indexOf("localServer://")==0) {// mock server (GET)
		// find local servers
		
		// set callbacks for the request instance
		
		// set parameters of request
		
		// get localstorage data associated to url and send to worker, wait for response
		
		
	} else {
		var self = this;
		if(window.ActiveXObject) { 
			this.xhr = new ActiveXObject('Microsoft.XMLHTTP'); 
		} else if(window.XMLHttpRequest) { 
			this.xhr = new XMLHttpRequest();
		}
		if(!this.xhr) throw "xhr can't initiate.";
		this.xhr.onreadystatechange = function() {
			if(self.xhr.readyState == 4 && self.xhr.status == 200) {
				var result = self.xhr.responseText;
				if(self.info.json === true && typeof JSON != 'undefined') {
					result = JSON.parse(result);
				}
				self.doneCallback && self.doneCallback.apply(self.host, [result, self.info]);
			} else if(self.xhr.readyState == 4) {
				self.failCallback && self.failCallback.apply(self.host, [self.info]);
			}
			self.alwaysCallback && self.alwaysCallback.apply(self.host, [self.info]);
		}
		if(this.info.method == 'get') {
			this.xhr.open("GET", this.info.url + this.info.formatArguments(), true);
		} else if(this.info.method=="post"){
			this.xhr.open("POST", this.info.url, true);
			this.setHeaders({
				'X-Requested-With': 'XMLHttpRequest',
				'Content-type': 'application/x-www-form-urlencoded'
			});
		} else {
			this.xhr.open("GET", this.info.url + this.info.formatArguments(), true);
		}
		if(this.info.headers && typeof this.info.headers == 'object') {
			for(var name in this.info.headers) this.xhr && this.xhr.setRequestHeader(name, this.info.headers[name]);
		}
		if(this.info.method=="post") {
			self.xhr.send(this.info.formatArguments());
		} else {
			self.xhr.send();
		}
		return this;
	}
};
function ImportList(import_arr) {
	if(!( this instanceof ImportList )) return new ImportList(import_arr);
	this.fetch = import_arr;
	this.complete = false;
	this.data = [];
}
ImportList.prototype.done = function(callback) { this.doneCallback = callback; return this; };
ImportList.prototype.fail = function(callback) { this.failCallback = callback; return this; };
ImportList.prototype.always = function(callback) { this.alwaysCallback = callback; return this; };
ImportList.prototype.send = function() {
	
	//console.log("@@@@@@@@ IMPORT LIST SEND");
	var self = this;
	var _done = function(x,a,b) {
		//console.log("@@@@@@@@ IMPORT LIST RECEIVE");
		self.data[x].result = a;
		self.data[x].info = b;
		self.data[x].state |= 1;
		
		var check = false;
		var allok = true;
		var results = [];
		var infos = [];
		for(var _x = 0; _x < self.data.length; _x++) {
			//console.log("        x:",_x,self.data.length,self.data[_x].state);
			if( (self.data[_x].state & 0x1) == 0) {
				//console.log("break");
				check = true;
				break;
			} else {
				if( (self.data[_x].state & 0x2) != 0 ) {
					allok = false;
					results.push("");
					infos.push( self.data[_x].info );
				} else {
					results.push( self.data[_x].result );
					infos.push( self.data[_x].info );
				}
			}
			
		}
		
		if(!check) {
			if(allok) {
				self.doneCallback&&self.doneCallback.apply({},[results,infos]);
			} else {
				self.failCallback&&self.failCallback.apply({},[infos]);
			}
			self.alwaysCallback&&self.alwaysCallback.apply({},[infos]);
		}
		
	}
	var _fail = function(x,a) {
		//console.log("XHR FAIL:",a.url);
		self.data[x].info = a;
		self.data[x].state |= 2;
		
	}
	var _always = function(x,a) {
		
		self.data[x].info = a;
		self.data[x].state |= 4;
		//console.log("@@@@@@@@ IMPORT LIST ALWAYS",self.data[x].state);
		
			
	}
	
	var create_item = function(x,import_arr) {
		return { 
			state : 0,
			result : "",
			info : null,
			target : Import(import_arr[x])
				.done(function(a,b) {
					_done(x,a,b)
				})
				.fail(function(a,b) {
					_fail(x,a)
				})
				.always(function(a,b) {
					_always(x,a)
				})
		};
	}
	
	for(var x = 0; x < this.fetch.length;x++) {
		var item = create_item(x,this.fetch);
		if("headers" in this.fetch[x]) item.target.setHeaders(this.fetch[x].headers);
		this.data.push(item);
	}
	for(var x = 0; x < this.fetch.length;x++) {
		this.data[x].target.send();
	}
}
window.addEventListener("load",function() {
	// verify if localStorage has a crsf cookie -> try to auto login
	var logout = document.getElementById("btnLogout");
	logout.style.display = "none";
	logout.style.left = "800px";
	logout.addEventListener("mouseover",function() {
		logout.style.backgroundColor = "#000";
		logout.style.color = "#fff";
	});
	logout.addEventListener("mouseout",function() {
		logout.style.backgroundColor = "#fff";
		logout.style.color = "#000";
	});
	logout.addEventListener("mousedown",function() {
		var args = {};
		Import({url:"/json.logout",method:"get",json:true,data:args})
			.done(function(data) {
				localStorage.setItem("csrf-cookie",null);
				delete localStorage["csrf-cookie"];
				logout.style.display = "none";
				login_screen();
			})
			.fail(function(error) {
			})
			.send();
	});
	
	function login_screen() {
		document.getElementById("panelLogin").style.display = "";
		var login_username = document.getElementById("login_username");
		var login_password = document.getElementById("login_password");
		var login_btn =  document.getElementById("login_btn");
		login_btn.style.cursor = "pointer";
		login_btn.style.border = "solid 1px #000";
		login_btn.style.backgroundColor = "#000";
		login_btn.style.color = "#fff";
		
		login_username.value = "";
		login_password.value = "";
		function submit_login() {
			var args = {
				username : login_username.value,
				password : login_password.value
			};
			Import({url:"/json.login",method:"get",json:true,data:args})
				.done(function(data) {
					//alert(JSON.stringify(data));
					if(data.result) {
						localStorage.setItem("csrf-cookie",data.csrf_cookie);
						document.getElementById("panelLogin").style.display = "none";
						logout.style.display = "";
					}
					login_username.value = "";
					login_password.value = "";
				})
				.fail(function(error) {
					alert("error:",error);
				})
				.send();
		}
		login_username.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_login(); }
		});
		login_password.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_login(); }
		});
		login_btn.addEventListener("mouseover",function() {
			login_btn.style.borderTop = "solid 5px #000";
			login_btn.style.borderBottom = "solid 5px #000";
			login_btn.style.backgroundColor = "#fff";
			login_btn.style.color = "#000";
		});
		login_btn.addEventListener("mouseout",function() {
			login_btn.style.borderTop = "solid 1px #000";
			login_btn.style.borderBottom = "solid 1px #000";
			login_btn.style.backgroundColor = "#000";
			login_btn.style.color = "#fff";
		});
		login_btn.addEventListener("click",function(e) {
			submit_login();
		});
		
		
		var register_username = document.getElementById("register_username");
		var register_password1 = document.getElementById("register_password1");
		var register_password2 = document.getElementById("register_password2");
		var register_token = document.getElementById("register_token");
		var register_btn = document.getElementById("register_btn");
		register_btn.style.cursor = "pointer";
		register_btn.style.border = "solid 1px #000";
		register_btn.style.backgroundColor = "#000";
		register_btn.style.color = "#fff";
		function submit_register() {
			if(register_password1.value == register_password2.value) {
				var args = {
					username : register_username.value,
					password : register_password1.value,
					token : register_token.value
				};
				//console.log(JSON.stringify(args));
				Import({url:"/json.register",method:"get",json:true,data:args})
					.done(function(data) {
						if(data.result) {
							localStorage.setItem("csrf-cookie",data.csrf_cookie);
							document.getElementById("panelLogin").style.display = "none";
							logout.style.display = "";
						}
						register_username.value = "";
						register_password1.value = "";
						register_password2.value = "";
						register_token.value = "";
					})
					.fail(function(error) {
						alert("error:",error);
					})
					.send();
			} else {
				alert("please, retype password correctly.");
			}
		}
		
		register_username.value = "";
		register_password1.value = "";
		register_password2.value = "";
		register_token.value = "";
		register_username.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_register(); }
		});
		register_password1.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_register(); }
		});
		register_password2.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_register(); }
		});
		register_token.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_register(); }
		});
		register_btn.addEventListener("mouseover",function() {
			register_btn.style.borderTop = "solid 5px #000";
			register_btn.style.borderBottom = "solid 5px #000";
			register_btn.style.backgroundColor = "#fff";
			register_btn.style.color = "#000";
		});
		register_btn.addEventListener("mouseout",function() {
			register_btn.style.borderTop = "solid 1px #000";
			register_btn.style.borderBottom = "solid 1px #000";
			register_btn.style.backgroundColor = "#000";
			register_btn.style.color = "#fff";
		});
		register_btn.addEventListener("click",function() {
			submit_register();
		});
		
	}
	var csrf_cookie = localStorage.getItem("csrf-cookie");
	if(csrf_cookie == null || csrf_cookie == undefined || csrf_cookie == "undefined") {
		login_screen();
	} else {
		Import({url:"/json.login",method:"get",json:true,data:{csrf_cookie:csrf_cookie}})
			.done(function(data) {
				// if fail to authenticate then load login screen
				if(data.result) {
					document.getElementById("panelLogin").style.display = "none";
					logout.style.display = "";
				} else {
					login_screen();
				}
			})
			.fail(function(error) {
			})
			.send();
			
	}
});