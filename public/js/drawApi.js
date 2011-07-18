getLines = function(ctx, phrase, maxPxLength) {
	var wa = phrase.split(" "),
			phraseArray = [],
			lastPhrase = "",
			l = maxPxLength,
			measure = 0;
	for (var i = 0; i < wa.length; i++) {
		var w = wa[i];
		measure = ctx.measureText(lastPhrase + w).width;
		if (measure < l) {
			lastPhrase += (" " + w);
		} else {
			phraseArray.push(lastPhrase);
			lastPhrase = w;
		}
		if (i === wa.length - 1) {
			phraseArray.push(lastPhrase);
			break;
		}
	}
	return phraseArray;
}

this.drawBubble = function(ctx, x, y, w, h, text, orient) {
	h -= 15;
	w -= 15;
	x += 2;
	y += 2;
	var kappa = .5522848;
	ox = (w / 2) * kappa,// control point offset horizontal
			oy = (h / 2) * kappa,// control point offset vertical
			xe = x + w,// x-end
			ye = y + h,// y-end
			xm = x + w / 2,// x-middle
			ym = y + h / 2;       // y-middle


	var drawEllipse = function() {
		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
		ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
		ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
		ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
		ctx.closePath();
	}

	drawEllipse();
	ctx.stroke();

	ctx.beginPath();

	if (orient == 0) {
		ctx.moveTo(x, y);
		ctx.lineTo(x + ox / 2, ym);
		ctx.moveTo(x, y);
		ctx.lineTo(xm - ox, ym - oy);
		ctx.lineTo(x + ox / 2, ym);
	} else if (orient == 1) {
		ctx.moveTo(xe, y);
		ctx.lineTo(xe - ox / 2, ym);
		ctx.moveTo(xe, y);
		ctx.lineTo(xm + ox, ym - oy);
		ctx.lineTo(xe - ox / 2, ym);
	} else if (orient == 2) {
		ctx.moveTo(xe, ye);
		ctx.lineTo(xe - ox / 2, ym);
		ctx.moveTo(xe, ye);
		ctx.lineTo(xm + ox, ym + oy);
		ctx.lineTo(xe - ox / 2, ym);
	} else if (orient == 3) {
		ctx.moveTo(x, ye);
		ctx.lineTo(x + ox / 2, ym);
		ctx.moveTo(x, ye);
		ctx.lineTo(xm - ox, ym + oy);
		ctx.lineTo(x + ox / 2, ym);
	}
	ctx.closePath();
	ctx.stroke();
	ctx.fillStyle = '#fff'
	ctx.fill();

	drawEllipse();
	ctx.fill();

	ctx.font = '14px Georgia';
	ctx.strokeStyle = '#000000';
	ctx.fillStyle = '#000'

	var lines = getLines(ctx, text, w * 0.8);

	var yd = h / 2 - 20 * lines.length / 2 + 15;
	for (var line in lines) {
		var te = ctx.measureText(lines[line]);

		ctx.fillText(lines[line], x + w / 2 - te.width / 2, y + yd);
		yd += 20;
	}
}
