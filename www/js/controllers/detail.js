define(['app'], function(app) {
  app.controller('DetailCtrl', ['$scope', '$routeParams', '$http',
    function DetailCtrl($scope, $routeParams, $http) {
      var kc = $scope.keyChain;
      var uuid = $routeParams.uuid;
      $http.get('/data/default/' + uuid + '.1password').success(function(entry) {
        var item = kc.getItem(entry);
        var decryption_status;
        try {
          decryption_status = kc.decryptItem(item);
        }
        catch (e) {
          alert("Error: " + e);
        }

        if (decryption_status != "OK") {
          alert("An error occurred while processing item '" + item.uuid + "'.\n\n" + decryption_status);
          return;
        }

        console.log(item)
        $scope.item = item;
        $scope.item.username = kc.findItemFieldWithDesignation($scope.item, 'username');
      });

    }
  ]);
});
