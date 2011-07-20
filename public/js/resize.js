this.writeToAndResizeIfNeeded = function (buffer, maxWidth, maxHeight, outFilename, successCallback, errorCallback) {
	im.identify({data:buffer.toString('binary')}, function(err, features) {
		if (err || features == undefined) {
			console.log(err);
			errorCallback();
		} else if (features.width > maxWidth || features.height > maxHeight) {
			console.log('Image too big, resizing');
			im.resize({srcData: buffer.toString('binary'), dstPath: outFilename, width: 800, format: 'jpg'}, function(err) {
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
