'use strict';

var cloud = {}
cloud.dropbox = {};
cloud.dropbox.client = undefined;

var creds;
try {
  creds = JSON.parse(localStorage.getItem('dropbox_auth'))
} catch (e) {
  console.error(e)
}

cloud.dropbox.auth = new Dropbox.Client(creds || { key: "ioiuz7xcr9ig0u1" });
cloud.dropbox.auth.onAuth = new CustomEvent('cloud.dropbox.authed');
