var Widget = require("./Widget");

module.exports = function (elements) {

  var length = elements.length;

  for (var i = 0; i < length; i++) {

    var element = elements.item(i);
    var widget = new Widget(element);
    widget.create();

  }

};
