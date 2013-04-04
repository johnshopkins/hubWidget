var hubWidget = (function ($, hubJS) {

	/**
	 * Widget container div
	 * @type {Object}
	 */
	var $widget;

	/**
	 * hubWidget object for reference
	 * inside return object below.
	 * @type {Object}
	 */
	var _library;

	/**
	 * Holds the various data attributes passed
	 * to the widget
	 * @type {Object}
	 */
	var _data = {};

	/**
	 * Default number of articles to get
	 * @type {Number}
	 */
	var _defaultCount = 5;

	return {

		/**
		 * Initialize the hub widget
		 * @return {object} hubWidget
		 */
		init: function() {

			$widget = $("#hubWidget");

			// Extract data attributes
			_data.title = $widget.attr("data-title");
			_data.count = $widget.attr("data-count");
			_data.topics = $widget.attr("data-topics");
			_data.tags = $widget.attr("data-tags");

			// Initial HTML
			var html = "<div class=\"header\">" + _data.title + "</div>";
			html += "<div class=\"content loading\"></div>";
			html += "<div class=\"hubpower clearfix\"><div class=\"link\"><a href=\"http://hub.jhu.edu\">http://hub.jhu.edu</a></div><div class=\"image\"><a href=\"http://hub.jhu.edu\"><span>Powered by the Hub</span></a></div></div>";


			$widget.html(html);

			// Save off hubWidget for use in the return object
			_library = this;

			// Initialize hubJS
			hubJS.init({ v: 0 });
			hubJS.baseUrl = "http://local.api.hub.jhu.edu/";

			return _library;
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
			return _library;
		},

		/**
		 * Populare the widget with found articles
		 * @param  {array} articles Array of article objects
		 * @return {object} hubWidget
		 */
		populateWidget: function(articles) {
			$widget.find(".content").removeClass("loading");
			$widget.find(".content").html($("<ul>"));

			$.each(articles, function(i, article) {
				var html = "<li><p class=\"headline\"><a href=\"" + article.url +"\">" + article.headline +"</a></p>";
                var html = html + "<p class=\"pubdate\">" + _library.utility.getPublishDate(article.publish_date) + "</a></p></li>";
				$widget.find("ul").append(html);
			});
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
				data.per_page = $.isNumeric(_data.count) ? _data.count : _defaultCount;

				if (_data.topics) {
					data.topics = _library.utility.cleanList(_data.topics);
				}

				if (_data.tags) {
					data.tags = _library.utility.cleanList(_data.tags);
				}

				return data;
			},
			cleanList: function (string) {
				return string.replace(/\s/g, "");
			}
		},
		displayError: function() {
			$widget.find(".content").html("<p>Sorry, no results were found. Trying checking out <a href=\"http://hub.jhu.edu\">The Hub</a> for the latest Johns Hopkins news.</p>");
		}
	}
})(jQuery, hubJS);

jQuery(document).ready(function ($) {
    hubWidget.init().getArticles();
});