/**
 * @jsx React.DOM
 */

(function(window) {
  'use strict';

  window.MenuItem = React.createClass({
    render: function() {
      return (
        <li className="topcoat-list__item side-nav__list__item">
          <a
          href="#"
          className="side-nav__button"
          onClick={this.props.onMenuItemClick}>{this.props.title}</a>
        </li>
        );
    }
  });

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
