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
var hubJS = (function (global, $) {

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
		version: 0
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
			_library.userSettings = $.extend({}, _defaultSettings, settings);
		},

		/**
		 * Gets a payload from the Hub API
		 * 
		 * @param  {string} 	endpoint  	API endpoint
		 * @param  {object} 	data     	Data to be sent to the server
		 * @param  {function} 	callback 	Function to run when request is successful
		 * @return {jqXHR}    				See: http://api.jquery.com/jQuery.ajax/#jqXHR
		 */
		get: function(endpoint, data, callback) {

			var data = $.extend({}, data);
			data.v = _library.userSettings.version;

			if (data.id) {
				endpoint = endpoint + "/" + data.id;
				delete data.id;
			}

	        return $.ajax({
	            url: _library.baseUrl + endpoint,
	            dataType: "jsonP",
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
			 * @return {jqXHR}    				See: http://api.jquery.com/jQuery.ajax/#jqXHR
			 */
			find: function(data, callback) {
				var data = $.extend({}, data);
				return _library.get("articles", data, callback);
			}
		}
	}

})(window, jQuery);

/* **********************************************
     Begin widgetCreator.js
********************************************** */

var widgetCreator = (function ($, hubJS) {

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
		 * Widget container div
		 * @type {Object}
		 */
		widget: {},

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
		create: function(widgetDiv) {

			_library = this;
			_library.widget = widgetDiv;

			// Create base widget
			_library.extractDataAttrs();
			_library.widget.html(_library.createInitialHtml());

			// Initialize hubJS
			hubJS.init({ v: 0 });
			hubJS.baseUrl = "http://api.hub.jhu.edu/";

			_library.getArticles();

			// Keeps things chainable
			return _library.widget;
		},

		/**
		 * Extracts the data attributes from the widget div
		 * for use in creating the widgets appearance and
		 * creating the data to send to hubJS.
		 * @return null
		 */
		extractDataAttrs: function() {
			_library.data = {
				count: parseInt(_library.widget.attr("data-count")) || _library.defaultCount,
				tags: _library.widget.attr("data-tags") || null,
				title: _library.widget.attr("data-title") || _library.defaultTitle,
				topics: _library.widget.attr("data-topics") || null
			};
		},

		/**
		 * Creates the HTML that initially populares the widget
		 * @return {string} The HTML
		 */
		createInitialHtml: function() {
			var html = "<div class=\"header\">" + _library.data.title + "</div>";
			html += "<div class=\"content loading\"></div>";
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
			_library.widget.find(".content").removeClass("loading");
			_library.widget.find(".content").html($("<ul>"));

			$.each(articles, function(i, article) {
				var html = "<li><p class=\"headline\"><a href=\"" + article.url +"\">" + article.headline +"</a></p>";
                var html = html + "<p class=\"pubdate\">" + _library.utility.getPublishDate(article.publish_date) + "</a></p></li>";
				_library.widget.find("ul").append(html);
			});
		},

		/**
		 * Displays an error if non results were returned.
		 * @return null
		 */
		displayError: function() {
			_library.widget.find(".content").html("<p>Sorry, no results were found. Trying checking out <a href=\"http://hub.jhu.edu\">The Hub</a> for the latest Johns Hopkins news.</p>");
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
				data.per_page = $.isNumeric(_library.data.count) ? _library.data.count : _library.defaultCount;

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
			}
		}
	}
})(jQuery, hubJS);

/* **********************************************
     Begin jquery.hubwidget.js
********************************************** */

/**
 * jQuery plugin
 */

/**
 * @codekit-prepend "../custom/hubJS.abbrev.js"
 * @codekit-prepend "../custom/widgetCreator.js"
 */

(function( $ ){
	$.fn.hubWidget = function() {
		return widgetCreator.create(this);
	};
})( jQuery );