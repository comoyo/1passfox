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

  window.List = React.createClass({
    componentDidUpdate: function() {
      Utils.store('react-todos', this.state.todos);
    },

    render: function() {
      var createItem = function(item) {
        return React.DOM.li(null, item.title);
      };
      return React.DOM.ul(null, this.props.items.map(createItem));
    }
  })
})(window, React);
