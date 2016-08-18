
var selection_start_backup = document.onselectstart;
function no_selection(target) {
	target.addEventListener("selectstart",function(e) { e.preventDefault(); return false; });
}

console.log("DEF BASE");

Router.addTemplate("base",function(args) {
	//console.log("base template");
	base_container.apply(this);
	var origin_lt = this.Container().elementNew("origin_lt","div");
	origin_lt.style.position = "absolute";
	origin_lt.style.left = "0px";
	origin_lt.style.top = "0px";
	origin_lt.style.width = "0px";
	origin_lt.style.height = "0px";
	
	var origin_lt_map = this.Container().elementNew("origin_lt_map","div");
	origin_lt_map.style.position = "absolute";
	origin_lt_map.style.left = "0px";
	origin_lt_map.style.top = "0px";
	origin_lt_map.style.width = "0px";
	origin_lt_map.style.height = "0px";
	origin_lt_map.style.zIndex = 50;
	
	var origin_rt = this.Container().elementNew("origin_rt","div");
	origin_rt.style.position = "absolute";
	origin_rt.style.right = "0px";
	origin_rt.style.top = "0px";
	origin_rt.style.width = "0px";
	origin_rt.style.height = "0px";
	
	var origin_lt_container = this.Container().elementGetContents("origin_lt");
});
function base_container() {
	this.container.style.position = "absolute";
	this.container.style.left = "0px";
	this.container.style.top = "0px";
	this.container.style.width = "1px";
	this.container.style.height = "1px";
}
Router.addPage({name:"login",template:"base"},function(args,template) { // loaded presentation, communications panel
	var self = this;
	base_container.apply(this);
	
	var origin_lt_container = template.Container().elementGetContents("origin_lt");
	var origin_lt = template.Container().elementGet("origin_lt");
	origin_lt_container.elementsClear();
	var w = window.innerWidth || document.documentElement.clientWidth || body.clientWidth,
	h = window.innerHeight|| document.documentElement.clientHeight|| body.clientHeight;
	var $ = BrowserTools.setStyle;
	var $$ = BrowserTools.arraySetStyle;	
	var p = origin_lt_container.elementNewPacket(
		"<div id=\"panelLogin\" style=\"position:absolute;left:"+(w/2-200)+"px;top:"+(h/2-320)+"px;width:400px;height:640px;border:solid 1px #000;background-color:#ec3;\">"+
			
			/*
				cartao 320px X 240px
				
				qual o tamanho do cache da memória humana no tempo? quanto tempo de história pode ser contada de modo fidedigna?
			*/
			"<table cellpadding=\"0\" cellspacing=\"0\" border=\"1\" style=\"position:absolute;left:40px;width:320px;height:240px;top:30px;\">"+
				"<tr><td></td><td></td><td></td><td></td><td></td></tr>"+
				"<tr><td></td><td></td><td></td><td></td><td></td></tr>"+
				"<tr><td></td><td></td><td height=\"200\" style=\"font-size:10px;\"><text value=\"demonstration screen\"/></td><td></td><td></td></tr>"+
				"<tr><td></td><td></td><td></td><td></td><td></td></tr>"+
				"<tr><td></td><td></td><td></td><td></td><td></td></tr>"+
			"</table>"+
			"<table cellpadding=\"0\" cellspacing=\"0\" style=\"position:absolute;left:60px;top:280px;\">"+
				"<tr>"+
					"<td style=\"padding:20px;\">"+
					"<table cellpadding=\"0\" cellspacing=\"0\" border=\"1\">"+
						"<tr>"+
						"<td colspan=\"2\" style=\"font-family:Tahoma;font-size:30px;\"><text value=\"Acesso\"/></td>"+
						"</tr>"+
						"<tr>" + 
							"<td align=\"right\" valign=\"top\" style=\"\"><text value=\"usuario:\"/></td>"+
							"<td valign=\"top\">"+
								"<input id=\"login_username\" type=\"text\" style=\"border:solid 1px #000;padding:1px;\"/>"+
							"</td>"+
						"</tr>" + 
						"<tr>" + 
							"<td align=\"right\" valign=\"top\"><text value=\"senha:\"/></td>"+
							"<td valign=\"top\"><input id=\"login_password\" type=\"password\" style=\"border:solid 1px #000;padding:1px;\"/></td>"+
						"</tr>"+
						"<tr>"+
							"<td></td>"+
							"<td id=\"login_btn\" style=\"font-family:Tahoma;font-size:16px;cursor:pointer;\"><text value=\"Acessar\"/></td>"+
						"</tr>"+
						"<tr>"+
							"<td colspan=\"2\" style=\"font-family:Tahoma;font-size:30px;\"><text value=\"Registro\"/></td>"+
						"</tr>"+
						"<tr>"+
							"<td align=\"right\"><text value=\"usuario : \"/></td>"+
							"<td>"+
								"<input id=\"register_username\" type=\"text\" style=\"border:solid 1px #000;padding:1px;\"/>"+
							"</td>"+
						"</tr>"+
						"<tr>"+
							"<td align=\"right\"><text value=\"senha : \"/></td>"+
							"<td>"+
								"<input id=\"register_password1\" type=\"password\" style=\"border:solid 1px #000;padding:1px;\"/>"+
							"</td>" +
						"</tr>"+
						"<tr>"+
							"<td align=\"right\"><text value=\"senha : \"/></td>"+
							"<td>"+
								"<input id=\"register_password2\" type=\"password\" style=\"border:solid 1px #000;padding:1px;\"/>"+
							"</td>"+
						"</tr>"+
						"<tr>"+
							"<td align=\"right\"><text value=\"token : \"/></td>"+
							"<td>"+
								"<input id=\"register_token\" type=\"text\" style=\"border:solid 1px #000;padding:1px;\"/>"+
							"</td>"+
						"</tr>"+
						"<tr>"+
							"<td></td>"+
							"<td id=\"register_btn\" style=\"font-family:Tahoma;font-size:16px;cursor:pointer;\"><text value=\"Registrar\"/></td>"+
						"</tr>"+
					"</table>"+
					"</td>"+
				"</tr>"+
			"</table>"+
			"<div id=\"lblErrorMessage\" style=\"position:relative;top:570px;border:solid 1px #f00;background-color:#fff;color:#000;display:none;padding:5px;\"></div>"+
		"</div>"
	);
	
	p.el.login_username.value = "";
	p.el.login_password.value = "";
	function submit_login() {
		var username = p.el.login_username.value;
		Hash.sha3_512_start();
		var args = {
			username : p.el.login_username.value,
			password : Hash.sha3_512_iter(p.el.login_password.value).data
		};
		Import({url:"/json.login",method:"get",json:true,data:args})
			.done(function(data) {
				//alert(JSON.stringify(data));
				if(data.result) {
					localStorage.setItem("csrf-cookie",data.csrf_cookie);
					localStorage.setItem("username",username);
					//document.getElementById("panelLogin").style.display = "none";
					//document.getElementById("lblErrorMessage").style.display = "none";
					//load_terminal();
					//logout.style.display = "";
					
					// goto
					History.go("#home");
					
				} else {
					var error = p.el.lblErrorMessage;
					error.innerHTML = data.message;
					error.style.display = "";
				}
				p.el.login_username.value = "";
				p.el.login_password.value = "";
			})
			.fail(function(error) {
				var error = p.el.lblErrorMessage;
				error.innerHTML = error.message;
				error.style.display = "";
			})
			.send();
	}
	function submit_register() {
		var username = p.el.register_username.value;
		if(p.el.register_password1.value == p.el.register_password2.value) {
			Hash.sha3_512_start();
			var args = {
				username : p.el.register_username.value,
				password : Hash.sha3_512_iter(p.el.register_password1.value).data,
				token : p.el.register_token.value
			};
			Import({url:"/json.register",method:"get",json:true,data:args})
				.done(function(data) {
					if(data.result) {
						localStorage.setItem("csrf-cookie",data.csrf_cookie);
						localStorage.setItem("username",username);
						History.go("#home");
						
					} else {
						var error = p.el.lblErrorMessage;
						error.innerHTML = data.message;
						error.style.display = "";
					}
					p.el.register_username.value = "";
					p.el.register_password1.value = "";
					p.el.register_password2.value = "";
					p.el.register_token.value = "";
				})
				.fail(function(error) {
					var error = p.el.lblErrorMessage;
					error.innerHTML = error.message;
					error.style.display = "";
				})
				.send();
		} else {
			var error = p.el.lblErrorMessage;
			error.innerHTML = "please, retype password correctly.";
			error.style.display = "";
			register_password1.value = "";
			register_password2.value = "";
			//alert("please, retype password correctly.");
		}
	}
	$(p.el.login_username,{
		events : {
			keydown : function(e) {
				if(e.keyCode==13) { submit_login(); }
			}
		}
	});
	$(p.el.login_password,{
		events : {
			keydown : function(e) {
				if(e.keyCode==13) { submit_login(); }
			}
		}
	});
	$(p.el.login_btn,{
		events : {
			click : function() {
				submit_login();
			}
		}
	});
	$(p.el.register_btn,{
		events : {
			click : function() {
				submit_register();
			}
		}
	});
	
	
	var start_page = "home";
	var csrf_cookie = localStorage.getItem("csrf-cookie");
	if(csrf_cookie == null || csrf_cookie == undefined || csrf_cookie == "undefined") {
		
	} else {
		Import({url:"/json.login",method:"get",json:true,data:{csrf_cookie:csrf_cookie}})
			.done(function(data) {
				// if fail to authenticate then load login screen
				if(data.result) {
					History.go("#home");
				}
			})
			.fail(function(error) {
			})
			.send();
			
	}
	
	UI.Window.on("resize",function() {
		console.log("window resize");
		var w = window.innerWidth || document.documentElement.clientWidth || body.clientWidth,
		h = window.innerHeight|| document.documentElement.clientHeight|| body.clientHeight;
		
		$(p.el.panelLogin,{
			left: (w/2-200)+"px",
			top : (h/2-320)+"px"
		});
		
	});
	
});

