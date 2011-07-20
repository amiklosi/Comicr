var image = iUrl;
var bubbleEdited;
var originalText;
var bubbles = {};
var formSubmit;

function loadImage(url) {
	var cat = new Image();
	cat.src = url;
	cat.onload = function() {
		var b_canvas = document.getElementById("canv");
		var b_context = b_canvas.getContext("2d");
		b_canvas.width = cat.width
		b_canvas.height = cat.height
		b_context.drawImage(cat, 0, 0);
	};
}

function createUploader() {
	var uploader = new qq.FileUploaderBasic({
		element: document.getElementById('file-uploader'),
		button: document.getElementById('file-uploader'),
		action: '/doUpload',
		allowedExtensions: ['png','jpg','jpeg','gif'],
		debug: true,
		onSubmit: function(id, fileName) {
			$('#progress').show();
		},
		onProgress: function(id, fileName, loaded, total) {
			if (loaded < total) {
				$('#progress').html("Uploading: " + (loaded / total * 100).toFixed(0) + "%");
			} else {
				$('#progress').html("Processing...");
			}
		},
		onComplete: function(id, fileName, responseJSON) {
			$('#progress').hide();
			image = responseJSON.id;
			loadImage("/upload/" + responseJSON.id);
		}
	});
}

function bubbleClickHandler(ev, bubb) {
	originalText = bubb.text;
	if (bubbleEdited === bubb) {
		$('#textInput').show();
		$('#textInput').val("");
		$('#textInput').val(bubb.text);
		var toTop = bubb.position().top;
		var toLeft = bubb.position().left;
		$('#textInput').css('width', bubb.w - 40);
		$('#textInput').css('height', bubb.h - 40);
		$('#textInput').css('top', toTop + 10);
		$('#textInput').css('left', toLeft + 10);
		$('#textInput').focus();
	}
	bubbleEdited = bubb;
	showControls(bubb.position().top, bubb.position().left);
}

function commitText() {
	text = $('#textInput').val();
	$('#textInput').hide();
	bubbleEdited.changeText(text);
}

function cancelText() {
	text = originalText;
	$('#textInput').hide();
	bubbleEdited.changeText(text);
}

function showControls(toTop, toLeft) {
	$('.hoverButton').show();
	$('#flipVert').css('top', toTop + bubbleEdited.h / 2 - $('#flipVert').height() / 2 - 5);
	$('#flipVert').css('left', toLeft - 15);

	$('#flipHoriz').css('top', toTop - 15);
	$('#flipHoriz').css('left', toLeft + bubbleEdited.w / 2 - $('#flipHoriz').width() / 2);

	$('#close').css('top', toTop - 15);
	$('#close').css('left', toLeft + bubbleEdited.w - 10);

	$('#flipHoriz').attr({ src : bubbleEdited.type % 3 != 0 ? 'images/right-left.png' : 'images/left-right.png'});
	$('#flipVert').attr({ src : bubbleEdited.type < 2 ? 'images/down-up.png' : 'images/up-down.png'});
}

function hideControls() {
	$('.hoverButton').hide();
	$('#textInput').hide();
}

function openForm(text) {
	var elem = $('#enterUrl');
	$('#formLabel').html(text);
	$('#formField').width('80%');
	$('#enterUrl').toggle(function() {
		$('#formField').focus();
	});
}

window.onload = createUploader;

$(this).ready(function() {

	if (iUrl && iUrl.length > 1) {
		loadImage("/upload/" + iUrl);
	}

	$('#textInput').hide();

	$('#canv').click(function(ev) {
		hideControls();
		if (!bubbleEdited) {
			var b = new Bubble($('#bubbles'));
			b.clickHandler = bubbleClickHandler;
			b.startDragHandler = hideControls;
			b.startResizeHandler = hideControls;
			b.move(ev.pageX, ev.pageY);
			bubbles[b.id] = b;
			bubbleClickHandler(ev, b);
		} else {
			bubbleEdited = undefined;
		}
	});

	$('#flipHoriz').click(function() {
		bubbleEdited.type = (bubbleEdited.type % 2 == 0) ? bubbleEdited.type + 1 : bubbleEdited.type - 1;
		bubbleEdited.resize();
		bubbleEdited.draw();
		$('#flipHoriz').attr({ src : bubbleEdited.type % 3 != 0 ? 'images/right-left.png' : 'images/left-right.png'});
	});

	$('#flipVert').click(function() {
		bubbleEdited.type = 3 - bubbleEdited.type;
		bubbleEdited.resize();
		bubbleEdited.draw();
		$('#flipVert').attr({ src : bubbleEdited.type < 2 ? 'images/down-up.png' : 'images/up-down.png'});
	});

	$('#close').click(function(ev) {
		bubbleEdited.remove();
		hideControls();
		delete bubbles[bubbleEdited.id];
		bubbleEdited = undefined;

	});

	$('#btnWeb').click(function() {
		openForm("Enter the Image URL");
		formSubmit = function() {
			var s = "/imageFromWeb?url=" + $("#formField").val();
			$.getJSON(s, function(json) {
				if (json.success) {
					image = json.id;
					loadImage("/upload/" + json.id);
					$('#enterUrl').hide();
				} else {
					alert('nok');
				}
			});
		}
	});

	$('#btnFlickr').click(function() {
		openForm("Enter a tag for a random FlickR image");
		formSubmit = function() {
			alert('Coming Soon');
		}
	});

	$('#btnDownload').click(function() {
		var s = "/image?file=" + image + "&data=" + serializeBubbles(bubbles);
		console.log(s);
		window.location = s;
	});

	$('#btnEmail').click(function() {
		$('#emailForm').toggle();
		formSubmit = function() {
			var s = "/email?file=" + image + "&data=" + serializeBubbles(bubbles);
			$.getJSON(s,
					{from: $('#emailFrom').val(),
						to: $('#emailTo').val(),
						body: $('#emailBody').val(),
						subject: $('#emailSubject').val()},
					function(json) {
						if (json.success) {
							$('#progress').html("Email sent...");
						} else {
							$('#progress').html("Email not sent...");
							// TODO handle
						}
					});
			$('#emailForm').toggle();
			$('#progress').show();
			$('#progress').html("Sending Email...");
		}

	});

	$('#btnImgur').click(function() {
		var s = "/imgur?file=" + image + "&data=" + serializeBubbles(bubbles);
		console.log(s);
		window.location = s;
	});

	$('.cancelButton').click(function() {
		$('.overlayForm').fadeOut('fast');
	});

	$('#textInput').keyup(function(ev) {
		console.log(ev.keyCode);
		if (ev.keyCode == 13) {
			ev.preventDefault();
			commitText();
		} else
		if (ev.keyCode == 27) {
			cancelText();
		}
	});

	$('#textInput').focusout(function() {
		commitText();
	});
});

