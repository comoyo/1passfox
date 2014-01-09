/**
 * @jsx React.DOM
 */
/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */
/*global React, Utils */
(function(window) {
  'use strict';

  window.MenuBar = React.createClass({

    handleClick: function(name) {
      this.props.onMenuClick(name)
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      return this.props.items !== nextProps.items
    },

    render: function() {
      var createItem = function(item) {
        return (<MenuItem
        onMenuItemClick={this.handleClick.bind(this, item.name)}
        title={item.name} />);
      };

      return (
        <div className="side-nav" >
          <div className="topcoat-list__container side-nav__list__container">
            <ul className="topcoat-list side-nav__list">
              {this.props.items.map(createItem.bind(this))}
            </ul>
          </div>
        </div >
        );
    }
  });
})(window);
