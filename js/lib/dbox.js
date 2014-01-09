define([], function() {
  // Create dropbox object where we'll store Dropbox objects and metadata.
  var DboxMeta = {
    auth: new Dropbox.Client({ key: "ioiuz7xcr9ig0u1" })
  };

  DboxMeta.auth.authDriver(new Dropbox.AuthDriver.Popup({
    rememberUser: true,
    receiverUrl: "http://localhost:8000/dropbox.html"
  }));

  return DboxMeta;
});
