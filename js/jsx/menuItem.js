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
        <li className="topcoat-list__item side-nav__list__item">
          <a
          href="#"
          className="side-nav__button"
          onClick={this.props.onMenuItemClick}>{this.props.title}</a>
        </li>
			);
		}
	});
})(window);
