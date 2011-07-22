var FlickrAPI = require('./flickr.js').FlickrAPI;
var sys = require('sys');
var flickr = new FlickrAPI('e842a2c3c7590a0c5452db9f6ae05f84');

this.getRandomFlickrUrl = function(tags, successCallback, errorCallback) {
	tags = tags.replace(/[^a-zA-Z0-9,]/g, '');
	console.log("Searching FlickR for ", tags);
	flickr.photos.search({tags:tags, tag_mode: 'all', media: 'photos', per_page: 1}, function(error, results) {
		console.log("Response 1 ",error);
		var randomPage = Math.floor(Math.random() * Number(results.pages));
		if (error) {
			errorCallback(error);
			return;
		}
		flickr.photos.search({tags:tags, tag_mode: 'all', media: 'photos', extras: 'url_z,url_l,url_o', per_page: 10, page: Math.floor(randomPage / 10)}, function(error, results) {
			console.log("Response 2 ",error);
			if (error) {
				errorCallback(error);
				return;
			}
			var total = Number(results.photo.length);
			var idx = Math.min(Math.floor(total * Math.random()), total-1);
			var photo = results.photo[idx];
			if (photo) {
				var url = photo.url_z;
				successCallback(url);
			} else {
				errorCallback("Image not found");
			}
		});
	});
}

