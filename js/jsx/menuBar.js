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
    render: function() {
      var createItem = function(item) {

        return <MenuItem title={item.name} />;
      };

      return (<div>
        <div className="topcoat-navigation-bar">
          <div className="topcoat-navigation-bar__item left quarter">
            <a id="slide-menu-button"
            className="topcoat-icon-button--quiet slide-menu-button">
              <span className="topcoat-icon topcoat-icon--menu-stack"></span>
            </a>
          </div>
          <div className="topcoat-navigation-bar__item center half">
            <h1 className="topcoat-navigation-bar__title">Topcoat Drawer</h1>
          </div>
          <div className="topcoat-navigation-bar__item right quarter">
            <a className="topcoat-icon-button--quiet">
              <span className="topcoat-icon topcoat-icon--edit"></span>
            </a>
          </div>
        </div>
        <div className="side-nav" >
          <div className="topcoat-list__container side-nav__list__container">
            <ul className="topcoat-list side-nav__list">
          {this.props.items.map(createItem)}
            </ul>
          </div>
        </div >
      </div>);
    }
  });
})(window);
