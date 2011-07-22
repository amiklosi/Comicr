app.get('/imageFromFlickr', function(req, mainRes) {
	flickrGateway.getRandomFlickrUrl(req.query.tags, function(url) {
		console.log('Found Url: '+url)
		console.log("Getting image from ", url);
		globals.uploadFromUrl(url, req, mainRes);
	}, function(err) {
		console.log('Image not found');
		mainRes.send(JSON.stringify({success: false, error: err.toString()}));
	});
});
