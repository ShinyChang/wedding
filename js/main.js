"use strict";

// for mobile
(function() {
    var lockOrientation = screen.mslockOrientation || screen.mozlockOrientation || screen.webkitlockOrientation || screen.lockOrientation;

    if (lockOrientation) {
        lockOrientation('portrait');
    }
})();


// facebook API
window.fbAsyncInit = function() {
    FB.getLoginStatus(function(response) {
        onFacebookLoginStatusChange(response);
    });

    // checkFacebookLoginState not always correct
    // should listen auth.statusChange get correct status
    FB.Event.subscribe('auth.statusChange', onFacebookLoginStatusChange);

};

window.checkFacebookLoginState = function() {
    FB.getLoginStatus(function(response) {
        onFacebookLoginStatusChange(response);
    });
};


window.onFacebookLoginStatusChange = function(response) {
    if (response.status === 'connected') {
        FB.api('/me', function(response) {
            // fill form
            $(".js-form")
                .find(".js-form-id").val(response.id).end()
                .find(".js-form-name").val(response.name);

            $(".js-fb-not-login").hide();
            $(".js-fb-logined")
                .fadeIn()
                .find(".user-photo")
                .css("background-image", "url(https://graph.facebook.com/" + response.id + "/picture?type=large)");
        });
    } else if (response.status !== 'unknown' && response.status === 'not_authorized') {

    }
};

// Google Analytics
window.GoogleAnalyticsObject = 'ga';
window.ga = window.ga || function() {
    (window.ga.q = window['ga'].q || []).push(arguments)
};
ga('create', 'UA-27224084-4', 'auto');
ga('send', 'pageview');

// fullpage.js
(function() {
    var gallery;

    $('.js-fullpage').fullpage({
        anchors: ['main', 'slideshow', 'comment'],
        menu: '.js-menu',
        navigation: true,
        // resize: false,
        verticalCentered: false,
        scrollOverflow: false,
        normalScrollElements: ".pswp, .photo-box, .comment-list",
        navigationTooltips: ['首頁', '婚紗照', '留言板'],
        scrollingSpeed: 500,
        paddingTop: '35px',
        afterLoad: function(anchorLink, index) {
            if (anchorLink === 'main') {
                $(".js-menu").hide();
            } else {
                $(".js-menu").show();
            }
            if (anchorLink === 'comment') {
                FB.getLoginStatus(function(response) {
                    if (response.status !== 'connected') {
                        swal({
                            title: "",
                            text: "♥登入留言者，宴客時可參加抽獎♥",
                            showCancelButton: true,
                            confirmButtonText: "登入 Facebook 並留言",
                            cancelButtonText: "我知道了",
                        }, function(isConfirm) {
                            if (isConfirm) {
                                FB.login();
                            }
                        });
                    }
                });
            }
        },
        afterResize: function() {
            $.fn.fullpage.reBuild();
        }
    });

    // parse picture index and gallery index from URL (#&pid=1&gid=2)
    function photoswipeParseHash() {
        var hash = window.location.hash.substring(1),
            params = {};

        if (hash.length < 5) {
            return params;
        }

        var vars = hash.split('&');
        for (var i = 0; i < vars.length; i++) {
            if (!vars[i]) {
                continue;
            }
            var pair = vars[i].split('=');
            if (pair.length < 2) {
                continue;
            }
            params[pair[0]] = pair[1];
        }

        if (params.gid) {
            params.gid = parseInt(params.gid, 10);
        }

        if (!params.hasOwnProperty('pid')) {
            return params;
        }
        params.pid = parseInt(params.pid, 10);
        return params;
    };

    // parse slide data (url, title, size ...) from DOM elements
    // (children of gallerySelector)
    function parseThumbnailElements(el) {
        var thumbElements = el.childNodes,
            numNodes = thumbElements.length,
            items = [],
            figureEl,
            linkEl,
            size,
            item;

        for (var i = 0; i < numNodes; i++) {

            figureEl = thumbElements[i]; // <figure> element

            // include only element nodes
            if (figureEl.nodeType !== 1) {
                continue;
            }

            linkEl = figureEl.children[0]; // <a> element

            size = linkEl.getAttribute('data-size').split('x');

            // create slide object
            item = {
                src: linkEl.getAttribute('href'),
                w: parseInt(size[0], 10),
                h: parseInt(size[1], 10)
            };



            if (figureEl.children.length > 1) {
                // <figcaption> content
                item.title = figureEl.children[1].innerHTML;
            }

            if (linkEl.children.length > 0) {
                // <img> thumbnail element, retrieving thumbnail url
                item.msrc = linkEl.children[0].getAttribute('src');
            }

            item.el = figureEl; // save link to element for getThumbBoundsFn
            items.push(item);
        }

        return items;
    };
    // triggers when user clicks on thumbnail
    function onThumbnailsClick(e) {
        e = e || window.event;
        e.preventDefault ? e.preventDefault() : e.returnValue = false;

        var eTarget = e.target || e.srcElement;

        // find root element of slide
        var clickedListItem = closest(eTarget, function(el) {
            return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
        });

        if (!clickedListItem) {
            return;
        }

        // find index of clicked item by looping through all child nodes
        // alternatively, you may define index via data- attribute
        var clickedGallery = clickedListItem.parentNode,
            childNodes = clickedListItem.parentNode.childNodes,
            numChildNodes = childNodes.length,
            nodeIndex = 0,
            index;

        for (var i = 0; i < numChildNodes; i++) {
            if (childNodes[i].nodeType !== 1) {
                continue;
            }

            if (childNodes[i] === clickedListItem) {
                index = nodeIndex;
                break;
            }
            nodeIndex++;
        }



        if (index >= 0) {
            // open PhotoSwipe if valid index found
            openPhotoSwipe(index, clickedGallery);
        }
        return false;
    };

    // find nearest parent element
    function closest(el, fn) {
        return el && (fn(el) ? el : closest(el.parentNode, fn));
    };

    function openPhotoSwipe(index, galleryElement, disableAnimation) {
        var pswpElement = document.querySelectorAll('.pswp')[0],
            options,
            items;

        items = parseThumbnailElements(galleryElement);

        // define options (if needed)
        options = {
            index: index,
            pinchToClose: false,
            closeOnScroll: false,
            closeOnVerticalDrag: false,
            escKey: false,

            // define gallery index (for URL)
            galleryUID: galleryElement.getAttribute('data-pswp-uid'),


            shareButtons: [{
                id: 'facebook',
                label: '分享到 Facebook',
                url: 'https://www.facebook.com/sharer/sharer.php?u={{url}}'
            }, {
                id: 'download',
                label: '下載原始圖片',
                url: '{{raw_image_url}}',
                download: true
            }]
        };

        if (disableAnimation) {
            options.showAnimationDuration = 0;
        }

        // Pass data to PhotoSwipe and initialize it
        gallery = new PhotoSwipe(pswpElement, PhotoSwipeUI_Default, items, options);
        gallery.init();

        // init thumbnail
        var $tbContainer = $(".pswp__thumbnail").empty();
        $.each(gallery.items, function(idx, item) {
            $tbContainer.append($("<img>", {
                "class": 'pswp__thumbnail--item',
                "src": item.msrc,
                "data-id": idx
            }));
        });
        $tbContainer.on('click', ".pswp__thumbnail--item", function(){
            gallery.goTo($(this).data('id'));
            return false;
        });
        gallery.listen('beforeChange', function() {
            var $tbTarget = $tbContainer.children().eq(gallery.getCurrentIndex()),
                offset = 0;
            $tbTarget.prevAll().each(function(idx, item){
                offset += $(item).outerWidth(true);
            });
            $tbContainer.prop('scrollLeft', offset + $tbTarget.width() / 2 - $(window).width() / 2);
        });

        gallery.listen('parseVerticalMargin', function(item) {
            item.vGap.bottom = 60;
        });
    };


    // loop through all gallery elements and bind events
    var galleryElements = document.querySelectorAll('.photo-box');

    for (var i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i + 1);
        galleryElements[i].onclick = onThumbnailsClick;
    }

    // Parse URL and open gallery if it contains #&pid=3&gid=1
    var hashData = photoswipeParseHash();
    if (hashData.pid > 0 && hashData.gid > 0) {
        openPhotoSwipe(hashData.pid - 1, galleryElements[hashData.gid - 1], true);
        gallery.shout('beforeChange');
    }
})();



