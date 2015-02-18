"use strict";
(function(){
    $.get("http://wedding.shinychang.net/reward", function(o){
        var $container = $(".main");
        for (var i = o.length - 1; i >= 0; i--) {
            var template = "<div class='media'>"
                                + "<div class='media-left'>"
                                    + "<div class='profile' style='background-image: url(https://graph.facebook.com/"+ o[i].id + "/picture?type=large)'></div>"
                                + "</div>"
                                + "<div class='media-body'>"
                                    + "<h4 class='media-heading'>" + o[i].name + "</h4>"
                                    + o[i].message
                                + "</div>"
                            + "</div>";
            $container.append(template);
        };
    }, 'json');
})();
