app.get('/imgur', function(req, res) {
	console.log("Imguring, file=",req.query.file,', data=',req.query.data);
	canvas.create(mainDirname + "/public/upload/" + req.query.file, req.query.data,
			function(canvas) {
				var post_data = querystring.stringify({
					'key' : 'f0b2267e5fa0e21021efe367acc03ef1',
					'image': canvas.toBuffer().toString("base64")
				});
				var post_options = {
					host: 'api.imgur.com',
					port: '80',
					path: '/2/upload.json',
					method: 'POST',
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded',
						'Content-Length': post_data.length
					}
				};
				var post_req = http.request(post_options, function(pres) {
					pres.setEncoding('utf8');
					var response = "";
					pres.on('data', function (chunk) {
						response += chunk;
					});
					pres.on('end', function() {
						console.log('Response: ' + response);
						var obj = JSON.parse(response);
						var result = obj.upload.links;
						console.dir(result);
						res.send(JSON.stringify(result))
					});
				});
				// post the data
				post_req.write(post_data);
				post_req.end();
			}
	);
});
