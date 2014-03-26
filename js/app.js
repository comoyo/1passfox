/**
 * @jsx React.DOM
 */

(function(window, React) {
  'use strict';

  React.initializeTouchEvents(true);

  window.kc = new Keychain();
  window.localForageConfig = {
    name        : '1passfox',
    version     : 1.0,
    storeName   : '1p-database',
  };

  var basePath = '1Password.agilekeychain/data/default/';
  var OneApp = React.createClass({displayName: 'OneApp',
    getInitialState: function() {
      return {
        contents: [],
        loggedIn: false,
        loginField: '',
        categories: [],
        category: ''
      };
    },

    _setup: function(error, keys, contents, avoidStorage) {
      if (error) {
        return console.error("Error retrieving 1password files from Dropbox");
      }

      if (typeof keys === 'string') {
        keys = JSON.parse(keys);
      }

      if (typeof contents === 'string') {
        contents = JSON.parse(contents);
      }

      if (avoidStorage !== true) {
        queue(2)
        .defer(localforage.setItem, '1p.encryptionKeys', keys)
        .defer(localforage.setItem, '1p.contents', contents)
        .await(function(error) {
          if (error) {
            alert('There was an error when saving data in database: ' + error);
          }
        });

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
      }
    },

    _getContents: function() {
      var readFile = cloud.dropbox.auth.readFile.bind(cloud.dropbox.auth);

      //queue(2)
        //.defer(localforage.getItem, '1p.encryptionKeys')
        //.defer(localforage.getItem, '1p.contents')
        //.await(function(error, keys, contents) {
          //if (error || !keys || !contents) {
            return queue(2)
              .defer(readFile, basePath + "encryptionKeys.js")
              .defer(readFile, basePath + "contents.js")
              .await(this._setup.bind(this));
            //return console.error("Unable to load password files.");
          //}

          //return this._setup.bind(this)(error, keys, contents, true);
        //}.bind(this));
    },

    authenticateDropbox: function(e) {
      var client = cloud.dropbox.auth;
      if (!client.isAuthenticated()) {
        return client.authenticate(function(error, client) {
          if (error || !client) {
            console.log(error.toString(), client);
            return console.error("Error authenticating with Dropbox");
          }

          localStorage.setItem('dropbox_auth', JSON.stringify(client.credentials()));
          this._getContents();
        }.bind(this));
      } else {
        this._getContents();
      }
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
        if (!obj) {
          var path = basePath + item.uuid + '.1password';
          cloud.dropbox.auth.readFile(path, function(err, data) {
            if (err) {
              return console.error(err);
            }

            data = JSON.parse(data);
            var item = kc.getItem(data);
            localforage.setItem(itemDbName, item, function() {});
            getItemData(item);
          });
        }
        else {
          getItemData(obj);
        }
      });

      function getItemData(item) {
        var decryption_status;
        try {
          if (typeof item === "string") {
            item = JSON.parse(item);
          }
          decryption_status = kc.decryptItem(item);
        }
        catch (e) {
          console.error("Error: " + e);
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

        main = React.DOM.div( {className:"main-container"}, 
          MenuBar( {onMenuClick:this.switchToType, items:this.state.categories} ),
          React.DOM.div( {className:"main-content"}, 
            Header( {title:this.state.sectionTitle}),
            React.DOM.div( {className:classes}, 
              React.DOM.div( {className:"content-list"}, 
                List( {onItemClick:this.switchToItem, items:this.state.contents[this.state.category]} )
              ),
              React.DOM.div( {className:"item-page"}, 
                Item( {item:this.state.selectedItem})
              )
            )
          )
        )
      } else {
        var authenticated = cloud.dropbox.auth.isAuthenticated();
//        console.log(cloud.dropbox.auth.isAuthenticated())
        if (!authenticated) {
          main = React.DOM.div( {className:"main-container dropbox-screen"}, 
            React.DOM.form( {id:"dropbox-form", className:"form-wrapper cf"}, 
              React.DOM.button( {className:"dropbox", onClick:this.authenticateDropbox, tabIndex:"-1"}, "Login to dropbox")
            )
          );
        } else {
          main = React.DOM.div( {className:"main-container login-screen"}, 
            React.DOM.form( {id:"login-form", className:"form-wrapper cf"}, 
              React.DOM.input( {id:"login_field", type:"password", autofocus:true,
              placeholder:"Enter your Master Password",
              onChange:this.handleLoginChange, value:value} ),
              React.DOM.button( {id:"submit_login", onClick:this.verifyPassword, tabIndex:"-1"}, "LOGIN")
            )
          );
        }
      }

      return React.DOM.section( {id:"main"}, main);
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
        }, 60000);
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

  React.renderComponent(OneApp(null ), document.getElementById('app'));
})(window, React);
