

var http = require("http");
var fs = require("fs");
var path = require("path");
var child_process = require("child_process");
function guid() {
	function s4() {
		return Math.floor(Math.random()*0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function generateTokens(n) {

	if(!fs.existsSync("users")) fs.mkdirSync("users");
	if(!fs.existsSync("users"+path.sep+"info.json")) fs.writeFileSync("users"+path.sep+"info.json","{}");
	var users_info = fs.readFileSync("users"+path.sep+"info.json");
	
	var list = {};
	for(var x = 0; x < n;x++) {
		var id = guid();
		while(id in list) id = guid();
		var next = false;
		for(var username in users_info) {
			if(id == users_info[username].token) {
				next = true;
				break;
			}
		}
		if(next) {
			x--;
			continue;
		}
		list[id] = {};
	}
	fs.writeFileSync("tokens.json",JSON.stringify(list));
}
generateTokens(64);

function createUserList() {
	fs.writeFileSync("users.json",JSON.stringify({}));
}
function createSessionFile() {
}
function createUser() {
}
function createUserFolder() {
}
function createUserInfoFile() {
}

function Server(port,host,timeout,client_script) {
	this.port = port;
	this.host = host;
	this.debugFlag = false;
	this.timer = new Date();
	this.timeout = timeout;
	this.running = true;
	var self = this;
	function processing(request,response,container) {
		if(self.running) {
			if(container.path=="/") {
				var data = child_process.spawn("arp",["-a"]);
				var buffer = [];
				data.stdout.on('data', function(data) { buffer.push(data); });
				data.stderr.on('data', function (data) { console.log(`stderr: ${data}`); });
				data.on('close', function(code) {
					response.writeHead(200, {"content-type": "text/html","connection":"close"});
					var data1 = /Interface: \d{1,3}[.]\d{1,3}[.]\d{1,3}[.]\d{1,3}/.exec( buffer.join(" ") );
					// buffer.join(" ");//
					response.write(
						"<!doctype html><html>"+
						"<head>"+
						"<script>"+
						fs.readFileSync(client_script)+
						"</script>"+
						"</head><body>"+
						
						// ip interface
						"<div style=\"position:absolute;left:10px;top:10px;border:solid 1px #000;\">"+
						container.clientIp+
						//"<br/>"+data1[0].substring("Interface: ".length)+
						"</div>"+
						
						
						// start panel
						"<div id=\"panelLogin\" style=\"position:absolute;left:10px;top:40px;border:solid 1px #000;padding:10px;background-color:#ec3;\">"+
							// login interface
							"<table>"+
								"<tr><td align=\"right\" valign=\"top\">usuario : </td><td valign=\"top\"><input id=\"login_username\" type=\"text\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td align=\"right\" valign=\"top\">senha : </td><td valign=\"top\"><input id=\"login_password\" type=\"password\" style=\"border:solid 1px #000;padding:1px;\"/><br/><a style=\"font-size:13px;\">esqueceu a senha?</a></td></tr>"+
								"<tr><td></td><td id=\"login_btn\" style=\"text-align:center;\">acessar</td></tr>"+
							"</table>"+
							// register interface
							"<table>"+
								"<tr><td align=\"right\">usuario : </td><td><input id=\"register_username\" type=\"text\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td align=\"right\">senha : </td><td><input id=\"register_password1\" type=\"password\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td align=\"right\">senha : </td><td><input id=\"register_password2\" type=\"password\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td align=\"right\">token : </td><td><input id=\"register_token\" type=\"text\" style=\"border:solid 1px #000;padding:1px;\"/></td></tr>"+
								"<tr><td></td><td id=\"register_btn\" style=\"text-align:center;\">registrar</td></tr>"+
							"</table>"+
							"<div id=\"lblErrorMessage\" style=\"border:solid 1px #f00;background-color:#fff;color:#000;display:none;padding:5px;\"></div>"+
						"</div>"+
						
						
						// logout interface
						"<div id=\"btnLogout\" style=\"position:absolute;top:10px;\">"+
						"logout"+
						"</div>"+
						
						// terminal interface
						"<div id=\"terminal\" style=\"display:none;position:absolute;left:10px;top:40px;padding:10px;\">"+
							"<div style=\"position:relative;width:780px;height:30px;border:solid 1px #000;padding:5px;background-color:#eee;\">"+
								"<input type=\"text\" style=\"width:755px;height:25px;border:solid 1px #000;outline:0px;padding-left:10px;padding-right:10px;\"/>"+
							"</div>"+
						"</div>"+
						
						// [system]
						
							// add user user2 ( adicionar contato )
						
							// find user where word + exists
							// find user where sentence add user exists
							
							// remove user ( remover contato )
						
							// enviar mensage para contato
						
							// use user user1
						
												
						// add word ( adicionar topico )
						
						// list words ( listar topicos )
						
						//	list instance of word ( listar items usando pesquisa )
						
						// remove word ( remover topicos )
						
						// add instance of word ( adicionar item ao topico ) -> json :: drawing, point, message, number, audio, video
						
						// find instance of word ( procurar items usando topico )
						
						// 	remove instance of word ( remover items usando pesquisa )
						
						// add sentence ( adicionar mote )
						
						// find senteces ( procurar mote )
						
						// 	remove sentence ( remove mote )
						
						// add instance of sentence ( adicionar conjunto de items dos topicos do mote )
						
						// find instances of sentence ( procurar items dos topicos do mote )
						
						// 	remove instances of sentence ( remover conjunto de items dos topicos do mote )
						
						// 	refine search of instances of sentence ( especificar mote )
						
						
						"</body></html>"
					);
					response.end();
					console.log(`child process exited with code ${code}`);
				});
			} else if(container.path == "/json.login") {
				response.writeHead(200, {"content-type": "application/json","connection":"close"});
				if(!fs.existsSync("users")) {
					response.write("{\"result\":false}");
					fs.mkdirSync("users");
					fs.writeFileSync("users"+path.sep+"info.json","{}");
				} 
				
				if("username" in container.get && "password" in container.get) { // relogin (new session)
					// get users/info.json
					var users = JSON.parse( fs.readFileSync("users"+path.sep + "info.json", "utf8") );
					if( container.get.username in users && users[ container.get.username ].password == container.get.password ) {
						var id = guid();
						var hash = fs.existsSync("session.json") ? JSON.parse( fs.readFileSync("session.json") ) : {};
						if(id in hash) while(id in hash) id = guid();
						hash[id] = {csrf:id,username:container.get.username,log:[["in",new Date()]]}
						fs.writeFileSync("session.json",JSON.stringify(hash));
						response.write("{\"result\":true,\"csrf_cookie\":\""+id+"\"}");
					} else {
						response.write("{\"result\":false,\"message\":\"incorrect username or password.\"}");
					}
					
				} else if("csrf_cookie" in container.get) { // auto relogin (reuse session)
					// relogin
					
					var hash = fs.existsSync("session.json") ? JSON.parse( fs.readFileSync("session.json") ) : null;
					if(hash==null) {
						response.write("{\"result\":false,\"message\":\"server internal error(2).\"}");
					} else {
						if(container.get.csrf_cookie in hash) {
							hash[ container.get.csrf_cookie ].log.push(["rein",new Date()]);
							response.write("{\"result\":true}");
							fs.writeFileSync("session.json",JSON.stringify(hash));
						} else {
							response.write("{\"result\":false}");
						}
					}
				}
				response.end();
			} else if(container.path == "/json.logout") {
				if("csrf_cookie" in container.get) {
					// csrf_cookie -> username -> log out
					var hash = fs.existsSync("session.json") ? JSON.parse( fs.readFileSync("session.json") ) : null;
					if(hash==null) {
						response.writeHead(200, {"content-type": "application/json","connection":"close"});
						response.write("{\"result\":false,\"message\":\"server internal error(1).\"}");
						response.end();
					} else {
						var logout_date = new Date();
						if(container.get.csrf_cookie in hash) {
							hash[ container.get.csrf_cookie ].log.push(["out",logout_date]);
						}
						// transfer log from session to history in user, using logout date
						console.log("HASH:" + JSON.stringify(hash) + " || " + container.get.csrf_cookie );
						if(fs.existsSync(
							"users"+path.sep
							+hash[container.get.csrf_cookie ].username+path.sep
							+"history.json"
						)) {
							var history = JSON.parse( fs.readFileSync("users"+path.sep+hash[container.get.csrf_cookie ].username+path.sep+"history.json") );
							history[ logout_date.valueOf() ] = hash[ container.get.csrf_cookie ].log;
							fs.writeFileSync("users"+path.sep+hash[container.get.csrf_cookie ].username+path.sep+"history.json",JSON.stringify(history));
						}
						// remove session
						delete hash[container.get.csrf_cookie];
						fs.writeFileSync("session.json",JSON.stringify(hash));
						
						response.writeHead(200, {"content-type": "application/json","connection":"close"});
						response.write("{\"result\":true}");
						response.end();
						
					}
				} else {
					response.writeHead(200, {"content-type": "application/json","connection":"close"});
					response.write("{\"result\":false,\"message\":\"wrong cookie.\"}");
					response.end();
				}
			} else if(container.path == "/json.register") {
				console.log(JSON.stringify(container.get));
				response.writeHead(200, {"content-type": "application/json","connection":"close"});
				// format accepted for json.register
				if("username" in container.get && "password" in container.get && "token" in container.get) {
					console.log("FIND FOR ",container.get.token);
					var tokens = JSON.parse( fs.readFileSync("tokens.json") );
					var check = false;
					if(container.get.token in tokens) check = true;
					if(check) {
						console.log("FOUND TOKEN");
						
						if(!fs.existsSync("users")) fs.mkdirSync("users");
						if(!fs.existsSync("users"+path.sep+"info.json")) fs.writeFileSync("users"+path.sep+"info.json","{}");
						
						var info = JSON.parse( fs.readFileSync("users"+path.sep+"info.json") );
						
						// recheck of token reuse, do not allow duplicates
						var check = false;
						for(var username in info) {
							if(info[username].token == container.get.token) {
								check = true;
								console.log("TOKEN HAS ALREADY BEEM USED.");
								response.write("{\"result\":false,\"message\":\"token has already been used.\"}");
								response.end();
								delete tokens[ container.get.token ];
								fs.writeFileSync("tokens.json",JSON.stringify(tokens));
								return;
							}
						}
						
						if(!check && container.get.username in info) {
							console.log("USERNAME HAS ALREADY BEEN TAKEN.");
							response.write("{\"result\":false,\"message\":\"username has already been taken.\"}");
						} else {
							var id = guid();
							var hash = fs.existsSync("session.json") ? JSON.parse( fs.readFileSync("session.json") ) : {};
							if(id in hash) while(id in hash) id = guid();
							hash[id] = {csrf:id,username:container.get.username,log:[["in",new Date()]]};
							fs.writeFileSync("session.json",JSON.stringify(hash));
							info[container.get.username] = { 
								token : container.get.token, 
								password : container.get.password
							};
							fs.writeFileSync("users"+path.sep+"info.json",JSON.stringify(info));
							console.log("REGISTERED AND LOGGED AS " + id);
							if(!fs.existsSync("users"+path.sep+container.get.username)) fs.mkdirSync("users"+path.sep+container.get.username);
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"history.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"history.json","{}");
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"parser.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"parser.json",
								"{"+
									"\"main\" : \"main\","+
									"\"stack\" : [{}]"
								"}"
							);
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"words.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"base.json","{}");
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"words.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"words.json","{}");
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"sentences.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"sentences.json","{}");
							if(!fs.existsSync("users"+path.sep+container.get.username+path.sep+"texts.json")) fs.writeFileSync("users"+path.sep+container.get.username+path.sep+"texts.json","{}");
							response.write("{\"result\":true,\"csrf_cookie\":\""+id+"\"}");
						}
						
						response.end();
						delete tokens[ container.get.token ];
						fs.writeFileSync("tokens.json",JSON.stringify(tokens));
						
						return;
						
					} else {
						console.log("TOKEN NOT FOUND");
						response.write("{\"result\":false,\"message\":\"token not found.\"}");
						response.end();
						return;
					}
				} else {
					console.log("INVALID ARGUMENTS TO REGISTER");
					response.write("{\"result\":false,\"message\":\"invalid arguments to register a username.\"}");
					response.end();
					return;
				}
			} else if(container.path == "/json.login_remember") {
			
			} else if(container.path == "/json.parser") {
				
				if( "query" in container.get && "csrf_cookie" in container.get) {
					/*
					var stack = JSON.parse( fs.readFileSync("users"+path.sep+container.get.username+path.sep+"parser.json") );
					var hash = fs.existsSync("session.json") ? JSON.parse( fs.readFileSync("session.json") ) : null;
					if(hash==null) {
					
					} else {
					
					}
					TODO:
						cache session
					*/
				}
			}
		} else {
			response.writeHead(500, {"content-type": "text/html","connection":"close"});
			response.write("<!doctype html><html><body>500</body></html>");
			response.end();
			self.stop();
		}
	}
	
	function handler(request,response) {
		if(self.running) {
			var container = {};
			var arr_url = request.url.split('?');
			var base_url = arr_url[0]; // without arguments and hashes
			arr_url.shift(); // remove base_url
			var args = arr_url.join("").split("&");
			var queryString = {};
			
			container.cookies = {};
			container.post = {};
			container.get = {};
			container.path = base_url;
			container.clientIp = request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress || request.connection.socket.remoteAddress;
			if("cookie" in request.headers) {
				var full_cookie = request.headers["cookie"];
				cookie_vars = full_cookie.split(";");
				for(var c in cookie_vars) { var item = cookie_vars[c].split("="); container.cookies[ item[0].trim() ] = item[1]; }
			}
			if (request.method == 'POST') {
				container.method = "post";
				var cbuffer = [];
				request.on('data', function(chunk) {
					cbuffer.push( chunk.toString());
				});
				request.on('end', function() {
					for(var x = 0; x < args.length;x++) { 
						var tmp_obj = args[x].split('='); 
						container.get[ tmp_obj[0] ] = tmp_obj[1];
					}
					var arr = cbuffer.join("").split("&");
					for(var x = 0; x < arr.length;x++) {
						var obj = arr[x].split("=");
						container.post[obj[0]] = obj[1];
					}
					if(self.debugFlag) {
						var message = "request [ method : " + container.method + ", url: \"" + base_url + "\", get: "+JSON.stringify(container.get)+", post: "+JSON.stringify(container.post)+" ]"
						if(self.debugFlag) console.log("[system] " + message);
						fs.appendFileSync("log.txt","[i] " + self.host + ":" + self.port + " -> " + message+"\r\n");
					}
					processing(request,response,"post",base_url,qs);
				});
			} else if(request.method == 'GET') {
				container.method = "get";
				for(var x = 0; x < args.length;x++) { 
					var tmp_obj = args[x].split('='); 
					container.get[ tmp_obj[0] ] = tmp_obj[1]; 
				}
				if(self.debugFlag) {
					var message = "request [ method : " + container.method + ", url: \"" + base_url + "\", get: "+JSON.stringify(container.get)+"]";
					if(self.debugFlag) console.log("[system] " + message);
					fs.appendFileSync("log.txt","[i] " + self.host + ":" + self.port + " -> " + message+"\r\n");
				}
				processing(request,response,container);
			}
		} else {
			response.writeHead(500, {"content-type": "text/html","connection":"close"});
			response.write("<!doctype html><html><body>500</body></html>");
			response.end();
			self.stop();
		}
	}
	process.on('SIGINT', function() {
		fs.appendFileSync("log.txt","[-] " + self.host + ":" + self.port + " -> " + new Date().toISOString() +"\r\n");
	    	process.exit();
	});
	this.server = http.createServer(handler);
	this.server.on("error",function(err) {
		console.log("err:",err);
	});
	this.services = setInterval(function() {
		if(self.timeout>0) {
			if( (new Date()).valueOf() > (self.timer.valueOf() + self.timeout) ) {
				self.stop();
			}
		}
	},10000);
}

Server.prototype.debug = function(flag) {
	this.debugFlag = !!flag;
}

Server.prototype.start = function() {
	if(this.debugFlag) console.log("[system] server " + this.host + " started at port " + this.port + ".");
	this.server.listen(this.port, this.host);
	fs.appendFileSync("log.txt","[+] " + this.host + ":" + this.port + " -> " + new Date().toISOString() +"\r\n");
}
Server.prototype.stop = function() {
	var self = this;
	this.server.close(function() {
		if(self.debugFlag) console.log("[system] server " + self.host + " at port " + self.port + " stoped.");
	});
	clearInterval(this.services);
	fs.appendFileSync("log.txt","[-] " + this.host + ":" + this.port + " -> " + new Date().toISOString() +"\r\n");
}

var server = new Server(80,"0.0.0.0",-1,"./client/0x00.js");
server.debug(true);
server.start();
