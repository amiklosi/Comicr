app.get('/facebook', function(req, res) {
	console.log("Facebook image request: ", req.query);
	res.header('Content-Type', 'image/png');
	var facebookFile = mainDirname + "/public/facebook/" + Hash.md5(req.query.file+req.query.data) + ".png";
	var inStream = fs.createReadStream(facebookFile).
			addListener('error',
			function() {
				console.log('Image does not exist yet, creating.');
				canvas.create(mainDirname + "/public/upload/" + req.query.file, req.query.data,
						function(canvas) {
							stream = canvas.createPNGStream();
							stream.pipe(res);
							var out = fs.createWriteStream(facebookFile);
							stream.on('data', function(chunk) {
								out.write(chunk);
							});
						}
				);
			}).
			addListener('data',
			function(c) {
				res.write(c);
			}).
			addListener("close", function() {
				res.end();
			});
});
