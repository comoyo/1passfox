/**
 * @jsx React.DOM
 */

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
        return React.DOM.li( {onClick:self.handleClick.bind(self, item)}, item.title);
      };
      return React.DOM.ul(null, this.props.items.map(createItem));
    }
  });

  window.Item = React.createClass({
    getInitialState: function() {
      return { fields: [] };
    },

    render: function() {
      var fields = [];
      if (this.props.item && this.props.item.fields) {
        fields = this.props.item.fields.map(function(f) {
          return React.DOM.li(null, f.name,": ", f.value)
        });
      }

      return React.DOM.div(null, 
        React.DOM.ul(null, fields)
      )
    }
  });
})(window, React);
