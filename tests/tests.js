/**
 * Functions left to test:
 * getArticles
 * populateWidget
 * displayError
 */

test("hubWidget.setSettings() : default", function () {
	hubWidget.setSettings({});
	
	var expected = { container: "#hubWidget" };

	equal(JSON.stringify(hubWidget.userSettings), JSON.stringify(expected));
});

test("hubWidget.setSettings() : override container", function () {
	hubWidget.setSettings({ container: "#somethingElse"});
	
	var expected = { container: "#somethingElse" };

	equal(JSON.stringify(hubWidget.userSettings), JSON.stringify(expected));
});

test("hubWidget.extractDataAttrs() - no attributes", function () {
	hubWidget.widget = $("<div id=\"hubWidget\"></div>");
	hubWidget.extractDataAttrs();

	var expected = {
		count: 5,
		tags: null,
		title: "News from the Hub",
		topics: null
	};

	equal(JSON.stringify(hubWidget.data), JSON.stringify(expected));
});

test("hubWidget.extractDataAttrs() - override count", function () {
	hubWidget.widget = $("<div id=\"hubWidget\" data-count=\"10\"></div>");
	hubWidget.extractDataAttrs();

	var expected = {
		count: 10,
		tags: null,
		title: "News from the Hub",
		topics: null
	};

	equal(JSON.stringify(hubWidget.data), JSON.stringify(expected));
});

test("hubWidget.extractDataAttrs() - custom title", function () {
	hubWidget.widget = $("<div id=\"hubWidget\" data-title=\"News\"></div>");
	hubWidget.extractDataAttrs();

	var expected = {
		count: 5,
		tags: null,
		title: "News",
		topics: null
	};

	equal(JSON.stringify(hubWidget.data), JSON.stringify(expected));
});

test("hubWidget.extractDataAttrs() - some tags", function () {
	hubWidget.widget = $("<div id=\"hubWidget\" data-tags=\"one, two, three\"></div>");
	hubWidget.extractDataAttrs();

	var expected = {
		count: 5,
		tags: "one, two, three",
		title: "News from the Hub",
		topics: null
	};

	equal(JSON.stringify(hubWidget.data), JSON.stringify(expected));
});

test("hubWidget.extractDataAttrs() - some topics", function () {
	hubWidget.widget = $("<div id=\"hubWidget\" data-topics=\"four, five, six\"></div>");
	hubWidget.extractDataAttrs();

	console.log(hubWidget.data);

	var expected = {
		count: 5,
		tags: null,
		title: "News from the Hub",
		topics: "four, five, six"
	};

	equal(JSON.stringify(hubWidget.data), JSON.stringify(expected));
});

test("hubWidget.createInitialHtml() - default args", function () {
	hubWidget.data = {
		count: 5,
		tags: null,
		title: "News from the Hub",
		topics: null
	};

	var output = hubWidget.createInitialHtml();
	var expected = '<div class="header">News from the Hub</div><div class="content loading"></div><div class="hubpower clearfix"><div class="link"><a href="http://hub.jhu.edu">http://hub.jhu.edu</a></div><div class="image"><a href="http://hub.jhu.edu"><span>Powered by the Hub</span></a></div></div>';
	
	equal(output, expected);
});

test("hubWidget.createInitialHtml() - custom title", function () {
	hubWidget.data = {
		count: 5,
		tags: null,
		title: "News",
		topics: null
	};

	var output = hubWidget.createInitialHtml();
	var expected = '<div class="header">News</div><div class="content loading"></div><div class="hubpower clearfix"><div class="link"><a href="http://hub.jhu.edu">http://hub.jhu.edu</a></div><div class="image"><a href="http://hub.jhu.edu"><span>Powered by the Hub</span></a></div></div>';
	
	equal(output, expected);
});

test("hubWidget.utility.getPublishDate()", function () {
	// Also tests getMonth() indirectly
	var input = 1365098689;
	var output = hubWidget.utility.getPublishDate(input);
	equal(output, "April 4, 2013");
});

test("hubWidget.utility.cleanList()", function () {
	var input = "one,two,three";
	var output = hubWidget.utility.cleanList(input);
	equal(output, "one,two,three");

	input = "one, two, three";
	output = hubWidget.utility.cleanList(input);
	equal(output, "one,two,three");
});

test("hubWidget.utility.compileData() - no attributes", function () {
	hubWidget.widget = $("<div id=\"hubWidget\"></div>");
	var output = hubWidget.utility.compileData();

	var expected = {
		per_page: 5,
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});

test("hubWidget.utility.compileData() - override count", function () {
	hubWidget.widget = $("<div id=\"hubWidget\" data-count=\"10\"></div>");
	hubWidget.extractDataAttrs();
	var output = hubWidget.utility.compileData();

	var expected = {
		per_page: 10,
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});

test("hubWidget.utility.compileData() - custom title", function () {
	hubWidget.widget = $("<div id=\"hubWidget\" data-title=\"News\"></div>");
	hubWidget.extractDataAttrs();
	var output = hubWidget.utility.compileData();

	var expected = {
		per_page: 5
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});

test("hubWidget.extractDataAttrs() - some tags", function () {
	hubWidget.widget = $("<div id=\"hubWidget\" data-tags=\"one, two, three\"></div>");
	hubWidget.extractDataAttrs();
	var output = hubWidget.utility.compileData();

	var expected = {
		per_page: 5,
		tags: "one,two,three",
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});

test("hubWidget.utility.compileData() - some topics", function () {
	hubWidget.widget = $("<div id=\"hubWidget\" data-topics=\"four, five, six\"></div>");
	hubWidget.extractDataAttrs();
	var output = hubWidget.utility.compileData();

	var expected = {
		per_page: 5,
		topics: "four,five,six"
	};

	equal(JSON.stringify(output), JSON.stringify(expected));
});