app.get('/imageFromWeb', function(req, mainRes) {
	console.log("Getting image from ", req.query.url);
	globals.uploadFromUrl(req.query.url, req, mainRes);
});