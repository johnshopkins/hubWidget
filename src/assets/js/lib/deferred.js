var Deferred = function() {

	var deferred = {

		newDefer: {},

		resolve: function(responseText, status, statusText) {

			// result of the function passed to then()
			var result = deferred.fulfilled(responseText, status, statusText);

			if (result && result.then) {
				// we need to wait here until promise resolves
				result.then(function(data) {
					deferred.newDefer.resolve(data);
				});
			}

			else if (typeof deferred.newDefer.resolve == "function") {
				// another 'then' was defined
				deferred.newDefer.resolve(result);
			}
		},

		reject: function(promiseOrValue) {

			// result of the function passed to then()
			var result = deferred.error(promiseOrValue);

			if (promiseOrValue && promiseOrValue.then) {
				// we need to wait here until promise resolves
				promiseOrValue.then(function(data) {
					deferred.newDefer.resolve(data);
				});
			}

			else if (typeof deferred.newDefer.reject == "function") {
				// another 'then' was defined
				deferred.newDefer.reject(result);
			}
		},

		fulfilled: function(responseText, status, statusText) { },

		error: function(status, statusText) { },

		// what arguments, when does this fire?
		progress: function() { },

		promise: {

			then: function(fulfilled, error, progress) {

				deferred.fulfilled = typeof fulfilled == "function" ? fulfilled : function() {};
				deferred.error = typeof error == "function" ? error : function() {};
				deferred.progress = typeof progress == "function" ? progress: function() {};

				// This function should return a new promise that is fulfilled when the given
				// fulfilledHandler or errorHandler callback is finished
				deferred.newDefer = new Deferred();
				return deferred.newDefer.promise;
			}
		}
	};

	return deferred;

};

module.exports = Deferred;
