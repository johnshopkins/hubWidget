var api = require("./api");
var utils = require("./utils");
var DateFormatter = require("./date-formatter");

var Widget = function (element) {

  this.widget = element;

  this.api = new api({
    key: element.getAttribute("data-key"),
    v: element.getAttribute("data-version")
  });

};

Widget.prototype.create = function () {

  this.createBaseHtml();

  var self = this;
  this.getData(function (error, data) {

    if (error) return self.displayError();
    self.populateWidget(data);

  });

};

Widget.prototype.createBaseHtml = function () {

  var title = this.widget.getAttribute("data-title");
  this.title = title ? title : "News from the Hub";

  var html = "<div class=\"header\">" + this.title + "</div>";
  html += "<div class=\"content\" class=\"loading\"></div>";
  html += "<div class=\"hubpower clearfix\"><div class=\"link\"><a href=\"http://hub.jhu.edu\">http://hub.jhu.edu</a></div><div class=\"image\"><a href=\"http://hub.jhu.edu\"><span>Powered by the Hub</span></a></div></div>";

  this.widget.innerHTML = html;

};

Widget.prototype.getQueryStringParams = function () {

  // defaults
  var params = { per_page: 5 };

  var count = parseInt(this.widget.getAttribute("data-count"));
  if (utils.isNumeric(count)) params.per_page = count;

  var channels = this.widget.getAttribute("data-channels");
  if (channels) params.channels = channels;

  var tags = this.widget.getAttribute("data-tags");
  if (tags) params.tags = tags;

  var topics = this.widget.getAttribute("data-topics");
  if (topics) params.topics = topics;

  if (this.type === "events") {
    var featured = this.widget.getAttribute("data-featured");
    if (featured) params.featured = true;
  }

  return params;

};

/**
 * Get obects to populate the widget
 * @param  {Lamdba(data, jqXHR)} Callback that fires upon successful retrieval of data.
 * @return {object} hubWidget
 */
Widget.prototype.getData = function (callback) {

  var type = this.widget.getAttribute("data-type");
  this.type = type ? type : "articles";

  // something other than articles or events was requested
  if (!this.api[this.type]) return this.displayError(this.widget);

  var params = this.getQueryStringParams();

  this.api[this.type](params).then(function (payload) {

    if (payload.error) {
      return callback(payload.error);
    } else {
      return callback(null, payload);
    }

  });

};

Widget.prototype.populateWidget = function (data) {

  var content = "";

  if (this.type == "articles") {
    content = this.getFormattedArticles(data);
  } else if (this.type == "events") {
    content = this.getFormattedEvents(data);
  }

  this.contentDiv = this.widget.querySelector(".content");
  utils.removeClass(this.contentDiv, "loading");

  if (!content) return this.displayError();

  this.contentDiv.innerHTML = "<ul>" + content + "</ul>";

};

Widget.prototype.getFormattedArticles = function (data) {

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

Widget.prototype.getFormattedEvents = function (data) {

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
Widget.prototype.displayError = function () {

  this.contentDiv.innerHTML = "<p>Sorry, no results were found. Trying checking out <a href=\"http://hub.jhu.edu\">The Hub</a> for the latest Johns Hopkins news and events.</p>";

};

module.exports = Widget;
