/**
 * jQuery plugin
 */

/**
 * @codekit-prepend "../custom/hubJS.abbrev.js"
 * @codekit-prepend "../custom/widgetCreator.js"
 */

(function( $ ){
	$.fn.hubWidget = function() {
		return widgetCreator.create(this);
	};
})( jQuery );