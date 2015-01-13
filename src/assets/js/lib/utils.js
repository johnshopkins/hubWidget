var utils = function () {

};

utils.prototype.removeClass = function (obj, className) {

  var classes = obj.className;

  var re = new RegExp(className);
  var newClasses = classes.replace(re, "");

  obj.className = newClasses;

};

utils.prototype.isNumeric = function(obj) {
  return !isNaN( parseFloat(obj) ) && isFinite( obj );
};

module.exports = new utils();
