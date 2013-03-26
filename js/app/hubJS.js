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
			},

			/**
			 * Convenience method to find recent articles
			 * 
			 * @param  {object} 	data     	Data to be sent to the server
			 * @param  {function} 	callback 	Function to run when request is successful
			 * @return {jqXHR}    				See: http://api.jquery.com/jQuery.ajax/#jqXHR
			 */
			recent: function(data, callback) {
				var data = $.extend({}, data);
				return _library.articles.find(data, callback);
			},

			/**
			 * Find popular articles
			 * 
			 * @param  {object} 	data     	Data to be sent to the server
			 * @param  {function} 	callback 	Function to run when request is successful
			 * @return {jqXHR}    				See: http://api.jquery.com/jQuery.ajax/#jqXHR
			 */
			popular: function(data, callback) {
				var data = $.extend({}, data, { order_by: "score", score: "trending" });
				return _library.get("articles", data, callback);
			},

			/**
			 * Find articles related to a specific article
			 * 
			 * @param  {integer} 	id        	ID of article to lookup other articles against
			 * @param  {object} 	data     	Data to be sent to the server
			 * @param  {function} 	callback 	Function to run when request is successful
			 * @return {deferred}    			See: http://api.jquery.com/category/deferred-object/
			 */
			related: function(id, data, callback) {

				// if the user passed additional related IDs, merge them with ours
				var ids = data && data.excluded_ids ? id + "," + data.excluded_ids : id;

				var data = $.extend({}, data, { excluded_ids: ids });

				var toReturn;
				
				var article = _library.articles.find({id: id});

				var relatedByTags = article.then(function (payload) {
					var tagIds = _library.utility.extractEmbeddedItemIds(payload, "tags");
					var tagData = $.extend({}, data, { tags: tagIds.join(",") });
					return _library.articles.find(tagData);
				});

				var relatedByTopics = article.then(function (payload) {
					var topicIds = _library.utility.extractEmbeddedItemIds(payload, "topics");
					var topicData = $.extend({}, data, { topics: topicIds.join(",") });
					return relatedByTopics = _library.articles.find(topicData);
				});

				relatedByTags.done(function (payload) {
					toReturn = (payload._embedded.articles) ? "tags" : "topics";
				});

				return (toReturn == "tags") ? relatedByTags.done(callback) : relatedByTopics.done(callback);
			}
		},

		/**
	     * Utility methods
	     * @type {Object}
	     */
		utility: {

			/**
			 * Extract the IDs of all items in a given
			 * embedded object; for example tags or topics.
			 * 
			 * @param  {object} payload Payload to extract embedded item IDs from
			 * @param  {string} object  Target object (like "tags")
			 * @return {array}        	IDs
			 */
			extractEmbeddedItemIds: function(payload, object) {
				var target = (payload && payload._embedded && payload._embedded[object]) || [];
				return target.map(function(object) {
					return object.id;
				});
			}
		}
	}

})(window, jQuery);