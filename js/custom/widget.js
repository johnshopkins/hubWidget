// From http://css-tricks.com/snippets/jquery/load-jquery-only-if-not-present/
if (!jqExists("1.8.*")) {

	if (typeof $ == "function") {
		// warning, global var
		thisPageUsingOtherJSLibrary = true;
	}
	
	function getScript(url, success) {
	
		var script = document.createElement("script");
		script.src = url;
		
		var head = document.getElementsByTagName("head")[0];
		var done = false;
		
		// Attach handlers for all browsers
		script.onload = script.onreadystatechange = function() {
		
			if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
			
				done = true;
				
				// callback function provided as param
				success();
				
				script.onload = script.onreadystatechange = null;
				head.removeChild(script);
				
			}
		
		};
		
		head.appendChild(script);
	
	};
	
	getScript("//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js", function() {
		
		getScript("http://hub.jhu.edu/assets/shared/js/jquery.hubwidget.1.0.min.js", function () {
			jQuery.noConflict();
			jQuery(document).ready(function ($) {
				$("#hubWidget").hubWidget();
			});
		});

	});
	
} else {

	jQuery(document).ready(function ($) {
		$("#hubWidget").hubWidget();
	});

};