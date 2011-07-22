app.get('/imageFromFlickr', function(req, mainRes) {
	flickrGateway.getRandomFlickrUrl(req.query.tags, function(url) {
		console.log('Found Url: '+url)
		console.log("Getting image from ", url);
		globals.uploadFromUrl(url, req, mainRes);
	}, function(err) {
		mainRes.send(JSON.stringify({success: false}));
	});
});
