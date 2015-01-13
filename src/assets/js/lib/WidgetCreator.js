var api = require("./api");
var utils = require("./utils");
var DateFormatter = require("./date-formatter");

var WidgetCreator = function (elements) {

  var length = elements.length;

  for (var i = 0; i < length; i++) {

    var element = elements.item(i);
    this.create(element);

  }

};

WidgetCreator.prototype.create = function (element) {

  // setup api, if its not already setup
  if (!this.api) {

    this.api = new api({
      key: element.getAttribute("data-key"),
      v: element.getAttribute("data-version")
    });

  }

  // create base html for widget
  this.createBaseHtml(element);


  // gather data and populate widget
  var type = element.getAttribute("data-type");
  type = type ? type : "articles";

  var self = this;
  this.getData(element, type, function (error, data) {

    if (error) return self.displayError(element);
    self.populateWidget(element, type, data);

  });

};

WidgetCreator.prototype.createBaseHtml = function (element) {

  var title = element.getAttribute("data-title");
  title = title ? title : "News from the Hub";

  var html = "<div class=\"header\">" + title + "</div>";
  html += "<div class=\"content\" class=\"loading\"></div>";
  html += "<div class=\"hubpower clearfix\"><div class=\"link\"><a href=\"http://hub.jhu.edu\">http://hub.jhu.edu</a></div><div class=\"image\"><a href=\"http://hub.jhu.edu\"><span>Powered by the Hub</span></a></div></div>";

  element.innerHTML = html;

};

WidgetCreator.prototype.getQueryStringParams = function (element) {

  // defaults
  var params = { per_page: 5 };

  var count = parseInt(element.getAttribute("data-count"));
  if (utils.isNumeric(count)) params.per_page = count;

  var channels = element.getAttribute("data-channels");
  if (channels) params.channels = channels;

  var tags = element.getAttribute("data-tags");
  if (tags) params.tags = tags;

  var topics = element.getAttribute("data-topics");
  if (topics) params.topics = topics;

  return params;

};

/**
 * Get obects to populate the widget
 * @param  {Lamdba(data, jqXHR)} Callback that fires upon successful retrieval of data.
 * @return {object} hubWidget
 */
WidgetCreator.prototype.getData = function (element, type, callback) {

  // something other than articles or events was requested
  if (!this.api[type]) return this.displayError(element);

  var params = this.getQueryStringParams(element);

  this.api[type](params).then(function (payload) {

    if (payload.error) {
      return callback(payload.error);
    } else {
      return callback(null, payload);
    }

  });

};

WidgetCreator.prototype.populateWidget = function (element, type, data) {

  var content = "";

  if (type == "articles") {
    content = this.getFormattedArticles(data);
  } else if (type == "events") {
    content = this.getFormattedEvents(data);
  }

  if (!content) return this.displayError();

  utils.removeClass(element.querySelector(".content"), "loading");
  element.querySelector(".content").innerHTML = "<ul>" + content + "</ul>";

};

WidgetCreator.prototype.getFormattedArticles = function (data) {

  var articles = data._embedded.articles;
  if (!articles) return;

  var html = "";

  for (var i = 0, len = articles.length; i < len; i++) {

    var article = articles[i];
    var formatter = new DateFormatter(article.publish_date);

    html += "<li><p class=\"headline\"><a href=\"" + article.url +"\">" + article.headline +"</a></p>";
    html += "<p class=\"pubdate\">" + formatter.article() + "</a></p></li>";

  }

  return html;

};

WidgetCreator.prototype.getFormattedEvents = function (data) {

  var events = data._embedded.events;
  if (!events) return;

  var html = "";

  for (var i = 0, len = events.length; i < len; i++) {

    var event = events[i];

    var formatter = new DateFormatter(event.start_date + " " + event.start_time);

    html += "<li><p class=\"headline\"><a href=\"" + event.url +"\">" + event.name +"</a></p>";
    html += "<p class=\"pubdate\">" + formatter.event() + "</a></p></li>";

  }

  return html;

};



/**
 * Displays an error if non results were returned.
 * @return null
 */
WidgetCreator.prototype.displayError = function (element) {

  utils.removeClass(element.querySelector(".content"), "loading");
  element.querySelector(".content").innerHTML = "<p>Sorry, no results were found. Trying checking out <a href=\"http://hub.jhu.edu\">The Hub</a> for the latest Johns Hopkins news and events.</p>";

};

module.exports = WidgetCreator;
