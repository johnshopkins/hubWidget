/**
 * Not all browsers support array.indexOf(). This code will make it available
 * if the users's browser does not have indexOf() capability. From:
 * https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
 */
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
        "use strict";
        if (this == null) {
            throw new TypeError();
        }
        var t = Object(this);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 1) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        return -1;
    }
}

/* **********************************************
     Begin simplyAjax.js
********************************************** */

var simplyAjax = (function () {

	/**
	 * Holds XMLHttpRequest object
	 * 
	 * @type {Object}
	 */
	var _xhr;

	/**
	 * Sets _xhr to either XMLHttpRequest or
	 * the correct version ofActiveXObject
	 * 
	 * @return {Object}
	 */
	function setXHR() {
		if (typeof XMLHttpRequest !== 'undefined') {
			_xhr = new XMLHttpRequest();
		
		} else {
			var versions = ["Microsoft.XmlHttp", "MSXML2.XmlHttp", "MSXML2.XmlHttp.3.0", "MSXML2.XmlHttp.4.0", "MSXML2.XmlHttp.5.0"];
			
			for (var i = 0, len = versions.length; i < len; i++) {
				try {
					_xhr = new ActiveXObject(versions[i]);
					break;
				}
				catch (e) {}
			}
		}
	}

	function random() {
		return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
	}

	function randomCallbackName() {
		return "simplyAjax_" + random()+random()+random()+random()+random();
	}

	/**
	 * Attach a script element to the current page
	 * referencing the URL we need to make a GET
	 * request to
	 * @param  {string} url Full URL (with query string)
	 * @return null
	 */
	function crossDomainRequest(url) {
		var script = document.createElement("script");
		script.src = url;
		document.body.appendChild(script);
	}

	/**
	 * Create a query string from an object
	 * containing key: value pairs
	 * @param  {Object} object
	 * @return {string} Query string
	 */
	function createQueryString(object) {

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
	}

	return {

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
		get: function(obj) {

			if (obj.dataType && obj.dataType.toLowerCase() == "jsonp") {

				// assign success callback to a function on ajax object
				var cb = randomCallbackName();
				simplyAjax[cb] = obj.success;

				// assign callback in URL
				obj.data.callback = "simplyAjax." + cb;
				var url = obj.url + createQueryString(obj.data);
				
				crossDomainRequest(url);

			} else {

				var url = obj.url + createQueryString(obj.data);

				setXHR();
				
				_xhr.onreadystatechange = function() {

					if (_xhr.readyState === 4) {

						if (_xhr.status == 200) {
							obj.success(_xhr.responseText, _xhr.status, _xhr.statusText);
						} else {
							obj.fail(_xhr.status, _xhr.statusText);
						}
					}	
				}
				
				_xhr.open("GET", url, true);
				_xhr.send(null);
			}
		
		}
	}
})();

/* **********************************************
     Begin hubJS.abbrev.js
********************************************** */

/**
 * This is an appreviated version of hubJS that includes only functions
 * that the widget needs. The following functions were ommited:
 *
 * articles.related
 * articles.recent
 * articles.popular
 * utility.extractEmbeddedItemIds
 * 
 */
var hubJS = (function (ajax) {

	/**
	 * Hub library object for reference inside
	 * return object.
	 */
	var _library;

	/**
	 * Default settings
	 * @type {Object}
	 */
	var _defaultSettings = {
		version: 0,
		key: null
	};


	return {

		/**
		 * User defined settings
		 * @type {Object}
		 */
		userSettings: {},

		/**
		 * API base URL
		 * @type {String}
		 */
		baseUrl: "http://api.hub.jhu.edu/",

		/**
		 * Initialize the Hub library.
		 * 
		 * @param  {object} settings
		 * @return null
		 */
		init: function (settings) {
			_library = this;
			_library.userSettings = _library.utility.extend({}, _defaultSettings, settings);
		},

		/**
		 * Gets a payload from the Hub API
		 * 
		 * @param  {string} 	endpoint  	API endpoint
		 * @param  {object} 	data     	Data to be sent to the server
		 * @param  {function} 	callback 	Function to run when request is successful
		 */
		get: function(endpoint, data, callback) {

			var data = _library.utility.extend({}, data);
			data.v = _library.userSettings.version;
			data.key = _library.userSettings.key;

			if (data.id) {
				endpoint = endpoint + "/" + data.id;
				delete data.id;
			}

	        ajax.get({
	            url: _library.baseUrl + endpoint,
	            dataType: "jsonp",
	            data: data,
	            success: callback,
	            fail: _library.userSettings.fail
	        });
	    },

	    /**
	     * Articles methods
	     * @type {Object}
	     */
		articles: {

			/**
			 * Find an article or articles
			 * 
			 * @param  {object} 	data     	Data to be sent to the server
			 * @param  {function} 	callback 	Function to run when request is successful
			 */
			find: function(data, callback) {
				var data = _library.utility.extend({}, data);
				_library.get("articles", data, callback);
			}
		},

		utility: {
			extend: function() {
				for (var i = 1, len = arguments.length; i < len; i++) {
					for (var key in arguments[i]) {
						if (arguments[i].hasOwnProperty(key)) {
							arguments[0][key] = arguments[i][key];
						}
					}
				}
				return arguments[0];
			}
		}
	}

})(simplyAjax);

/* **********************************************
     Begin widgetCreator.js
********************************************** */

