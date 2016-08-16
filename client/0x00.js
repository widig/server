
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


/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = { // not default 
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._$",
	// public method for encoding
	encode : function (input) {
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = Base64._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
			this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
		}
		return output;
	},
	// public method for decoding
	decode : function (input) {
		var output = "";
		var chr1, chr2, chr3;
		var enc1, enc2, enc3, enc4;
		var i = 0;
		input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
		while (i < input.length) {
			enc1 = this._keyStr.indexOf(input.charAt(i++));
			enc2 = this._keyStr.indexOf(input.charAt(i++));
			enc3 = this._keyStr.indexOf(input.charAt(i++));
			enc4 = this._keyStr.indexOf(input.charAt(i++));
			chr1 = (enc1 << 2) | (enc2 >> 4);
			chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
			chr3 = ((enc3 & 3) << 6) | enc4;
			output = output + String.fromCharCode(chr1);
			if (enc3 != 64) {
				output = output + String.fromCharCode(chr2);
			}
			if (enc4 != 64) {
				output = output + String.fromCharCode(chr3);
			}
		}
		output = Base64._utf8_decode(output);
		return output;
	},
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			}
			else if((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			}
			else {
				c2 = utftext.charCodeAt(i+1);
				c3 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
}


function getBounds() {
	var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		screenWidth = w.innerWidth || e.clientWidth || g.clientWidth,
		screenHeight = w.innerHeight|| e.clientHeight|| g.clientHeight;
	return [screenWidth,screenHeight];
}






window.addEventListener("resize",function() {

});
window.addEventListener("load",function() {
	// verify if localStorage has a crsf cookie -> try to auto login
	
	
		    
	var logout = document.getElementById("btnLogout");
	logout.style.display = "none";
	
	logout.style.left = (getBounds()[0]-128) +"px";
	logout.style.top = "10px";
	logout.style.height = "20px";
	logout.style.width = "100px";
	logout.style.padding = "5px";
	logout.style.cursor = "pointer";
	logout.style.textAlign = "center";
	logout.addEventListener("mouseover",function() {
		logout.style.backgroundColor = "#000";
		logout.style.color = "#fff";
	});
	logout.addEventListener("mouseout",function() {
		logout.style.backgroundColor = "#fff";
		logout.style.color = "#000";
	});
	logout.addEventListener("mousedown",function() {
		var csrf_cookie = localStorage.getItem("csrf-cookie");
		var args = {csrf_cookie:csrf_cookie};
		Import({url:"/json.logout",method:"get",json:true,data:args})
			.done(function(data) {
				if(data.result) {
					localStorage.setItem("csrf-cookie",null);
					delete localStorage["csrf-cookie"];
					localStorage.setItem("username",null);
					document.getElementById("lblErrorMessage").style.display = "none";
					unload_logout();
				} else {
					var error = document.getElementById("lblErrorMessage");
					error.innerHTML = data.message;
					error.style.display = "";
				}
				logout.style.display = "none";
				console.log("logout");
				login_screen();
			})
			.fail(function(error) {
			})
			.send();
	});
	function unload_logout() {
		logout.style.display = "none";
		unload_terminal();
	}
	function load_terminal() {
		var terminal = document.getElementById("terminal");
		terminal.style.display = "";
		terminal.style.backgroundColor = "#ccc";
		terminal.style.border = "1px solid #000";
		
		var sz = getBounds();
    
		terminal.style.width = (sz[0]-50)+"px";
		terminal.style.height = (sz[1]-80) +"px";
		
		
		var lstThreads = document.getElementById("lstThreads");
		lstThreads.style.width = (sz[0]-162)+"px";
		lstThreads.style.height = (sz[1]-124) +"px";
		
		
		var frameContacts = document.getElementById("frameContacts");
		frameContacts.style.position = "absolute";
		frameContacts.style.left = (sz[0]-150) + "px";
		frameContacts.style.top = "0px";
		frameContacts.style.width = "100px";
		frameContacts.style.height = (sz[1]-80)+"px";
		frameContacts.style.padding = "10px";
		
		var command = document.getElementById("txtCommand");
		function submit_command() {
			var csrf_cookie = localStorage.getItem("csrf-cookie");
			var args = {
				query : command.value,
				csrf_cookie : csrf_cookie
			}
			Import({url:"/json.parser",method:"get",json:true,data:args})
				.done(function(data) {
					if(data.result) {
						console.log("OK COMMAND:"+command.value);
						if(data.code == 1) { // add thread
							// open add thread with data topic
							var topic = data.data.join(" ");
							
							var addThread = document.createElement("div");
							addThread.style.border = "solid 1px #000";
							var addThreadTopic = document.createElement("div");
							addThreadTopic.style.padding = "10px";
							
							var addThreadTitle = document.createElement("div"); 
							addThreadTitle.innerHTML = topic;
							addThreadTitle.style.padding = "5px";
							addThreadTitle.style.backgroundColor = "#000";
							addThreadTitle.style.color = "#fff";
							var addThreadBody = document.createElement("div");
							addThreadBody.style.height = "300px";
							// slot mode is default
							
							// select type of content to add
							//	survey, image, model, element(json|struct), text, code, sheet, audio, slide, video
							// select type of description to add
							//	
							// select mode : request, response
							
							
							
							// call someone to edit content
							// put price on content
							// put reward on accept answer
							// share -> public, list of people
							// finish edit content [button -> seal thread]
							
							addThreadTopic.appendChild(addThreadTitle);
							addThreadTopic.appendChild(addThreadBody);
							addThread.appendChild(addThreadTopic);
							lstThreads.appendChild(addThread);
							
						} else if(data.code == 2) { // find thread
							
						} else if(data.code == 3) { // fork thread (previously added content)
						
						} else if(data.code == 3) { // event coding thread (timers,regex)
							
						}
					} else {
						console.log("FAIL COMMAND:"+command.value);
					}
				})
				.fail(function(error) {
					console.log("FAIL COMMAND:"+error.message,command.value);
				})
				.send();
		}
		
		command.addEventListener("keydown",function(e) {
			if(e.keyCode==13) { submit_command(); }
		});
		
		
		
	}
	function unload_terminal() {
		var terminal = document.getElementById("terminal");
		terminal.style.display = "none";
	}
	function login_screen() {
		document.getElementById("panelLogin").style.display = "";
		var login_username = document.getElementById("login_username");
		var login_password = document.getElementById("login_password");
		var login_btn =  document.getElementById("login_btn");
		login_btn.style.position = "relative";
		login_btn.style.cursor = "pointer";
		login_btn.style.border = "solid 1px #000";
		login_btn.style.borderTop = "solid 5px #000";
		login_btn.style.borderBottom = "solid 5px #000";
		
		login_btn.style.backgroundColor = "#000";
		login_btn.style.color = "#fff";
		
		login_username.value = "";
		login_password.value = "";
		function submit_login() {
			var username = login_username.value;
			
			Hash.sha3_512_start();
			var args = {
				username : login_username.value,
				password : Hash.sha3_512_iter(login_password.value).data
			};
			Import({url:"/json.login",method:"get",json:true,data:args})
				.done(function(data) {
					//alert(JSON.stringify(data));
					if(data.result) {
						localStorage.setItem("csrf-cookie",data.csrf_cookie);
						localStorage.setItem("username",username);
						document.getElementById("panelLogin").style.display = "none";
						document.getElementById("lblErrorMessage").style.display = "none";
						load_terminal();
						logout.style.display = "";
					} else {
						var error = document.getElementById("lblErrorMessage");
						error.innerHTML = data.message;
						error.style.display = "";
					}
					login_username.value = "";
					login_password.value = "";
				})
				.fail(function(error) {
					var error = document.getElementById("lblErrorMessage");
					error.innerHTML = error.message;
					error.style.display = "";
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
			login_btn.style.borderTop = "solid 5px #000";
			login_btn.style.borderBottom = "solid 5px #000";
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
		register_btn.style.borderTop = "solid 5px #000";
		register_btn.style.borderBottom = "solid 5px #000";
		register_btn.style.backgroundColor = "#000";
		register_btn.style.color = "#fff";
		function submit_register() {
			var username = register_username.value;
			if(register_password1.value == register_password2.value) {
				Hash.sha3_512_start();
				var args = {
					username : register_username.value,
					password : Hash.sha3_512_iter(register_password1.value).data,
					token : register_token.value
				};
				//console.log(JSON.stringify(args));
				Import({url:"/json.register",method:"get",json:true,data:args})
					.done(function(data) {
						if(data.result) {
							localStorage.setItem("csrf-cookie",data.csrf_cookie);
							localStorage.setItem("username",username);
							document.getElementById("panelLogin").style.display = "none";
							document.getElementById("lblErrorMessage").style.display = "none";
							logout.style.display = "";
							load_terminal();
						} else {
							var error = document.getElementById("lblErrorMessage");
							error.innerHTML = data.message;
							error.style.display = "";
						}
						register_username.value = "";
						register_password1.value = "";
						register_password2.value = "";
						register_token.value = "";
					})
					.fail(function(error) {
						var error = document.getElementById("lblErrorMessage");
						error.innerHTML = error.message;
						error.style.display = "";
					})
					.send();
			} else {
				var error = document.getElementById("lblErrorMessage");
				error.innerHTML = "please, retype password correctly.";
				error.style.display = "";
				register_password1.value = "";
				register_password2.value = "";
				//alert("please, retype password correctly.");
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
			register_btn.style.borderTop = "solid 5px #000";
			register_btn.style.borderBottom = "solid 5px #000";
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
					load_terminal();
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

