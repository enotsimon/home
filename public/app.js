(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    return aliases[name] ? expandAlias(aliases[name]) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var process;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("color.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Color = function () {
  function Color() {
    _classCallCheck(this, Color);
  }

  _createClass(Color, null, [{
    key: "random_near",
    value: function random_near(_ref) {
      var _ref2 = _slicedToArray(_ref, 3),
          r = _ref2[0],
          g = _ref2[1],
          b = _ref2[2];

      var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
      var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 2;

      return Color.for_rgb([r, g, b], function (e) {
        return Color.random_channel(e, step, count);
      });
    }
  }, {
    key: "random",
    value: function random(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 3),
          r = _ref4[0],
          g = _ref4[1],
          b = _ref4[2];

      var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;

      return Color.for_rgb([r, g, b], function (e) {
        return Color.random_by_floor(e, step);
      });
    }
  }, {
    key: "to_pixi",
    value: function to_pixi(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 3),
          r = _ref6[0],
          g = _ref6[1],
          b = _ref6[2];

      return (r << 16) + (g << 8) + b;
    }

    // PRIVATE

  }, {
    key: "for_rgb",
    value: function for_rgb(_ref7, func) {
      var _ref8 = _slicedToArray(_ref7, 3),
          r = _ref8[0],
          g = _ref8[1],
          b = _ref8[2];

      return [func(r), func(g), func(b)];
    }

    // PRIVATE

  }, {
    key: "random_channel",
    value: function random_channel(base, step, count) {
      var rand = step * _util2.default.rand(-count, count);
      var res = base + rand;
      return res > 255 ? 255 : res < 0 ? 0 : res;
    }

    // PRIVATE

  }, {
    key: "random_by_floor",
    value: function random_by_floor(floor, step) {
      return floor - step * _util2.default.rand(0, floor / step | 0);
    }
  }]);

  return Color;
}();

exports.default = Color;

});

require.register("components/app.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _collapsible_panel = require('components/collapsible_panel');

var _collapsible_panel2 = _interopRequireDefault(_collapsible_panel);

var _debug_info = require('components/debug_info');

var _debug_info2 = _interopRequireDefault(_debug_info);

var _generate_world_form = require('components/generate_world_form');

var _generate_world_form2 = _interopRequireDefault(_generate_world_form);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    _classCallCheck(this, App);

    return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
  }

  _createClass(App, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'table',
        { style: { margin: '5px', borderSpacing: '5px', borderCollapse: 'separate' } },
        _react2.default.createElement(
          'tbody',
          null,
          _react2.default.createElement(
            'tr',
            { style: { verticalAlign: 'top' } },
            _react2.default.createElement(
              'td',
              null,
              _react2.default.createElement(
                'div',
                { className: 'panel-group' },
                _react2.default.createElement(
                  'div',
                  { className: 'panel panel-success' },
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-body' },
                    _react2.default.createElement(
                      'div',
                      { className: '', id: 'map_container' },
                      _react2.default.createElement('canvas', { id: 'map', width: '800', height: '800' })
                    )
                  )
                ),
                _react2.default.createElement(_collapsible_panel2.default, { header: 'debug', name: 'debug', content_func: function content_func() {
                    return _react2.default.createElement(_debug_info2.default);
                  } })
              )
            ),
            _react2.default.createElement(
              'td',
              { width: '100%' },
              _react2.default.createElement(
                'div',
                { className: 'panel-group' },
                _react2.default.createElement(
                  'div',
                  { className: 'panel panel-success' },
                  _react2.default.createElement(
                    'div',
                    { className: 'panel-body' },
                    _react2.default.createElement(_collapsible_panel2.default, { header: 'world generating', name: 'generate_world', content_func: function content_func() {
                        return _react2.default.createElement(_generate_world_form2.default);
                      } })
                  ),
                  _react2.default.createElement('div', { className: 'panel-footer' })
                )
              )
            )
          )
        )
      );
    }
  }]);

  return App;
}(_react2.default.Component);

exports.default = App;

});

