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
var hubJS = (function ($, ajax) {

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
			 * @return {jqXHR}    				See: http://api.jquery.com/jQuery.ajax/#jqXHR
			 */
			find: function(data, callback) {
				var data = $.extend({}, data);
				return _library.get("articles", data, callback);
			}
		}
	}

})(jQuery, simplyAjax);