(function($) {
	$.fn.toggle = function(callback) {
		var elem = $(this);
		if (elem.is(":visible")) elem.fadeOut('fast'); else elem.fadeIn('fast', callback);
		return this;
	}
}
)(jQuery);
