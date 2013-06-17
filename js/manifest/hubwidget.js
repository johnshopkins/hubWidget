/**
 * @codekit-prepend "../custom/prototypes.js"
 * @codekit-prepend "../lib/simplyAjax.js"
 * @codekit-prepend "../custom/hubJS.abbrev.js"
 * @codekit-prepend "../custom/widgetCreator.js"
 */

var widget = document.getElementById("hubWidget");

widgetCreator.create( widget,{
	version: widget.getAttribute("version"),
	key: widget.getAttribute("key")
});