/*!
 * Automatically creates widgets out of
 * all divs with the class of "hub-widget"
 *
 */

/* global require: false */
/* global document: false */

var $ = require("./shims/jquery");

$(function() {
  var WidgetCreator = require("./lib/WidgetCreator");
  new WidgetCreator(document.querySelectorAll(".hub-widget"));
});