var widgetCreator = (function (hubJS) {

	/**
	 * hubWidget object for reference
	 * inside return object below.
	 * @type {Object}
	 */
	var _library;

	return {

		/**
		 * Holds the various data attributes passed
		 * to the widget
		 * @type {Object}
		 */
		data: {},

		/**
		 * Default widget title 
		 * @type {String}
		 */
		defaultTitle: "News from the Hub",

		/**
		 * Default number of articles to get
		 * @type {Integer}
		 */
		defaultCount: 5,

		/**
		 * Saves off the object as _library. This is
		 * separated out so it can be called by tests.
		 * @return Object
		 */
		init: function() {
			_library = this;
			return _library;
		},

		/**
		 * Initialize the hub widget
		 * @return {object} hubWidget
		 */
		create: function(object, settings) {

			_library = this;
			_library.widget = object;

			// Create base widget
			_library.extractDataAttrs();
			_library.widget.innerHTML = _library.createInitialHtml();

			// Initialize hubJS
			var key = _library.widget.getAttribute("key") || null
			hubJS.init(settings);

			_library.getArticles();

			// Keeps things chainable
			return _library;
		},

		/**
		 * Extracts the data attributes from the widget div
		 * for use in creating the widgets appearance and
		 * creating the data to send to hubJS.
		 * @return null
		 */
		extractDataAttrs: function() {
			_library.data = {
				count: parseInt(_library.widget.getAttribute("data-count")) || _library.defaultCount,
				tags: _library.widget.getAttribute("data-tags") || null,
				title: _library.widget.getAttribute("data-title") || _library.defaultTitle,
				topics: _library.widget.getAttribute("data-topics") || null
			};
		},

		/**
		 * Creates the HTML that initially populares the widget
		 * @return {string} The HTML
		 */
		createInitialHtml: function() {
			var html = "<div class=\"header\">" + _library.data.title + "</div>";
			html += "<div id=\"hubWidgetContent\" class=\"loading\"></div>";
			html += "<div class=\"hubpower clearfix\"><div class=\"link\"><a href=\"http://hub.jhu.edu\">http://hub.jhu.edu</a></div><div class=\"image\"><a href=\"http://hub.jhu.edu\"><span>Powered by the Hub</span></a></div></div>";
			return html;
		},

		/**
		 * Get articles to populate the widget
		 * @param  {Lamdba(data, jqXHR)} Callback that fires upon successful retrieval of data.
		 * @return {object} hubWidget
		 */
		getArticles: function() {

			var data = _library.utility.compileData();

			hubJS.articles.find(data, function(payload) {
				if (!payload.error) {
					_library.populateWidget(payload._embedded.articles);
				} else {
					_library.displayError();
				}
			});
		},

		/**
		 * Populare the widget with found articles
		 * @param  {array} articles Array of article objects
		 * @return {object} hubWidget
		 */
		populateWidget: function(articles) {
			
			var html = "<ul>";
			for (var i = 0, len = articles.length; i < len; i++) {
				var article = articles[i];
				html += "<li><p class=\"headline\"><a href=\"" + article.url +"\">" + article.headline +"</a></p>";
                html += "<p class=\"pubdate\">" + _library.utility.getPublishDate(article.publish_date) + "</a></p></li>";
			}
			html += "</ul";

			_library.utility.removeClass(document.getElementById("hubWidgetContent"), "loading");
			document.getElementById("hubWidgetContent").innerHTML = html;
		},

		/**
		 * Displays an error if non results were returned.
		 * @return null
		 */
		displayError: function() {
			_library.utility.removeClass(document.getElementById("hubWidgetContent"), "loading");
			document.getElementById("hubWidgetContent").innerHTML = "<p>Sorry, no results were found. Trying checking out <a href=\"http://hub.jhu.edu\">The Hub</a> for the latest Johns Hopkins news.</p>";
		},

		/**
		 * Set of utiltiy functions
		 * @type {Object}
		 */
		utility: {
			getPublishDate: function(timestamp) {
				var date = new Date(timestamp * 1000);
				var month = _library.utility.getMonth(date);
				var day = date.getDate();
				var year = date.getFullYear();

				return fullDate = month + " " + day + ", " + year;
			},
			getMonth: function(dateObject) {
				var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
				return monthNames[dateObject.getMonth()];
			},
			compileData: function() {
				var data = {};
				data.per_page = _library.utility.isNumeric(_library.data.count) ? _library.data.count : _library.defaultCount;

				if (_library.data.topics) {
					data.topics = _library.utility.cleanList(_library.data.topics);
				}

				if (_library.data.tags) {
					data.tags = _library.utility.cleanList(_library.data.tags);
				}

				return data;
			},
			cleanList: function (string) {
				return string.replace(/\s/g, "");
			},
			removeClass: function (obj, className) {
				var classes = obj.className;
				classes = classes.trim().split(" ");

				var index = classes.indexOf(className);
				classes.splice(index, 1);

				obj.className = classes.join(" ");
			},
			isNumeric: function(obj) {
				return !isNaN( parseFloat(obj) ) && isFinite( obj );
			}
		}
	}
})(hubJS);

/* **********************************************
     Begin hubwidget.js
********************************************** */

/**
 * @codekit-prepend "../custom/prototypes.js"
 * @codekit-prepend "../lib/simplyAjax.js"
 * @codekit-prepend "../custom/hubJS.abbrev.js"
 * @codekit-prepend "../custom/widgetCreator.js"
 */

var widget = document.getElementById("hubWidget");

widgetCreator.create( widget,{
	version: widget.getAttribute("version"),
	key: widget.getAttribute("key")
});