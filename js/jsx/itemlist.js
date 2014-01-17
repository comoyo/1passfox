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
        return <li onClick={self.handleClick.bind(self, item)}>{item.title}</li>;
      };
      return <ul>{this.props.items.map(createItem)}</ul>;
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
          return <li>{f.name}: {f.value}</li>
        });
      }

      return <div>
        <ul>{fields}</ul>
      </div>
    }
  });
})(window, React);
