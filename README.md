# Hub widget

Embeds articles and/or events from the Hub on your website. Drop a couple lines of code onto your website and the widget will automatically populate in the area in which it was dropped.

## API version and key

The [Hub API](https://api.hub.jhu.edu), the system the widget runs on, requires all requests to specify an API version number and an authorization key. If you do not have an authorization key, please [request an API key](mailto:jwachter@jhu.edu?subject=API key request).

If you are already using the API, plug your API key into the `data-key` attribute and the latest version of the API into the `data-version` attribute in the examples below. See the [API Documentation](http://api.hub.jhu.edu/docs) for more information about API keys and versions.

## Basic usage

Drop the following code in the HTML of your website where you want the widget to display:

```html
<div class="hub-widget" data-version="[API_VERSION]" data-key="[API_KEY]"></div>
<script src="//hub.jhu.edu/assets/shared/js/hubwidget.4.1.0.min.js"></script>
```

This code will retrieve default content from the Hub API, which consists of the 5 most recently published articles.

## Advanced usage

You can customize the widget by adding data attributes (see below) to the `.hub-widget` div. The folllowing example changes the header of the widget to read "Hub News."

```html
<div class="hub-widget" data-version="[API_VERSION]" data-key="[API_KEY]" data-title="Hub News"></div>
```

### Data attributes

The following table outlines the available attributes on the widget.

| Attribute  			| Value																	| Description 														|
|-----------------|---------------------------------------|-----------------------------------------|
| data-count			| Integer, default: 5 | The number of items to display |
| data-featured   | Boolean, default: false | If TRUE, retrieve only featured content. Applies only to events at this time |
| data-tags       | String: Comma-separated list of tag slugs or IDs, default: null | Alters the request to only get items in these tags. [Need help finding tag slugs?](#finding-tag-topic-slugs) |
| data-title			| String, default: News from the Hub | The title of the widget |
| data-topics     | String: Comma-separated list of topic slugs or IDs, default: null | Alters the request to only get items in these topics. [Need help finding topic slugs?](#finding-tag-topic-slugs) |
| data-type       | String: articles or events | Type of content to retrieve |


### Advanced usage examples

Retrieve 7 articles from two topics:

```html
<div class="hub-widget" data-version="[API_VERSION]" data-key="[API_KEY]" data-count="7" data-topics="health, arts-sciences"></div>
```

Retrieve 2 articles from a tag:

```html
<div class="hub-widget" data-version="[API_VERSION]" data-key="[API_KEY]" data-count="2" data-tags="film-and-media-studies"></div>
```

Retrieve 10 events from a topic:

```html
<div class="hub-widget" data-version="[API_VERSION]" data-key="[API_KEY]" data-count="10" data-type="events" data-topics="arts-sciences"></div>
```

### <a name="finding-tag-topic-slugs"></a>Finding tag or topic slugs

The easiest way to find a tag or topic slug is to visit that term's page on the Hub. Topic pages can be found by clicking "See all &raquo;" on the topic's homepage section. To find a tag page, find an article that is tagged with the tag you are looking for. Then click on the tag's name under the byline, which will take you to the tag page. Once you have found the tag or topic page you are looking for, the slug is located in the URL. Examples:

| URL														| Slug 						|
| ----------------------------------------------------------|---------------------------|
| http://hub.jhu.edu/tags/film-and-media-studies/articles			| film-and-media-studies	|
| http://hub.jhu.edu/health									| health					|


## Themes

Both light and dark CSS themes are available for you to style the Hub Widget. You may also write your own styles so that the widget matches the rest of your site.

```html
<!-- for websites with light colored backgrounds -->
<link rel="stylesheet" href="//hub.jhu.edu/assets/shared/css/widget-light.4.1.0.css" />

<!-- for websites with dark colored backgrounds -->
<link rel="stylesheet" href="//hub.jhu.edu/assets/shared/css/widget-dark.4.1.0.css" />
```

## Browser compatibility

* Chrome 1+
* Firefox 3.5+
* Internet Explorer 8+*
* Safari 3.2+
* Opera 10+

\* Version 4.0 of the Hub Widget allows for multiple widgets on a single page, which has the added side effect of no longer supporting Internet Explorer 7. If you need IE7 support, please use [v3.0](https://github.com/johnshopkins/hubWidget/tree/3.0) of the widget.
