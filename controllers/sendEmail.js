app.get('/email', function(req, res) {
	canvas.create(mainDirname + "/public/upload/" + req.query.file, req.query.data,
			function(canvas) {
				var cid = Date.now() + ".image.png";
				var message = {
					to:req.query.to,
					body: req.query.body,
					html: req.query.body + "<p><img src=\"cid:" + cid + "\"/></p><p>Create your own speech bubbles at <a href='http://comicr.co.uk'>http://comicr.co.uk</a></p>",
					attachments:[
						{
							filename: "image.png",
							contents: canvas.toBuffer(),
							cid: cid
						}
					]
				};
				console.log(req.query.from);
				console.log(req.query.from.length);
				if (req.query.from && req.query.from.length > 0) message.sender = req.query.from;
				else message.sender = "info@comicr.co.uk";
				if (req.query.subject) message.subject = req.query.subject;

				var callback = function(error, success) {
					if (error) {
						console.log("Error occured");
						console.log(error.message);
						return;
					}
					if (success) {
						console.log("Message sent successfully!");
						res.send('{"success": "true"}');
					} else {
						console.log("Message failed, reschedule!");
						res.send('{"success": "false"}');
					}
				}
				var mail;
				try {
					mail = nodemailer.send_mail(message, callback);
				} catch(e) {
					console.log("Caught Exception", e);
					res.send('{"success": "false"}');
				}
			}
	);
});

