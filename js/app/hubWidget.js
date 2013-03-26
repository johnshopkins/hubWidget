var hubWidget = (function ($, hubJS) {

	/**
	 * Hub widget object for reference
	 * inside return object.
	 */
	var _library;

	return {

		/**
		 * Initialize the hub widget
		 * @return {object} hubWidget
		 */
		init: function() {

			// Add a loading gif to the widget content area
			$("#hubWidget .content").html("<p style=\"text-align:center;\"><img src=\"images/loading.gif\" /></p>");

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
		getArticles: function(callback) {
			hubJS.articles.find({ per_page: 5 }, function(payload) {
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

			$("#hubWidget .content").html($("<ul>"));

			$.each(articles, function(i, article) {
				var html = "<li><p class=\"headline\"><a href=\"" + article.url +"\">" + article.headline +"</a></p>";
                var html = html + "<p class=\"pubdate\">" + _library.utility.getPublishDate(article.publish_date) + "</a></p></li>";
				$("#hubWidget ul").append(html);
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
			$("#hubWidget .content").html("<p>Sorry, no results were found. Trying checking out <a href=\"http://hub.jhu.edu\">The Hub</a> for the latest Johns Hopkins news.</p>");
		}
	}
})(jQuery, hubJS);

jQuery(document).ready(function ($) {
    hubWidget.init().getArticles();
});