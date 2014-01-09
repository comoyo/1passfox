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

  window.Item = React.createClass({
    getInitialState: function() {
      var todos = Utils.store('react-todos');
      return {
        fields: []
      };
    },

    render: function() {
      var fields = this.props.item.fields.map(function(f) {
        return React.DOM.li(null, f.name,": ", f.value)
      });

      return React.DOM.div(null, 
        React.DOM.ul(null, fields)
      )
    }
  })
})(window, React);
