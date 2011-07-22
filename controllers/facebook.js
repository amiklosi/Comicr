app.get('/facebook', function(req, res) {
	console.log("Facebook image request: ", req.query);

	var hash = Hash.md5(req.query.fbfile+req.query.data);
	var facebookFile = mainDirname + "/public/upload/" + hash + ".png";
	var first = true;
	var inStream = fs.createReadStream(facebookFile).
			addListener('error',
			function() {
				console.log('Image does not exist yet, creating: '+facebookFile);
				res.header('Content-Type', 'text/html');
				canvas.create(mainDirname + "/public/upload/" + req.query.fbfile, req.query.data,
						function(canvas) {
							stream = canvas.createPNGStream();
							var out = fs.createWriteStream(facebookFile);
							stream.on('data', function(chunk) {
								out.write(chunk);
							});
							stream.on('end', function() {
								req.session.iUrl = hash+".png";
								var fbUrl = "http://"+req.headers.host+"/file/"+hash+".png";
								res.render('index.jade', {iUrl: req.session.iUrl, fbUrl: fbUrl, isDefault: false});
							});
						}
				);
			}).
			addListener('data',
				function(c) {
					if (first) {
						req.session.iUrl = hash+".png";
						var fbUrl = "http://"+req.headers.host+"/file/"+hash+".png";
						res.render('index.jade', {iUrl: req.session.iUrl, fbUrl: fbUrl, isDefault: false});
						first = false;
					}
				}
			).
			addListener("close", function() {
			});
});
