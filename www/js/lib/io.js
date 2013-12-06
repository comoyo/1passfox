define(['js/lib/dbox'], function(DboxMeta) {
  var BASEPATH = '1Password.agilekeychain/data/default/';

  var io = {
    getFile: function(name, callback) {
      function read() {
        DboxMeta.client.readFile(BASEPATH + name, function(error, data) {
          if (error) return callback(error);

          callback(null, data);
        });
      }

      if (DboxMeta.client)
        return read();

      DboxMeta.auth.authenticate(function(error, client) {
        if (error) return callback(error);

        DboxMeta.client = client;
        read();
      });
    },
    getKeys: function(callback) {
      var self = this;
      asyncStorage.getItem('1pf::keys', function(keys) {
        if (keys)
          return callback(keys);

        self.getFile("encryptionKeys.js", function(err, data) {
          if (err) return callback(err);

          asyncStorage.setItem('1pf::keys', data);
          callback(null, data)
        });
      })
    }
  };

  return io;
});
