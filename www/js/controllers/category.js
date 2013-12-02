define(['app'], function(app) {
  app.controller('CategoryCtrl', ['$scope', '$routeParams', '$location', '$http',
    function CategoryCtrl($scope, $routeParams, $location, $http) {
      var kc = $scope.keyChain;
      if (Object.keys(kc.contents).length === 0) {
        $http.get('/data/default/contents.js')
          .success(function(res) {
            getList(kc.setContents(res));
          })
          .error(function(error) {
            console.error(error);
          });
      } else {
        getList(kc.contents);
      }

      function getList(contents) {
        if ($routeParams.type) {
          var type = $routeParams.type;
          $scope.items = contents[type].map(function(item) {
            item.category = type;
            return item;
          });
        }
      }
    }
  ]);
});
