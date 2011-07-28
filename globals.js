this.uploadFromUrl = function(url, req, mainRes) {
	var matches = /^.*?:\/\/(.*?)(\/.*)$/.exec(url);
	if (!matches || matches.length < 3) {
		mainRes.writeHead(200, {'content-type': 'text/json' });
		mainRes.write(JSON.stringify({success: false, error: 'Error uploading image.'}));
		mainRes.end('\n');
	}
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
		});
		res.on('end', function(chunk) {
			console.log("Total Length: ", sumLength);
			var pos = 0;
			var bigBuffer = new Buffer(sumLength + 1)
			for (var i = 0; i < buffers.length; i++) {
				buffers[i].copy(bigBuffer, pos, 0);
				pos += buffers[i].length;
			}
			req.session.iUrl = str;

			resize.writeToAndResizeIfNeeded(bigBuffer, 800, 600, mainDirname + '/public/upload/' + str,
					function() {
						mainRes.writeHead(200, {'content-type': 'text/json' });
						mainRes.write(JSON.stringify({success: true, id: str}));
						mainRes.end('\n');
					},
					function() {
						mainRes.writeHead(200, {'content-type': 'text/json' });
						mainRes.write(JSON.stringify({success: false, error: 'Error uploading image.'}));
						mainRes.end('\n');
					}
			);
		})
	});
	request.addListener('error', function(error){
		mainRes.writeHead(200, {'content-type': 'text/json' });
		mainRes.write(JSON.stringify({success: false, error: error.toString()}));
		mainRes.end('\n');
	});
}