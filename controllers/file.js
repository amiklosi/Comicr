app.get('/file/:file',function(req, res) {
	var first = true;
	var fileName = req.params.file;
	var inStream = fs.createReadStream(mainDirname+"/public/upload/"+fileName).
			addListener('error',
			function() {
				console.log('Image does not exist.');
				res.header('Content-Type', 'text/plain');
				res.send('nok');
			}).
			addListener('data',
			function(c) {
				if (first) {
					console.log("Setting iurl to "+fileName)
					req.session.iUrl = fileName;
					res.header('Content-Type', 'image/png');
					first = false;
				}
				res.write(c);
			}).
			addListener("close", function() {
				res.end();
			});
});
