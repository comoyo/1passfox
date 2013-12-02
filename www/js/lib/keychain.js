define(['js/lib/gibberish-aes', 'js/lib/event_emitter'], function(GibberishAES, EventEmitter) {
  var INDEX_UUID = 0,
    INDEX_TYPE = 1,
    INDEX_NAME = 2,
    INDEX_URL = 3,
    INDEX_DATE = 4,
    INDEX_FOLDER = 5,
    INDEX_PASSWORD_STRENGTH = 6,
    INDEX_TRASHED = 7;

  var TYPE_WEBFORMS = 'webforms.WebForm',
    TYPE_FOLDERS = 'system.folder.Regular',
    TYPE_NOTES = 'securenotes.SecureNote',
    TYPE_IDENTITIES = 'identities.Identity',
    TYPE_PASSWORDS = 'passwords.Password',
    TYPE_WALLET = 'wallet',
    TYPE_SOFTWARE_LICENSES = 'wallet.computer.License',
    TYPE_TRASHED = 'trashed',
    TYPE_ACCOUNT = 'account',
    TYPE_ACCOUNT_ONLINESERVICE = 'wallet.onlineservices.',
    TYPE_ACCOUNT_COMPUTER = 'wallet.computer.';

  var ERROR_BAD_DECRYPT = "Decryption failed",
    ERROR_INVALID_JSON = "Decryption passed but JSON was invalid",
    ERROR_OK = "OK";

  String.prototype.escapeHTML = function() {
    return this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function Keychain() {
    EventEmitter.call(this);

    this.AUTOLOCK_LENGTH = 1 * 60 * 1000;
    this.autoLogoutTime = null;
    this.contents = {};
    this.encryptionKeys = null;
    this._all = null;
    this.masterPassword = null;
    this.encryptionKeysLoaded = false;
  }

  Keychain.prototype.setEncryptionKeys = function(keys) {
    this.encryptionKeys = keys;
    this.encryptionKeysLoaded = true;
  }

  Keychain.prototype.verifyPassword = function(password) {
    GibberishAES.size(128);
    this.encryptionKeys.decryptedKeys = {};

    var key = this.decryptEncryptionKey("SL5", password);
    if (!key) return false;

    this.masterPassword = password;
    return true;
  }

  Keychain.prototype.decryptEncryptionKey = function(sl, password) {
    for (var i = 0; i < this.encryptionKeys["list"].length; i++) {
      var item = this.encryptionKeys["list"][i];

      if (item['identifier'] == this.encryptionKeys[sl]) {
        var iterations = parseInt(item['iterations'] || "0", 10);
        if (iterations < 1000) iterations = 1000;

        var decryptedKey = GibberishAES.decryptUsingPBKDF2(item["data"], password, iterations);
        if (!decryptedKey) return null;

        var verification = GibberishAES.decryptBase64UsingKey(item["validation"], GibberishAES.s2a(decryptedKey));
        if (verification != decryptedKey) return null;

        this.encryptionKeys.decryptedKeys[sl] = decryptedKey;
        return decryptedKey;
      }
    }

    return null;
  }

  Keychain.prototype.keyForItem = function(item) {
    if (item.securityLevel == null) {
      return this.encryptionKeys.decryptedKeys["SL5"]
    }

    var key = this.encryptionKeys.decryptedKeys[item.securityLevel];
    if (!key) {
      key = this.decryptEncryptionKey(item.securityLevel, this.masterPassword);
    }
    return key;
  }

  Keychain.prototype.setContents = function(itemArray) {
    this._all = {};

    itemArray.forEach(function(_item) {
      var item = new KeychainItemOverview(_item);
      if (item.type.indexOf("system.") === 0) {
        return;
      }

      this._all[item.uuid] = item;

      var type = item.type || TYPE_ACCOUNT;
      if (item.trashed == "Y") {
        type = TYPE_TRASHED;
      } else if (type.indexOf(TYPE_FOLDERS) === 0) {
        type = 'folders';
      } else if (type.search(/^wallet/) > -1) {
        type = TYPE_WALLET;
      }

      if (!this.contents[type]) {
        this.contents[type] = [item];
      } else {
        this.contents[type].push(item);
      }
    }, this);

    return this.contents;
  };

  Keychain.prototype.itemsOfType = function(name) {
    return this.contents[name];
  }

  Keychain.prototype.itemWithUuid = function(uuid) {
    return this._all[uuid];
  }

  Keychain.prototype._autoLogout = function() {
    Bus.emit('logout', true);
  }

  Keychain.prototype.lock = function() {
    if (this.encryptionKeys) {
      this.encryptionKeys.decryptedKeys = null;
    }
    this.masterPassword = null;
    this.encryptionKeysLoaded = false;
  }

  function KeychainItemOverview(data) {
    this.uuid = data[INDEX_UUID];
    this.type = data[INDEX_TYPE];
    this.title = data[INDEX_NAME];
    this.domain = data[INDEX_URL];
    this.updatedAtMs = data[INDEX_DATE] * 1000;
    this.trashed = data[INDEX_TRASHED];

    var date = new Date();
    date.setTime(this.updatedAtMs);
    //    this.updatedAt = date.format("mmm d, yyyy, h:MM:ss TT");
  }

  KeychainItemOverview.prototype.matches = function(s) {
    var re = new RegExp(s, 'i');
    return re.test(this.title) || re.test(this.domain);
  }

  Keychain.prototype.getItem = function(data) {
    var item = {};
    item.updatedAt = null; // TODO -- confirm that it can be deleted

    item.data = data;
    item.folderUuid = data.folderUuid;
    item.encrypted_contents = data.encrypted;
    item.decrypted = false;
    item.decrypted_secure_contents = null;

    item.uuid = data.uuid;
    item.type = data.typeName;
    item.title = data.title;
    item.domain = data.location;

    item.securityLevel = data.securityLevel;
    if (!data.securityLevel && data.openContents) {
      item.securityLevel = data.openContents.securityLevel;
    }

    if (!item.securityLevel) {
      item.securityLevel = "SL5";
    }

    item.updatedAtMs = data.updatedAt * 1000;

//    var folderName = this.itemWithUuid(item.folderUuid);
//    if (!folderName) {
//      folderName = "None";
//    }

    return item;
  }

  Keychain.prototype.decryptItem = function(item) {
    GibberishAES.size(128);
    var key = this.keyForItem(item);
    var plainText = GibberishAES.decryptBase64UsingKey(
      item.encrypted_contents, GibberishAES.s2a(key));

    if (!plainText) {
      return ERROR_BAD_DECRYPT;
    }

    // Decode UTF encoding that OpenSSL uses.
    plainText = decodeURIComponent(escape(plainText));

    try {
      item.decrypted_secure_contents = JSON.parse(plainText);
    } catch (e) {
      return ERROR_INVALID_JSON;
    }

    return ERROR_OK;
  }

  Keychain.prototype.findItemFieldWithDesignation = function(item, designation) {
    var field = item.decrypted_secure_contents.fields.filter(function(f) {
      return f.designation == designation;
    })[0];

    if (field)
      return field
  };

  function encodeToHex(str) {
    var r = "";
    var e = str.length;
    var c = 0;
    var h;
    while (c < e) {
      h = str.charCodeAt(c++).toString(16);
      while (h.length < 2) h = "0" + h;
      r += h;
    }
    return r.toUpperCase();
  }

  return Keychain;
});
