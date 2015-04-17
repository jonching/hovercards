'use strict';

require(['account-directive',
         'content-directive',
         'discussions-directive',
         'entry-directive',
         'error-directive',
         'more-content-directive',
         'people-directive',
         'readmore-directive',
         'youtube-channel-subscribe-directive',
         'copy-filter',
         'htmlify-filter',
         'numsmall-filter',
         'trust-resource-url-filter',
         'slide-animation'], function() {
    angular.bootstrap(document, ['app']);

    require(['domReady!'], function() {
        chrome.runtime.sendMessage({ msg: 'ready' });
    });
});

require(['everywhere-main']);