require.register("components/collapsible_panel.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CollapsiblePanel = function (_React$Component) {
  _inherits(CollapsiblePanel, _React$Component);

  function CollapsiblePanel(args) {
    _classCallCheck(this, CollapsiblePanel);

    var _this = _possibleConstructorReturn(this, (CollapsiblePanel.__proto__ || Object.getPrototypeOf(CollapsiblePanel)).call(this));

    _this.header = args.header;
    _this.name = args.name;
    _this.content_func = args.content_func;
    return _this;
  }

  _createClass(CollapsiblePanel, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        { className: "panel panel-success" },
        _react2.default.createElement(
          "div",
          { className: "panel-heading" },
          _react2.default.createElement(
            "h4",
            { className: "panel-title" },
            _react2.default.createElement(
              "a",
              { "data-toggle": "collapse", href: '#' + this.name },
              this.header,
              " ",
              _react2.default.createElement("span", { className: "caret" })
            )
          )
        ),
        _react2.default.createElement(
          "div",
          { id: this.name, className: "panel-collapse collapse" },
          _react2.default.createElement(
            "div",
            { className: "panel-body" },
            this.content_func()
          )
        )
      );
    }
  }]);

  return CollapsiblePanel;
}(_react2.default.Component);

exports.default = CollapsiblePanel;

});

require.register("components/debug_info.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DebugInfo = function (_React$Component) {
  _inherits(DebugInfo, _React$Component);

  function DebugInfo() {
    _classCallCheck(this, DebugInfo);

    return _possibleConstructorReturn(this, (DebugInfo.__proto__ || Object.getPrototypeOf(DebugInfo)).apply(this, arguments));
  }

  _createClass(DebugInfo, [{
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        null,
        _react2.default.createElement(
          "div",
          null,
          "FPS: ",
          _react2.default.createElement("span", { id: "fps_counter" })
        ),
        _react2.default.createElement(
          "div",
          null,
          "map scale: ",
          _react2.default.createElement("span", { id: "map_scale" })
        ),
        _react2.default.createElement(
          "div",
          null,
          "mouse position: ",
          _react2.default.createElement(
            "span",
            { id: "mouse_pos" },
            (0, 0)
          )
        ),
        _react2.default.createElement(
          "div",
          null,
          "world point: ",
          _react2.default.createElement(
            "span",
            { id: "world_pos" },
            (0, 0)
          )
        )
      );
    }
  }]);

  return DebugInfo;
}(_react2.default.Component);

exports.default = DebugInfo;

});

require.register("components/generate_world_form.jsx", function(exports, require, module) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _input_spinner = require('components/input_spinner');

var _input_spinner2 = _interopRequireDefault(_input_spinner);

var _game = require('game');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GenerateWorldForm = function (_React$Component) {
  _inherits(GenerateWorldForm, _React$Component);

  function GenerateWorldForm() {
    _classCallCheck(this, GenerateWorldForm);

    return _possibleConstructorReturn(this, (GenerateWorldForm.__proto__ || Object.getPrototypeOf(GenerateWorldForm)).apply(this, arguments));
  }

  _createClass(GenerateWorldForm, [{
    key: 'submit',
    value: function submit(e) {
      e.preventDefault();
      console.clear();
      _game.game.map_drawer.map.stage.children.forEach(function (layer) {
        return layer.removeChildren();
      });
      _game.game.generate_world();
    }
  }, {
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          'form',
          { className: 'form-horizontal' },
          _react2.default.createElement(
            'div',
            { className: 'form-group' },
            _react2.default.createElement(
              'div',
              { className: 'col-sm-offset-4 col-sm-8' },
              _react2.default.createElement(
                'button',
                { type: 'button', className: 'btn btn-default', id: 'generate_world', onClick: this.submit.bind(this) },
                'generate'
              )
            )
          )
        )
      );
    }
  }]);

  return GenerateWorldForm;
}(_react2.default.Component);

exports.default = GenerateWorldForm;

});

