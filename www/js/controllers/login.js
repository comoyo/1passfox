define(['app'], function(app) {
  app.controller('LoginCtrl', ['$scope', '$rootScope', '$location',
    function LoginCtrl($scope, $rootScope, $location) {
      $scope.pwd = '';

      function handleError(error) {
        setReady(false);
        $scope.errorMsg = error;
      }

      function setReady(readyOrNot) {
        if ($rootScope.readyToLogin === readyOrNot) return;
        $rootScope.readyToLogin = readyOrNot;
      }

      $scope.DropboxClient.authenticate(function(error, client) {
        if (error) {
          return handleError(error);
        }

        setReady(true);
      });

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
          }, 500);
        }
      };
    }
  ]);
});

