// for mobile
(function(){
    var lockOrientation = screen.mslockOrientation
                        || screen.mozlockOrientation
                        || screen.webkitlockOrientation
                        || screen.lockOrientation;

    if (lockOrientation) {
        lockOrientation('portrait');
    }
})();


// facebook API
window.fbAsyncInit = function() {
    FB.getLoginStatus(function(response) {
        onFacebookLoginStatusChange(response);
    });
};

window.checkFacebookLoginState = function() {
    FB.getLoginStatus(function(response) {
        onFacebookLoginStatusChange(response);
    });
};

window.onFacebookLoginStatusChange = function(response) {
    if (response.status === 'connected') {
        FB.api('/me', function(response) {
            $(".js-fb-not-login").hide();
            $(".js-fb-logined")
                .fadeIn()
                .find(".user-photo")
                .css("background-image", "url(https://graph.facebook.com/" + response.id + "/picture?type=large)");
        });
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
(function(){
    $('.js-fullpage').fullpage({
        anchors: ['main', 'slideshow', 'comment'],
        navigation: true,
        resize: false,
        verticalCentered:false,
        normalScrollElements: ".pswp, .photo-box",
        navigationTooltips: ['首頁', '婚紗照', '留言板'],
        scrollingSpeed: 700,
        afterLoad: function(anchorLink, index) {
            if (anchorLink === 'comment') {
                $("input:text:visible").focus();
            }
        }
    });
})();

// photoSwipe
(function(){
        var initPhotoSwipeFromDOM = function(gallerySelector) {

        // parse slide data (url, title, size ...) from DOM elements
        // (children of gallerySelector)
        var parseThumbnailElements = function(el) {
            var thumbElements = el.childNodes,
                numNodes = thumbElements.length,
                items = [],
                figureEl,
                linkEl,
                size,
                item;

            for(var i = 0; i < numNodes; i++) {

                figureEl = thumbElements[i]; // <figure> element

                // include only element nodes
                if(figureEl.nodeType !== 1) {
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



                if(figureEl.children.length > 1) {
                    // <figcaption> content
                    item.title = figureEl.children[1].innerHTML;
                }

                if(linkEl.children.length > 0) {
                    // <img> thumbnail element, retrieving thumbnail url
                    item.msrc = linkEl.children[0].getAttribute('src');
                }

                item.el = figureEl; // save link to element for getThumbBoundsFn
                items.push(item);
            }

            return items;
        };

        // find nearest parent element
        var closest = function closest(el, fn) {
            return el && ( fn(el) ? el : closest(el.parentNode, fn) );
        };

        // triggers when user clicks on thumbnail
        var onThumbnailsClick = function(e) {
            e = e || window.event;
            e.preventDefault ? e.preventDefault() : e.returnValue = false;

            var eTarget = e.target || e.srcElement;

            // find root element of slide
            var clickedListItem = closest(eTarget, function(el) {
                return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
            });

            if(!clickedListItem) {
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
                if(childNodes[i].nodeType !== 1) {
                    continue;
                }

                if(childNodes[i] === clickedListItem) {
                    index = nodeIndex;
                    break;
                }
                nodeIndex++;
            }



            if(index >= 0) {
                // open PhotoSwipe if valid index found
                openPhotoSwipe( index, clickedGallery );
            }
            return false;
        };

        // parse picture index and gallery index from URL (#&pid=1&gid=2)
        var photoswipeParseHash = function() {
            var hash = window.location.hash.substring(1),
            params = {};

            if (hash.length < 5) {
                return params;
            }

            var vars = hash.split('&');
            for (var i = 0; i < vars.length; i++) {
                if(!vars[i]) {
                    continue;
                }
                var pair = vars[i].split('=');
                if(pair.length < 2) {
                    continue;
                }
                params[pair[0]] = pair[1];
            }

            if(params.gid) {
                params.gid = parseInt(params.gid, 10);
            }

            if(!params.hasOwnProperty('pid')) {
                return params;
            }
            params.pid = parseInt(params.pid, 10);
            return params;
        };

        var openPhotoSwipe = function(index, galleryElement, disableAnimation) {
            var pswpElement = document.querySelectorAll('.pswp')[0],
                gallery,
                options,
                items;

            items = parseThumbnailElements(galleryElement);

            // define options (if needed)
            options = {
                index: index,

                // define gallery index (for URL)
                galleryUID: galleryElement.getAttribute('data-pswp-uid') || 1, // compatibility with mCustomScrollbar


                shareButtons: [
                    {id:'facebook', label:'分享到 Facebook', url:'https://www.facebook.com/sharer/sharer.php?u='},
                    {id:'download', label:'下載原始圖片', url:'', download:true}
                ],
                getThumbBoundsFn: function(index) {
                    // See Options -> getThumbBoundsFn section of documentation for more info
                    var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
                        pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
                        rect = thumbnail.getBoundingClientRect();

                    return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
                }

            };

            if(disableAnimation) {
                options.showAnimationDuration = 0;
            }

            // Pass data to PhotoSwipe and initialize it
            gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
            gallery.init();
        };

        // loop through all gallery elements and bind events
        var galleryElements = document.querySelectorAll( gallerySelector );

        for(var i = 0, l = galleryElements.length; i < l; i++) {
            galleryElements[i].setAttribute('data-pswp-uid', i+1);
            galleryElements[i].onclick = onThumbnailsClick;
        }

        // Parse URL and open gallery if it contains #&pid=3&gid=1
        var hashData = photoswipeParseHash();
        if(hashData.pid > 0 && hashData.gid > 0) {
            openPhotoSwipe( hashData.pid - 1 ,  galleryElements[ hashData.gid - 1 ], true );
        }
    };

    // execute above function
    initPhotoSwipeFromDOM('.photo-box');
})();
