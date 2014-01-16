/**
 * @jsx React.DOM
 */

(function(window, React) {
  'use strict';

  React.initializeTouchEvents(true);

  window.kc = new Keychain();

  var OneApp = React.createClass({displayName: 'OneApp',
    getInitialState: function() {

      return {
        contents: [],
        loggedIn: false,
        loginField: '',
        categories: [],
        category: '',
        selectedItem: {
          uuid: 'D05256408DE8485886F15FA9C6B3198D',
          title: 'A',
          fields: []
        }
      };
    },

    _setup: function setup(error, keys, contents) {
      var self = this;
      if (error) {
        return alert("Error retrieving 1password files from Dropbox");
      }

      if (typeof keys === 'string') keys = JSON.parse(keys);
      if (typeof contents === 'string') contents = JSON.parse(contents);

      queue(2)
        .defer(asyncStorage.setItem, '1p.encryptionKeys', keys)
        .defer(asyncStorage.setItem, '1p.contents', contents)
        .await(function(error) {
          if (error) {
            alert('There was an error when trying to save data in database: ' + error);
          }
        });

      kc.setEncryptionKeys(keys);
      self.state.contents = kc.setContents(contents);

      var categories = Object.keys(self.state.contents);
      self.setState({
        category: categories[0],
        categories: categories.map(function(ct) {
          return {
            name: ct,
            count: self.state.contents[ct].length
          }
        })
      })
    },

    authenticate: function() {
      var self = this;
      var client = cloud.dropbox.auth;

      if (!client.isAuthenticated()) {
        client.authenticate(function(error, client) {
          if (error || !client) {
            return console.error("Error authenticating with Dropbox");
          }
          queue(2)
            .defer(asyncStorage.getItem, '1p.encryptionKeys')
            .defer(asyncStorage.getItem, '1p.contents')
            .await(function(error, keys, contents) {
              if (error || !keys || !contents) {
                queue(2)
                  .defer(client.readFile.bind(client), "1Password.agilekeychain/data/default/encryptionKeys.js")
                  .defer(client.readFile.bind(client), "1Password.agilekeychain/data/default/contents.js")
                  .await(self._setup.bind(self))
              }
              else {
                self._setup.bind(self)(error, keys, contents);
              }
            })
        });
      }
    },

    componentDidMount: function() {
      this.authenticate()

//      var router = Router({
//        '/': this.setState.bind(this, {nowShowing: ALL_TODOS}),
//        '/active': this.setState.bind(this, {nowShowing: ACTIVE_TODOS}),
//        '/completed': this.setState.bind(this, {nowShowing: COMPLETED_TODOS})
//      });
//      router.init();
//      this.refs.newField.getDOMNode().focus();
    },

    componentDidUpdate: function() {
//      Utils.store('react-todos', this.state.todos);
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
      asyncStorage.getItem(itemDbName, function(err, obj) {
        if (!obj) {
          cloud.dropbox.auth.readFile('1Password.agilekeychain/data/default/' + item.uuid + '.1password', function(err, data) {
            var item = kc.getItem(data);
            asyncStorage.setItem(itemDbName, item, function() {})
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
          decryption_status = kc.decryptItem(item);
        }
        catch (e) {
          console.error("Error: " + e);
        }

        if (decryption_status != "OK") {
          alert("An error occurred while processing item '" + item.uuid + "'.\n\n" + decryption_status);
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
        })
      }
    },

    render: function() {
      var main = null;
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
        var disabled = !cloud.dropbox.auth.isAuthenticated();
        main = (
          React.DOM.div( {className:"main-container login-screen"}, 
            React.DOM.form( {id:"login-form", className:"form-wrapper cf"}, 
              React.DOM.input( {id:"login_field", type:"password", autofocus:true,
              placeholder:"Enter your Master Password",
              onChange:this.handleLoginChange, value:value} ),
              React.DOM.button( {id:"submit_login", onClick:this.submitLogin, tabIndex:"-1"}, "LOGIN")
            )
          )
          );
      }

      return React.DOM.section( {id:"main"}, main);
    },

    handleLoginChange: function(event) {
      this.setState({ loginField: event.target.value });
    },

    submitLogin: function() {
      this.setState({ loggedIn: !!kc.verifyPassword.bind(kc)(this.state.loginField) });
    },

    getList: function getList() {
      this.setState({
        items: this.state.contents[type]
      });
    }
  });

  React.renderComponent(OneApp(null ), document.getElementById('app'));
})(window, React);
