define(['angular', 'Keychain', 'EventEmitter'], function(_, keyChain, EventEmitter) {
  Bus = new EventEmitter();

  var app = angular
    .module('app', ['mobile-navigate'])
    .config(function($locationProvider, $routeProvider) {
//      $locationProvider.html5Mode(true);
      $routeProvider
        .when('/list', {
          templateUrl: 'views/list.html',
          controller: 'ListCtrl'
        })
        .when('/login', {
          templateUrl: 'views/login.html',
          controller: 'LoginCtrl'
        })
        .when('/:type', {
          templateUrl: 'views/category.html',
          controller: 'CategoryCtrl'
        })
        .when('/:type/:uuid', {
          templateUrl: 'views/detail.html',
          controller: 'DetailCtrl'
        })
        .otherwise({
          redirectTo: '/'
        });
    });

  app.controller('MainCtrl', ['$rootScope', '$scope', '$navigate', '$location', '$http',
    function($rootScope, $scope, $navigate, $location) {
      var kc = $rootScope.keyChain = new Keychain();
      /**
       * Reset the logout timeout, to be used when users are interacting with
       * the app so that we don't log them out.
       */
      $rootScope.resetLogoutInterval = function() {
        // Clear logout timeout on switching page
        clearInterval(kc.logoutInterval);
        kc.logoutInterval =
          window.setTimeout(kc._autoLogout, kc.AUTOLOCK_LENGTH);
      };

      /*
       $http.get('/data/default/encryptionKeys.js')
       .success(function(keys) {
       $scope.keyChain.setEncryptionKeys(keys);
       })
       .error(function(error) {
       console.error(error);
       });
       */
      Bus.on('logout', function() {
        kc.lock();
        $rootScope.loggedUser = false;
        $location.path("/login");
      });

      $rootScope.$on('$locationChangeStart', function(scope, next, current) {
        if (!$rootScope.loggedUser) {
          // no logged user, we should be going to #login
          if (/login$/.test(next) === false) {
            // not going to #login, we should redirect now
            $location.path("/login");
          }
        }

        $rootScope.resetLogoutInterval();
      });

      $scope.$navigate = $navigate;
      $navigate.go($location.path(), 'none').search($location.search());
    }]);

  app.config(['$httpProvider', function($httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  }]);

  // TouchStart is faster than click, that's why we add this here as a
  // directive. Use `ng-tap` in code rather than `ng-click`.
  app.directive('ngTap', function() {
    var isTouch = !!('ontouchstart' in window);
    return function(scope, elm, attrs) {
      // if there is no touch available, we'll fall back to click
      if (isTouch) {
        var tapping = false;
        elm.bind('touchstart', function(event) {
          tapping = true;
        });
        // prevent firing when someone is f.e. dragging
        elm.bind('touchmove', function() {
          tapping = false;
        });
        elm.bind('touchend', function(event) {
          tapping && scope.$apply(attrs['ngTap'], elm);
        });
      }
      else {
        elm.bind('click', function() {
          scope.$apply(attrs.ngTap);
        });
      }
    };
  });

  return app;
});
