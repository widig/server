

var http = require("http");

function Server() {
	function handler(req,res) {
	
	}
	this.server = http.createServer(handler);
	this.server.on("error",function(err) {
		console.log("err:",err);
	});
	
}