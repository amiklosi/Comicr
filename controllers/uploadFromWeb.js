app.get('/imageFromWeb', function(req, mainRes) {

	console.log("Getting image from ", req.query.url);

	var matches = /^.*?:\/\/(.*?)(\/.*)$/.exec(req.query.url);
	var options = {
		host: matches[1],
		port: 80,
		path: matches[2]
	}
	var str = Hash.md5(new Date().toString() + req.sessionID);
	var request = http.get(options, function(res) {
		res.setEncoding('binary')
		var buffers = [];
		var sumLength = 0;
		res.on("data", function(chunk) {
			buffers.push(new Buffer(chunk, 'binary'));
			sumLength += chunk.length;
			console.log(typeof chunk);
		});
		res.on('end', function(chunk) {
			console.log("Total Length: ", sumLength);
			var pos = 0;
			var bigBuffer = new Buffer(sumLength + 1)
			for (var i = 0; i < buffers.length; i++) {
				buffers[i].copy(bigBuffer, pos, 0);
				pos += buffers[i].length;
			}

			resize.writeToAndResizeIfNeeded(bigBuffer, 800, 600, mainDirname + '/public/upload/' + str,
					function() {
						mainRes.writeHead(200, {'content-type': 'text/json' });
						mainRes.write(JSON.stringify({success: true, id: str}));
						mainRes.end('\n');
					},
					function() {
						mainRes.writeHead(200, {'content-type': 'text/json' });
						mainRes.write(JSON.stringify({success: false}));
						mainRes.end('\n');
					}
			);
		})
	});
	request.addListener('error', function(){
		mainRes.writeHead(200, {'content-type': 'text/json' });
		mainRes.write(JSON.stringify({success: false}));
		mainRes.end('\n');
	});
});