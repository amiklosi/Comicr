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
		resize.writeToAndResizeIfNeeded(bigBuffer, 800, 600, mainDirname + '/public/upload/' + str,
				function() {
					res.send(JSON.stringify({success: true, id: str}));
				},
				function() {
					res.send(JSON.stringify({success: false}));
				}
		);
	});
});
