function getMonthName (date) {

  var months = {
    1: "January",
    2: "February",
    3: "March",
    4: "April",
    5: "May",
    6: "June",
    7: "July",
    8: "August",
    9: "September",
    10: "October",
    11: "November",
    12: "December"
  };

  var monthNum = date.getMonth() + 1;

  return months[monthNum];
}

function getHour (date) {

  var hour = date.getHours();

  if (hour > 12) {
    return hour - 12;
  }

  if (hour === 0) {
    return 12;
  }

  return hour;

}

function getMinutes (date) {

  var minutes = date.getMinutes();

  if (minutes < 10) {
    return "0" + minutes.toString();
  }

  return minutes.toString();

}

function getAmPm (date) {

  var hour = date.getHours();
  return hour < 12 ? "am" : "pm";

}

/**
 * Parse event dates. The expected format
 * is YYYY-MM-DD HH:MM. For IE8 compatibility.
 * @param {[type]} date [description]
 */
function parseDate(date) {

  var parts = date.split(" ");

  var date = parts[0].split("-");
  var time = parts[1].split(":");

  // zero-indexing of months
  var month = parseInt(date[1]) - 1;

  return new Date(date[0], month, date[2], time[0], time[1]);

}

var Formatter = function (date) {

  if (typeof date === "number") {
    // article
    var timestamp = date * 1000;
    this.dateObject = new Date(timestamp);
  } else {
    // event
    this.dateObject = parseDate(date);
  }

  // alert(timestamp);

  // this.dateObject = new Date(timestamp);

  this.date = {
    timstamp: timestamp,
    dayOfMonth: this.dateObject.getDate(),         // 1-31
    monthName: getMonthName(this.dateObject),      // November
    year: this.dateObject.getFullYear(),           // 2014
    hour: getHour(this.dateObject),                // 1-12
    minutes: getMinutes(this.dateObject),          // 0-59
    ampm: getAmPm(this.dateObject)                 // a.m. or p.m.
  };

};

Formatter.prototype.article = function () {
  return this.date.monthName + " " + this.date.dayOfMonth + ", " + this.date.year;
};

Formatter.prototype.event = function () {
  return this.date.monthName + " " + this.date.dayOfMonth + " at " + this.date.hour + ":" + this.date.minutes + this.date.ampm;
};

module.exports = Formatter;
