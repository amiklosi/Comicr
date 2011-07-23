this.create = function (source, data, callback) {
	fs.readFile(source, function(err, imageData) {
		if (err) {
			console.log("There was an error reading the image file. ", err);
			return;
		}
		var img = new Image;
		img.onerror = function(e) {
			console.log("Error:" + e);
		};
		img.onload = function(e) {
			console.log('onLoad');
		}
		try {
			img.src = imageData;
			var bubbles = serial.deserializeBubbles(data);
			var canvas = new Canvas(img.width, img.height);
			var ctx = canvas.getContext('2d');
			ctx.drawImage(img, 0, 0, img.width, img.height);
			for (var b in bubbles) {
				var bubble = bubbles[b];
				console.dir(bubble);
				ctx.strokeStyle = 'rgba(0,0,0,0.5)';
				drawApi.drawBubble(ctx, Number(bubble.x), Number(bubble.y), Number(bubble.w), Number(bubble.h), bubble.text, bubble.type);
			}
			ctx.font = '12px Georgia';
			ctx.strokeStyle = '#000';
			ctx.fillStyle = '#fff'
			ctx.fillText("comicr.co.uk", 5, canvas.height - 20);
			ctx.strokeText("comicr.co.uk", 5, canvas.height - 20);

			callback(canvas);
		} catch (e) {
			console.log("Error", e);
		}
	});
}
