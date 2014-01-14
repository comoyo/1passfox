/**
 * @jsx React.DOM
 */

(function(window, React) {
  'use strict';

  React.initializeTouchEvents(true);

  window.kc = new Keychain();

  var OneApp = React.createClass({
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

    componentDidMount: function() {
      localStorage.credentials || (localStorage.credentials = {});

      var self = this;
      var client = cloud.dropbox.auth;

      if (!client.isAuthenticated()) {
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
      }

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
      if (localStorage['credential-' + item.uuid]) {
        getItemData(JSON.parse(localStorage['credential-' + item.uuid]))
      } else {
        cloud.dropbox.auth.readFile('1Password.agilekeychain/data/default/' + item.uuid + '.1password', function(err, data) {
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
        var disabled = !cloud.dropbox.auth.isAuthenticated();
        main = (
          <div className="main-container login-screen">
            <form id="login-form" className="form-wrapper cf">
              <input id="login_field" type="password" autofocus
              placeholder="Enter your Master Password" disabled={disabled ? "disabled" : ""}
              onChange={this.handleLoginChange} value={value} />
              <button id="submit_login" onClick={this.submitLogin} tabIndex="-1">LOGIN</button>
            </form>
          </div>
          );
      }

      return <section id="main">{main}</section>;
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

  React.renderComponent(<OneApp />, document.getElementById('app'));
})(window, React);
