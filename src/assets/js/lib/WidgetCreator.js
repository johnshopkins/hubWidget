/* global require: false */
/* global module: false */

var $ = require("../shims/jquery");
var Widget = require("./Widget");

module.exports = function (elements) {

  $.each(elements, function (i, element) {

    var widget = new Widget(element);
    widget.create();

  });

};
