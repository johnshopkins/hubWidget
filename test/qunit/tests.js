/**
 * Unit testing
 */


/**
 * Initialization settings object
 * @type {Object}
 */
var init = {
	version: 0,
	key: "3c862c46d83c108a30c6660c7b91b560e4f76199"
}


/**
 * Articles
 */

asyncTest("hubJS.get() : lookup with no data", function () {
	hubJS.init(init);
	var response = hubJS.get("articles", {}).then(function (payload) {
		var length = payload._embedded.articles.length;
		equal(length, 5);
		start();
	});
});

asyncTest("hubJS.get() : lookup with ID", function () {
	hubJS.init(init);

	var id = 157;

	var response = hubJS.get("articles", {id: id}).then(function (payload) {
		var foundId = payload.id;
		equal(foundId, id);
		start();
	});
});

asyncTest("hubJS.articles.find() : lookup with no data", function () {
	hubJS.init(init);
	var response = hubJS.articles.find().then(function (payload) {
		var length = payload._embedded.articles.length;
		equal(length, 5);
		start();
	});
});

asyncTest("hubJS.articles.find() : lookup with ID", function () {
	hubJS.init(init);

	var id = 157;

	var response = hubJS.articles.find({id: id}).then(function (payload) {
		var foundId = payload.id;
		equal(foundId, id);
		start();
	});
});

asyncTest("hubJS.articles.find() : lookup with ID", function () {
	hubJS.init(init);

	var id = 157;

	var response = hubJS.articles.find({id: id}).then(function (payload) {
		var foundId = payload.id;
		equal(foundId, id);
		start();
	});
});

asyncTest("hubJS.articles.recent()", function () {
	hubJS.init(init);
	var response = hubJS.articles.recent(2).then(function (payload) {
		var length = payload._embedded.articles.length;
		equal(length, 2);
		start();
	});
});

asyncTest("hubJS.articles.recent()", function () {
	hubJS.init(init);
	response = hubJS.articles.recent().then(function (payload) {
		var length = payload._embedded.articles.length;
		equal(length, 5);
		start();
	});
});

asyncTest("hubJS.articles.related()", function () {
	hubJS.init(init);
	var response = hubJS.articles.related(1009).then(function (payload) {
		var length = payload._embedded.articles.length;
		equal(length, 5);
		start();
	});
});

asyncTest("hubJS.articles.related(): get back two articles", function () {
	hubJS.init(init);
	var response = hubJS.articles.related(157, { per_page: 2}).then(function (payload) {
		var length = payload._embedded.articles.length;
		equal(length, 2);
		start();
	});
});

asyncTest("hubJS.articles.related(): with a passed excluded ID", function () {
	hubJS.init(init);
	var response = hubJS.articles.related(157, { excluded_ids: 123 }).then(function (payload) {
		var length = payload._embedded.articles.length;
		equal(length, 5);
		start();
	});
});


/**
 * Events
 */

asyncTest("hubJS.get() : lookup with no data", function () {
	hubJS.init(init);
	var response = hubJS.get("events", {}).then(function (payload) {
		var length = payload._embedded.events.length;
		equal(length, 5);
		start();
	});
});

asyncTest("hubJS.get() : lookup with ID", function () {
	hubJS.init(init);

	var id = 3707;

	var response = hubJS.get("events", {id: id}).then(function (payload) {
		var foundId = payload.id;
		equal(foundId, id);
		start();
	});
});

asyncTest("hubJS.events.find() : lookup with no data", function () {
	hubJS.init(init);
	var response = hubJS.events.find().then(function (payload) {
		var length = payload._embedded.events.length;
		equal(length, 5);
		start();
	});
});

asyncTest("hubJS.events.find() : lookup with ID", function () {
	hubJS.init(init);

	var id = 3707;

	var response = hubJS.events.find({id: id}).then(function (payload) {
		var foundId = payload.id;
		equal(foundId, id);
		start();
	});
});

asyncTest("hubJS.events.find() : lookup with ID", function () {
	hubJS.init(init);

	var id = 3707;

	var response = hubJS.events.find({id: id}).then(function (payload) {
		var foundId = payload.id;
		equal(foundId, id);
		start();
	});
});

asyncTest("hubJS.events.upcoming()", function () {
	hubJS.init(init);
	var response = hubJS.events.upcoming(2).then(function (payload) {
		var length = payload._embedded.events.length;
		equal(length, 2);
		start();
	});
});

asyncTest("hubJS.events.upcoming()", function () {
	hubJS.init(init);
	response = hubJS.events.upcoming().then(function (payload) {
		var length = payload._embedded.events.length;
		equal(length, 5);
		start();
	});
});

/**
 * Error handling
 */
asyncTest("Error detection", function () {
	hubJS.init();
	var response = hubJS.get("articles").then(function (payload) {
		if (payload.error) {
	        var httpStatus = payload.statusCode;
	        var message = payload.message;
	    }
		equal(httpStatus, 401);
		start();
	});
});
