/**
 * @jsx React.DOM
 */

(function(window) {
  'use strict';

  window.Header = React.createClass({displayName: 'Header',

    slide: function slide() {
      var cl = window.document.body.classList;
      if (cl.contains('left-nav')) {
        cl.remove('left-nav');
      } else {
        cl.add('left-nav');
      }
    },

    shouldComponentUpdate: function(nextProps, nextState) {
      return nextProps.title !== this.props.title;
    },

    render: function() {
      return (
        React.DOM.div( {className:"topcoat-navigation-bar"}, 
          React.DOM.div( {className:"topcoat-navigation-bar__item left quarter"}, 
            React.DOM.a( {id:"slide-menu-button",
            onClick:this.slide,
            className:"topcoat-icon-button--quiet slide-menu-button"}, 
              React.DOM.span( {className:"topcoat-icon topcoat-icon--menu-stack"})
            )
          ),
          React.DOM.div( {className:"topcoat-navigation-bar__item center half"}, 
            React.DOM.h1( {className:"topcoat-navigation-bar__title"}, this.props.title)
          )
        )
        );
    }
  });
})(window);
