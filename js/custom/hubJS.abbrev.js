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

})(jQuery, simplyAjax);