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

        return MenuItem( {title:item.name} );
      };

      return (React.DOM.div(null, 
        React.DOM.div( {className:"topcoat-navigation-bar"}, 
          React.DOM.div( {className:"topcoat-navigation-bar__item left quarter"}, 
            React.DOM.a( {id:"slide-menu-button",
            className:"topcoat-icon-button--quiet slide-menu-button"}, 
              React.DOM.span( {className:"topcoat-icon topcoat-icon--menu-stack"})
            )
          ),
          React.DOM.div( {className:"topcoat-navigation-bar__item center half"}, 
            React.DOM.h1( {className:"topcoat-navigation-bar__title"}, "Topcoat Drawer")
          ),
          React.DOM.div( {className:"topcoat-navigation-bar__item right quarter"}, 
            React.DOM.a( {className:"topcoat-icon-button--quiet"}, 
              React.DOM.span( {className:"topcoat-icon topcoat-icon--edit"})
            )
          )
        ),
        React.DOM.div( {className:"side-nav"} , 
          React.DOM.div( {className:"topcoat-list__container side-nav__list__container"}, 
            React.DOM.ul( {className:"topcoat-list side-nav__list"}, 
          this.props.items.map(createItem)
            )
          )
        )
      ));
    }
  });
})(window);
