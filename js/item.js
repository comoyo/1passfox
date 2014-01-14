/**
 * @jsx React.DOM
 */


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
