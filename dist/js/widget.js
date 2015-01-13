!function t(e,r,i){function a(s,o){if(!r[s]){if(!e[s]){var u="function"==typeof require&&require;if(!o&&u)return u(s,!0);if(n)return n(s,!0);throw new Error("Cannot find module '"+s+"'")}var h=r[s]={exports:{}};e[s][0].call(h.exports,function(t){var r=e[s][1][t];return a(r?r:t)},h,h.exports,t,e,r,i)}return r[s].exports}for(var n="function"==typeof require&&require,s=0;s<i.length;s++)a(i[s]);return a}({1:[function(t){var e=t("./shims/jquery"),r=t("./lib/WidgetCreator");e(function(){new r(e(".hub-widget"))})},{"./lib/WidgetCreator":3,"./shims/jquery":6}],2:[function(t,e){var r=t("../shims/jquery"),i=t("./api"),a=t("./date-formatter"),n=function(t){this.widget=r(t),this.api=new i({key:this.widget.attr("data-key"),v:this.widget.attr("data-version")})};n.prototype.create=function(){this.createBaseHtml();var t=this;this.getData(function(e,r){return e?t.displayError():void t.populateWidget(r)})},n.prototype.createBaseHtml=function(){var t=this.widget.attr("data-title");this.title=t?t:"News from the Hub";var e='<div class="header">'+this.title+"</div>";e+='<div class="content loading"></div>',e+='<div class="hubpower clearfix"><div class="link"><a href="http://hub.jhu.edu">http://hub.jhu.edu</a></div><div class="image"><a href="http://hub.jhu.edu"><span>Powered by the Hub</span></a></div></div>',this.widget.html(e)},n.prototype.getQueryStringParams=function(){var t={per_page:5},e=parseInt(this.widget.attr("data-count"));r.isNumeric(e)&&(t.per_page=e);var i=this.widget.attr("data-channels");i&&(t.channels=i);var a=this.widget.attr("data-tags");a&&(t.tags=a);var n=this.widget.attr("data-topics");if(n&&(t.topics=n),"events"===this.type){var s=this.widget.attr("data-featured");s&&(t.featured=!0)}return t},n.prototype.getData=function(t){var e=this.widget.attr("data-type");if(this.type=e?e:"articles",!this.api[this.type])return this.displayError(this.widget);var r=this.getQueryStringParams();this.api[this.type](r).then(function(e){return e.error?t(e.error):t(null,e)})},n.prototype.populateWidget=function(t){var e="";return"articles"==this.type?e=this.getFormattedArticles(t):"events"==this.type&&(e=this.getFormattedEvents(t)),this.contentDiv=r(".content"),this.contentDiv.removeClass("loading"),e?void this.contentDiv.html("<ul>"+e+"</ul>"):this.displayError()},n.prototype.getFormattedArticles=function(t){var e=t._embedded.articles;if(e){var i="";return r.each(e,function(t,e){var r=new a(e.publish_date);i+='<li><p class="headline"><a href="'+e.url+'">'+e.headline+"</a></p>",i+='<p class="pubdate">'+r.article()+"</a></p></li>"}),i}},n.prototype.getFormattedEvents=function(t){var e=t._embedded.events;if(e){var i="";return r.each(e,function(t,e){var r=new a(e.start_date+" "+e.start_time);i+='<li><p class="headline"><a href="'+e.url+'">'+e.name+"</a></p>",i+='<p class="pubdate">'+r.event()+"</a></p></li>"}),i}},n.prototype.displayError=function(){this.contentDiv.html('<p>Sorry, no results were found. Trying checking out <a href="http://hub.jhu.edu">The Hub</a> for the latest Johns Hopkins news and events.</p>')},e.exports=n},{"../shims/jquery":6,"./api":4,"./date-formatter":5}],3:[function(t,e){var r=t("../shims/jquery"),i=t("./Widget");e.exports=function(t){r.each(t,function(t,e){var r=new i(e);r.create()})}},{"../shims/jquery":6,"./Widget":2}],4:[function(t,e){var r=t("../shims/jquery"),i=function(t){this.key=t.key,this.v=t.v};i.prototype.get=function(t,e){return e.v=this.v,e.key=this.key,r.ajax({url:"http://api.hub.jhu.edu/"+t,dataType:"jsonp",data:e})},i.prototype.articles=function(t){return this.get("articles",t)},i.prototype.events=function(t,e){return e===!0&&(t.featured=!0),this.get("events",t)},e.exports=i},{"../shims/jquery":6}],5:[function(t,e){function r(t){var e={1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",7:"July",8:"August",9:"September",10:"October",11:"November",12:"December"},r=t.getMonth()+1;return e[r]}function i(t){var e=t.getHours();return e>12?e-12:0===e?12:e}function a(t){var e=t.getMinutes();return 10>e?"0"+e.toString():e.toString()}function n(t){var e=t.getHours();return 12>e?"am":"pm"}function s(t){var e=t.split(" "),t=e[0].split("-"),r=e[1].split(":"),i=parseInt(t[1])-1;return new Date(t[0],i,t[2],r[0],r[1])}var o=function(t){if("number"==typeof t){var e=1e3*t;this.dateObject=new Date(e)}else this.dateObject=s(t);this.date={timstamp:e,dayOfMonth:this.dateObject.getDate(),monthName:r(this.dateObject),year:this.dateObject.getFullYear(),hour:i(this.dateObject),minutes:a(this.dateObject),ampm:n(this.dateObject)}};o.prototype.article=function(){return this.date.monthName+" "+this.date.dayOfMonth+", "+this.date.year},o.prototype.event=function(){return this.date.monthName+" "+this.date.dayOfMonth+" at "+this.date.hour+":"+this.date.minutes+this.date.ampm},e.exports=o},{}],6:[function(t,e){(function(t){e.exports=t.jQuery}).call(this,"undefined"!=typeof self?self:"undefined"!=typeof window?window:{})},{}]},{},[1]);