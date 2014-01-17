/**
 * @jsx React.DOM
 */

(function(window, React) {
  'use strict';

  React.initializeTouchEvents(true);

  window.kc = new Keychain();

  var basePath = '1Password.agilekeychain/data/default/';

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

    _setup: function(error, keys, contents, avoidStorage) {
      if (error) {
        return alert("Error retrieving 1password files from Dropbox");
      }

      if (typeof keys === 'string') keys = JSON.parse(keys);
      if (typeof contents === 'string') contents = JSON.parse(contents);

      if (avoidStorage !== true) {
        queue(2)
          .defer(asyncStorage.setItem, '1p.encryptionKeys', keys)
          .defer(asyncStorage.setItem, '1p.contents', contents)
          .await(function(error) {
            if (error) {
              alert('There was an error when saving data in database: ' + error);
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
          }
        }, this)
      })
    },

    _getContents: function() {
      var readFile = cloud.dropbox.auth.readFile.bind(cloud.dropbox.auth);

      queue(2)
        .defer(asyncStorage.getItem, '1p.encryptionKeys')
        .defer(asyncStorage.getItem, '1p.contents')
        .await(function(error, keys, contents) {
          if (error || !keys || !contents) {
            return queue(2)
              .defer(readFile, basePath + "encryptionKeys.js")
              .defer(readFile, basePath + "contents.js")
              .await(this._setup.bind(this))
          }

          return this._setup.bind(this)(error, keys, contents, true);
        }.bind(this));
    },

    authenticate: function() {
      var client = cloud.dropbox.auth;
      if (!client.isAuthenticated()) {
        return client.authenticate(function(error, client) {
          if (error || !client) {
            return console.error("Error authenticating with Dropbox");
          }

          localStorage.setItem('dropbox_auth', JSON.stringify(client.credentials()))
          return this._getContents();
        }.bind(this));
      }

      return this._getContents();
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
          cloud.dropbox.auth.readFile(basePath + item.uuid + '.1password', function(err, data) {
            if (err)
              return console.error(err);

            data = JSON.parse(data);
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
          if (typeof item === "string") {
            item = JSON.parse(item);
          }
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
        var disabled = !cloud.dropbox.auth.isAuthenticated();
        main = (
          <div className="main-container login-screen">
            <form id="login-form" className="form-wrapper cf">
              <input id="login_field" type="password" autofocus
              placeholder="Enter your Master Password"
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
      this.setState({ loggedIn: !!kc.verifyPassword.bind(kc)(this.state.loginField) });
    },

    getList: function getList() {
      this.setState({
        items: this.state.contents[type]
      });
    }
  });

  React.renderComponent(<OneApp />, document.getElementById('app'));
})(window, React);
