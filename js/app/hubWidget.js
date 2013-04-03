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
	 * Title of widget
	 * @type {String}
	 */
	var _title;

	/**
	 * Comma-separated list of topic slugs or IDs
	 * @type {String}
	 */
	var _topics;

	/**
	 * Comma-separated list of tag slugs or IDs
	 * @type {String}
	 */
	var _tags;

	return {

		/**
		 * Initialize the hub widget
		 * @return {object} hubWidget
		 */
		init: function() {

			$widget = $("#hubWidget");

			// Extract data attributes
			_title = $widget.attr("data-title");
			_topics = $widget.attr("data-topics");
			_tags = $widget.attr("data-tags");

			// Initial HTML
			var html = "<div class=\"header\">" + _title + "</div>";
			html += "<div class=\"content loading\"></div>";
			html += "<div class=\"hubpower\"><a href=\"http://hub.jhu.edu\"><span>Powered by the Hub</span></a></div>";


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

			var data = { per_page: 5 };

			if (_topics) {
				data.topics = _topics.replace(/\s/g, "");
			}

			if (_tags) {
				data.tags = _tags.replace(/\s/g, "");
			}

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