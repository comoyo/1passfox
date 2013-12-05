/*global angular */
require.config({
  shim: {
    'angular': {
      exports: 'angular'
    },
    'EventEmitter': {
      exports: 'EventEmitter'
    },
    'Utils': {
      exports: 'Utils'
    },
    'SHA1': {
      deps: ['Utils'],
      exports: 'SHA1'
    },
    'GibberishAES': {
      deps: ['Utils', 'SHA1'],
      exports: 'GibberishAES'
    },
    'Keychain': {
      deps: ['GibberishAES', 'EventEmitter'],
      exports: 'Keychain'
    }
  },
  paths: {
    app: 'js/app',
    angular: 'components/angular/angular',
    EventEmitter: 'js/lib/event_emitter',
    GibberishAES: 'js/lib/gibberish-aes',
    Utils: 'js/lib/utils',
    SHA1: 'js/lib/sha1',
    Keychain: 'js/lib/keychain'
  },
  baseUrl: ''
});

(function() {
  console.time('requirejs');
  require([
    // application
    'app',
    'js/mobile-nav.js',

    // dependencies
    'angular',
    'shared/js/async_storage.js',

    // 1p libs
//    'js/lib/date_format.js',
//    'js/lib/event_emitter.js',
//    'js/lib/gibberish-aes.js',
//    'js/lib/keychain.js',

    // services
//    'js/services/database.js',
    'js/services/dates.js',
    'js/services/http-cache.js',
    'js/services/install.js',

    // controllers
    'js/controllers/login.js',
    'js/controllers/list.js',
    'js/controllers/category.js',
    'js/controllers/detail.js'
  ], function() {
    console.timeEnd('requirejs');

    angular.bootstrap(document, ['app']);
  });

})();
