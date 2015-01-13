/*!
 * Automatically creates widgets out of
 * all divs with the class of "hub-widget"
 *
 */

/* global require: false */
/* global document: false */

var $ = require("./shims/jquery");
var WidgetCreator = require("./lib/WidgetCreator");

$(function() {
  new WidgetCreator($(".hub-widget"));
});
