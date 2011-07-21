var bubbleCounter = 0;

var Bubble = function(parent) {
	this.x = 0;
	this.y = 0;
	this.w = 150;
	this.h = 75;
	this.text = "";
	this.type = 0;
	this.id = bubbleCounter;

	parent.append('<div id="cont' + bubbleCounter + '" style="position: absolute">' +
			'<canvas id="bubble' + bubbleCounter + '" width="'+this.w+'" height="'+this.h+'"></canvas></div>');

	var that = this;
	var resizing = false;

	$('#cont' + bubbleCounter).css('width', this.w);
	$('#cont' + bubbleCounter).css('height', this.h);
	$('#cont' + bubbleCounter).draggable({
		start: function() {
			$(this).fadeTo('fast', 0.5);
			if (typeof that.startDragHandler == "function") that.startDragHandler();
		},
		drag: function(event, ui) {
			that.x = ui.position.left - $('#canv').position().left;
			that.y = ui.position.top - $('#canv').position().top;
		},
		stop: function() {
			$(this).fadeTo('fast', 1);
		}
	});

	$('#cont' + bubbleCounter).click(function(ev) {
		if (!resizing) {
			that.clickHandler(ev, that);
		}
		resizing = false;
	});

	$('#cont' + bubbleCounter).resizable({
		start: function() {
			if (typeof that.startResizeHandler == "function") that.startResizeHandler();
		},
		resize: function(event, ui) {
			that.w = ui.size.width;
			that.h = ui.size.height;
			that.resize();
			that.draw();
			resizing = true;
		}
	});
	this.resize();
	this.draw();
	bubbleCounter++;
}


Bubble.prototype.remove = function() {
	$('#cont'+this.id).remove();
}

Bubble.prototype.position = function() {
	return $('#cont'+this.id).position();
}

Bubble.prototype.move = function(toX, toY) {
	this.x = toX - $('#canv').position().left;
	this.y = toY - $('#canv').position().top
	$('#cont'+this.id).css('left', toX);
	$('#cont'+this.id).css('top', toY);
}

Bubble.prototype.resize = function() {
	var b_canvas = document.getElementById("bubble" + this.id);
	console.log('resizing',this.id,this.w,this.h);
	b_canvas.width = this.w;
	b_canvas.height = this.h;
	$('#cont'+this.id).css('width', this.w);
	$('#cont'+this.id).css('height', this.h);
}

Bubble.prototype.textWidth = function() {
	var b_canvas = document.getElementById("bubble" + this.id);
	var ctx2 = b_canvas.getContext("2d");
	var te = ctx2.measureText(this.text);
	return te.width;

}

Bubble.prototype.draw = function() {
	console.log('drawing',this.id, this.x,this.y,this.w,this.h);
	var b_canvas = document.getElementById("bubble" + this.id);
	var b_context = b_canvas.getContext("2d");
	drawBubble(b_context, 0, 0, this.w, this.h, this.text, this.type);
}

Bubble.prototype.changeText = function(val) {
	var b_canvas = document.getElementById("bubble" + this.id);
	console.log('changing text',this.id,this.w,this.h);
	b_canvas.width = this.w;
	b_canvas.height = this.h;
	this.text = val.replace(/[\n\r]/g,"");
	this.draw();
}

Bubble.prototype.fitToText = function() {
	var b_canvas = document.getElementById("bubble" + this.id);
	var ctx2 = b_canvas.getContext("2d");
	var te = ctx2.measureText(this.text);
	this.w = te.width + 50;
	this.h = 50;
	this.resize();
	this.draw();
}
