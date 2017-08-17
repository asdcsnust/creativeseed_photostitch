var express = require("express");
var bodyParser = require("body-parser");
var Promise = require('bluebird');
var multer = require("multer");
var http = require("http");
var mv = require('mv');
var exec = require('child_process').execFile;
var path = require("path");
function promiseFromChildProcess(child) {
	return new Promise(function(resolve, reject){
		child.addListner("error", reject);
		child.addListner("exit", resolve);
	});
}

var app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "results")));

var httpServer = http.createServer(app).listen(8088, function(req, res){
	console.log("Socket IO Server has been started at 8088");
});

var io = require("socket.io").listen(httpServer);

var storage = multer.diskStorage({
	destination: function(req, file, callback){
		callback(null, './uploads');
	},
	filename: function(req, file, callback){
		callback(null, file.fieldname + "-" + Date.now());
	}
});
var upload = multer({storage: storage}).array('userPhoto', 255);


app.get('/', function(req,res){
	res.sendFile(__dirname + "/index.html");
});

io.sockets.on('connection', function(socket){
	console.log("connected!");
	socket.emit("connected", { msg: "connected!"});
	socket.on('forceDisconnect', function() {
		socket.disconnect();
	});

	socket.on('disconnect', function() {
		console.log('user disconnected: ' + socket.name);
	});
});

app.post('/api/photo', function(req, res){
	upload(req, res, function(err){
		if(err){
			return res.end("error");
		} else {
			
			var imgArr = [];
			for(var i=0; i < req.files.length; i++){
				imgArr[i] = req.files[i].path;
			}

			var child = exec('./image-stitching', imgArr);
			
			promiseFromChildProcess(child).then(function (result) {
   				console.log('promise complete: ' + result);
			}, function (err) {
    			console.log('promise rejected: ' + err);
			});
			
			child.stdout.on('data', function (data) {
				io.sockets.emit("logs", { msg: data});
    			console.log('stdout: ' + data);
			});
			
			child.stderr.on('data', function (data) {
    			console.log('stderr: ' + data);
			});
			
			child.on('close', function (code) {
				var filename = "results/"+Date.now() + "-" +"out.jpg"
				console.log(filename);
				mv("out.jpg", filename, function(err){
					if(err){
						console.log();
						io.sockets.emit("logs", { msg: 'err: ' + err});
						return err;
					}
					console.log(filename);
					io.sockets.emit("imgsrc", { msg: filename.replace("results/", "")});
					console.log('closing code: ' + code);
				});
			});
			io.sockets.emit("logs", { msg: "Upload success!"});
			res.end("Upload success!");
		}
	});
});
/*
app.listen(3000, function(){
	console.log("working on port 3000");
});
*/
