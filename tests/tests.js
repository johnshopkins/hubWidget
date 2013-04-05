/**
 * Functions left to test:
 * getArticles
 * populateWidget
 * displayError
 */

test("widgetCreator.extractDataAttrs() - no attributes", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\"></div>");
	widgetCreator.extractDataAttrs();

	var expected = {
		count: 5,
		tags: null,
		title: "News from the Hub",
		topics: null
	};

	equal(JSON.stringify(widgetCreator.data), JSON.stringify(expected));
});

test("widgetCreator.extractDataAttrs() - override count", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\" data-count=\"10\"></div>");
	widgetCreator.extractDataAttrs();

	var expected = {
		count: 10,
		tags: null,
		title: "News from the Hub",
		topics: null
	};

	equal(JSON.stringify(widgetCreator.data), JSON.stringify(expected));
});

test("widgetCreator.extractDataAttrs() - custom title", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\" data-title=\"News\"></div>");
	widgetCreator.extractDataAttrs();

	var expected = {
		count: 5,
		tags: null,
		title: "News",
		topics: null
	};

	equal(JSON.stringify(widgetCreator.data), JSON.stringify(expected));
});

test("widgetCreator.extractDataAttrs() - some tags", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\" data-tags=\"one, two, three\"></div>");
	widgetCreator.extractDataAttrs();

	var expected = {
		count: 5,
		tags: "one, two, three",
		title: "News from the Hub",
		topics: null
	};

	equal(JSON.stringify(widgetCreator.data), JSON.stringify(expected));
});

test("widgetCreator.extractDataAttrs() - some topics", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\" data-topics=\"four, five, six\"></div>");
	widgetCreator.extractDataAttrs();

	console.log(widgetCreator.data);

	var expected = {
		count: 5,
		tags: null,
		title: "News from the Hub",
		topics: "four, five, six"
	};

	equal(JSON.stringify(widgetCreator.data), JSON.stringify(expected));
});

test("widgetCreator.createInitialHtml() - default args", function () {
	widgetCreator.data = {
		count: 5,
		tags: null,
		title: "News from the Hub",
		topics: null
	};

	var output = widgetCreator.createInitialHtml();
	var expected = '<div class="header">News from the Hub</div><div class="content loading"></div><div class="hubpower clearfix"><div class="link"><a href="http://hub.jhu.edu">http://hub.jhu.edu</a></div><div class="image"><a href="http://hub.jhu.edu"><span>Powered by the Hub</span></a></div></div>';
	
	equal(output, expected);
});

test("widgetCreator.createInitialHtml() - custom title", function () {
	widgetCreator.data = {
		count: 5,
		tags: null,
		title: "News",
		topics: null
	};

	var output = widgetCreator.createInitialHtml();
	var expected = '<div class="header">News</div><div class="content loading"></div><div class="hubpower clearfix"><div class="link"><a href="http://hub.jhu.edu">http://hub.jhu.edu</a></div><div class="image"><a href="http://hub.jhu.edu"><span>Powered by the Hub</span></a></div></div>';
	
	equal(output, expected);
});

test("widgetCreator.utility.getPublishDate()", function () {
	// Also tests getMonth() indirectly
	var input = 1365098689;
	var output = widgetCreator.utility.getPublishDate(input);
	equal(output, "April 4, 2013");
});

test("widgetCreator.utility.cleanList()", function () {
	var input = "one,two,three";
	var output = widgetCreator.utility.cleanList(input);
	equal(output, "one,two,three");

	input = "one, two, three";
	output = widgetCreator.utility.cleanList(input);
	equal(output, "one,two,three");
});

test("widgetCreator.utility.compileData() - no attributes", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\"></div>");
	var output = widgetCreator.utility.compileData();

	var expected = {
		per_page: 5,
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});

test("widgetCreator.utility.compileData() - override count", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\" data-count=\"10\"></div>");
	widgetCreator.extractDataAttrs();
	var output = widgetCreator.utility.compileData();

	var expected = {
		per_page: 10,
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});

test("widgetCreator.utility.compileData() - custom title", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\" data-title=\"News\"></div>");
	widgetCreator.extractDataAttrs();
	var output = widgetCreator.utility.compileData();

	var expected = {
		per_page: 5
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});

test("widgetCreator.extractDataAttrs() - some tags", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\" data-tags=\"one, two, three\"></div>");
	widgetCreator.extractDataAttrs();
	var output = widgetCreator.utility.compileData();

	var expected = {
		per_page: 5,
		tags: "one,two,three",
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});

test("widgetCreator.utility.compileData() - some topics", function () {
	widgetCreator.widget = $("<div id=\"widgetCreator\" data-topics=\"four, five, six\"></div>");
	widgetCreator.extractDataAttrs();
	var output = widgetCreator.utility.compileData();

	var expected = {
		per_page: 5,
		topics: "four,five,six"
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});