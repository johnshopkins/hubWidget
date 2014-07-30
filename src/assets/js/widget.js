/* global require: false */
/* global document: false */

var Widget = require("./lib/WidgetCreator");

var div = document.getElementById("hubWidget");
new Widget(div);
