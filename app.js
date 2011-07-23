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
flickrGateway = require('./flickr/flickrGateway.js');
resize = require('./public/js/resize.js');
globals = require('./globals.js');

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
	var isDefault = false;
	if (!req.session.iUrl) {
		req.session.iUrl = 'default.png';
		isDefault = true;
	}
	var fbUrl = "http://"+req.headers.host+"/file/"+req.session.iUrl;
	res.render('index.jade', {iUrl: req.session.iUrl, fbUrl: fbUrl, isDefault: isDefault});
});

require('./controllers/uploadFromWeb.js');
require('./controllers/uploadFromFlickr.js');
require('./controllers/facebook.js');
require('./controllers/sendEmail.js');
require('./controllers/imgur.js');
require('./controllers/formUpload.js');
require('./controllers/file.js');
require('./controllers/downloadImage.js');

app.listen(3000);

console.log('Comicr started on port 3000');

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