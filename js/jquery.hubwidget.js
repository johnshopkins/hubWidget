/**
 * @codekit-prepend "lib/hubJS.js"
 * @codekit-prepend "custom/widgetCreator.js"
 */

(function( $ ){
	$.fn.hubWidget = function() {
		return widgetCreator.create(this);
	};
})( jQuery );