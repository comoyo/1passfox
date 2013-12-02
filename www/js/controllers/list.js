define(['app'], function(app) {
  app.controller('ListCtrl', ['$scope', '$routeParams', '$location', '$http',
    function ListCtrl($scope, $routeParams, $location, $http) {
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
            return item;
          });
        } else {
          var items = [];
          items.push({
            title: 'All Items',
            count: Object.keys(kc._all).length
          });

          $scope.items = items.concat(Object.keys(contents).map(function(key) {
            return {
              title: key,
              count: contents[key].length
            };
          }));
        }
      }
    }
  ]);
});
