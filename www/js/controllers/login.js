define(['app'], function(app) {
  app.controller('LoginCtrl', ['$scope', '$rootScope', '$location',
    function LoginCtrl($scope, $rootScope, $location) {
      $scope.pwd = '';
      $scope.readyToLogin = false;

      function handleError(error) {
        setReady(false);
        $scope.errorMsg = error;
      }

      var authenticated = true;
      function setReady(readyOrNot) {
        if ($scope.readyToLogin === readyOrNot) return;
        $scope.readyToLogin = readyOrNot;
        $scope.$$phase || $scope.$apply();
      }

      console.log("ASD")

      $scope.DropboxClient.authenticate({interactive: false}, function(error, client) {
        if (error) {
          return handleError(error);
        }

        if (client.isAuthenticated()) {
          // Cached credentials are available, make Dropbox API calls.
          alert("AUTHENTICATED ALREADY")
          setReady(true);
        } else {
          // show and set up the "Sign into Dropbox" button
          alert("TRYING TO AUTHENTICATE")
          client.authenticate(function(error, client) {
            alert("AUTHENTICATED!")
            if (error) {
              return handleError(error);
            }
            setReady(true);
          });
        }
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

