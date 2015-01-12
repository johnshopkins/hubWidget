(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global require: false */

window.Widget = require("./lib/WidgetCreator");

},{"./lib/WidgetCreator":2}],2:[function(require,module,exports){
var api = require("./api");
var utils = require("./utils");
var DateFormatter = require("./date-formatter");

var WidgetCreator = function (div) {

  this.widget = div;

  this.api = new api({
    key: this.widget.getAttribute("data-key"),
    v: this.widget.getAttribute("data-version")
  });

  var type = this.widget.getAttribute("data-type");
  this.type = type ? type : "articles";

  var title = this.widget.getAttribute("data-title");
  this.title = title ? title : "News from the Hub";

  this.createQueryStringParameters();
  this.create();

};

WidgetCreator.prototype.createQueryStringParameters = function () {

  // defaults
  this.parameters = { per_page: 5 };

  var count = parseInt(this.widget.getAttribute("data-count"));
  if (utils.isNumeric(count)) this.parameters.per_page = count;

  var channels = this.widget.getAttribute("data-channels");
  if (channels) this.parameters.channels = channels;

  var tags = this.widget.getAttribute("data-tags");
  if (tags) this.parameters.tags = tags;

  var topics = this.widget.getAttribute("data-topics");
  if (topics) this.parameters.topics = topics;

};

WidgetCreator.prototype.create = function () {

  var html = "<div class=\"header\">" + this.title + "</div>";
  html += "<div id=\"hubWidgetContent\" class=\"loading\"></div>";
  html += "<div class=\"hubpower clearfix\"><div class=\"link\"><a href=\"http://hub.jhu.edu\">http://hub.jhu.edu</a></div><div class=\"image\"><a href=\"http://hub.jhu.edu\"><span>Powered by the Hub</span></a></div></div>";

  this.widget.innerHTML = html;

  var self = this;

  this.getData(function (error, data) {

    if (error) return self.displayError();
    self.populateWidget(data);

  });

};

/**
 * Get obects to populate the widget
 * @param  {Lamdba(data, jqXHR)} Callback that fires upon successful retrieval of data.
 * @return {object} hubWidget
 */
WidgetCreator.prototype.getData = function (callback) {

  // something other than articles or events was requested
  if (!this.api[this.type]) return this.displayError();

  this.api[this.type](this.parameters).then(function (payload) {

    if (payload.error) {
      return callback(payload.error);
    } else {
      return callback(null, payload);
    }

  });

};

WidgetCreator.prototype.populateWidget = function (data) {

  var content = "";

  if (this.type == "articles") {
    content = this.getFormattedArticles(data);
  } else if (this.type == "events") {
    content = this.getFormattedEvents(data);
  }

  if (!content) return this.displayError();

  utils.removeClass(document.getElementById("hubWidgetContent"), "loading");
  document.getElementById("hubWidgetContent").innerHTML = "<ul>" + content + "</ul>";

};

WidgetCreator.prototype.getFormattedArticles = function (data) {

  var articles = data._embedded.articles;
  if (!articles) return;

  var html = "";

  for (var i = 0, len = articles.length; i < len; i++) {

    var article = articles[i];
    html += "<li><p class=\"headline\"><a href=\"" + article.url +"\">" + article.headline +"</a></p>";
    html += "<p class=\"pubdate\">" + utils.getPublishDate(article.publish_date) + "</a></p></li>";

  }

  return html;

};

WidgetCreator.prototype.getFormattedEvents = function (data) {

  var events = data._embedded.events;
  if (!events) return;

  var html = "";

  for (var i = 0, len = events.length; i < len; i++) {

    var event = events[i];

    var formatter = new DateFormatter(event.start_date, event.start_time);

    html += "<li><p class=\"headline\"><a href=\"" + event.url +"\">" + event.name +"</a></p>";
    html += "<p class=\"pubdate\">" + formatter.event() + "</a></p></li>";

  }

  return html;

};



/**
 * Displays an error if non results were returned.
 * @return null
 */
WidgetCreator.prototype.displayError = function () {

  utils.removeClass(document.getElementById("hubWidgetContent"), "loading");
  document.getElementById("hubWidgetContent").innerHTML = "<p>Sorry, no results were found. Trying checking out <a href=\"http://hub.jhu.edu\">The Hub</a> for the latest Johns Hopkins news and events.</p>";

};

module.exports = WidgetCreator;

},{"./api":4,"./date-formatter":5,"./utils":7}],3:[function(require,module,exports){
var Deferred = require("./deferred");

var Ajax = function () {};

/**
 * Sets _xhr to either XMLHttpRequest or
 * the correct version ofActiveXObject
 *
 * @return {Object}
 */
Ajax.prototype.getXHR = function () {
	var xhr;

	if (typeof XMLHttpRequest !== 'undefined') {
		xhr = new XMLHttpRequest();

	} else {
		var versions = ["Microsoft.XmlHttp", "MSXML2.XmlHttp", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.5.0"];

		for (var i = 0, len = versions.length; i < len; i++) {
			try {
				xhr = new ActiveXObject(versions[i]);
				break;
			}
			catch (e) {}
		}
	}
	return xhr;
};

/**
 * Attach a script element to the current page
 * referencing the URL we need to make a GET
 * request to
 * @param  {string} url Full URL (with query string)
 * @return null
 */
Ajax.prototype.crossDomainRequest = function (url) {
	var script = document.createElement("script");
	script.src = url;
	document.body.appendChild(script);
};

/**
 * Make a GET request
 *
 * @param  {Object} obj
 *         url: URL to make the request to
 *         data: Plain object of key: value pairs to send with the request
 *         dataType: right now, specifiying jsonp is the only thing that does anything
 *         success: callback function to fire upon a successful GET request (data, statusCode, statusText)
 *         fail: callback function to fire upon a failed GET request (statusCode, statusText)
 * @return null
 */
Ajax.prototype.get = function(obj) {

	var deferred = new Deferred();

	var url;

	if (obj.dataType && obj.dataType.toLowerCase() == "jsonp") {

		// assign success callback to a function on ajax object
		var cb = this.randomCallbackName();
		window[cb] = deferred.resolve;

		// assign callback in URL
		obj.data.callback = cb;
		url = obj.url + this.createQueryString(obj.data);

		this.crossDomainRequest(url);

	} else {

		url = obj.url + this.createQueryString(obj.data);

		var xhr = getXHR();

		xhr.onreadystatechange = function() {

			if (xhr.readyState === 4) {

				if (xhr.status == 200) {
					deferred.resolve(xhr.responseText, xhr.status);
				} else {
					deferred.reject(xhr.status);
				}
			}
		};

		xhr.open("GET", url, true);
		xhr.send(null);
	}

	return deferred.promise;

};

/**
 * Create a query string from an object
 * containing key: value pairs
 * @param  {Object} object
 * @return {string} Query string
 */
Ajax.prototype.createQueryString = function(object) {

	var queryString = "";
	var amp = false;

	for (var key in object) {
		if (amp) {
			queryString += "&";
		}
		queryString += key + "=" + object[key];

		// start adding the ampersand from now on
		amp = true;
	}

	return "?" + queryString;
};

Ajax.prototype.random = function() {
	return Math.floor(Math.random() * (100000 * 100000));
};

Ajax.prototype.randomCallbackName = function() {
	var timestamp = new Date().getTime();
	return "Ajax_" + this.random() + "_" + timestamp + "_" + this.random();
};

module.exports = new Ajax();

},{"./deferred":6}],4:[function(require,module,exports){
/**
 * A super-simple version of HubJS
 */

var ajax = require("./ajax");

var api = function (settings) {

  this.key = settings.key;
  this.v = settings.v;

};

/**
 * Gets a payload from the Hub API
 *
 * @param  {string}   endpoint    API endpoint
 * @param  {object}   data      Data to be sent to the server
 * @return {Object}     promise
 */
api.prototype.get = function (endpoint, data) {

  data.v = this.v;
  data.key = this.key;

  return ajax.get({
    url: "http://api.hub.jhu.edu/" + endpoint,
    dataType: "jsonp",
    data: data
  });
}

/**
 * Find an article or articles
 *
 * @param  {object}   data      Data to be sent to the server
 * @return {Object}     promise
 */
api.prototype.articles = function(data) {
  return this.get("articles", data);
};

/**
 * Find an event or events
 *
 * @param  {object}   data      Data to be sent to the server
 * @return {Object}     promise
 */
api.prototype.events = function(data) {
  return this.get("events", data);
}

module.exports = api;

},{"./ajax":3}],5:[function(require,module,exports){
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

var Formatter = function (date) {

  var timestamp;

  if (typeof date === "number") {
    timestamp = date * 1000;
  } else {
    timestamp = Date.parse(date);
  }

  this.dateObject = new Date(timestamp);

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

Formatter.prototype.event = function () {
  return this.date.monthName + " " + this.date.dayOfMonth + " at " + this.date.hour + ":" + this.date.minutes + this.date.ampm;
};

module.exports = Formatter;

},{}],6:[function(require,module,exports){
var Deferred = function() {

	var deferred = {

		newDefer: {},

		resolve: function(responseText, status, statusText) {

			// result of the function passed to then()
			var result = deferred.fulfilled(responseText, status, statusText);

			if (result && result.then) {
				// we need to wait here until promise resolves
				result.then(function(data) {
					deferred.newDefer.resolve(data);
				});
			}

			else if (typeof deferred.newDefer.resolve == "function") {
				// another 'then' was defined
				deferred.newDefer.resolve(result);
			}
		},

		reject: function(promiseOrValue) {

			// result of the function passed to then()
			var result = deferred.error(promiseOrValue);

			if (promiseOrValue && promiseOrValue.then) {
				// we need to wait here until promise resolves
				promiseOrValue.then(function(data) {
					deferred.newDefer.resolve(data);
				});
			}

			else if (typeof deferred.newDefer.reject == "function") {
				// another 'then' was defined
				deferred.newDefer.reject(result);
			}
		},

		fulfilled: function(responseText, status, statusText) { },

		error: function(status, statusText) { },

		// what arguments, when does this fire?
		progress: function() { },

		promise: {

			then: function(fulfilled, error, progress) {

				deferred.fulfilled = typeof fulfilled == "function" ? fulfilled : function() {};
				deferred.error = typeof error == "function" ? error : function() {};
				deferred.progress = typeof progress == "function" ? progress: function() {};

				// This function should return a new promise that is fulfilled when the given
				// fulfilledHandler or errorHandler callback is finished
				deferred.newDefer = new Deferred();
				return deferred.newDefer.promise;
			}
		}
	};

	return deferred;

};

module.exports = Deferred;

},{}],7:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qd2FjaHRlci93d3cvbGlicy9odWJXaWRnZXQvbm9kZV9tb2R1bGVzL2d1bHAtdGFza3Mvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2p3YWNodGVyL3d3dy9saWJzL2h1YldpZGdldC9zcmMvYXNzZXRzL2pzL2Zha2VfYjIxOTZjOTkuanMiLCIvVXNlcnMvandhY2h0ZXIvd3d3L2xpYnMvaHViV2lkZ2V0L3NyYy9hc3NldHMvanMvbGliL1dpZGdldENyZWF0b3IuanMiLCIvVXNlcnMvandhY2h0ZXIvd3d3L2xpYnMvaHViV2lkZ2V0L3NyYy9hc3NldHMvanMvbGliL2FqYXguanMiLCIvVXNlcnMvandhY2h0ZXIvd3d3L2xpYnMvaHViV2lkZ2V0L3NyYy9hc3NldHMvanMvbGliL2FwaS5qcyIsIi9Vc2Vycy9qd2FjaHRlci93d3cvbGlicy9odWJXaWRnZXQvc3JjL2Fzc2V0cy9qcy9saWIvZGF0ZS1mb3JtYXR0ZXIuanMiLCIvVXNlcnMvandhY2h0ZXIvd3d3L2xpYnMvaHViV2lkZ2V0L3NyYy9hc3NldHMvanMvbGliL2RlZmVycmVkLmpzIiwiL1VzZXJzL2p3YWNodGVyL3d3dy9saWJzL2h1YldpZGdldC9zcmMvYXNzZXRzL2pzL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsIHJlcXVpcmU6IGZhbHNlICovXG5cbndpbmRvdy5XaWRnZXQgPSByZXF1aXJlKFwiLi9saWIvV2lkZ2V0Q3JlYXRvclwiKTtcbiIsInZhciBhcGkgPSByZXF1aXJlKFwiLi9hcGlcIik7XG52YXIgdXRpbHMgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbnZhciBEYXRlRm9ybWF0dGVyID0gcmVxdWlyZShcIi4vZGF0ZS1mb3JtYXR0ZXJcIik7XG5cbnZhciBXaWRnZXRDcmVhdG9yID0gZnVuY3Rpb24gKGRpdikge1xuXG4gIHRoaXMud2lkZ2V0ID0gZGl2O1xuXG4gIHRoaXMuYXBpID0gbmV3IGFwaSh7XG4gICAga2V5OiB0aGlzLndpZGdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtleVwiKSxcbiAgICB2OiB0aGlzLndpZGdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXZlcnNpb25cIilcbiAgfSk7XG5cbiAgdmFyIHR5cGUgPSB0aGlzLndpZGdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXR5cGVcIik7XG4gIHRoaXMudHlwZSA9IHR5cGUgPyB0eXBlIDogXCJhcnRpY2xlc1wiO1xuXG4gIHZhciB0aXRsZSA9IHRoaXMud2lkZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtdGl0bGVcIik7XG4gIHRoaXMudGl0bGUgPSB0aXRsZSA/IHRpdGxlIDogXCJOZXdzIGZyb20gdGhlIEh1YlwiO1xuXG4gIHRoaXMuY3JlYXRlUXVlcnlTdHJpbmdQYXJhbWV0ZXJzKCk7XG4gIHRoaXMuY3JlYXRlKCk7XG5cbn07XG5cbldpZGdldENyZWF0b3IucHJvdG90eXBlLmNyZWF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVycyA9IGZ1bmN0aW9uICgpIHtcblxuICAvLyBkZWZhdWx0c1xuICB0aGlzLnBhcmFtZXRlcnMgPSB7IHBlcl9wYWdlOiA1IH07XG5cbiAgdmFyIGNvdW50ID0gcGFyc2VJbnQodGhpcy53aWRnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1jb3VudFwiKSk7XG4gIGlmICh1dGlscy5pc051bWVyaWMoY291bnQpKSB0aGlzLnBhcmFtZXRlcnMucGVyX3BhZ2UgPSBjb3VudDtcblxuICB2YXIgY2hhbm5lbHMgPSB0aGlzLndpZGdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWNoYW5uZWxzXCIpO1xuICBpZiAoY2hhbm5lbHMpIHRoaXMucGFyYW1ldGVycy5jaGFubmVscyA9IGNoYW5uZWxzO1xuXG4gIHZhciB0YWdzID0gdGhpcy53aWRnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS10YWdzXCIpO1xuICBpZiAodGFncykgdGhpcy5wYXJhbWV0ZXJzLnRhZ3MgPSB0YWdzO1xuXG4gIHZhciB0b3BpY3MgPSB0aGlzLndpZGdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRvcGljc1wiKTtcbiAgaWYgKHRvcGljcykgdGhpcy5wYXJhbWV0ZXJzLnRvcGljcyA9IHRvcGljcztcblxufTtcblxuV2lkZ2V0Q3JlYXRvci5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBodG1sID0gXCI8ZGl2IGNsYXNzPVxcXCJoZWFkZXJcXFwiPlwiICsgdGhpcy50aXRsZSArIFwiPC9kaXY+XCI7XG4gIGh0bWwgKz0gXCI8ZGl2IGlkPVxcXCJodWJXaWRnZXRDb250ZW50XFxcIiBjbGFzcz1cXFwibG9hZGluZ1xcXCI+PC9kaXY+XCI7XG4gIGh0bWwgKz0gXCI8ZGl2IGNsYXNzPVxcXCJodWJwb3dlciBjbGVhcmZpeFxcXCI+PGRpdiBjbGFzcz1cXFwibGlua1xcXCI+PGEgaHJlZj1cXFwiaHR0cDovL2h1Yi5qaHUuZWR1XFxcIj5odHRwOi8vaHViLmpodS5lZHU8L2E+PC9kaXY+PGRpdiBjbGFzcz1cXFwiaW1hZ2VcXFwiPjxhIGhyZWY9XFxcImh0dHA6Ly9odWIuamh1LmVkdVxcXCI+PHNwYW4+UG93ZXJlZCBieSB0aGUgSHViPC9zcGFuPjwvYT48L2Rpdj48L2Rpdj5cIjtcblxuICB0aGlzLndpZGdldC5pbm5lckhUTUwgPSBodG1sO1xuXG4gIHZhciBzZWxmID0gdGhpcztcblxuICB0aGlzLmdldERhdGEoZnVuY3Rpb24gKGVycm9yLCBkYXRhKSB7XG5cbiAgICBpZiAoZXJyb3IpIHJldHVybiBzZWxmLmRpc3BsYXlFcnJvcigpO1xuICAgIHNlbGYucG9wdWxhdGVXaWRnZXQoZGF0YSk7XG5cbiAgfSk7XG5cbn07XG5cbi8qKlxuICogR2V0IG9iZWN0cyB0byBwb3B1bGF0ZSB0aGUgd2lkZ2V0XG4gKiBAcGFyYW0gIHtMYW1kYmEoZGF0YSwganFYSFIpfSBDYWxsYmFjayB0aGF0IGZpcmVzIHVwb24gc3VjY2Vzc2Z1bCByZXRyaWV2YWwgb2YgZGF0YS5cbiAqIEByZXR1cm4ge29iamVjdH0gaHViV2lkZ2V0XG4gKi9cbldpZGdldENyZWF0b3IucHJvdG90eXBlLmdldERhdGEgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcblxuICAvLyBzb21ldGhpbmcgb3RoZXIgdGhhbiBhcnRpY2xlcyBvciBldmVudHMgd2FzIHJlcXVlc3RlZFxuICBpZiAoIXRoaXMuYXBpW3RoaXMudHlwZV0pIHJldHVybiB0aGlzLmRpc3BsYXlFcnJvcigpO1xuXG4gIHRoaXMuYXBpW3RoaXMudHlwZV0odGhpcy5wYXJhbWV0ZXJzKS50aGVuKGZ1bmN0aW9uIChwYXlsb2FkKSB7XG5cbiAgICBpZiAocGF5bG9hZC5lcnJvcikge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKHBheWxvYWQuZXJyb3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCwgcGF5bG9hZCk7XG4gICAgfVxuXG4gIH0pO1xuXG59O1xuXG5XaWRnZXRDcmVhdG9yLnByb3RvdHlwZS5wb3B1bGF0ZVdpZGdldCA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgdmFyIGNvbnRlbnQgPSBcIlwiO1xuXG4gIGlmICh0aGlzLnR5cGUgPT0gXCJhcnRpY2xlc1wiKSB7XG4gICAgY29udGVudCA9IHRoaXMuZ2V0Rm9ybWF0dGVkQXJ0aWNsZXMoZGF0YSk7XG4gIH0gZWxzZSBpZiAodGhpcy50eXBlID09IFwiZXZlbnRzXCIpIHtcbiAgICBjb250ZW50ID0gdGhpcy5nZXRGb3JtYXR0ZWRFdmVudHMoZGF0YSk7XG4gIH1cblxuICBpZiAoIWNvbnRlbnQpIHJldHVybiB0aGlzLmRpc3BsYXlFcnJvcigpO1xuXG4gIHV0aWxzLnJlbW92ZUNsYXNzKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaHViV2lkZ2V0Q29udGVudFwiKSwgXCJsb2FkaW5nXCIpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImh1YldpZGdldENvbnRlbnRcIikuaW5uZXJIVE1MID0gXCI8dWw+XCIgKyBjb250ZW50ICsgXCI8L3VsPlwiO1xuXG59O1xuXG5XaWRnZXRDcmVhdG9yLnByb3RvdHlwZS5nZXRGb3JtYXR0ZWRBcnRpY2xlcyA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgdmFyIGFydGljbGVzID0gZGF0YS5fZW1iZWRkZWQuYXJ0aWNsZXM7XG4gIGlmICghYXJ0aWNsZXMpIHJldHVybjtcblxuICB2YXIgaHRtbCA9IFwiXCI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFydGljbGVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cbiAgICB2YXIgYXJ0aWNsZSA9IGFydGljbGVzW2ldO1xuICAgIGh0bWwgKz0gXCI8bGk+PHAgY2xhc3M9XFxcImhlYWRsaW5lXFxcIj48YSBocmVmPVxcXCJcIiArIGFydGljbGUudXJsICtcIlxcXCI+XCIgKyBhcnRpY2xlLmhlYWRsaW5lICtcIjwvYT48L3A+XCI7XG4gICAgaHRtbCArPSBcIjxwIGNsYXNzPVxcXCJwdWJkYXRlXFxcIj5cIiArIHV0aWxzLmdldFB1Ymxpc2hEYXRlKGFydGljbGUucHVibGlzaF9kYXRlKSArIFwiPC9hPjwvcD48L2xpPlwiO1xuXG4gIH1cblxuICByZXR1cm4gaHRtbDtcblxufTtcblxuV2lkZ2V0Q3JlYXRvci5wcm90b3R5cGUuZ2V0Rm9ybWF0dGVkRXZlbnRzID0gZnVuY3Rpb24gKGRhdGEpIHtcblxuICB2YXIgZXZlbnRzID0gZGF0YS5fZW1iZWRkZWQuZXZlbnRzO1xuICBpZiAoIWV2ZW50cykgcmV0dXJuO1xuXG4gIHZhciBodG1sID0gXCJcIjtcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZXZlbnRzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cbiAgICB2YXIgZXZlbnQgPSBldmVudHNbaV07XG5cbiAgICB2YXIgZm9ybWF0dGVyID0gbmV3IERhdGVGb3JtYXR0ZXIoZXZlbnQuc3RhcnRfZGF0ZSwgZXZlbnQuc3RhcnRfdGltZSk7XG5cbiAgICBodG1sICs9IFwiPGxpPjxwIGNsYXNzPVxcXCJoZWFkbGluZVxcXCI+PGEgaHJlZj1cXFwiXCIgKyBldmVudC51cmwgK1wiXFxcIj5cIiArIGV2ZW50Lm5hbWUgK1wiPC9hPjwvcD5cIjtcbiAgICBodG1sICs9IFwiPHAgY2xhc3M9XFxcInB1YmRhdGVcXFwiPlwiICsgZm9ybWF0dGVyLmV2ZW50KCkgKyBcIjwvYT48L3A+PC9saT5cIjtcblxuICB9XG5cbiAgcmV0dXJuIGh0bWw7XG5cbn07XG5cblxuXG4vKipcbiAqIERpc3BsYXlzIGFuIGVycm9yIGlmIG5vbiByZXN1bHRzIHdlcmUgcmV0dXJuZWQuXG4gKiBAcmV0dXJuIG51bGxcbiAqL1xuV2lkZ2V0Q3JlYXRvci5wcm90b3R5cGUuZGlzcGxheUVycm9yID0gZnVuY3Rpb24gKCkge1xuXG4gIHV0aWxzLnJlbW92ZUNsYXNzKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaHViV2lkZ2V0Q29udGVudFwiKSwgXCJsb2FkaW5nXCIpO1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImh1YldpZGdldENvbnRlbnRcIikuaW5uZXJIVE1MID0gXCI8cD5Tb3JyeSwgbm8gcmVzdWx0cyB3ZXJlIGZvdW5kLiBUcnlpbmcgY2hlY2tpbmcgb3V0IDxhIGhyZWY9XFxcImh0dHA6Ly9odWIuamh1LmVkdVxcXCI+VGhlIEh1YjwvYT4gZm9yIHRoZSBsYXRlc3QgSm9obnMgSG9wa2lucyBuZXdzIGFuZCBldmVudHMuPC9wPlwiO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdpZGdldENyZWF0b3I7XG4iLCJ2YXIgRGVmZXJyZWQgPSByZXF1aXJlKFwiLi9kZWZlcnJlZFwiKTtcblxudmFyIEFqYXggPSBmdW5jdGlvbiAoKSB7fTtcblxuLyoqXG4gKiBTZXRzIF94aHIgdG8gZWl0aGVyIFhNTEh0dHBSZXF1ZXN0IG9yXG4gKiB0aGUgY29ycmVjdCB2ZXJzaW9uIG9mQWN0aXZlWE9iamVjdFxuICpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqL1xuQWpheC5wcm90b3R5cGUuZ2V0WEhSID0gZnVuY3Rpb24gKCkge1xuXHR2YXIgeGhyO1xuXG5cdGlmICh0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0eGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cblx0fSBlbHNlIHtcblx0XHR2YXIgdmVyc2lvbnMgPSBbXCJNaWNyb3NvZnQuWG1sSHR0cFwiLCBcIk1TWE1MMi5YbWxIdHRwXCIsIFwiTVNYTUwyLlhtbEh0dHAuMy4wXCIsIFwiTVNYTUwyLlhtbEh0dHAuNC4wXCIsIFwiTVNYTUwyLlhtbEh0dHAuNS4wXCJdO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDAsIGxlbiA9IHZlcnNpb25zLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR4aHIgPSBuZXcgQWN0aXZlWE9iamVjdCh2ZXJzaW9uc1tpXSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdFx0Y2F0Y2ggKGUpIHt9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB4aHI7XG59O1xuXG4vKipcbiAqIEF0dGFjaCBhIHNjcmlwdCBlbGVtZW50IHRvIHRoZSBjdXJyZW50IHBhZ2VcbiAqIHJlZmVyZW5jaW5nIHRoZSBVUkwgd2UgbmVlZCB0byBtYWtlIGEgR0VUXG4gKiByZXF1ZXN0IHRvXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHVybCBGdWxsIFVSTCAod2l0aCBxdWVyeSBzdHJpbmcpXG4gKiBAcmV0dXJuIG51bGxcbiAqL1xuQWpheC5wcm90b3R5cGUuY3Jvc3NEb21haW5SZXF1ZXN0ID0gZnVuY3Rpb24gKHVybCkge1xuXHR2YXIgc2NyaXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcblx0c2NyaXB0LnNyYyA9IHVybDtcblx0ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzY3JpcHQpO1xufTtcblxuLyoqXG4gKiBNYWtlIGEgR0VUIHJlcXVlc3RcbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9ialxuICogICAgICAgICB1cmw6IFVSTCB0byBtYWtlIHRoZSByZXF1ZXN0IHRvXG4gKiAgICAgICAgIGRhdGE6IFBsYWluIG9iamVjdCBvZiBrZXk6IHZhbHVlIHBhaXJzIHRvIHNlbmQgd2l0aCB0aGUgcmVxdWVzdFxuICogICAgICAgICBkYXRhVHlwZTogcmlnaHQgbm93LCBzcGVjaWZpeWluZyBqc29ucCBpcyB0aGUgb25seSB0aGluZyB0aGF0IGRvZXMgYW55dGhpbmdcbiAqICAgICAgICAgc3VjY2VzczogY2FsbGJhY2sgZnVuY3Rpb24gdG8gZmlyZSB1cG9uIGEgc3VjY2Vzc2Z1bCBHRVQgcmVxdWVzdCAoZGF0YSwgc3RhdHVzQ29kZSwgc3RhdHVzVGV4dClcbiAqICAgICAgICAgZmFpbDogY2FsbGJhY2sgZnVuY3Rpb24gdG8gZmlyZSB1cG9uIGEgZmFpbGVkIEdFVCByZXF1ZXN0IChzdGF0dXNDb2RlLCBzdGF0dXNUZXh0KVxuICogQHJldHVybiBudWxsXG4gKi9cbkFqYXgucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKG9iaikge1xuXG5cdHZhciBkZWZlcnJlZCA9IG5ldyBEZWZlcnJlZCgpO1xuXG5cdHZhciB1cmw7XG5cblx0aWYgKG9iai5kYXRhVHlwZSAmJiBvYmouZGF0YVR5cGUudG9Mb3dlckNhc2UoKSA9PSBcImpzb25wXCIpIHtcblxuXHRcdC8vIGFzc2lnbiBzdWNjZXNzIGNhbGxiYWNrIHRvIGEgZnVuY3Rpb24gb24gYWpheCBvYmplY3Rcblx0XHR2YXIgY2IgPSB0aGlzLnJhbmRvbUNhbGxiYWNrTmFtZSgpO1xuXHRcdHdpbmRvd1tjYl0gPSBkZWZlcnJlZC5yZXNvbHZlO1xuXG5cdFx0Ly8gYXNzaWduIGNhbGxiYWNrIGluIFVSTFxuXHRcdG9iai5kYXRhLmNhbGxiYWNrID0gY2I7XG5cdFx0dXJsID0gb2JqLnVybCArIHRoaXMuY3JlYXRlUXVlcnlTdHJpbmcob2JqLmRhdGEpO1xuXG5cdFx0dGhpcy5jcm9zc0RvbWFpblJlcXVlc3QodXJsKTtcblxuXHR9IGVsc2Uge1xuXG5cdFx0dXJsID0gb2JqLnVybCArIHRoaXMuY3JlYXRlUXVlcnlTdHJpbmcob2JqLmRhdGEpO1xuXG5cdFx0dmFyIHhociA9IGdldFhIUigpO1xuXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQpIHtcblxuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PSAyMDApIHtcblx0XHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlKHhoci5yZXNwb25zZVRleHQsIHhoci5zdGF0dXMpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRlZmVycmVkLnJlamVjdCh4aHIuc3RhdHVzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR4aHIub3BlbihcIkdFVFwiLCB1cmwsIHRydWUpO1xuXHRcdHhoci5zZW5kKG51bGwpO1xuXHR9XG5cblx0cmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgcXVlcnkgc3RyaW5nIGZyb20gYW4gb2JqZWN0XG4gKiBjb250YWluaW5nIGtleTogdmFsdWUgcGFpcnNcbiAqIEBwYXJhbSAge09iamVjdH0gb2JqZWN0XG4gKiBAcmV0dXJuIHtzdHJpbmd9IFF1ZXJ5IHN0cmluZ1xuICovXG5BamF4LnByb3RvdHlwZS5jcmVhdGVRdWVyeVN0cmluZyA9IGZ1bmN0aW9uKG9iamVjdCkge1xuXG5cdHZhciBxdWVyeVN0cmluZyA9IFwiXCI7XG5cdHZhciBhbXAgPSBmYWxzZTtcblxuXHRmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSB7XG5cdFx0aWYgKGFtcCkge1xuXHRcdFx0cXVlcnlTdHJpbmcgKz0gXCImXCI7XG5cdFx0fVxuXHRcdHF1ZXJ5U3RyaW5nICs9IGtleSArIFwiPVwiICsgb2JqZWN0W2tleV07XG5cblx0XHQvLyBzdGFydCBhZGRpbmcgdGhlIGFtcGVyc2FuZCBmcm9tIG5vdyBvblxuXHRcdGFtcCA9IHRydWU7XG5cdH1cblxuXHRyZXR1cm4gXCI/XCIgKyBxdWVyeVN0cmluZztcbn07XG5cbkFqYXgucHJvdG90eXBlLnJhbmRvbSA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKDEwMDAwMCAqIDEwMDAwMCkpO1xufTtcblxuQWpheC5wcm90b3R5cGUucmFuZG9tQ2FsbGJhY2tOYW1lID0gZnVuY3Rpb24oKSB7XG5cdHZhciB0aW1lc3RhbXAgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcblx0cmV0dXJuIFwiQWpheF9cIiArIHRoaXMucmFuZG9tKCkgKyBcIl9cIiArIHRpbWVzdGFtcCArIFwiX1wiICsgdGhpcy5yYW5kb20oKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IEFqYXgoKTtcbiIsIi8qKlxuICogQSBzdXBlci1zaW1wbGUgdmVyc2lvbiBvZiBIdWJKU1xuICovXG5cbnZhciBhamF4ID0gcmVxdWlyZShcIi4vYWpheFwiKTtcblxudmFyIGFwaSA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xuXG4gIHRoaXMua2V5ID0gc2V0dGluZ3Mua2V5O1xuICB0aGlzLnYgPSBzZXR0aW5ncy52O1xuXG59O1xuXG4vKipcbiAqIEdldHMgYSBwYXlsb2FkIGZyb20gdGhlIEh1YiBBUElcbiAqXG4gKiBAcGFyYW0gIHtzdHJpbmd9ICAgZW5kcG9pbnQgICAgQVBJIGVuZHBvaW50XG4gKiBAcGFyYW0gIHtvYmplY3R9ICAgZGF0YSAgICAgIERhdGEgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICBwcm9taXNlXG4gKi9cbmFwaS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGVuZHBvaW50LCBkYXRhKSB7XG5cbiAgZGF0YS52ID0gdGhpcy52O1xuICBkYXRhLmtleSA9IHRoaXMua2V5O1xuXG4gIHJldHVybiBhamF4LmdldCh7XG4gICAgdXJsOiBcImh0dHA6Ly9hcGkuaHViLmpodS5lZHUvXCIgKyBlbmRwb2ludCxcbiAgICBkYXRhVHlwZTogXCJqc29ucFwiLFxuICAgIGRhdGE6IGRhdGFcbiAgfSk7XG59XG5cbi8qKlxuICogRmluZCBhbiBhcnRpY2xlIG9yIGFydGljbGVzXG4gKlxuICogQHBhcmFtICB7b2JqZWN0fSAgIGRhdGEgICAgICBEYXRhIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlclxuICogQHJldHVybiB7T2JqZWN0fSAgICAgcHJvbWlzZVxuICovXG5hcGkucHJvdG90eXBlLmFydGljbGVzID0gZnVuY3Rpb24oZGF0YSkge1xuICByZXR1cm4gdGhpcy5nZXQoXCJhcnRpY2xlc1wiLCBkYXRhKTtcbn07XG5cbi8qKlxuICogRmluZCBhbiBldmVudCBvciBldmVudHNcbiAqXG4gKiBAcGFyYW0gIHtvYmplY3R9ICAgZGF0YSAgICAgIERhdGEgdG8gYmUgc2VudCB0byB0aGUgc2VydmVyXG4gKiBAcmV0dXJuIHtPYmplY3R9ICAgICBwcm9taXNlXG4gKi9cbmFwaS5wcm90b3R5cGUuZXZlbnRzID0gZnVuY3Rpb24oZGF0YSkge1xuICByZXR1cm4gdGhpcy5nZXQoXCJldmVudHNcIiwgZGF0YSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXBpO1xuIiwiZnVuY3Rpb24gZ2V0TW9udGhOYW1lIChkYXRlKSB7XG5cbiAgdmFyIG1vbnRocyA9IHtcbiAgICAxOiBcIkphbnVhcnlcIixcbiAgICAyOiBcIkZlYnJ1YXJ5XCIsXG4gICAgMzogXCJNYXJjaFwiLFxuICAgIDQ6IFwiQXByaWxcIixcbiAgICA1OiBcIk1heVwiLFxuICAgIDY6IFwiSnVuZVwiLFxuICAgIDc6IFwiSnVseVwiLFxuICAgIDg6IFwiQXVndXN0XCIsXG4gICAgOTogXCJTZXB0ZW1iZXJcIixcbiAgICAxMDogXCJPY3RvYmVyXCIsXG4gICAgMTE6IFwiTm92ZW1iZXJcIixcbiAgICAxMjogXCJEZWNlbWJlclwiXG4gIH07XG5cbiAgdmFyIG1vbnRoTnVtID0gZGF0ZS5nZXRNb250aCgpICsgMTtcblxuICByZXR1cm4gbW9udGhzW21vbnRoTnVtXTtcbn1cblxuZnVuY3Rpb24gZ2V0SG91ciAoZGF0ZSkge1xuXG4gIHZhciBob3VyID0gZGF0ZS5nZXRIb3VycygpO1xuXG4gIGlmIChob3VyID4gMTIpIHtcbiAgICByZXR1cm4gaG91ciAtIDEyO1xuICB9XG5cbiAgaWYgKGhvdXIgPT09IDApIHtcbiAgICByZXR1cm4gMTI7XG4gIH1cblxuICByZXR1cm4gaG91cjtcblxufVxuXG5mdW5jdGlvbiBnZXRNaW51dGVzIChkYXRlKSB7XG5cbiAgdmFyIG1pbnV0ZXMgPSBkYXRlLmdldE1pbnV0ZXMoKTtcblxuICBpZiAobWludXRlcyA8IDEwKSB7XG4gICAgcmV0dXJuIFwiMFwiICsgbWludXRlcy50b1N0cmluZygpO1xuICB9XG5cbiAgcmV0dXJuIG1pbnV0ZXMudG9TdHJpbmcoKTtcblxufVxuXG5mdW5jdGlvbiBnZXRBbVBtIChkYXRlKSB7XG5cbiAgdmFyIGhvdXIgPSBkYXRlLmdldEhvdXJzKCk7XG4gIHJldHVybiBob3VyIDwgMTIgPyBcImFtXCIgOiBcInBtXCI7XG5cbn1cblxudmFyIEZvcm1hdHRlciA9IGZ1bmN0aW9uIChkYXRlKSB7XG5cbiAgdmFyIHRpbWVzdGFtcDtcblxuICBpZiAodHlwZW9mIGRhdGUgPT09IFwibnVtYmVyXCIpIHtcbiAgICB0aW1lc3RhbXAgPSBkYXRlICogMTAwMDtcbiAgfSBlbHNlIHtcbiAgICB0aW1lc3RhbXAgPSBEYXRlLnBhcnNlKGRhdGUpO1xuICB9XG5cbiAgdGhpcy5kYXRlT2JqZWN0ID0gbmV3IERhdGUodGltZXN0YW1wKTtcblxuICB0aGlzLmRhdGUgPSB7XG4gICAgdGltc3RhbXA6IHRpbWVzdGFtcCxcbiAgICBkYXlPZk1vbnRoOiB0aGlzLmRhdGVPYmplY3QuZ2V0RGF0ZSgpLCAgICAgICAgIC8vIDEtMzFcbiAgICBtb250aE5hbWU6IGdldE1vbnRoTmFtZSh0aGlzLmRhdGVPYmplY3QpLCAgICAgIC8vIE5vdmVtYmVyXG4gICAgeWVhcjogdGhpcy5kYXRlT2JqZWN0LmdldEZ1bGxZZWFyKCksICAgICAgICAgICAvLyAyMDE0XG4gICAgaG91cjogZ2V0SG91cih0aGlzLmRhdGVPYmplY3QpLCAgICAgICAgICAgICAgICAvLyAxLTEyXG4gICAgbWludXRlczogZ2V0TWludXRlcyh0aGlzLmRhdGVPYmplY3QpLCAgICAgICAgICAvLyAwLTU5XG4gICAgYW1wbTogZ2V0QW1QbSh0aGlzLmRhdGVPYmplY3QpICAgICAgICAgICAgICAgICAvLyBhLm0uIG9yIHAubS5cbiAgfTtcblxufTtcblxuRm9ybWF0dGVyLnByb3RvdHlwZS5ldmVudCA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHRoaXMuZGF0ZS5tb250aE5hbWUgKyBcIiBcIiArIHRoaXMuZGF0ZS5kYXlPZk1vbnRoICsgXCIgYXQgXCIgKyB0aGlzLmRhdGUuaG91ciArIFwiOlwiICsgdGhpcy5kYXRlLm1pbnV0ZXMgKyB0aGlzLmRhdGUuYW1wbTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRm9ybWF0dGVyO1xuIiwidmFyIERlZmVycmVkID0gZnVuY3Rpb24oKSB7XG5cblx0dmFyIGRlZmVycmVkID0ge1xuXG5cdFx0bmV3RGVmZXI6IHt9LFxuXG5cdFx0cmVzb2x2ZTogZnVuY3Rpb24ocmVzcG9uc2VUZXh0LCBzdGF0dXMsIHN0YXR1c1RleHQpIHtcblxuXHRcdFx0Ly8gcmVzdWx0IG9mIHRoZSBmdW5jdGlvbiBwYXNzZWQgdG8gdGhlbigpXG5cdFx0XHR2YXIgcmVzdWx0ID0gZGVmZXJyZWQuZnVsZmlsbGVkKHJlc3BvbnNlVGV4dCwgc3RhdHVzLCBzdGF0dXNUZXh0KTtcblxuXHRcdFx0aWYgKHJlc3VsdCAmJiByZXN1bHQudGhlbikge1xuXHRcdFx0XHQvLyB3ZSBuZWVkIHRvIHdhaXQgaGVyZSB1bnRpbCBwcm9taXNlIHJlc29sdmVzXG5cdFx0XHRcdHJlc3VsdC50aGVuKGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdFx0XHRkZWZlcnJlZC5uZXdEZWZlci5yZXNvbHZlKGRhdGEpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIGRlZmVycmVkLm5ld0RlZmVyLnJlc29sdmUgPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdC8vIGFub3RoZXIgJ3RoZW4nIHdhcyBkZWZpbmVkXG5cdFx0XHRcdGRlZmVycmVkLm5ld0RlZmVyLnJlc29sdmUocmVzdWx0KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0cmVqZWN0OiBmdW5jdGlvbihwcm9taXNlT3JWYWx1ZSkge1xuXG5cdFx0XHQvLyByZXN1bHQgb2YgdGhlIGZ1bmN0aW9uIHBhc3NlZCB0byB0aGVuKClcblx0XHRcdHZhciByZXN1bHQgPSBkZWZlcnJlZC5lcnJvcihwcm9taXNlT3JWYWx1ZSk7XG5cblx0XHRcdGlmIChwcm9taXNlT3JWYWx1ZSAmJiBwcm9taXNlT3JWYWx1ZS50aGVuKSB7XG5cdFx0XHRcdC8vIHdlIG5lZWQgdG8gd2FpdCBoZXJlIHVudGlsIHByb21pc2UgcmVzb2x2ZXNcblx0XHRcdFx0cHJvbWlzZU9yVmFsdWUudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0ZGVmZXJyZWQubmV3RGVmZXIucmVzb2x2ZShkYXRhKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBkZWZlcnJlZC5uZXdEZWZlci5yZWplY3QgPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRcdC8vIGFub3RoZXIgJ3RoZW4nIHdhcyBkZWZpbmVkXG5cdFx0XHRcdGRlZmVycmVkLm5ld0RlZmVyLnJlamVjdChyZXN1bHQpO1xuXHRcdFx0fVxuXHRcdH0sXG5cblx0XHRmdWxmaWxsZWQ6IGZ1bmN0aW9uKHJlc3BvbnNlVGV4dCwgc3RhdHVzLCBzdGF0dXNUZXh0KSB7IH0sXG5cblx0XHRlcnJvcjogZnVuY3Rpb24oc3RhdHVzLCBzdGF0dXNUZXh0KSB7IH0sXG5cblx0XHQvLyB3aGF0IGFyZ3VtZW50cywgd2hlbiBkb2VzIHRoaXMgZmlyZT9cblx0XHRwcm9ncmVzczogZnVuY3Rpb24oKSB7IH0sXG5cblx0XHRwcm9taXNlOiB7XG5cblx0XHRcdHRoZW46IGZ1bmN0aW9uKGZ1bGZpbGxlZCwgZXJyb3IsIHByb2dyZXNzKSB7XG5cblx0XHRcdFx0ZGVmZXJyZWQuZnVsZmlsbGVkID0gdHlwZW9mIGZ1bGZpbGxlZCA9PSBcImZ1bmN0aW9uXCIgPyBmdWxmaWxsZWQgOiBmdW5jdGlvbigpIHt9O1xuXHRcdFx0XHRkZWZlcnJlZC5lcnJvciA9IHR5cGVvZiBlcnJvciA9PSBcImZ1bmN0aW9uXCIgPyBlcnJvciA6IGZ1bmN0aW9uKCkge307XG5cdFx0XHRcdGRlZmVycmVkLnByb2dyZXNzID0gdHlwZW9mIHByb2dyZXNzID09IFwiZnVuY3Rpb25cIiA/IHByb2dyZXNzOiBmdW5jdGlvbigpIHt9O1xuXG5cdFx0XHRcdC8vIFRoaXMgZnVuY3Rpb24gc2hvdWxkIHJldHVybiBhIG5ldyBwcm9taXNlIHRoYXQgaXMgZnVsZmlsbGVkIHdoZW4gdGhlIGdpdmVuXG5cdFx0XHRcdC8vIGZ1bGZpbGxlZEhhbmRsZXIgb3IgZXJyb3JIYW5kbGVyIGNhbGxiYWNrIGlzIGZpbmlzaGVkXG5cdFx0XHRcdGRlZmVycmVkLm5ld0RlZmVyID0gbmV3IERlZmVycmVkKCk7XG5cdFx0XHRcdHJldHVybiBkZWZlcnJlZC5uZXdEZWZlci5wcm9taXNlO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gZGVmZXJyZWQ7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gRGVmZXJyZWQ7XG4iLCJ2YXIgdXRpbHMgPSBmdW5jdGlvbiAoKSB7XG5cbn07XG5cbnV0aWxzLnByb3RvdHlwZS5nZXRQdWJsaXNoRGF0ZSA9IGZ1bmN0aW9uKHRpbWVzdGFtcCkge1xuICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHRpbWVzdGFtcCAqIDEwMDApO1xuICB2YXIgbW9udGggPSB0aGlzLmdldE1vbnRoKGRhdGUpO1xuICB2YXIgZGF5ID0gZGF0ZS5nZXREYXRlKCk7XG4gIHZhciB5ZWFyID0gZGF0ZS5nZXRGdWxsWWVhcigpO1xuXG4gIHJldHVybiBmdWxsRGF0ZSA9IG1vbnRoICsgXCIgXCIgKyBkYXkgKyBcIiwgXCIgKyB5ZWFyO1xufTtcblxudXRpbHMucHJvdG90eXBlLmdldE1vbnRoID0gZnVuY3Rpb24oZGF0ZU9iamVjdCkge1xuICB2YXIgbW9udGhOYW1lcyA9IFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdO1xuICByZXR1cm4gbW9udGhOYW1lc1tkYXRlT2JqZWN0LmdldE1vbnRoKCldO1xufTtcblxudXRpbHMucHJvdG90eXBlLnJlbW92ZUNsYXNzID0gZnVuY3Rpb24gKG9iaiwgY2xhc3NOYW1lKSB7XG5cbiAgdmFyIGNsYXNzZXMgPSBvYmouY2xhc3NOYW1lO1xuXG4gIHZhciByZSA9IG5ldyBSZWdFeHAoY2xhc3NOYW1lKTtcbiAgdmFyIG5ld0NsYXNzZXMgPSBjbGFzc2VzLnJlcGxhY2UocmUsIFwiXCIpO1xuXG4gIG9iai5jbGFzc05hbWUgPSBuZXdDbGFzc2VzO1xuXG59O1xuXG51dGlscy5wcm90b3R5cGUuaXNOdW1lcmljID0gZnVuY3Rpb24ob2JqKSB7XG4gIHJldHVybiAhaXNOYU4oIHBhcnNlRmxvYXQob2JqKSApICYmIGlzRmluaXRlKCBvYmogKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IHV0aWxzKCk7XG4iXX0=
