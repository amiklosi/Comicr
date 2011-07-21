app.get('/facebook', function(req, res) {
	console.log("Facebook image request: ", req.query);
	res.header('Content-Type', 'image/png');
	var inStream = fs.createReadStream(mainDirname + "/public/facebook/" + req.query.file + ".png").
			addListener('error',
			function() {
				console.log('Image does not exist yet, creating.');
				canvas.create(mainDirname + "/public/upload/" + req.query.file, req.query.data,
						function(canvas) {
							stream = canvas.createPNGStream();
							stream.pipe(res);
							var out = fs.createWriteStream(mainDirname + "/public/facebook/" + req.query.file + ".png");
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