require.register("components/input_spinner.jsx", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InputSpinner = function (_React$Component) {
  _inherits(InputSpinner, _React$Component);

  function InputSpinner(args) {
    _classCallCheck(this, InputSpinner);

    var _this = _possibleConstructorReturn(this, (InputSpinner.__proto__ || Object.getPrototypeOf(InputSpinner)).call(this, args));

    _this.state = { value: args.value };
    _this.name = args.name;
    _this.min = args.min ? args.min : 0;
    _this.max = args.max ? args.max : Infinity;
    return _this;
  }

  _createClass(InputSpinner, [{
    key: "click_up",
    value: function click_up(e) {
      if (this.state.value >= this.max) {
        return false;
      }
      this.update_value(this.state.value + 1);
      e.preventDefault();
    }
  }, {
    key: "click_down",
    value: function click_down(e) {
      if (this.state.value <= this.min) {
        return false;
      }
      this.update_value(this.state.value - 1);
      e.preventDefault();
    }
  }, {
    key: "manual_set",
    value: function manual_set(e) {
      this.update_value(e.target.value);
    }
  }, {
    key: "update_value",
    value: function update_value(new_value) {
      this.setState({ value: new_value });
    }
  }, {
    key: "render",
    value: function render() {
      return _react2.default.createElement(
        "div",
        { className: "input-group" },
        _react2.default.createElement(
          "span",
          { className: "input-group-btn" },
          _react2.default.createElement(
            "a",
            { className: "btn btn-danger", onClick: this.click_down.bind(this) },
            _react2.default.createElement("span", { className: "glyphicon glyphicon-minus" })
          )
        ),
        _react2.default.createElement("input", { id: this.name, type: "text", className: "form-control text-center", value: this.state.value, onChange: this.manual_set.bind(this) }),
        _react2.default.createElement(
          "span",
          { className: "input-group-btn" },
          _react2.default.createElement(
            "a",
            { className: "btn btn-info", onClick: this.click_up.bind(this) },
            _react2.default.createElement("span", { className: "glyphicon glyphicon-plus" })
          )
        )
      );
    }
  }]);

  return InputSpinner;
}(_react2.default.Component);

exports.default = InputSpinner;

});

require.register("game.js", function(exports, require, module) {
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _interaction = require("interaction");

var _interaction2 = _interopRequireDefault(_interaction);

var _map_drawer = require("map_drawer");

var _map_drawer2 = _interopRequireDefault(_map_drawer);

var _reactDom = require("react-dom");

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _app = require("components/app");

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = function () {
  function Game() {
    _classCallCheck(this, Game);

    // CONST
    this.width = 800;
    this.height = 800;

    this.map_drawer = new _map_drawer2.default();
    this.interaction = new _interaction2.default();
  }

  _createClass(Game, [{
    key: "generate_world",
    value: function generate_world() {
      // ...

      this.map_drawer.init(this.width, this.height);
      this.interaction.init();
      this.map_drawer.draw();
    }
  }]);

  return Game;
}();

var game = new Game();
module.exports.game = game;

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(_app2.default, null), document.querySelector('#app'));
  game.generate_world();
});

});

require.register("initialize.js", function(exports, require, module) {
'use strict';

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _app = require('components/app');

var _app2 = _interopRequireDefault(_app);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

document.addEventListener('DOMContentLoaded', function () {
  _reactDom2.default.render(_react2.default.createElement(_app2.default, null), document.querySelector('#app'));
});

});

