!function(t,e){"use strict";e.initializeTouchEvents(!0),t.kc=new Keychain;var n=e.createClass({displayName:"OneApp",getInitialState:function(){return{contents:[],loggedIn:!1,loginField:"",categories:[],category:"",selectedItem:{uuid:"D05256408DE8485886F15FA9C6B3198D",title:"A",fields:[]}}},_setup:function(t,e,n){var i=this;if(t)return alert("Error retrieving 1password files from Dropbox");"string"==typeof e&&(e=JSON.parse(e)),"string"==typeof n&&(n=JSON.parse(n)),queue(2).defer(asyncStorage.setItem,"1p.encryptionKeys",e).defer(asyncStorage.setItem,"1p.contents",n).await(function(t){t&&alert("There was an error when trying to save data in database: "+t)}),kc.setEncryptionKeys(e),i.state.contents=kc.setContents(n);var a=Object.keys(i.state.contents);i.setState({category:a[0],categories:a.map(function(t){return{name:t,count:i.state.contents[t].length}})})},authenticate:function(){var t=this,e=cloud.dropbox.auth;e.isAuthenticated()||e.authenticate(function(e,n){return e||!n?console.error("Error authenticating with Dropbox"):void queue(2).defer(asyncStorage.getItem,"1p.encryptionKeys").defer(asyncStorage.getItem,"1p.contents").await(function(e,i,a){!e&&i&&a?t._setup.bind(t)(e,i,a):queue(2).defer(n.readFile.bind(n),"1Password.agilekeychain/data/default/encryptionKeys.js").defer(n.readFile.bind(n),"1Password.agilekeychain/data/default/contents.js").await(t._setup.bind(t))})})},componentDidMount:function(){this.authenticate()},componentDidUpdate:function(){},switchToType:function(t){this.setState({category:t,sectionTitle:t})},switchToItem:function(t){function e(t){var e;try{e=kc.decryptItem(t)}catch(i){console.error("Error: "+i)}if("OK"!=e)return void alert("An error occurred while processing item '"+t.uuid+"'.\n\n"+e);var a=t.decrypted_secure_contents,s=a.fields||Object.keys(a).map(function(t){return{designation:t,value:a[t]}}),o=JSON.parse(JSON.stringify(t));o.fields=s,n.setState({sectionTitle:t.title,selectedItem:o,screen:"detail"})}var n=this,i="1pItem-"+t.uuid;asyncStorage.getItem(i,function(n,a){a?e(a):cloud.dropbox.auth.readFile("1Password.agilekeychain/data/default/"+t.uuid+".1password",function(t,n){var a=kc.getItem(n);asyncStorage.setItem(i,a,function(){}),e(a)})})},render:function(){var t=null,n=this.state.loginField;if(this.state.loggedIn===!0){var i=e.addons.classSet,a=i({container:!0,"item-view":"detail"===this.state.screen});t=e.DOM.div({className:"main-container"},MenuBar({onMenuClick:this.switchToType,items:this.state.categories}),e.DOM.div({className:"main-content"},Header({title:this.state.sectionTitle}),e.DOM.div({className:a},e.DOM.div({className:"content-list"},List({onItemClick:this.switchToItem,items:this.state.contents[this.state.category]})),e.DOM.div({className:"item-page"},Item({item:this.state.selectedItem})))))}else{{!cloud.dropbox.auth.isAuthenticated()}t=e.DOM.div({className:"main-container login-screen"},e.DOM.form({id:"login-form",className:"form-wrapper cf"},e.DOM.input({id:"login_field",type:"password",autofocus:!0,placeholder:"Enter your Master Password",onChange:this.handleLoginChange,value:n}),e.DOM.button({id:"submit_login",onClick:this.submitLogin,tabIndex:"-1"},"LOGIN")))}return e.DOM.section({id:"main"},t)},handleLoginChange:function(t){this.setState({loginField:t.target.value})},submitLogin:function(){this.setState({loggedIn:!!kc.verifyPassword.bind(kc)(this.state.loginField)})},getList:function(){this.setState({items:this.state.contents[type]})}});e.renderComponent(n(null),document.getElementById("app"))}(window,React);
!function(t){"use strict";t.Header=React.createClass({slide:function(){var a=t.document.body.classList;a.contains("left-nav")?a.remove("left-nav"):a.add("left-nav")},shouldComponentUpdate:function(t){return t.title!==this.props.title},render:function(){return React.DOM.div({className:"topcoat-navigation-bar"},React.DOM.div({className:"topcoat-navigation-bar__item left quarter"},React.DOM.a({id:"slide-menu-button",onClick:this.slide,className:"topcoat-icon-button--quiet slide-menu-button"},React.DOM.span({className:"topcoat-icon topcoat-icon--menu-stack"}))),React.DOM.div({className:"topcoat-navigation-bar__item center half"},React.DOM.h1({className:"topcoat-navigation-bar__title"},this.props.title)),React.DOM.div({className:"topcoat-navigation-bar__item right quarter"},React.DOM.a({className:"topcoat-icon-button--quiet"},React.DOM.span({className:"topcoat-icon topcoat-icon--edit"}))))}})}(window);
!function(t,n){"use strict";t.List=n.createClass({handleClick:function(t){this.props.onItemClick(t)},shouldComponentUpdate:function(t){return this.props.items!==t.items},render:function(){var t=this,e=function(e){return n.DOM.li({onClick:t.handleClick.bind(t,e)},e.title)};return n.DOM.ul(null,this.props.items.map(e))}}),t.Item=n.createClass({getInitialState:function(){return{fields:[]}},render:function(){var t=this.props.item.fields.map(function(t){return n.DOM.li(null,t.name,": ",t.value)});return n.DOM.div(null,n.DOM.ul(null,t))}})}(window,React);
!function(t){"use strict";t.MenuItem=React.createClass({render:function(){return React.DOM.li({className:"topcoat-list__item side-nav__list__item"},React.DOM.a({href:"#",className:"side-nav__button",onClick:this.props.onMenuItemClick},this.props.title))}}),t.MenuBar=React.createClass({handleClick:function(t){this.props.onMenuClick(t)},shouldComponentUpdate:function(t){return this.props.items!==t.items},render:function(){var t=function(t){return MenuItem({onMenuItemClick:this.handleClick.bind(this,t.name),title:t.name})};return React.DOM.div({className:"side-nav"},React.DOM.div({className:"topcoat-list__container side-nav__list__container"},React.DOM.ul({className:"topcoat-list side-nav__list"},this.props.items.map(t.bind(this)))))}})}(window);
!function(t){"use strict";t.Utils={uuid:function(){var t,e,n="";for(t=0;32>t;t++)e=16*Math.random()|0,(8===t||12===t||16===t||20===t)&&(n+="-"),n+=(12===t?4:16===t?3&e|8:e).toString(16);return n},pluralize:function(t,e){return 1===t?e:e+"s"},store:function(t,e){if(e)return localStorage.setItem(t,JSON.stringify(e));var n=localStorage.getItem(t);return n&&JSON.parse(n)||[]},extend:function(){for(var t={},e=0;e<arguments.length;e++){var n=arguments[e];for(var r in n)n.hasOwnProperty(r)&&(t[r]=n[r])}return t},XHRGet:function(t,e){var n=new XMLHttpRequest;n.open("GET",t,!0),n.setRequestHeader("Accept","application/json"),n.onreadystatechange=function(){4===n.readyState&&(n.status<300?e(null,JSON.parse(n.responseText)):e(n.status))},n.send(null)}}}(window);