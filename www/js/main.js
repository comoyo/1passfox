/*global angular */
require.config({
  shim: {
    'io': { exports: 'io' },
    'angular': { exports: 'angular' },
    'EventEmitter': { exports: 'EventEmitter' },
    'Utils': { exports: 'Utils' },

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
    Keychain: 'js/lib/keychain',
    io: 'js/lib/io',
    dbox: 'js/lib/dbox'
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

//    'js/services/http-cache.js',
//    'js/services/install.js',

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
