/**
 * @jsx React.DOM
 */
/*jshint quotmark: false */
/*jshint white: false */
/*jshint trailing: false */
/*jshint newcap: false */
/*global React, Utils */
(function (window) {
	'use strict';

	window.MenuItem = React.createClass({

		render: function () {
			return (
        React.DOM.li( {className:"topcoat-list__item side-nav__list__item"}, 
          React.DOM.a(
          {href:"#",
          className:"side-nav__button",
          onClick:"this.props.onClick"}, this.props.title)
        )
			);
		}
	});
})(window);