require.register("interaction.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _d = require("d3");

var d3 = _interopRequireWildcard(_d);

var _game = require("game");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Interaction = function () {
  function Interaction() {
    _classCallCheck(this, Interaction);

    this.state = 'initial';
  }

  _createClass(Interaction, [{
    key: "init",
    value: function init() {
      var _this = this;

      this.game = _game.game;
      this.map = this.game.map_drawer.map;
      this.map.stage.interactive = true;

      document.addEventListener('mousemove', this.map_mouse_move_handler.bind(this), false);

      d3.select('#map').on('click', this.map_click_handler.bind(this));

      // from https://bl.ocks.org/pkerpedjiev/cf791db09ebcabaec0669362f4df1776
      d3.select('#map').call(d3.zoom().scaleExtent([1, 4]).translateExtent([[0, 0], [this.map.view.width, this.map.view.height]]).on("zoom", this.map_zoom.bind(this)));

      this.ticks = 0; // here?
      this.fps_div = document.getElementById('fps_counter');
      this.map.ticker.add(function () {
        _this.ticks++;
        if (_this.ticks % 10 == 0) {
          d3.select('#fps_counter').html(_this.map.ticker.FPS | 0);
        }
      });
      this.update_map_scale();
    }
  }, {
    key: "map_mouse_move_handler",
    value: function map_mouse_move_handler(event) {
      if (event.target != this.map.view) {
        //this.game.map_drawer.clear_cell_under_cursor();
        //this.cell_under_cursor = null;
        return false;
      }
      var mouse_coords = this.get_mouse_coords(event);

      d3.select('#mouse_pos').html('{x: ' + mouse_coords.x + ', y: ' + mouse_coords.y + '}');
      var world_pos = this.mouse_coords_to_world_coords(mouse_coords);
      d3.select('#world_pos').html('{x: ' + world_pos.x + ', y: ' + world_pos.y + '}');
    }
  }, {
    key: "map_click_handler",
    value: function map_click_handler() {
      var mouse_coords = this.get_mouse_coords(d3.event);
    }
  }, {
    key: "map_zoom",
    value: function map_zoom() {
      this.map.stage.position.x = d3.event.transform.x;
      this.map.stage.position.y = d3.event.transform.y;
      this.map.stage.scale.x = d3.event.transform.k;
      this.map.stage.scale.y = d3.event.transform.k;
      this.update_map_scale();
    }
    ///////////////////////////////////////


  }, {
    key: "update_map_scale",
    value: function update_map_scale() {
      d3.select('#map_scale').html('{x: ' + this.map.stage.scale.x + ', y: ' + this.map.stage.scale.y + '}');
    }

    ///////////////////////////////////////  
    // UTILS
    ///////////////////////////////////////

  }, {
    key: "get_mouse_coords",
    value: function get_mouse_coords(event) {
      return { x: event.offsetX, y: event.offsetY };
    }
  }, {
    key: "mouse_coords_to_world_coords",
    value: function mouse_coords_to_world_coords(mouse_coords) {
      var xn = Math.floor((mouse_coords.x - this.map.stage.position.x) / this.map.stage.scale.x),
          yn = Math.floor((mouse_coords.y - this.map.stage.position.y) / this.map.stage.scale.y);
      return { x: xn, y: yn };
    }
  }]);

  return Interaction;
}();

exports.default = Interaction;

});

require.register("map_drawer.js", function(exports, require, module) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require("util");

var _util2 = _interopRequireDefault(_util);

var _color = require("color");

var _color2 = _interopRequireDefault(_color);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MapDrawer = function () {
  function MapDrawer() {
    _classCallCheck(this, MapDrawer);
  }

  _createClass(MapDrawer, [{
    key: "init",
    value: function init(width, height) {
      var _this = this;

      var PIXI = require('pixi.js');
      this.map = new PIXI.Application(width, height, {
        backgroundColor: _color2.default.to_pixi([0, 0, 0]),
        antialias: true,
        view: document.getElementById('map')
      });
      console.log('renderer', this.map.renderer);
      this.layers = {};
      MapDrawer.layers().forEach(function (layer) {
        _this.layers[layer] = new PIXI.Container();
        _this.map.stage.addChild(_this.layers[layer]);
      });
      document.getElementById('map_container').appendChild(this.map.view);
    }
  }, {
    key: "draw",
    value: function draw() {}
  }], [{
    key: "layers",
    value: function layers() {
      // edges -- test for rivers by edges
      return [
      // cells filling
      'regions', 'geo', 'heights', 'dim_cells',
      // all items, objects, all that 'upon' the ground
      'borders', 'water', 'rrt_links', 'arrows', 'edges', 'roads', 'errors',
      // interaction routines
      'selection', 'under_cursor',
      // other
      'dim'];
    }
  }]);

  return MapDrawer;
}();

exports.default = MapDrawer;

});

require.alias("buffer/index.js", "buffer");
require.alias("path-browserify/index.js", "path");
require.alias("process/browser.js", "process");
require.alias("punycode/punycode.js", "punycode");
require.alias("querystring-es3/index.js", "querystring");
require.alias("util/util.js", "sys");
require.alias("url/url.js", "url");process = require('process');require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=app.js.map