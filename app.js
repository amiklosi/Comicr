/**
 * Module dependencies.
 */

express = require('express');
fs = require('fs')
http = require('http')
form = require('connect-form');
require('joose');
require('joosex-namespace-depended');
require('hash');
drawApi = require('./public/js/drawApi.js');
serial = require('./public/js/serial.js');
canvas = require('./public/js/canvas.js');
querystring = require('querystring');
Canvas = require('canvas');
nodemailer = require('nodemailer');
im = require('imagemagick');
im.identify.path = "/usr/local/bin/identify";
im.convert.path = "/usr/local/bin/convert";

resize = require('./public/js/resize.js');

mainDirname = __dirname;

Image = Canvas.Image;
app = express.createServer(
		express.cookieParser(),
		express.session({ secret: "crazysecretstuff"}),
		form({ keepExtensions: true })
);

app.configure('development', function() {
	console.log('development mode');
	app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
	app.use(express.logger({ format: ':date :remote-addr :method :status :url' }));
});

app.configure('production', function() {
	console.log('production mode');
	app.use(express.errorHandler());
});

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});


app.get('/', function(req, res) {
	res.render('index.jade', {iUrl: req.session.iUrl});
});

app.get('/email', function(req, res) {
	canvas.create(__dirname + "/public/upload/" + req.query.file, req.query.data,
			function(canvas) {
				var cid = Date.now() + ".image.png";
				var message = {
					to:req.query.to,
					body: req.query.body,
					html: req.query.body + "<p><img src=\"cid:" + cid + "\"/></p>",
					attachments:[
						{
							filename: "image.png",
							contents: canvas.toBuffer(),
							cid: cid
						}
					]
				};
				console.log(req.query.from);
				console.log(req.query.from.length);
				if (req.query.from && req.query.from.length > 0) message.sender = req.query.from;
				else message.sender = "info@bubblr.co.uk";
				if (req.query.subject) message.subject = req.query.subject;

				var callback = function(error, success) {
					if (error) {
						console.log("Error occured");
						console.log(error.message);
						return;
					}
					if (success) {
						console.log("Message sent successfully!");
						res.send('{"success": "true"}');
					} else {
						console.log("Message failed, reschedule!");
						res.send('{"success": "false"}');
					}
				}
				var mail;
				try {
					mail = nodemailer.send_mail(message, callback);
				} catch(e) {
					console.log("Caught Exception", e);
					res.send('{"success": "false"}');
				}
			}
	);
});

app.get('/imgur', function(req, res) {
	console.log("Imguring: ", req.query);
	canvas.create(__dirname + "/public/upload/" + req.query.file, req.query.data,
			function(canvas) {
				var post_data = querystring.stringify({
					'key' : 'f0b2267e5fa0e21021efe367acc03ef1',
					'image': canvas.toBuffer().toString("base64")
				});
				var post_options = {
					host: 'api.imgur.com',
					port: '80',
					path: '/2/upload.json',
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': post_data.length
					}
				};
				var post_req = http.request(post_options, function(pres) {
					pres.setEncoding('utf8');
					var response = "";
					pres.on('data', function (chunk) {
						response += chunk;
					});
					pres.on('end', function() {
						console.log('Response: ' + response);
						var obj = JSON.parse(response);
						var result = obj.upload.links;
						console.dir(result);
						res.send(JSON.stringify(result))
					});
				});
				// post the data
				post_req.write(post_data);
				post_req.end();
			}
	);

});

app.get('/file/:file',function(req, res) {
	console.log(req.params.file);
	var first = true;
	var inStream = fs.createReadStream(mainDirname+"/public/upload/"+req.params.file).
			addListener('error',
			function() {
				console.log('Image does not exist.');
				res.header('Content-Type', 'text/plain');
				res.send('nok');
			}).
			addListener('data',
			function(c) {
				if (first) {
					console.log("Setting iurl to "+req.params.file)
					req.session.iUrl = req.params.file;
					res.header('Content-Type', 'image/png');
					first = false;
				}
				res.write(c);
			}).
			addListener("close", function() {
				res.end();
			});
});

app.get('/image', function(req, res) {
	console.log(req.query);

	res.header('Content-Type', 'image/png');
	res.header('Content-Disposition', 'attachment; filename="speechBubble.png"');

	canvas.create(__dirname + "/public/upload/" + req.query.file, req.query.data,
			function(canvas) {
				stream = canvas.createPNGStream();
				stream.pipe(res);
			}
	);

});


app.post('/doUpload', function(req, res, next) {
	var str = Hash.md5(new Date().toString() + req.sessionID);
	req.session.iUrl = str;
	var buffers = [];
	var sumLength = 0;
	req.on("data", function(chunk) {
		buffers.push(chunk);
		sumLength += chunk.length;
	});
	req.on('end', function(chunk) {
		console.log("Total Length: ", sumLength);
		var pos = 0;
		var bigBuffer = new Buffer(sumLength + 1)
		for (var i = 0; i < buffers.length; i++) {
			buffers[i].copy(bigBuffer, pos, 0);
			pos += buffers[i].length;
		}
		resize.writeToAndResizeIfNeeded(bigBuffer, 800, 600, __dirname + '/public/upload/' + str,
				function() {
					res.send(JSON.stringify({success: true, id: str}));
				},
				function() {
					res.send(JSON.stringify({success: false}));
				}
		);
	});
});

require('./controllers/uploadFromWeb.js');
require('./controllers/facebook.js');

app.listen(3000);

console.log('Bubblr started on port 3000');

if (process.env.NODE_ENV != 'production') {
	console.log("Using gmail SMTP");
	nodemailer.SMTP = {
		host: "smtp.gmail.com", // required
		port: 465, // optional, defaults to 25 or 465
		use_authentication: true,
		ssl: true,
		user: "miklosi.attila@gmail.com",
		pass: "123bolombika"
	}
}