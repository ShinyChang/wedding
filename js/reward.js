"use strict";
(function() {
    $.get("http://wedding.shinychang.net/reward", function(o) {
        var $container = $(".list");
        for (var i = o.length - 1; i >= 0; i--) {
            var template = "<div class='user'>" + "<div class='profile' style='background-image: url(https://graph.facebook.com/" + o[i].id + "/picture?type=large)'></div>" + "<div class='name'>" + o[i].name + "</div>" + "</div>";
            $container.append(template);
        };
        if (!o.length) {
            var template = "<div class='user'><div class='name message'>大家都中獎了 :)</div></div>";
            $container.append(template);
        }
    }, 'json');

    var SPIN_CNT_PER_ROUND = 5;
    var SPIN_TIME = [100, 100, 100, 100, 100];
    var spin_count = 0;
    var rewardList = [];

    function spin() {
        var $list = $(".list"),
            round = ++spin_count % SPIN_CNT_PER_ROUND,
            max_height = $list.prop('scrollHeight');

        if ($list.find(".message").length) {
            swal("恭喜", "大家都中獎拉！", "info");
            return;
        }

        $list.animate({
            scrollTop: 0
        }, spin_count[round], function() {
            $list.prop('scrollTop', max_height);
            if (++spin_count % SPIN_CNT_PER_ROUND) {
                $list = null;
                spin();
            } else {
                var index = Math.floor(Math.random() * $list.children().length);
                var $target = $list.children().eq(index);
                var position = $list.prop('scrollHeight') - $target.position().top * -1 - $target.outerHeight(true);

                // callback hell, (LOL)
                $list.finish().animate({
                    scrollTop: position + 50
                }, 500, function() {
                    $list.animate({
                        scrollTop: position - 25
                    }, 1000, function() {
                        $list.animate({
                            scrollTop: position + 15
                        }, function() {
                            swal({
                                title: $target.find(".name").text(),
                                text: "恭喜中獎，請上台領獎",
                                imageUrl: $target.find(".profile").css('background-image').substring(4, $target.find(".profile").css('background-image').length - 1),
                            }, function() {
                                $(".modal-body").append($target);
                                $(".cnt").text(~~$(".cnt").text() + 1);
                                if (!$list.children().length) {
                                    var template = "<div class='user'><div class='name message'>大家都中獎了 :)</div></div>";
                                    $list.append(template);
                                }
                                $target = null;
                                $list = null;
                            });
                        });
                    });
                });
            }
        });
    }

    $(".spin").bind('click', spin);
})();
