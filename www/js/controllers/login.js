define(['app'], function(app) {
  app.controller('LoginCtrl', ['$scope', '$rootScope', '$location',
    function LoginCtrl($scope, $rootScope, $location) {
      $scope.pwd = '';
      $scope.verifyPassword = function() {
        if ($scope.keyChain.verifyPassword($scope.pwd) === true) {
          $rootScope.loggedUser = true;
          $location.path("/");
        } else {
          document.getElementById('masterLogin').focus();

          $scope.invalid = true;
          setTimeout(function() {
            $scope.$apply(function() {
              $scope.invalid = false;
            });
//            console.log("ACTIVE", document.activeElement)
          }, 500);
        }
      };
    }
  ]);
});

