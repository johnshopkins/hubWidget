/*!
 * Adds the WidgetCreator object to the
 * global scope, allowing users to create
 * the widgets on their own. For example:
 *
 * var elements = document.querySelectorAll(".widget");
 * new WidgetCreator(elements);
 *
 */

/* global require: false */

window.WidgetCreator = require("./lib/WidgetCreator");