Router.addPage({name:"home",template:"base"},function(args,template) { // loaded presentation, communications panel
	var self = this;
	base_container.apply(this);
	
	var origin_lt_container = template.Container().elementGetContents("origin_lt");
	var origin_lt = template.Container().elementGet("origin_lt");
	origin_lt_container.elementsClear();
	var w = window.innerWidth || document.documentElement.clientWidth || body.clientWidth,
	h = window.innerHeight|| document.documentElement.clientHeight|| body.clientHeight;

	var $ = BrowserTools.setStyle;
	var $$ = BrowserTools.arraySetStyle;	
	
	var p = origin_lt_container.elementNewPacket(
		"<div id=\"logout_btn\" style=\"position:absolute;left:"+(w-100)+"px;top:0px;padding:10px;background-color:#000;color:#fff;font-family:Impact;font-size:20px;cursor:pointer;\">"+
		"<text value=\"logout\"/>"+
		"</div>"
	);
	
	$(p.el.logout_btn,{
		events : {
			click : function() { 
				var csrf_cookie = localStorage.getItem("csrf-cookie");
				var args = {csrf_cookie:csrf_cookie};
				Import({url:"/json.logout",method:"get",json:true,data:args})
					.done(function(data) {
						if(data.result) {
							localStorage.setItem("csrf-cookie",null);
							delete localStorage["csrf-cookie"];
							localStorage.setItem("username",null);
						}
						History.go("#login");
					})
					.fail(function(error) {
					})
					.send();
			}
		}
	});
	
	UI.Window.on("resize",function() {
		console.log("window resize");
		var w = window.innerWidth || document.documentElement.clientWidth || body.clientWidth,
		h = window.innerHeight|| document.documentElement.clientHeight|| body.clientHeight;
		$(p.el.logout_btn,{
			left : (w-100) + "px"
		});
		
	});
	
});

