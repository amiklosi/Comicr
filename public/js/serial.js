this.delimiter = "±";
this.serializeBubbles = function(bubbles) {
	var str = "";
	for (var b in bubbles) {
		var bubble = bubbles[b];
		str += "|"+[bubble.x,bubble.y,bubble.w,bubble.h,bubble.text,bubble.type].join(this.delimiter);
	}
	return str.substring(1);
}

this.deserializeBubbles =  function(data) {
	var bubbles = {};
	if (!data) return bubbles;
	var bubs = data.split('|');
	var i = 0;
	for (var b in bubs) {
		var els = bubs[b].split(this.delimiter);
		bubbles[i] = {x: els[0], y: els[1], w: els[2], h: els[3], text: els[4], type: els[5]};
		i++;
	}
	return bubbles;
}