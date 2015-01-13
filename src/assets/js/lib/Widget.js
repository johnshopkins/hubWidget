var $ = require("../shims/jquery");
var api = require("./api");
var DateFormatter = require("./date-formatter");

var Widget = function (element) {

  this.widget = $(element);

  this.api = new api({
    key: this.widget.attr("data-key"),
    v: this.widget.attr("data-version")
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

  var title = this.widget.attr("data-title");
  this.title = title ? title : "News from the Hub";

  var html = "<div class=\"header\">" + this.title + "</div>";
  html += "<div class=\"content\" class=\"loading\"></div>";
  html += "<div class=\"hubpower clearfix\"><div class=\"link\"><a href=\"http://hub.jhu.edu\">http://hub.jhu.edu</a></div><div class=\"image\"><a href=\"http://hub.jhu.edu\"><span>Powered by the Hub</span></a></div></div>";

  this.widget.html(html);

};

Widget.prototype.getQueryStringParams = function () {

  // defaults
  var params = { per_page: 5 };

  var count = parseInt(this.widget.attr("data-count"));
  if ($.isNumeric(count)) params.per_page = count;

  var channels = this.widget.attr("data-channels");
  if (channels) params.channels = channels;

  var tags = this.widget.attr("data-tags");
  if (tags) params.tags = tags;

  var topics = this.widget.attr("data-topics");
  if (topics) params.topics = topics;

  if (this.type === "events") {
    var featured = this.widget.attr("data-featured");
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

  var type = this.widget.attr("data-type");
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

  if (content) {
    this.contentDiv.innerHTML = "<ul>" + content + "</ul>";
  } else {
    return this.displayError();
  }

};

Widget.prototype.getFormattedArticles = function (data) {

  var articles = data._embedded.articles;
  if (!articles) return;

  var html = "";

  $.each(articles, function (i, article) {

    var formatter = new DateFormatter(article.publish_date);

    html += "<li><p class=\"headline\"><a href=\"" + article.url +"\">" + article.headline +"</a></p>";
    html += "<p class=\"pubdate\">" + formatter.article() + "</a></p></li>";

  });

  return html;

};

Widget.prototype.getFormattedEvents = function (data) {

  var events = data._embedded.events;
  if (!events) return;

  var html = "";

  $.each(events, function (i, event) {
    var formatter = new DateFormatter(event.start_date + " " + event.start_time);

    html += "<li><p class=\"headline\"><a href=\"" + event.url +"\">" + event.name +"</a></p>";
    html += "<p class=\"pubdate\">" + formatter.event() + "</a></p></li>";
  });

  return html;

};



/**
 * Displays an error if non results were returned.
 * @return null
 */
Widget.prototype.displayError = function () {

  this.contentDiv.html("<p>Sorry, no results were found. Trying checking out <a href=\"http://hub.jhu.edu\">The Hub</a> for the latest Johns Hopkins news and events.</p>");

};

module.exports = Widget;
