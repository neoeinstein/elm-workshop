var jQuery = require('jquery');
var Auth0Lock = require('auth0-lock');

require("file?name=/favicon.ico!./favicon.ico");
require("./assets/stylesheets/cimpress.css");
require("./assets/images/cimpressLogoIcon.png")

var Elm = require("../src/Main.elm");

var main = Elm.Main.fullscreen();