// comment
(function() {
    var _timer = null,
        _comments = [],
        $commentList = $(".js-comment-list");

    $(".js-form").submit(function() {
        var $form = $(this),
            data = $form.serialize();
        $(".js-form-submit").prop('disabled', true);
        $.post("http://wedding.shinychang.net/comments.json", data, function() {
            $(".js-form-message").val("");
            $(".js-form-submit").prop('disabled', false);
            refrashCommenet();
        }, 'json')
        return false;
    });


    function refrashCommenet() {
        clearTimeout(_timer);
        var $scrollEle = $(".comment-list");
        $.get("http://wedding.shinychang.net/comments.json", function(comments) {

            // no change
            if (comments.length === _comments.length) {
                $scrollEle = null;
                return;
            }

            var newComments = $(comments).slice(_comments.length);
            var scrollTop = $scrollEle.prop('scrollHeight') - $scrollEle.outerHeight(true) - $scrollEle.prop('scrollTop');

            $.each(newComments, function(idx, item) { // {id, name, message, timestamp}

                _comments.push(item);
                $commentList.append("<div class='comment clearfix'>" + "<div class='profile' title='" + item.name + "' style='background-image: url(https://graph.facebook.com/" + item.id + "/picture?type=large)'></div>" + "<div class='message'>" + item.message + "</div>" + "</div>");
            });

            // keep scroll to bottom
            if (scrollTop === 0) {
                $scrollEle.prop('scrollTop', $scrollEle.prop('scrollHeight'));
            }


            $scrollEle = null;
        }, 'json');
        _timer = setTimeout(refrashCommenet, 3000);
    }

    refrashCommenet();
})();
