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

  React.initializeTouchEvents(true)

  window.ALL_TODOS = 'all';
  window.ACTIVE_TODOS = 'active';
  window.COMPLETED_TODOS = 'completed';
  window.kc = new Keychain();

  var ENTER_KEY = 13;

  var OneApp = React.createClass({
    getInitialState: function() {

      var todos = Utils.store('react-todos');
      return {
        contents: [],
        loggedIn: false,
        loginField: '',
        categories: [],
        category: ''
      };
    },

    componentDidMount: function() {
      var self = this;
      queue(2)
        .defer(Utils.XHRGet, "/data/default/encryptionKeys.js")
        .defer(Utils.XHRGet, "/data/default/contents.js")
        .await(function(err, keys, contents) {
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

    render: function() {
      var main = null;
      var value = this.state.loginField;

      if (this.state.loggedIn === true) {
        var items = this.state.categories.concat();
        console.log(this.state.contents, this.state.category)
        main = <section id="main">
          <MenuBar items={items} />
          <div className="main-content">
          <List items={this.state.contents[this.state.category]} />
            </div>
        </section>
      } else {
        main = (
          <section id="main">
            <input id="login_field" type="password" onChange={this.handleLoginChange} value={value} />
            <button id="submit_login" onClick={this.submitLogin} tabIndex="-1">LOGIN</button>
          </section>
          );
      }

      return ( <div> {main} </div> );
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
