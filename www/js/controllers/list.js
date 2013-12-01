define(['app'], function(app) {
  app.controller('ListCtrl', ['$scope', '$routeParams', '$location', '$http',
    function ListCtrl($scope, $routeParams, $location, $http) {
      $http.get('/data/default/contents.js')
        .success(function(res) {
          $scope.keyChain.setContents(res);
          $scope.items = ["Logins", "Accounts", "Identities", "Secure Notes",
            "Software", "Wallet", "Passwords", "Trash"];
        })
        .error(function(error) {
          console.error(error);
        });

      $scope.keyChain.on('logout', function() {
        $scope.items = [];
        $scope.keyChain.lock();
        $scope.loggedUser = false;

        $location.path("/login");
      });
    }
  ]);
});
