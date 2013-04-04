# Hub widget

Embeds articles from the Hub on your website.


## Dependencies

In order for the Hub widget to work, you will need to also include the following on your website:

1. jQuery >= 1.8.0

## Basic usage

Basic usage of the Hub widget will display the five most recent articles published on the Hub with a header of "News from the Hub" with a light color theme.

```html
<script src="http://hub.jhu.edu/assets/js/hubWidget.js"></script>
<div id="hubWidget"></div>
```

## Themes

Both light and dark CSS themes are available for you to style the Hub Widget. You may also write your own styles so that the widget matches the rest of your site.

```html
<!-- light theme -->
<link rel="stylesheet" href="http://hub.jhu.edu/assets/css/light.css" />

<!-- dark theme -->
<link rel="stylesheet" href="http://hub.jhu.edu/assets/css/dark.css" />
```


## Advanced usage

You can customize the widget by adding data attributes to the `#hubWidget` div. The folllowing example would change the header of the widget to read "Hub News."

```html
<div id="hubWidget" data-title="Hub News"></div>
```

### Data attributes

| Attributes 			| Value																	| Description 														|
|-----------------------|-----------------------------------------------------------------------|-------------------------------------------------------------------|
| data-count			| Integer, default: 5 													| Alters the number of articles to display 							|
| data-tags				| String: Comma-separated list of tag slugs or IDs, default: null		| Alters the article request to only get articles in these tags 	|
| data-title			| String, default: News from the Hub									| Alters the title of the widget 									|
| data-topics			| String: Comma-separated list of topic slugs or IDs, default: null		| Alters the article request to only get articles in these topics 	|

_Note_: The easiest way to find a tag or topic slug is to visit that term's page on the Hub. Topic pages can be found by clicking "See all &raquo;" on the topic's homepage section. To find a tag page, find an article that is tagged with the tag you are looking for. Then click on the tag's name under the byline, which will take you to the tag page. Once you have found the tag or topic page you are looking for, the slug is located in the URL. Examples:

| URL														| Slug 						|
| ----------------------------------------------------------|---------------------------|
| http://hub.jhu.edu/tags/film-and-media-studies			| film-and-media-studies	|
| http://hub.jhu.edu/health									| health					|


### Advanced usage examples

Retrieves 7 articles from two topics:

```html
<div id="hubWidget" data-count="7" data-topics="health, arts-sciences"></div>
```

Retrieves 2 articles from a tag:

```html
<div id="hubWidget" data-count="7" data-tags="film-and-media-studies"></div>
```