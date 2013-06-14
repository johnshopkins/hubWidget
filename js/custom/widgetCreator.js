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
		create: function() {

			_library = this;
			_library.widget = document.getElementById("hubWidget");

			// Create base widget
			_library.extractDataAttrs();
			_library.widget.innerHTML = _library.createInitialHtml();

			// Initialize hubJS
			hubJS.init({ v: 0 });
			hubJS.baseUrl = "http://api.hub.jhu.edu/";

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