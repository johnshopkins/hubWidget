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