/**
 * Module dependencies.
 */

var express = require('express');
fs = require('fs')
http = require('http')
var form = require('connect-form');
require('joose');
require('joosex-namespace-depended');
require('hash');
var drawApi = require('./public/js/drawApi.js');
var serial = require('./public/js/serial.js');
var querystring = require('querystring');
var Canvas = require('canvas');
var nodemailer = require('nodemailer');
im = require('imagemagick');
im.identify.path = "/usr/local/bin/identify";
im.convert.path = "/usr/local/bin/convert";

resize = require('./public/js/resize.js');

mainDirname = __dirname;

var Image = Canvas.Image;
app = express.createServer(
		express.cookieParser(),
		express.session({ secret: "crazysecretstuff"}),
		form({ keepExtensions: true })
);

function createCanvas(source, data, callback) {
	fs.readFile(source, function(err, imageData) {
		if (err) {
			console.log("There was an error reading the image file. ", err);
			return;
		}
		var img = new Image;
		img.onerror = function(e) {
			console.log("Error:" + e);
		};
		img.onload = function(e) {
			console.log('onLoad');
		}
		try {
			img.src = imageData;
			var bubbles = serial.deserializeBubbles(data);
			var canvas = new Canvas(img.width, img.height);
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width, img.height);
			for (var b in bubbles) {
				var bubble = bubbles[b];
				console.dir(bubble);
				ctx.strokeStyle = 'rgba(0,0,0,0.5)';
				drawApi.drawBubble(ctx, Number(bubble.x), Number(bubble.y), Number(bubble.w), Number(bubble.h), bubble.text, bubble.type);
			}
			callback(canvas);
		} catch (e) {
			console.log("Error", e);
		}
	});
}

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
	createCanvas(__dirname + "/public/upload/" + req.query.file, req.query.data,
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
				else message.sender = "nobody@nobody.com";
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
	console.log(req.query);

	createCanvas(__dirname + "/public/upload/" + req.query.file, req.query.data,
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
					pres.on('data', function (chunk) {
						console.log('Response: ' + chunk);
						var obj = JSON.parse(chunk);
						console.dir(obj);
						res.redirect(obj.upload.links.imgur_page);

					});
				});
				// post the data
				post_req.write(post_data);
				post_req.end();
			}
	);

});

app.get('/image', function(req, res) {
	console.log(req.query);

	res.header('Content-Type', 'image/png');
	res.header('Content-Disposition', 'attachment; filename="speechBubble.png"');

	createCanvas(__dirname + "/public/upload/" + req.query.file, req.query.data,
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
		console.log(chunk.length);
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


app.listen(3000);


console.log('Express app started on port 3000');

nodemailer.SMTP = {
	host: "smtp.gmail.com", // required
	port: 465, // optional, defaults to 25 or 465
	use_authentication: true,
	ssl: true,
	user: "miklosi.attila@gmail.com",
	pass: "123bolombika"
}

