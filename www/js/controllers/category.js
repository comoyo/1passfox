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

      function sortFn(a, b) { return a.title > b.title ? 1 : -1 }
      $scope.title = $routeParams.type || 'Items';

      function getList(contents) {
        if ($routeParams.type) {
          if ($routeParams.type === 'All Items') {
            return $scope.items = Object.keys(kc._all).map(function(key) {
              var item = kc._all[key]
              item.category = 'All Items';
              return item;
            }).sort(sortFn)
          }

          var type = $routeParams.type;
          $scope.items = contents[type].map(function(item) {
            item.category = type;
            return item;
          }).sort(sortFn);
        }
      }
    }
  ]);
});
