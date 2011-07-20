this.writeToAndResizeIfNeeded = function (buffer, maxWidth, maxHeight, outFilename, successCallback, errorCallback) {
	var binary = buffer.toString('binary');
	im.identify({data:binary}, function(err, features) {
		if (err) {
			console.log(err);
			res.send(JSON.stringify({success: false}));
		}
		if (features.width > maxWidth || features.height > maxHeight) {
			console.log('Image too big, resizing');
			im.resize({srcData: binary, dstPath: outFilename, width: 800, format: 'jpg'}, function(err) {
				if (err) {
					console.log(err);
					errorCallback();

				} else {
					successCallback();
				}
			});
		} else {
			var out = fs.createWriteStream(outFilename);
			out.write(buffer);
			successCallback();
		}
	});
}
