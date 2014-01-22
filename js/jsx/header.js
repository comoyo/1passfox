/**
 * @jsx React.DOM
 */

(function(window) {
  'use strict';

  window.Header = React.createClass({

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
        <div className="topcoat-navigation-bar">
          <div className="topcoat-navigation-bar__item left quarter">
            <a id="slide-menu-button"
            onClick={this.slide}
            className="topcoat-icon-button--quiet slide-menu-button">
              <span className="topcoat-icon topcoat-icon--menu-stack"></span>
            </a>
          </div>
          <div className="topcoat-navigation-bar__item center half">
            <h1 className="topcoat-navigation-bar__title">{this.props.title}</h1>
          </div>
        </div>
        );
    }
  });
})(window);
