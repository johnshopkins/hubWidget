var utils = function () {

};

utils.prototype.getPublishDate = function(timestamp) {
  var date = new Date(timestamp * 1000);
  var month = this.getMonth(date);
  var day = date.getDate();
  var year = date.getFullYear();

  return fullDate = month + " " + day + ", " + year;
};

utils.prototype.getMonth = function(dateObject) {
  var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return monthNames[dateObject.getMonth()];
};

utils.prototype.cleanList = function (string) {
  return string.replace(/\s/g, "");
};

utils.prototype.removeClass = function (obj, className) {

  var classes = obj.className;

  var re = new RegExp(className);
  var newClasses = classes.replace(re, "");

  obj.className = newClasses;
  
};

utils.prototype.trim = function (string) {
  return string.replace(/^\s+|\s+$/g, "");
};

utils.prototype.isNumeric = function(obj) {
  return !isNaN( parseFloat(obj) ) && isFinite( obj );
};

module.exports = new utils();
