(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global require: false */
/* global document: false */

var Widget = require("./lib/WidgetCreator");

var div = document.getElementById("hubWidget");
new Widget(div);

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9qd2FjaHRlci93d3cvbGlicy9odWJXaWRnZXQvbm9kZV9tb2R1bGVzL2d1bHAtdGFza3Mvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2p3YWNodGVyL3d3dy9saWJzL2h1YldpZGdldC9zcmMvYXNzZXRzL2pzL2Zha2VfMzVlYThjYmMuanMiLCIvVXNlcnMvandhY2h0ZXIvd3d3L2xpYnMvaHViV2lkZ2V0L3NyYy9hc3NldHMvanMvbGliL1dpZGdldENyZWF0b3IuanMiLCIvVXNlcnMvandhY2h0ZXIvd3d3L2xpYnMvaHViV2lkZ2V0L3NyYy9hc3NldHMvanMvbGliL2FqYXguanMiLCIvVXNlcnMvandhY2h0ZXIvd3d3L2xpYnMvaHViV2lkZ2V0L3NyYy9hc3NldHMvanMvbGliL2FwaS5qcyIsIi9Vc2Vycy9qd2FjaHRlci93d3cvbGlicy9odWJXaWRnZXQvc3JjL2Fzc2V0cy9qcy9saWIvZGF0ZS1mb3JtYXR0ZXIuanMiLCIvVXNlcnMvandhY2h0ZXIvd3d3L2xpYnMvaHViV2lkZ2V0L3NyYy9hc3NldHMvanMvbGliL2RlZmVycmVkLmpzIiwiL1VzZXJzL2p3YWNodGVyL3d3dy9saWJzL2h1YldpZGdldC9zcmMvYXNzZXRzL2pzL2xpYi91dGlscy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWwgcmVxdWlyZTogZmFsc2UgKi9cbi8qIGdsb2JhbCBkb2N1bWVudDogZmFsc2UgKi9cblxudmFyIFdpZGdldCA9IHJlcXVpcmUoXCIuL2xpYi9XaWRnZXRDcmVhdG9yXCIpO1xuXG52YXIgZGl2ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJodWJXaWRnZXRcIik7XG5uZXcgV2lkZ2V0KGRpdik7XG4iLCJ2YXIgYXBpID0gcmVxdWlyZShcIi4vYXBpXCIpO1xudmFyIHV0aWxzID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgRGF0ZUZvcm1hdHRlciA9IHJlcXVpcmUoXCIuL2RhdGUtZm9ybWF0dGVyXCIpO1xuXG52YXIgV2lkZ2V0Q3JlYXRvciA9IGZ1bmN0aW9uIChkaXYpIHtcblxuICB0aGlzLndpZGdldCA9IGRpdjtcblxuICB0aGlzLmFwaSA9IG5ldyBhcGkoe1xuICAgIGtleTogdGhpcy53aWRnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1rZXlcIiksXG4gICAgdjogdGhpcy53aWRnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS12ZXJzaW9uXCIpXG4gIH0pO1xuXG4gIHZhciB0eXBlID0gdGhpcy53aWRnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS10eXBlXCIpO1xuICB0aGlzLnR5cGUgPSB0eXBlID8gdHlwZSA6IFwiYXJ0aWNsZXNcIjtcblxuICB2YXIgdGl0bGUgPSB0aGlzLndpZGdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLXRpdGxlXCIpO1xuICB0aGlzLnRpdGxlID0gdGl0bGUgPyB0aXRsZSA6IFwiTmV3cyBmcm9tIHRoZSBIdWJcIjtcblxuICB0aGlzLmNyZWF0ZVF1ZXJ5U3RyaW5nUGFyYW1ldGVycygpO1xuICB0aGlzLmNyZWF0ZSgpO1xuXG59O1xuXG5XaWRnZXRDcmVhdG9yLnByb3RvdHlwZS5jcmVhdGVRdWVyeVN0cmluZ1BhcmFtZXRlcnMgPSBmdW5jdGlvbiAoKSB7XG5cbiAgLy8gZGVmYXVsdHNcbiAgdGhpcy5wYXJhbWV0ZXJzID0geyBwZXJfcGFnZTogNSB9O1xuXG4gIHZhciBjb3VudCA9IHBhcnNlSW50KHRoaXMud2lkZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtY291bnRcIikpO1xuICBpZiAodXRpbHMuaXNOdW1lcmljKGNvdW50KSkgdGhpcy5wYXJhbWV0ZXJzLnBlcl9wYWdlID0gY291bnQ7XG5cbiAgdmFyIGNoYW5uZWxzID0gdGhpcy53aWRnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1jaGFubmVsc1wiKTtcbiAgaWYgKGNoYW5uZWxzKSB0aGlzLnBhcmFtZXRlcnMuY2hhbm5lbHMgPSBjaGFubmVscztcblxuICB2YXIgdGFncyA9IHRoaXMud2lkZ2V0LmdldEF0dHJpYnV0ZShcImRhdGEtdGFnc1wiKTtcbiAgaWYgKHRhZ3MpIHRoaXMucGFyYW1ldGVycy50YWdzID0gdGFncztcblxuICB2YXIgdG9waWNzID0gdGhpcy53aWRnZXQuZ2V0QXR0cmlidXRlKFwiZGF0YS10b3BpY3NcIik7XG4gIGlmICh0b3BpY3MpIHRoaXMucGFyYW1ldGVycy50b3BpY3MgPSB0b3BpY3M7XG5cbn07XG5cbldpZGdldENyZWF0b3IucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgaHRtbCA9IFwiPGRpdiBjbGFzcz1cXFwiaGVhZGVyXFxcIj5cIiArIHRoaXMudGl0bGUgKyBcIjwvZGl2PlwiO1xuICBodG1sICs9IFwiPGRpdiBpZD1cXFwiaHViV2lkZ2V0Q29udGVudFxcXCIgY2xhc3M9XFxcImxvYWRpbmdcXFwiPjwvZGl2PlwiO1xuICBodG1sICs9IFwiPGRpdiBjbGFzcz1cXFwiaHVicG93ZXIgY2xlYXJmaXhcXFwiPjxkaXYgY2xhc3M9XFxcImxpbmtcXFwiPjxhIGhyZWY9XFxcImh0dHA6Ly9odWIuamh1LmVkdVxcXCI+aHR0cDovL2h1Yi5qaHUuZWR1PC9hPjwvZGl2PjxkaXYgY2xhc3M9XFxcImltYWdlXFxcIj48YSBocmVmPVxcXCJodHRwOi8vaHViLmpodS5lZHVcXFwiPjxzcGFuPlBvd2VyZWQgYnkgdGhlIEh1Yjwvc3Bhbj48L2E+PC9kaXY+PC9kaXY+XCI7XG5cbiAgdGhpcy53aWRnZXQuaW5uZXJIVE1MID0gaHRtbDtcblxuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgdGhpcy5nZXREYXRhKGZ1bmN0aW9uIChlcnJvciwgZGF0YSkge1xuXG4gICAgaWYgKGVycm9yKSByZXR1cm4gc2VsZi5kaXNwbGF5RXJyb3IoKTtcbiAgICBzZWxmLnBvcHVsYXRlV2lkZ2V0KGRhdGEpO1xuXG4gIH0pO1xuXG59O1xuXG4vKipcbiAqIEdldCBvYmVjdHMgdG8gcG9wdWxhdGUgdGhlIHdpZGdldFxuICogQHBhcmFtICB7TGFtZGJhKGRhdGEsIGpxWEhSKX0gQ2FsbGJhY2sgdGhhdCBmaXJlcyB1cG9uIHN1Y2Nlc3NmdWwgcmV0cmlldmFsIG9mIGRhdGEuXG4gKiBAcmV0dXJuIHtvYmplY3R9IGh1YldpZGdldFxuICovXG5XaWRnZXRDcmVhdG9yLnByb3RvdHlwZS5nZXREYXRhID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG5cbiAgLy8gc29tZXRoaW5nIG90aGVyIHRoYW4gYXJ0aWNsZXMgb3IgZXZlbnRzIHdhcyByZXF1ZXN0ZWRcbiAgaWYgKCF0aGlzLmFwaVt0aGlzLnR5cGVdKSByZXR1cm4gdGhpcy5kaXNwbGF5RXJyb3IoKTtcblxuICB0aGlzLmFwaVt0aGlzLnR5cGVdKHRoaXMucGFyYW1ldGVycykudGhlbihmdW5jdGlvbiAocGF5bG9hZCkge1xuXG4gICAgaWYgKHBheWxvYWQuZXJyb3IpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhwYXlsb2FkLmVycm9yKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwsIHBheWxvYWQpO1xuICAgIH1cblxuICB9KTtcblxufTtcblxuV2lkZ2V0Q3JlYXRvci5wcm90b3R5cGUucG9wdWxhdGVXaWRnZXQgPSBmdW5jdGlvbiAoZGF0YSkge1xuXG4gIHZhciBjb250ZW50ID0gXCJcIjtcblxuICBpZiAodGhpcy50eXBlID09IFwiYXJ0aWNsZXNcIikge1xuICAgIGNvbnRlbnQgPSB0aGlzLmdldEZvcm1hdHRlZEFydGljbGVzKGRhdGEpO1xuICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PSBcImV2ZW50c1wiKSB7XG4gICAgY29udGVudCA9IHRoaXMuZ2V0Rm9ybWF0dGVkRXZlbnRzKGRhdGEpO1xuICB9XG5cbiAgaWYgKCFjb250ZW50KSByZXR1cm4gdGhpcy5kaXNwbGF5RXJyb3IoKTtcblxuICB1dGlscy5yZW1vdmVDbGFzcyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImh1YldpZGdldENvbnRlbnRcIiksIFwibG9hZGluZ1wiKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJodWJXaWRnZXRDb250ZW50XCIpLmlubmVySFRNTCA9IFwiPHVsPlwiICsgY29udGVudCArIFwiPC91bD5cIjtcblxufTtcblxuV2lkZ2V0Q3JlYXRvci5wcm90b3R5cGUuZ2V0Rm9ybWF0dGVkQXJ0aWNsZXMgPSBmdW5jdGlvbiAoZGF0YSkge1xuXG4gIHZhciBhcnRpY2xlcyA9IGRhdGEuX2VtYmVkZGVkLmFydGljbGVzO1xuICBpZiAoIWFydGljbGVzKSByZXR1cm47XG5cbiAgdmFyIGh0bWwgPSBcIlwiO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBhcnRpY2xlcy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXG4gICAgdmFyIGFydGljbGUgPSBhcnRpY2xlc1tpXTtcbiAgICBodG1sICs9IFwiPGxpPjxwIGNsYXNzPVxcXCJoZWFkbGluZVxcXCI+PGEgaHJlZj1cXFwiXCIgKyBhcnRpY2xlLnVybCArXCJcXFwiPlwiICsgYXJ0aWNsZS5oZWFkbGluZSArXCI8L2E+PC9wPlwiO1xuICAgIGh0bWwgKz0gXCI8cCBjbGFzcz1cXFwicHViZGF0ZVxcXCI+XCIgKyB1dGlscy5nZXRQdWJsaXNoRGF0ZShhcnRpY2xlLnB1Ymxpc2hfZGF0ZSkgKyBcIjwvYT48L3A+PC9saT5cIjtcblxuICB9XG5cbiAgcmV0dXJuIGh0bWw7XG5cbn07XG5cbldpZGdldENyZWF0b3IucHJvdG90eXBlLmdldEZvcm1hdHRlZEV2ZW50cyA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cbiAgdmFyIGV2ZW50cyA9IGRhdGEuX2VtYmVkZGVkLmV2ZW50cztcbiAgaWYgKCFldmVudHMpIHJldHVybjtcblxuICB2YXIgaHRtbCA9IFwiXCI7XG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGV2ZW50cy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXG4gICAgdmFyIGV2ZW50ID0gZXZlbnRzW2ldO1xuXG4gICAgdmFyIGZvcm1hdHRlciA9IG5ldyBEYXRlRm9ybWF0dGVyKGV2ZW50LnN0YXJ0X2RhdGUsIGV2ZW50LnN0YXJ0X3RpbWUpO1xuXG4gICAgaHRtbCArPSBcIjxsaT48cCBjbGFzcz1cXFwiaGVhZGxpbmVcXFwiPjxhIGhyZWY9XFxcIlwiICsgZXZlbnQudXJsICtcIlxcXCI+XCIgKyBldmVudC5uYW1lICtcIjwvYT48L3A+XCI7XG4gICAgaHRtbCArPSBcIjxwIGNsYXNzPVxcXCJwdWJkYXRlXFxcIj5cIiArIGZvcm1hdHRlci5ldmVudCgpICsgXCI8L2E+PC9wPjwvbGk+XCI7XG5cbiAgfVxuXG4gIHJldHVybiBodG1sO1xuXG59O1xuXG5cblxuLyoqXG4gKiBEaXNwbGF5cyBhbiBlcnJvciBpZiBub24gcmVzdWx0cyB3ZXJlIHJldHVybmVkLlxuICogQHJldHVybiBudWxsXG4gKi9cbldpZGdldENyZWF0b3IucHJvdG90eXBlLmRpc3BsYXlFcnJvciA9IGZ1bmN0aW9uICgpIHtcblxuICB1dGlscy5yZW1vdmVDbGFzcyhkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImh1YldpZGdldENvbnRlbnRcIiksIFwibG9hZGluZ1wiKTtcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJodWJXaWRnZXRDb250ZW50XCIpLmlubmVySFRNTCA9IFwiPHA+U29ycnksIG5vIHJlc3VsdHMgd2VyZSBmb3VuZC4gVHJ5aW5nIGNoZWNraW5nIG91dCA8YSBocmVmPVxcXCJodHRwOi8vaHViLmpodS5lZHVcXFwiPlRoZSBIdWI8L2E+IGZvciB0aGUgbGF0ZXN0IEpvaG5zIEhvcGtpbnMgbmV3cyBhbmQgZXZlbnRzLjwvcD5cIjtcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBXaWRnZXRDcmVhdG9yO1xuIiwidmFyIERlZmVycmVkID0gcmVxdWlyZShcIi4vZGVmZXJyZWRcIik7XG5cbnZhciBBamF4ID0gZnVuY3Rpb24gKCkge307XG5cbi8qKlxuICogU2V0cyBfeGhyIHRvIGVpdGhlciBYTUxIdHRwUmVxdWVzdCBvclxuICogdGhlIGNvcnJlY3QgdmVyc2lvbiBvZkFjdGl2ZVhPYmplY3RcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbkFqYXgucHJvdG90eXBlLmdldFhIUiA9IGZ1bmN0aW9uICgpIHtcblx0dmFyIHhocjtcblxuXHRpZiAodHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICE9PSAndW5kZWZpbmVkJykge1xuXHRcdHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdH0gZWxzZSB7XG5cdFx0dmFyIHZlcnNpb25zID0gW1wiTWljcm9zb2Z0LlhtbEh0dHBcIiwgXCJNU1hNTDIuWG1sSHR0cFwiLCBcIk1TWE1MMi5YbWxIdHRwLjMuMFwiLCBcIk1TWE1MMi5YbWxIdHRwLjQuMFwiLCBcIk1TWE1MMi5YbWxIdHRwLjUuMFwiXTtcblxuXHRcdGZvciAodmFyIGkgPSAwLCBsZW4gPSB2ZXJzaW9ucy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0eGhyID0gbmV3IEFjdGl2ZVhPYmplY3QodmVyc2lvbnNbaV0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKSB7fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4geGhyO1xufTtcblxuLyoqXG4gKiBBdHRhY2ggYSBzY3JpcHQgZWxlbWVudCB0byB0aGUgY3VycmVudCBwYWdlXG4gKiByZWZlcmVuY2luZyB0aGUgVVJMIHdlIG5lZWQgdG8gbWFrZSBhIEdFVFxuICogcmVxdWVzdCB0b1xuICogQHBhcmFtICB7c3RyaW5nfSB1cmwgRnVsbCBVUkwgKHdpdGggcXVlcnkgc3RyaW5nKVxuICogQHJldHVybiBudWxsXG4gKi9cbkFqYXgucHJvdG90eXBlLmNyb3NzRG9tYWluUmVxdWVzdCA9IGZ1bmN0aW9uICh1cmwpIHtcblx0dmFyIHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG5cdHNjcmlwdC5zcmMgPSB1cmw7XG5cdGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbn07XG5cbi8qKlxuICogTWFrZSBhIEdFVCByZXF1ZXN0XG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBvYmpcbiAqICAgICAgICAgdXJsOiBVUkwgdG8gbWFrZSB0aGUgcmVxdWVzdCB0b1xuICogICAgICAgICBkYXRhOiBQbGFpbiBvYmplY3Qgb2Yga2V5OiB2YWx1ZSBwYWlycyB0byBzZW5kIHdpdGggdGhlIHJlcXVlc3RcbiAqICAgICAgICAgZGF0YVR5cGU6IHJpZ2h0IG5vdywgc3BlY2lmaXlpbmcganNvbnAgaXMgdGhlIG9ubHkgdGhpbmcgdGhhdCBkb2VzIGFueXRoaW5nXG4gKiAgICAgICAgIHN1Y2Nlc3M6IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGZpcmUgdXBvbiBhIHN1Y2Nlc3NmdWwgR0VUIHJlcXVlc3QgKGRhdGEsIHN0YXR1c0NvZGUsIHN0YXR1c1RleHQpXG4gKiAgICAgICAgIGZhaWw6IGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGZpcmUgdXBvbiBhIGZhaWxlZCBHRVQgcmVxdWVzdCAoc3RhdHVzQ29kZSwgc3RhdHVzVGV4dClcbiAqIEByZXR1cm4gbnVsbFxuICovXG5BamF4LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihvYmopIHtcblxuXHR2YXIgZGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQoKTtcblxuXHR2YXIgdXJsO1xuXG5cdGlmIChvYmouZGF0YVR5cGUgJiYgb2JqLmRhdGFUeXBlLnRvTG93ZXJDYXNlKCkgPT0gXCJqc29ucFwiKSB7XG5cblx0XHQvLyBhc3NpZ24gc3VjY2VzcyBjYWxsYmFjayB0byBhIGZ1bmN0aW9uIG9uIGFqYXggb2JqZWN0XG5cdFx0dmFyIGNiID0gdGhpcy5yYW5kb21DYWxsYmFja05hbWUoKTtcblx0XHR3aW5kb3dbY2JdID0gZGVmZXJyZWQucmVzb2x2ZTtcblxuXHRcdC8vIGFzc2lnbiBjYWxsYmFjayBpbiBVUkxcblx0XHRvYmouZGF0YS5jYWxsYmFjayA9IGNiO1xuXHRcdHVybCA9IG9iai51cmwgKyB0aGlzLmNyZWF0ZVF1ZXJ5U3RyaW5nKG9iai5kYXRhKTtcblxuXHRcdHRoaXMuY3Jvc3NEb21haW5SZXF1ZXN0KHVybCk7XG5cblx0fSBlbHNlIHtcblxuXHRcdHVybCA9IG9iai51cmwgKyB0aGlzLmNyZWF0ZVF1ZXJ5U3RyaW5nKG9iai5kYXRhKTtcblxuXHRcdHZhciB4aHIgPSBnZXRYSFIoKTtcblxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSA0KSB7XG5cblx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT0gMjAwKSB7XG5cdFx0XHRcdFx0ZGVmZXJyZWQucmVzb2x2ZSh4aHIucmVzcG9uc2VUZXh0LCB4aHIuc3RhdHVzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRkZWZlcnJlZC5yZWplY3QoeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0eGhyLm9wZW4oXCJHRVRcIiwgdXJsLCB0cnVlKTtcblx0XHR4aHIuc2VuZChudWxsKTtcblx0fVxuXG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIHF1ZXJ5IHN0cmluZyBmcm9tIGFuIG9iamVjdFxuICogY29udGFpbmluZyBrZXk6IHZhbHVlIHBhaXJzXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9iamVjdFxuICogQHJldHVybiB7c3RyaW5nfSBRdWVyeSBzdHJpbmdcbiAqL1xuQWpheC5wcm90b3R5cGUuY3JlYXRlUXVlcnlTdHJpbmcgPSBmdW5jdGlvbihvYmplY3QpIHtcblxuXHR2YXIgcXVlcnlTdHJpbmcgPSBcIlwiO1xuXHR2YXIgYW1wID0gZmFsc2U7XG5cblx0Zm9yICh2YXIga2V5IGluIG9iamVjdCkge1xuXHRcdGlmIChhbXApIHtcblx0XHRcdHF1ZXJ5U3RyaW5nICs9IFwiJlwiO1xuXHRcdH1cblx0XHRxdWVyeVN0cmluZyArPSBrZXkgKyBcIj1cIiArIG9iamVjdFtrZXldO1xuXG5cdFx0Ly8gc3RhcnQgYWRkaW5nIHRoZSBhbXBlcnNhbmQgZnJvbSBub3cgb25cblx0XHRhbXAgPSB0cnVlO1xuXHR9XG5cblx0cmV0dXJuIFwiP1wiICsgcXVlcnlTdHJpbmc7XG59O1xuXG5BamF4LnByb3RvdHlwZS5yYW5kb20gPSBmdW5jdGlvbigpIHtcblx0cmV0dXJuIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICgxMDAwMDAgKiAxMDAwMDApKTtcbn07XG5cbkFqYXgucHJvdG90eXBlLnJhbmRvbUNhbGxiYWNrTmFtZSA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgdGltZXN0YW1wID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG5cdHJldHVybiBcIkFqYXhfXCIgKyB0aGlzLnJhbmRvbSgpICsgXCJfXCIgKyB0aW1lc3RhbXAgKyBcIl9cIiArIHRoaXMucmFuZG9tKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBBamF4KCk7XG4iLCIvKipcbiAqIEEgc3VwZXItc2ltcGxlIHZlcnNpb24gb2YgSHViSlNcbiAqL1xuXG52YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG5cbnZhciBhcGkgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcblxuICB0aGlzLmtleSA9IHNldHRpbmdzLmtleTtcbiAgdGhpcy52ID0gc2V0dGluZ3MudjtcblxufTtcblxuLyoqXG4gKiBHZXRzIGEgcGF5bG9hZCBmcm9tIHRoZSBIdWIgQVBJXG4gKlxuICogQHBhcmFtICB7c3RyaW5nfSAgIGVuZHBvaW50ICAgIEFQSSBlbmRwb2ludFxuICogQHBhcmFtICB7b2JqZWN0fSAgIGRhdGEgICAgICBEYXRhIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlclxuICogQHJldHVybiB7T2JqZWN0fSAgICAgcHJvbWlzZVxuICovXG5hcGkucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChlbmRwb2ludCwgZGF0YSkge1xuXG4gIGRhdGEudiA9IHRoaXMudjtcbiAgZGF0YS5rZXkgPSB0aGlzLmtleTtcblxuICByZXR1cm4gYWpheC5nZXQoe1xuICAgIHVybDogXCJodHRwOi8vYXBpLmh1Yi5qaHUuZWR1L1wiICsgZW5kcG9pbnQsXG4gICAgZGF0YVR5cGU6IFwianNvbnBcIixcbiAgICBkYXRhOiBkYXRhXG4gIH0pO1xufVxuXG4vKipcbiAqIEZpbmQgYW4gYXJ0aWNsZSBvciBhcnRpY2xlc1xuICpcbiAqIEBwYXJhbSAge29iamVjdH0gICBkYXRhICAgICAgRGF0YSB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXJcbiAqIEByZXR1cm4ge09iamVjdH0gICAgIHByb21pc2VcbiAqL1xuYXBpLnByb3RvdHlwZS5hcnRpY2xlcyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgcmV0dXJuIHRoaXMuZ2V0KFwiYXJ0aWNsZXNcIiwgZGF0YSk7XG59O1xuXG4vKipcbiAqIEZpbmQgYW4gZXZlbnQgb3IgZXZlbnRzXG4gKlxuICogQHBhcmFtICB7b2JqZWN0fSAgIGRhdGEgICAgICBEYXRhIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlclxuICogQHJldHVybiB7T2JqZWN0fSAgICAgcHJvbWlzZVxuICovXG5hcGkucHJvdG90eXBlLmV2ZW50cyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgcmV0dXJuIHRoaXMuZ2V0KFwiZXZlbnRzXCIsIGRhdGEpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFwaTtcbiIsImZ1bmN0aW9uIGdldE1vbnRoTmFtZSAoZGF0ZSkge1xuXG4gIHZhciBtb250aHMgPSB7XG4gICAgMTogXCJKYW51YXJ5XCIsXG4gICAgMjogXCJGZWJydWFyeVwiLFxuICAgIDM6IFwiTWFyY2hcIixcbiAgICA0OiBcIkFwcmlsXCIsXG4gICAgNTogXCJNYXlcIixcbiAgICA2OiBcIkp1bmVcIixcbiAgICA3OiBcIkp1bHlcIixcbiAgICA4OiBcIkF1Z3VzdFwiLFxuICAgIDk6IFwiU2VwdGVtYmVyXCIsXG4gICAgMTA6IFwiT2N0b2JlclwiLFxuICAgIDExOiBcIk5vdmVtYmVyXCIsXG4gICAgMTI6IFwiRGVjZW1iZXJcIlxuICB9O1xuXG4gIHZhciBtb250aE51bSA9IGRhdGUuZ2V0TW9udGgoKSArIDE7XG5cbiAgcmV0dXJuIG1vbnRoc1ttb250aE51bV07XG59XG5cbmZ1bmN0aW9uIGdldEhvdXIgKGRhdGUpIHtcblxuICB2YXIgaG91ciA9IGRhdGUuZ2V0SG91cnMoKTtcblxuICBpZiAoaG91ciA+IDEyKSB7XG4gICAgcmV0dXJuIGhvdXIgLSAxMjtcbiAgfVxuXG4gIGlmIChob3VyID09PSAwKSB7XG4gICAgcmV0dXJuIDEyO1xuICB9XG5cbiAgcmV0dXJuIGhvdXI7XG5cbn1cblxuZnVuY3Rpb24gZ2V0TWludXRlcyAoZGF0ZSkge1xuXG4gIHZhciBtaW51dGVzID0gZGF0ZS5nZXRNaW51dGVzKCk7XG5cbiAgaWYgKG1pbnV0ZXMgPCAxMCkge1xuICAgIHJldHVybiBcIjBcIiArIG1pbnV0ZXMudG9TdHJpbmcoKTtcbiAgfVxuXG4gIHJldHVybiBtaW51dGVzLnRvU3RyaW5nKCk7XG5cbn1cblxuZnVuY3Rpb24gZ2V0QW1QbSAoZGF0ZSkge1xuXG4gIHZhciBob3VyID0gZGF0ZS5nZXRIb3VycygpO1xuICByZXR1cm4gaG91ciA8IDEyID8gXCJhbVwiIDogXCJwbVwiO1xuXG59XG5cbnZhciBGb3JtYXR0ZXIgPSBmdW5jdGlvbiAoZGF0ZSkge1xuXG4gIHZhciB0aW1lc3RhbXA7XG5cbiAgaWYgKHR5cGVvZiBkYXRlID09PSBcIm51bWJlclwiKSB7XG4gICAgdGltZXN0YW1wID0gZGF0ZSAqIDEwMDA7XG4gIH0gZWxzZSB7XG4gICAgdGltZXN0YW1wID0gRGF0ZS5wYXJzZShkYXRlKTtcbiAgfVxuXG4gIHRoaXMuZGF0ZU9iamVjdCA9IG5ldyBEYXRlKHRpbWVzdGFtcCk7XG5cbiAgdGhpcy5kYXRlID0ge1xuICAgIHRpbXN0YW1wOiB0aW1lc3RhbXAsXG4gICAgZGF5T2ZNb250aDogdGhpcy5kYXRlT2JqZWN0LmdldERhdGUoKSwgICAgICAgICAvLyAxLTMxXG4gICAgbW9udGhOYW1lOiBnZXRNb250aE5hbWUodGhpcy5kYXRlT2JqZWN0KSwgICAgICAvLyBOb3ZlbWJlclxuICAgIHllYXI6IHRoaXMuZGF0ZU9iamVjdC5nZXRGdWxsWWVhcigpLCAgICAgICAgICAgLy8gMjAxNFxuICAgIGhvdXI6IGdldEhvdXIodGhpcy5kYXRlT2JqZWN0KSwgICAgICAgICAgICAgICAgLy8gMS0xMlxuICAgIG1pbnV0ZXM6IGdldE1pbnV0ZXModGhpcy5kYXRlT2JqZWN0KSwgICAgICAgICAgLy8gMC01OVxuICAgIGFtcG06IGdldEFtUG0odGhpcy5kYXRlT2JqZWN0KSAgICAgICAgICAgICAgICAgLy8gYS5tLiBvciBwLm0uXG4gIH07XG5cbn07XG5cbkZvcm1hdHRlci5wcm90b3R5cGUuZXZlbnQgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLmRhdGUubW9udGhOYW1lICsgXCIgXCIgKyB0aGlzLmRhdGUuZGF5T2ZNb250aCArIFwiIGF0IFwiICsgdGhpcy5kYXRlLmhvdXIgKyBcIjpcIiArIHRoaXMuZGF0ZS5taW51dGVzICsgdGhpcy5kYXRlLmFtcG07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZvcm1hdHRlcjtcbiIsInZhciBEZWZlcnJlZCA9IGZ1bmN0aW9uKCkge1xuXG5cdHZhciBkZWZlcnJlZCA9IHtcblxuXHRcdG5ld0RlZmVyOiB7fSxcblxuXHRcdHJlc29sdmU6IGZ1bmN0aW9uKHJlc3BvbnNlVGV4dCwgc3RhdHVzLCBzdGF0dXNUZXh0KSB7XG5cblx0XHRcdC8vIHJlc3VsdCBvZiB0aGUgZnVuY3Rpb24gcGFzc2VkIHRvIHRoZW4oKVxuXHRcdFx0dmFyIHJlc3VsdCA9IGRlZmVycmVkLmZ1bGZpbGxlZChyZXNwb25zZVRleHQsIHN0YXR1cywgc3RhdHVzVGV4dCk7XG5cblx0XHRcdGlmIChyZXN1bHQgJiYgcmVzdWx0LnRoZW4pIHtcblx0XHRcdFx0Ly8gd2UgbmVlZCB0byB3YWl0IGhlcmUgdW50aWwgcHJvbWlzZSByZXNvbHZlc1xuXHRcdFx0XHRyZXN1bHQudGhlbihmdW5jdGlvbihkYXRhKSB7XG5cdFx0XHRcdFx0ZGVmZXJyZWQubmV3RGVmZXIucmVzb2x2ZShkYXRhKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBkZWZlcnJlZC5uZXdEZWZlci5yZXNvbHZlID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHQvLyBhbm90aGVyICd0aGVuJyB3YXMgZGVmaW5lZFxuXHRcdFx0XHRkZWZlcnJlZC5uZXdEZWZlci5yZXNvbHZlKHJlc3VsdCk7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdHJlamVjdDogZnVuY3Rpb24ocHJvbWlzZU9yVmFsdWUpIHtcblxuXHRcdFx0Ly8gcmVzdWx0IG9mIHRoZSBmdW5jdGlvbiBwYXNzZWQgdG8gdGhlbigpXG5cdFx0XHR2YXIgcmVzdWx0ID0gZGVmZXJyZWQuZXJyb3IocHJvbWlzZU9yVmFsdWUpO1xuXG5cdFx0XHRpZiAocHJvbWlzZU9yVmFsdWUgJiYgcHJvbWlzZU9yVmFsdWUudGhlbikge1xuXHRcdFx0XHQvLyB3ZSBuZWVkIHRvIHdhaXQgaGVyZSB1bnRpbCBwcm9taXNlIHJlc29sdmVzXG5cdFx0XHRcdHByb21pc2VPclZhbHVlLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xuXHRcdFx0XHRcdGRlZmVycmVkLm5ld0RlZmVyLnJlc29sdmUoZGF0YSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgZGVmZXJyZWQubmV3RGVmZXIucmVqZWN0ID09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0XHQvLyBhbm90aGVyICd0aGVuJyB3YXMgZGVmaW5lZFxuXHRcdFx0XHRkZWZlcnJlZC5uZXdEZWZlci5yZWplY3QocmVzdWx0KTtcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZnVsZmlsbGVkOiBmdW5jdGlvbihyZXNwb25zZVRleHQsIHN0YXR1cywgc3RhdHVzVGV4dCkgeyB9LFxuXG5cdFx0ZXJyb3I6IGZ1bmN0aW9uKHN0YXR1cywgc3RhdHVzVGV4dCkgeyB9LFxuXG5cdFx0Ly8gd2hhdCBhcmd1bWVudHMsIHdoZW4gZG9lcyB0aGlzIGZpcmU/XG5cdFx0cHJvZ3Jlc3M6IGZ1bmN0aW9uKCkgeyB9LFxuXG5cdFx0cHJvbWlzZToge1xuXG5cdFx0XHR0aGVuOiBmdW5jdGlvbihmdWxmaWxsZWQsIGVycm9yLCBwcm9ncmVzcykge1xuXG5cdFx0XHRcdGRlZmVycmVkLmZ1bGZpbGxlZCA9IHR5cGVvZiBmdWxmaWxsZWQgPT0gXCJmdW5jdGlvblwiID8gZnVsZmlsbGVkIDogZnVuY3Rpb24oKSB7fTtcblx0XHRcdFx0ZGVmZXJyZWQuZXJyb3IgPSB0eXBlb2YgZXJyb3IgPT0gXCJmdW5jdGlvblwiID8gZXJyb3IgOiBmdW5jdGlvbigpIHt9O1xuXHRcdFx0XHRkZWZlcnJlZC5wcm9ncmVzcyA9IHR5cGVvZiBwcm9ncmVzcyA9PSBcImZ1bmN0aW9uXCIgPyBwcm9ncmVzczogZnVuY3Rpb24oKSB7fTtcblxuXHRcdFx0XHQvLyBUaGlzIGZ1bmN0aW9uIHNob3VsZCByZXR1cm4gYSBuZXcgcHJvbWlzZSB0aGF0IGlzIGZ1bGZpbGxlZCB3aGVuIHRoZSBnaXZlblxuXHRcdFx0XHQvLyBmdWxmaWxsZWRIYW5kbGVyIG9yIGVycm9ySGFuZGxlciBjYWxsYmFjayBpcyBmaW5pc2hlZFxuXHRcdFx0XHRkZWZlcnJlZC5uZXdEZWZlciA9IG5ldyBEZWZlcnJlZCgpO1xuXHRcdFx0XHRyZXR1cm4gZGVmZXJyZWQubmV3RGVmZXIucHJvbWlzZTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0cmV0dXJuIGRlZmVycmVkO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IERlZmVycmVkO1xuIiwidmFyIHV0aWxzID0gZnVuY3Rpb24gKCkge1xuXG59O1xuXG51dGlscy5wcm90b3R5cGUuZ2V0UHVibGlzaERhdGUgPSBmdW5jdGlvbih0aW1lc3RhbXApIHtcbiAgdmFyIGRhdGUgPSBuZXcgRGF0ZSh0aW1lc3RhbXAgKiAxMDAwKTtcbiAgdmFyIG1vbnRoID0gdGhpcy5nZXRNb250aChkYXRlKTtcbiAgdmFyIGRheSA9IGRhdGUuZ2V0RGF0ZSgpO1xuICB2YXIgeWVhciA9IGRhdGUuZ2V0RnVsbFllYXIoKTtcblxuICByZXR1cm4gZnVsbERhdGUgPSBtb250aCArIFwiIFwiICsgZGF5ICsgXCIsIFwiICsgeWVhcjtcbn07XG5cbnV0aWxzLnByb3RvdHlwZS5nZXRNb250aCA9IGZ1bmN0aW9uKGRhdGVPYmplY3QpIHtcbiAgdmFyIG1vbnRoTmFtZXMgPSBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXTtcbiAgcmV0dXJuIG1vbnRoTmFtZXNbZGF0ZU9iamVjdC5nZXRNb250aCgpXTtcbn07XG5cbnV0aWxzLnByb3RvdHlwZS5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIChvYmosIGNsYXNzTmFtZSkge1xuXG4gIHZhciBjbGFzc2VzID0gb2JqLmNsYXNzTmFtZTtcblxuICB2YXIgcmUgPSBuZXcgUmVnRXhwKGNsYXNzTmFtZSk7XG4gIHZhciBuZXdDbGFzc2VzID0gY2xhc3Nlcy5yZXBsYWNlKHJlLCBcIlwiKTtcblxuICBvYmouY2xhc3NOYW1lID0gbmV3Q2xhc3NlcztcblxufTtcblxudXRpbHMucHJvdG90eXBlLmlzTnVtZXJpYyA9IGZ1bmN0aW9uKG9iaikge1xuICByZXR1cm4gIWlzTmFOKCBwYXJzZUZsb2F0KG9iaikgKSAmJiBpc0Zpbml0ZSggb2JqICk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyB1dGlscygpO1xuIl19
