/**
 * @jsx React.DOM
 */
/*jshint quotmark:false */
/*jshint white:false */
/*jshint trailing:false */
/*jshint newcap:false */
/*global Utils, ALL_TODOS, ACTIVE_TODOS, COMPLETED_TODOS,
 TodoItem, TodoFooter, React, Router*/

(function(window, React) {
  'use strict';

  React.initializeTouchEvents(true);

  window.kc = new Keychain();

  var OneApp = React.createClass({displayName: 'OneApp',
    getInitialState: function() {

      var todos = Utils.store('react-todos');
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

    componentDidMount: function() {
      localStorage.credentials || (localStorage.credentials = {});

      var self = this;
      var client = cloud.dropbox.auth;

      client.authenticate(function(error, client) {
        if (error || !client) {
          alert("Error authenticating with Dropbox");
        }

        queue(2)
          .defer(client.readFile.bind(client), "1Password.agilekeychain/data/default/encryptionKeys.js")
          .defer(client.readFile.bind(client), "1Password.agilekeychain/data/default/contents.js")
          .await(function(error, keys, contents) {
            if (error) {
              return alert("Error retrieving 1password files from Dropbox");
            }

            keys = JSON.parse(keys);
            contents = JSON.parse(contents);

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
          })
      });

//      var router = Router({
//        '/': this.setState.bind(this, {nowShowing: ALL_TODOS}),
//        '/active': this.setState.bind(this, {nowShowing: ACTIVE_TODOS}),
//        '/completed': this.setState.bind(this, {nowShowing: COMPLETED_TODOS})
//      });
//      router.init();
//      this.refs.newField.getDOMNode().focus();
    },

    componentDidUpdate: function() {
      Utils.store('react-todos', this.state.todos);
    },

    switchToType: function(type) {
      this.setState({
        category: type,
        sectionTitle: type
      });
    },

    switchToItem: function(item) {
      var self = this;
      if (localStorage['credential-' + item.uuid]) {
        getItemData(JSON.parse(localStorage['credential-' + item.uuid]))
      } else {
        cloud.dropbox.auth.readFile('1Password.agilekeychai/data/default/' + item.uuid + '.1password', function(err, data) {
          var item = kc.getItem(data);
          localStorage['credential-' + item.uuid] = JSON.stringify(item);
          getItemData(item);
        });
      }

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
        main = (
          React.DOM.div( {className:"main-container"}, 
            React.DOM.input( {id:"login_field", type:"password", onChange:this.handleLoginChange, value:value} ),
            React.DOM.button( {id:"submit_login", onClick:this.submitLogin, tabIndex:"-1"}, "LOGIN")
          )
          );
      }

      return React.DOM.section( {id:"main"}, main);
    },

    handleLoginChange: function(event) {
      this.setState({ loginField: event.target.value });
    },

    submitLogin: function() {
      this.setState({ loggedIn: !!kc.verifyPassword(this.state.loginField) });
    },

    getList: function getList() {
      this.setState({
        items: this.state.contents[type]
      });
    }
  });

  React.renderComponent(OneApp(null ), document.getElementById('app'));
})(window, React);
