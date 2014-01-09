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
    handleClick: function(item) {
      this.props.onItemClick(item)
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      return this.props.items !== nextProps.items;
    },

    render: function() {
      var self = this;
      var createItem = function(item) {
        return <li onClick={self.handleClick.bind(self, item)}>{item.title}</li>;
      };
      return <ul>{this.props.items.map(createItem)}</ul>;
    }
  })
})(window, React);