UI.boot(function() {
	// clear all previous html components, that might be saved with save file.
	
	var body = document.getElementsByTagName("body")[0];
	body.visited = false;
	var stack = [body];
	// remove leafs before
	var k = 0;
	while(stack.length>0) {
		var item = stack.pop();
		//console.log(k++,item);
		
		var pushed = false;
		
		if( item.childNodes.length > 0 && item.visited == false) {
			item.visited = true;
			stack.push(item);
			
			
			for(var x = 0; x < item.childNodes.length;x++) {
				item.childNodes[x].visited = false;
				stack.push( item.childNodes[x] );
			}
			
			pushed = true;
			
		}
		
		var removed = false;
		
		if(!pushed && stack.length>0 && item!= body) { // leaf
			if(item.parentNode!=null)
				item.parentNode.removeChild( item );
			removed = true;
		}
		
		if(item.visited && !removed && stack.length>0 && item != body) { // maybe not leaf but already used
			item.parentNode.removeChild( item );
			removed = true;
		}
		
	}
	
	
	console.log("[UI.boot]");

})
UI.init(function() {
	// app mode
	console.log("[UI.init]");
	
	History.on("load",function(state) {
		console.log("loading:["+state+"]");
	});
	History.on("unload",function(state) {
		console.log("unloading:["+state+"]");
	});
	History.init();
	
	//console.log("-- STYLES");
	UI.Body.style.printList();
	console.log();
	
	
	/*
	var start_page = "home";
	var range_resolution = [640,800,960,1024,1152,1280,1360,1440,1680,1920,1920];
	var default_resolution = 10;
	var selected_resolution = -1;
	var activated = false;
	
	function set_resolution_mode(res) {
		var hash = History.getHash();
		var hash_arr = hash.split(":");
		if(hash_arr.length>0) {
			if(hash_arr[0]=="") hash_arr[0] = start_page;
			if(hash_arr.length>1) hash_arr.pop();
			hash = hash_arr.join(":");
		} else {
			hash = start_page;
		}
		//console.log("hash:",hash.split(":"),"res:", res);
		if(res) {
			if(hash=="") { History.go("#"+start_page+":"+res); }
			if( hash.split(":").length <= 1 ) { History.go("#" + hash + ":" + res); }
		} else {
			if(hash=="") { History.go("#"+start_page); }
			if( hash.split(":").length <= 1 ) { History.go("#" + hash); }
		}
	}
	function select_resolution_mode() {
		for(var x = 0; x < range_resolution.length;x++) {
			if(x==0 && window.innerWidth < range_resolution[x]) {
				if(selected_resolution==-1 || selected_resolution!=x) {
					set_resolution_mode((range_resolution[x])>>>1);
					selected_resolution = x;
				}
				break;
			} else if(x>0 && window.innerWidth >= range_resolution[x-1] && window.innerWidth < range_resolution[x] && (x-1)!=selected_resolution) {
				if(selected_resolution==-1 || selected_resolution!=x) {
					set_resolution_mode(range_resolution[x-1]);
					selected_resolution = x;
				}
				break;
			} else if(window.innerWidth >= range_resolution[x] && x == range_resolution.length-1) {
				if(selected_resolution==-1 || selected_resolution!=x) {
					set_resolution_mode(range_resolution[x]);
					selected_resolution = x;
				}
				break;
			} else if(x==range_resolution.length-1) {
				if(selected_resolution==-1 || selected_resolution!=x) {
					set_resolution_mode(range_resolution[default_resolution]);
					selected_resolution = default_resolution;
				}
			}
		}
	}
	select_resolution_mode();
	*/
	
	var start_page = "home";
	var csrf_cookie = localStorage.getItem("csrf-cookie");
	if(csrf_cookie == null || csrf_cookie == undefined || csrf_cookie == "undefined") {
		start_page = "login";
	} else {
		Import({url:"/json.login",method:"get",json:true,data:{csrf_cookie:csrf_cookie}})
			.done(function(data) {
				// if fail to authenticate then load login screen
				if(data.result) {
					start_page = "home";
				} else {
					start_page = "login";
				}
			})
			.fail(function(error) {
			})
			.send();
			
	}
	
	var hash = History.getHash();
	var hash_arr = hash.split(":");
	if(hash_arr.length>0) {
		if(hash_arr[0]=="") hash_arr[0] = start_page;
		hash = hash_arr.join(":");
	} else {
		hash = start_page;
	}
	History.go("#"+hash);
	
	UI.Window.on("resize",function() {
		//select_resolution_mode();
	});
	
});
