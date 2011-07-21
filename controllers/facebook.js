app.get('/facebook', function(req, res) {
	console.log("Facebook image request: ", req.query);

	var hash = Hash.md5(req.query.file+req.query.data);
	var facebookFile = mainDirname + "/public/upload/" + hash + ".png";
	var first = true;
	var inStream = fs.createReadStream(facebookFile).
			addListener('error',
			function() {
				console.log('Image does not exist yet, creating: '+facebookFile);
				res.header('Content-Type', 'image/png');
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
					if (first) {
						res.redirect('/?file='+hash);
						first = false;
					}
				}
			).
			addListener("close", function() {
			});
});
