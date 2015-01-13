/**
 * A simplified version of HubJS
 * https://github.com/johnshopkins/hubJS
 */

var ajax = require("./ajax");

var api = function (settings) {

  this.key = settings.key;
  this.v = settings.v;

};

/**
 * Gets a payload from the Hub API
 *
 * @param  {string}   endpoint    API endpoint
 * @param  {object}   data      Data to be sent to the server
 * @return {Object}     promise
 */
api.prototype.get = function (endpoint, data) {

  data.v = this.v;
  data.key = this.key;

  return ajax.get({
    url: "http://api.hub.jhu.edu/" + endpoint,
    dataType: "jsonp",
    data: data
  });
}

/**
 * Find an article or articles
 *
 * @param  {object}   data      Data to be sent to the server
 * @return {Object}     promise
 */
api.prototype.articles = function(data) {
  return this.get("articles", data);
};

/**
 * Find an event or events
 *
 * @param  {object}   data      Data to be sent to the server
 * @return {Object}     promise
 */
api.prototype.events = function(data) {
  return this.get("events", data);
}

module.exports = api;
