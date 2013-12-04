define(['app'], function(app) {
  app.controller('DetailCtrl', ['$scope', '$routeParams', '$http',
    function DetailCtrl($scope, $routeParams, $http) {
      var kc = $scope.keyChain;
      var uuid = $routeParams.uuid;
      var encryptedFields = [ 'password', 'cvv', 'pin'];

      function isMasked(f) {
        return encryptedFields.indexOf(f) > -1;
      }

      $http.get('/data/default/' + uuid + '.1password').success(function(entry) {
        var item = $scope.item = kc.getItem(entry);
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

        var decryptedFields = item.decrypted_secure_contents;

        if (decryptedFields.fields) {
          decryptedFields.fields.forEach(function(f) {
            f.pwdType = isMasked(f) ? 'password' : 'text';
            f.concealed = isMasked(f);
          });
          $scope.fields = decryptedFields.fields;
        }
        else {
          $scope.fields = Object.keys(decryptedFields).map(function(f) {
            return {
              designation: f,
              value: decryptedFields[f],
              pwdType: isMasked(f) ? 'password' : 'text',
              concealed: isMasked(f)
            };
          })
        }
      });

      $scope.revealPass = function(f) {
        f.pwdType = f.pwdType === 'password' ? 'text' : 'password';
        $scope.$$phase || $scope.$apply();
      }
    }
  ]);
});
