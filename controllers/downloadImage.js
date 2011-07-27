app.get('/downloadImage', function(req, res) {
	console.log("Generating image, file=",req.query.file,', data=',req.query.data);
	var fn = req.query.fileName ? req.query.fileName : 'speechBubble.png';

	res.header('Content-Type', 'image/png');
	res.header('Content-Disposition', 'attachment; filename="'+fn+'"');

	canvas.create(mainDirname + "/public/upload/" + req.query.file, req.query.data,
			function(canvas) {
				stream = canvas.createPNGStream();
				stream.pipe(res);
			}
	);
});
