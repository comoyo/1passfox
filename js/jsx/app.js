/**
 * @jsx React.DOM
 */

// Database configuration
window.localforage.config = {
  name: '1passfox',
  version: 1.0,
  storeName: '1p-database'
};

var client;

(function(window, React) {
  'use strict';

  //var creds;
  //try {
  //creds = JSON.parse(localStorage.getItem('dropbox_client'));
  //} catch (e) {
  //console.error('Error', e);
  //}

  client = new Dropbox.Client({ key: 'ioiuz7xcr9ig0u1' });

  client.authDriver(new Dropbox.AuthDriver.Popup({
    receiverUrl: 'http://localhost:8000/1p.html',
    rememberUser: true
  }));

  if (document.URL.indexOf("#access_token") != -1){
    console.log('access_token');
    Dropbox.AuthDriver.Popup.oauthReceiver();
    client.onAuth = new CustomEvent('authed');
  }


  React.initializeTouchEvents(true);

  window.kc = new Keychain();

  var basePath = '1Password.agilekeychain/data/default/';

  // OneApp is the entity for the 1passfox application.
  var OneApp = React.createClass({
    getInitialState: function() {
      return {
        contents: [],
        loggedIn: false,
        loginField: '',
        categories: [],
        category: ''
      };
    },

    /**
     *
     *
     * @param error
     * @param {string} keys
     * @param contents {string}
     * @param avoidStorage {Boolean}
     **/
    initialize: function(error, keys, contents, avoidStorage) {
      console.log(arguments);
      if (error) {
        return console.error("Error retrieving 1password files from Dropbox");
      }

      if (avoidStorage === undefined) {
        avoidStorage = false;
      }

      keys = JSON.parse(keys);
      contents = JSON.parse(contents);

      if (avoidStorage !== true) {
        queue(2)
        .defer(localforage.setItem, '1p.encryptionKeys', keys)
        .defer(localforage.setItem, '1p.contents', contents)
        .await(function(error) {
          if (error) {
            alert('There was an error saving data in database: ' + error);
          }
        });
      }

      kc.setEncryptionKeys(keys);
      this.state.contents = kc.setContents(contents);

      var categories = Object.keys(this.state.contents);
      this.setState({
        category: categories[0],
        categories: categories.map(function(ct) {
          return {
            name: ct,
            count: this.state.contents[ct].length
          };
        }, this)
      });
    },

    retrieveContents: function() {
      var readFile = client.readFile.bind(client);

      //queue(2)
      //.defer(localforage.getItem, '1p.encryptionKeys')
      //.defer(localforage.getItem, '1p.contents')
      //.await(function(error, keys, contents) {
      console.log(arguments);
      //if (error || !keys || !contents) {
      return queue(2)
      .defer(readFile, basePath + 'encryptionKeys.js')
      .defer(readFile, basePath + 'contents.js')
      .await(this.initialize.bind(this));
      //}

      //return this.initialize.bind(this)(error, keys, contents, true);
      //}.bind(this));
    },

    authenticateDropbox: function(e) {
      var self = this;
      client.authenticate(function(error, client) {
        if (error || !client.isAuthenticated()) {
          return console.error('Error authenticating with Dropbox', error);
        }

        //localStorage.setItem('dropbox_auth', JSON.stringify(client.credentials()));

        console.log('Authenticated');
        self.retrieveContents();
      });
    },

    switchToType: function(type) {
      this.setState({
        category: type,
        sectionTitle: type
      });
    },

    switchToItem: function(item) {
      var self = this;
      var itemDbName = '1pItem-' + item.uuid;
      localforage.getItem(itemDbName, function(err, obj) {
        if (obj) {
          return getItemData(obj);
        }

        var path = basePath + item.uuid + '.1password';
        client.readFile(path, function(err, data) {
          if (err) {
            return console.error(err);
          }

          var item = kc.getItem(JSON.parse(data));
          localforage.setItem(itemDbName, item, function() {});
          getItemData(item);
        });
      });

      function getItemData(item) {
        var decryption_status;
        try {
          item = JSON.parse(item);
          decryption_status = kc.decryptItem(item);
        }
        catch (e) {
          alert("Error: " + e);
        }

        if (decryption_status != "OK") {
          alert("An error occurred while processing item '" +
                item.uuid + "'.\n\n" + decryption_status);
          return;
        }

        var decryptedFields = item.decrypted_secure_contents;
        var fields = decryptedFields.fields ||
          Object.keys(decryptedFields).map(function(f) {
          return {
            designation: f,
            value: decryptedFields[f]
          };
        });

        //TODO make immutable
        var obj = JSON.parse(JSON.stringify(item));
        obj.fields = fields;

        self.setState({
          sectionTitle: item.title,
          selectedItem: obj,
          screen: 'detail'
        });
      }
    },

    render: function() {
      var main;
      var value = this.state.loginField;

      if (this.state.loggedIn === true) {
        var cx = React.addons.classSet;
        var classes = cx({
          'container': true,
          'item-view': this.state.screen === 'detail'
        });

        main = <div className="main-container">
        <MenuBar onMenuClick={this.switchToType} items={this.state.categories} />
        <div className="main-content">
        <Header title={this.state.sectionTitle}/>
        <div className={classes}>
        <div className="content-list">
        <List onItemClick={this.switchToItem} items={this.state.contents[this.state.category]} />
        </div>
        <div className="item-page">
        <Item item={this.state.selectedItem}/>
        </div>
        </div>
        </div>
        </div >
      } else {
        var authenticated = client.isAuthenticated();
        if (!authenticated) {
          main = <div className="main-container dropbox-screen">
          <form id="dropbox-form" className="form-wrapper cf">
          <button className="dropbox" onClick={this.authenticateDropbox} tabIndex="-1">Login to dropbox</button>
          </form>
          </div>;
        } else {
          main = <div className="main-container login-screen">
          <form id="login-form" className="form-wrapper cf">
          <input id="login_field" type="password" autofocus
          placeholder="Enter your Master Password"
          onChange={this.handleLoginChange} value={value} />
          <button id="submit_login" onClick={this.verifyPassword} tabIndex="-1">LOGIN</button>
          </form>
          </div>;
        }
      }

      return <section id="main">{main}</section>;
    },

    handleLoginChange: function(event) {
      this.setState({ loginField: event.target.value });
    },

    verifyPassword: function() {
      var self = this;
      var verified = kc.verifyPassword(this.state.loginField)
      if (verified === true) {
        this.logoutCountDown = setTimeout(function() {
          kc.lock();
          self.setState({
            loggedIn: false,
            selectedItem: {}
          });
        }, 90000);
        this.setState({ loggedIn: true });
      }

      return verified;
    },

    getList: function getList() {
      this.setState({
        items: this.state.contents[type]
      });
    }
  });

  React.renderComponent(<OneApp />, document.getElementById('app'));
})(window, React);
