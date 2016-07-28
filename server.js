

var http = require("http");

function Server(port,host) {
	this.port = port;
	this.host = host;
	this.debugFlag = false;
	var self = this;
	function handler(request,response) {
		if(self.debugFlag) {
			console.log("[system] request");
			//console.log("================================================================================");
			//console.log(JSON.stringify(sessions));
		}
		var arr_url = request.url.split('?');
		var base_url = arr_url[0]; // without arguments and hashes
		arr_url.shift(); // remove base_url
		var args = arr_url.join("").split("&");
		var queryString = {};
		for(var x = 0; x < args.length;x++) {
			var tmp_obj = args[x].split('=');
			queryString[ tmp_obj[0] ] = tmp_obj[1];
		}
		var qs = queryString;
		
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write("<!doctype html><html><body></body></html>");
		response.end();
	}
	this.server = http.createServer(handler);
	this.server.on("error",function(err) {
		console.log("err:",err);
	});
	
}

Server.prototype.debug = function(flag) {
	this.debugFlag = !!flag;
}

Server.prototype.start = function() {
	if(this.debugFlag) console.log("[system] server " + this.host + " started at port " + this.port + ".");
	this.server.listen(this.port, this.host);
}
Server.prototype.stop = function() {
	var self = this;
	this.server.close(function() {
		if(self.debugFlag) console.log("[system] server " + self.host + " at port " + self.port + " stoped.");
	});
}

function ServerBid(port,host,timeout) {
	var server = new Server(80,"127.0.0.1");
	server.debug(true);
	server.start();
	setTimeout(function() {
		console.log("!");
		server.stop();
	},timeout);
}

var server = new Server(80,"127.0.0.1");
server.debug(true);
server.start();
