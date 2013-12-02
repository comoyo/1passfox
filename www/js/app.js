/*global angular */
define(['angular', 'js/lib/keychain', 'js/lib/event_emitter'], function(_, keyChain, EventEmitter) {
  Bus = new EventEmitter();
  var app = angular
    .module('app', ['mobile-navigate'])
    .config(['$routeProvider', function($routeProvider) {
      $routeProvider
        .when('/', {
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
        /*
        .when('/edit/:id', {
          templateUrl: 'views/edit.html',
          controller: 'EditCtrl'
        })
        */
        .otherwise({
          redirectTo: '/'
        });
    }]);

  app.controller('MainCtrl', ['$rootScope', '$scope', '$navigate', '$location', '$http',
    function($rootScope, $scope, $navigate, $location, $http) {
      var kc = $rootScope.keyChain = new keyChain();

      $http.get('/data/default/encryptionKeys.js')
        .success(function(keys) {
          $scope.keyChain.setEncryptionKeys(keys);
        })
        .error(function(error) {
          console.error(error);
        });

      Bus.on('logout', function() {
        $scope.items = [];
        kc.lock();
        $rootScope.loggedUser = false;

        $location.path("/login");
      });

      $rootScope.$on('$locationChangeStart', function(scope, next, current) {
        if (!$rootScope.loggedUser) {
          // no logged user, we should be going to #login
          if (next.templateUrl == "views/login.html") {
            // already going to #login, no redirect needed
          } else {
            // not going to #login, we should redirect now
            $location.path("/login");
          }
        }
        kc.logoutInterval =
          window.setTimeout(kc._autoLogout, kc.AUTOLOCK_LENGTH);
      });

      $scope.$navigate = $navigate;
      var search = $location.search();
      $navigate.go($location.path(), 'none').search(search);
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
        elm.bind('touchstart', function() {
          tapping = true;
        });
        // prevent firing when someone is f.e. dragging
        elm.bind('touchmove', function() {
          tapping = false;
        });
        elm.bind('touchend', function() {
          tapping && scope.$apply(attrs.ngTap);
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
